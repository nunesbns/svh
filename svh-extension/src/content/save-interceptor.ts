import { EditorBridge } from './editor-bridge';
import { DomResolver, ScriptcaseContext } from './dom-resolver';

export class SaveInterceptor {
  private lastHash: Record<string, string> = {};

  constructor(
    private resolver: DomResolver,
    private bridge: EditorBridge,
  ) {}

  start() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        this.handleSave();
      }
    }, true);

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('#sc_btn_save') ||
        target.closest('button[onclick*="salvar"]') ||
        target.closest('.sc-toolbar-save')
      ) {
        this.handleSave();
      }
    }, true);

    this.patchFetch();
  }

  private async handleSave() {
    const ctx = this.resolver.getContext();
    if (!ctx) return;

    const content = this.bridge.getValue();
    if (!content) return;

    const hash = await this.sha256(content);
    const key = `${ctx.cod_prj}:${ctx.cod_apl}:${ctx.scope}`;

    if (this.lastHash[key] === hash) return;
    this.lastHash[key] = hash;

    const payload = {
      ...ctx,
      content,
      hash,
      captured_at: new Date().toISOString(),
      metadata: {},
    };

    chrome.runtime.sendMessage({ type: 'SNAPSHOT', payload });
  }

  private patchFetch() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject/fetch-patch.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);

    window.addEventListener('message', (e) => {
      if (e.source !== window) return;
      if (e.data?.type === 'SVH_SAVE_DETECTED') {
        this.handleSave();
      }
    });
  }

  private async sha256(text: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
