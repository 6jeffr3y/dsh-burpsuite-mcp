window.__ModuleLoader__.load({
  id: 'dsh-plugin-burpsuite-mcp',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')
    const h = React.createElement
    const LOCALE_NS = 'burpsuite-mcp.settings'
    const SETTINGS_NS = 'burpsuite-mcp'
    const defaults = { bridgeUrl: 'http://127.0.0.1:9639', toolCallTimeoutMs: 120000, reconnectMaxAttempts: 10 }
    const dictionaries = {
      zh: {
        title: 'BurpSuite MCP', description: '连接 Windows BurpSuite MCP Bridge，并向所有 DSH 模型提供同一组工具。',
        bridgeUrl: '桥接地址', bridgeUrlHint: '例如 http://127.0.0.1:9639。',
        timeout: '工具调用超时（毫秒）', timeoutHint: '单次 Burp MCP 工具调用允许等待的最长时间。',
        attempts: '重连次数', attemptsHint: '桥接中断后自动重连的最大尝试次数。',
        overridden: '已覆盖', reset: '恢复默认', save: '保存并重连', saving: '保存中…', discard: '放弃修改', unsaved: '未保存',
        invalidUrl: '请填写完整的 http:// 或 https:// 地址。', invalidNumber: '请输入大于 0 的整数。', failed: '配置未被接受，请检查输入或 Host 日志。',
        readOnly: '当前设置文档为只读。', live: '保存后只重启 Burp MCP 连接，无需重启 DSH。',
      },
      en: {
        title: 'BurpSuite MCP', description: 'Connect to the Windows BurpSuite MCP Bridge and expose its tools to every DSH model.',
        bridgeUrl: 'Bridge URL', bridgeUrlHint: 'For example http://127.0.0.1:9639.',
        timeout: 'Tool call timeout (ms)', timeoutHint: 'Maximum time allowed for one Burp MCP tool call.',
        attempts: 'Reconnect attempts', attemptsHint: 'Maximum automatic attempts after the bridge disconnects.',
        overridden: 'Overridden', reset: 'Reset', save: 'Save and reconnect', saving: 'Saving…', discard: 'Discard', unsaved: 'Unsaved',
        invalidUrl: 'Enter a complete http:// or https:// URL.', invalidNumber: 'Enter an integer greater than 0.', failed: 'The configuration was not accepted. Check the input or Host log.',
        readOnly: 'The settings document is read-only.', live: 'Saving restarts only the Burp MCP connection; DSH does not need a restart.',
      },
    }
    const css = `.lb-card{list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}.lb-head{width:100%;border:0;background:transparent;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:12px;padding:16px;text-align:left;cursor:pointer;font:inherit}.lb-headtext{display:flex;flex:1;min-width:0;flex-direction:column;gap:4px}.lb-name{font-size:14px;font-weight:600}.lb-desc,.lb-hint,.lb-live{margin:0;font-size:12px;color:var(--dsw-alias-label-tertiary)}.lb-badge{font-size:11px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);border-radius:999px;padding:2px 8px}.lb-arrow{transition:transform .15s}.lb-arrow.open{transform:rotate(180deg)}.lb-body{border-top:1px solid var(--dsw-alias-border-l2);padding:4px 16px 16px}.lb-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}.lb-field+.lb-field{border-top:1px solid var(--dsw-alias-border-l2)}.lb-labelrow{display:flex;gap:8px;align-items:center}.lb-label{flex:1;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary)}.lb-reset{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}.lb-input{height:34px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);padding:0 12px;font:inherit;font-size:13px}.lb-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}.lb-input.invalid{border-color:#ec1313}.lb-error{margin:0;font-size:12px;color:#ec1313}.lb-live{padding-top:8px;color:var(--dsw-alias-label-secondary)}.lb-footer{display:flex;justify-content:flex-end;gap:8px;padding-top:12px}.lb-button{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);padding:7px 14px;font:inherit;cursor:pointer}.lb-button.primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground)}.lb-button:disabled,.lb-reset:disabled{opacity:.45;cursor:default}`
    if (!document.querySelector('style[data-plugin-css="dsh-plugin-burpsuite-mcp"]')) {
      const style = document.createElement('style')
      style.dataset.pluginCss = 'dsh-plugin-burpsuite-mcp'
      style.textContent = css
      document.head.appendChild(style)
    }
    function validUrl(value) { try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' } catch { return false } }
    function validInt(value) { return /^\d+$/.test(value.trim()) && Number(value) > 0 }
    function Field({ id, label, hint, value, overridden, invalid, invalidText, disabled, onChange, onReset, t }) {
      return h('div', { className: 'lb-field' },
        h('div', { className: 'lb-labelrow' }, h('label', { className: 'lb-label', htmlFor: id }, label),
          overridden ? h('span', { className: 'lb-badge' }, t('overridden')) : null,
          overridden ? h('button', { type: 'button', className: 'lb-reset', disabled, onClick: onReset }, t('reset')) : null),
        h('input', { id, className: `lb-input${invalid ? ' invalid' : ''}`, value, disabled, onChange: event => onChange(event.target.value), 'aria-invalid': invalid || undefined }),
        h('p', { className: invalid ? 'lb-error' : 'lb-hint' }, invalid ? invalidText : hint))
    }
    function BurpCard({ scope, t }) {
      const snapshot = React.useSyncExternalStore(listener => scope.subscribe(listener), () => scope.getSnapshot(), () => scope.getSnapshot())
      const [open, setOpen] = React.useState(false)
      const [drafts, setDrafts] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [failed, setFailed] = React.useState(false)
      if (snapshot.status !== 'ready') return null
      const user = snapshot.user || {}, base = snapshot.base || {}
      const valueOf = field => drafts[field]?.value ?? String(snapshot.value?.[field] ?? defaults[field])
      const overridden = field => drafts[field]?.kind === 'unset' ? false : drafts[field] !== undefined || Object.prototype.hasOwnProperty.call(user, field)
      const edit = (field, value) => { setDrafts(current => ({ ...current, [field]: { kind: 'set', value } })); setFailed(false) }
      const reset = field => { setDrafts(current => ({ ...current, [field]: { kind: 'unset', value: String(base[field] ?? defaults[field]) } })); setFailed(false) }
      const bridgeUrl = valueOf('bridgeUrl'), timeout = valueOf('toolCallTimeoutMs'), attempts = valueOf('reconnectMaxAttempts')
      const invalid = !validUrl(bridgeUrl) || !validInt(timeout) || !validInt(attempts), dirty = Object.keys(drafts).length > 0
      const save = async () => {
        if (!dirty || invalid || saving || !snapshot.writable) return
        setSaving(true); setFailed(false)
        try {
          for (const [field, draft] of Object.entries(drafts)) {
            if (draft.kind === 'unset') await scope.unset(field)
            else await scope.set(field, field === 'bridgeUrl' ? draft.value.trim() : Number(draft.value))
          }
          setDrafts({})
        } catch { setFailed(true) } finally { setSaving(false) }
      }
      return h('li', { className: 'lb-card' },
        h('button', { type: 'button', className: 'lb-head', 'aria-expanded': open, onClick: () => setOpen(!open) },
          h('span', { className: 'lb-headtext' }, h('span', { className: 'lb-name' }, t('title')), h('span', { className: 'lb-desc' }, t('description'))),
          dirty ? h('span', { className: 'lb-badge' }, t('unsaved')) : null, h('span', { className: `lb-arrow${open ? ' open' : ''}` }, '⌄')),
        open ? h('div', { className: 'lb-body' },
          !snapshot.writable ? h('p', { className: 'lb-error' }, t('readOnly')) : null,
          h(Field, { id: 'burp-mcp-url', label: t('bridgeUrl'), hint: t('bridgeUrlHint'), value: bridgeUrl, overridden: overridden('bridgeUrl'), invalid: !validUrl(bridgeUrl), invalidText: t('invalidUrl'), disabled: !snapshot.writable, onChange: value => edit('bridgeUrl', value), onReset: () => reset('bridgeUrl'), t }),
          h(Field, { id: 'burp-mcp-timeout', label: t('timeout'), hint: t('timeoutHint'), value: timeout, overridden: overridden('toolCallTimeoutMs'), invalid: !validInt(timeout), invalidText: t('invalidNumber'), disabled: !snapshot.writable, onChange: value => edit('toolCallTimeoutMs', value), onReset: () => reset('toolCallTimeoutMs'), t }),
          h(Field, { id: 'burp-mcp-attempts', label: t('attempts'), hint: t('attemptsHint'), value: attempts, overridden: overridden('reconnectMaxAttempts'), invalid: !validInt(attempts), invalidText: t('invalidNumber'), disabled: !snapshot.writable, onChange: value => edit('reconnectMaxAttempts', value), onReset: () => reset('reconnectMaxAttempts'), t }),
          h('p', { className: 'lb-live' }, t('live')), failed ? h('p', { className: 'lb-error' }, t('failed')) : null,
          h('div', { className: 'lb-footer' },
            h('button', { type: 'button', className: 'lb-button', disabled: !dirty || saving, onClick: () => { setDrafts({}); setFailed(false) } }, t('discard')),
            h('button', { type: 'button', className: 'lb-button primary', disabled: !dirty || invalid || saving || !snapshot.writable, onClick: save }, t(saving ? 'saving' : 'save')))) : null)
    }
    const inject = ['slots', 'locale', 'settingsScope']
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(LOCALE_NS, dictionaries), 'burpsuite-mcp: settings dictionaries')
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS })
      ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name: 'settings.plugin.item', key: SETTINGS_NS, locale: LOCALE_NS, inject: () => ({ scope }),
      }, BurpCard))
    }
    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
