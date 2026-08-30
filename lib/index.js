import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import z from '@deepseek-ai/schemastery'
import * as McpClient from '@deepseek-ai/dsh-mcp-client'

export const name = 'burpsuite-mcp-bundle'
export const inject = ['settings', 'tools']

const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:9639'
const DEFAULT_TOOL_TIMEOUT_MS = 120_000
const DEFAULT_RECONNECT_ATTEMPTS = 10
const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export const Config = z.object({
  bridgeUrl: z.string().default(DEFAULT_BRIDGE_URL),
  toolCallTimeoutMs: z.number().step(1).min(1).default(DEFAULT_TOOL_TIMEOUT_MS),
  reconnectMaxAttempts: z.number().step(1).min(1).default(DEFAULT_RECONNECT_ATTEMPTS),
})

function validate(config) {
  let url
  try {
    url = new URL(config.bridgeUrl)
  } catch {
    throw new TypeError('Burp MCP bridge URL must be an absolute http:// or https:// URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Burp MCP bridge URL must use http:// or https://')
  }
}

function mcpConfig(config) {
  const serverPath = process.env.DSH_BURP_MCP_SERVER ?? join(packageRoot, 'server.py')
  return {
    transport: 'stdio',
    serverName: 'burpsuite_mcp_bridge',
    command: process.env.DSH_BURP_MCP_PYTHON ?? 'python3',
    args: [serverPath],
    env: {
      BURP_MCP_BRIDGE_URL: config.bridgeUrl,
      BURP_MCP_PLUGIN_ROOT: process.env.BURP_MCP_PLUGIN_ROOT ?? join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'burp-mcp'),
      PYTHONUNBUFFERED: '1',
    },
    cwd: process.env.DSH_BURP_MCP_CWD ?? packageRoot,
    toolCallTimeoutMs: config.toolCallTimeoutMs,
    failOnStartupError: true,
    reconnect: {
      enabled: true,
      initialDelayMs: 500,
      maxDelayMs: 30_000,
      maxAttempts: config.reconnectMaxAttempts,
    },
  }
}

export function apply(ctx, config) {
  validate(config)
  const scope = ctx.settings.register('burpsuite-mcp', Config, {
    base: config,
    applies: 'live',
    validate,
  })
  const child = ctx.plugin(McpClient, mcpConfig(scope.get()))
  ctx.effect(
    () => scope.watch(async next => {
      await child
      await child.update(mcpConfig(next), true)
    }),
    'burpsuite-mcp: live settings reload',
  )
}
