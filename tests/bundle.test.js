import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import vm from 'node:vm'

import * as plugin from '../lib/index.js'

test('host plugin rejects non-HTTP bridge URLs', () => {
  assert.throws(
    () => plugin.apply({}, { bridgeUrl: 'file:///tmp/bridge', toolCallTimeoutMs: 1, reconnectMaxAttempts: 1 }),
    /must use http:\/\/ or https:\/\//,
  )
})

test('host plugin mounts the bundled stdio server with isolated runtime data', () => {
  const previousHome = process.env.DSH_HOME
  const previousServer = process.env.DSH_BURP_MCP_SERVER
  const previousRoot = process.env.BURP_MCP_PLUGIN_ROOT
  delete process.env.DSH_BURP_MCP_SERVER
  delete process.env.BURP_MCP_PLUGIN_ROOT
  process.env.DSH_HOME = '/tmp/dsh-burpsuite-mcp-test'

  let mounted
  const listeners = new Map()
  const config = plugin.Config({ bridgeUrl: 'http://127.0.0.1:9639', toolCallTimeoutMs: 12_000, reconnectMaxAttempts: 4 })
  const child = Promise.resolve()
  child.update = async next => { mounted.config = next }
  const ctx = {
    settings: { configure: options => { assert.deepEqual(options, { auto: false }); return () => {} } },
    plugin: (subject, config) => {
      mounted = { subject, config }
      return child
    },
    effect: factory => factory(),
    on: (name, listener) => { listeners.set(name, listener); return () => {} },
  }
  ctx.fiber = {}

  try {
    plugin.apply(ctx, config)
    assert.equal(plugin.name, 'burpsuite-mcp-bundle')
    assert.equal(mounted.config.transport, 'stdio')
    assert.equal(mounted.config.serverName, 'burpsuite_mcp_bridge')
    assert.equal(mounted.config.command, 'python3')
    assert.match(mounted.config.args[0], /\/server\.py$/)
    assert.equal(mounted.config.env.BURP_MCP_BRIDGE_URL, 'http://127.0.0.1:9639')
    assert.equal(mounted.config.env.BURP_MCP_PLUGIN_ROOT, '/tmp/dsh-burpsuite-mcp-test/burp-mcp')
    assert.equal(mounted.config.toolCallTimeoutMs, 12_000)
    assert.equal(mounted.config.reconnect.maxAttempts, 4)
    assert.ok(listeners.has('internal/config'))
    assert.ok(listeners.has('loader/volatile-update'))
  } finally {
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    if (previousServer === undefined) delete process.env.DSH_BURP_MCP_SERVER
    else process.env.DSH_BURP_MCP_SERVER = previousServer
    if (previousRoot === undefined) delete process.env.BURP_MCP_PLUGIN_ROOT
    else process.env.BURP_MCP_PLUGIN_ROOT = previousRoot
  }
})

test('client bundle registers one localized settings card', async () => {
  const source = await readFile(join(import.meta.dirname, '../lib/client.js'), 'utf8')
  let descriptor
  const styles = []
  const document = {
    head: { appendChild: style => styles.push(style) },
    querySelector: () => null,
    createElement: () => ({ dataset: {} }),
  }
  vm.runInNewContext(source, {
    URL,
    document,
    window: { __ModuleLoader__: { load: value => { descriptor = value } } },
  })

  assert.equal(descriptor.id, 'dsh-plugin-burpsuite-mcp')
  const React = { createElement: () => null }
  const client = descriptor.factory(name => {
    assert.equal(name, 'react')
    return React
  })

  let dictionaries
  let slot
  const scope = { marker: 'settings-scope' }
  const ctx = {
    effect: factory => factory(),
    locale: { register: (namespace, value) => { dictionaries = { namespace, value }; return () => {} } },
    settingsScope: { bind: options => { assert.equal(options.namespace, 'burpsuite-mcp'); return scope } },
    slots: {
      inject: (name, factory) => { assert.equal(name, 'settings.plugin.item'); factory() },
      register: value => { slot = value; return () => {} },
    },
  }

  client.apply(ctx)
  assert.deepEqual(Array.from(client.inject), ['slots', 'locale', 'settingsScope'])
  assert.equal(dictionaries.namespace, 'burpsuite-mcp.settings')
  assert.equal(dictionaries.value.zh.title, 'BurpSuite MCP')
  assert.equal(slot.key, 'burpsuite-mcp')
  assert.equal(slot.inject().scope, scope)
  assert.equal(styles[0].dataset.pluginCss, 'dsh-plugin-burpsuite-mcp')
})
