import { EditorBridge } from './editor-bridge';
import { DomResolver } from './dom-resolver';

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

  private async processSave(content: string, scope?: string) {
    const ctx = this.resolver.getContext();
    if (!ctx) {
      console.warn('SVH: Context not found during save');
      return;
    }

    const finalScope = scope || ctx.scope;
    if (!content || !finalScope || finalScope === 'Unknown') {
      console.warn('SVH: Missing content or scope', { finalScope });
      return;
    }

    const hash = await this.sha256(content);
    const key = `${ctx.cod_prj}:${ctx.cod_apl}:${finalScope}`;

    if (this.lastHash[key] === hash) return;
    this.lastHash[key] = hash;

    const payload = {
      ...ctx,
      scope: finalScope,
      content,
      hash,
      captured_at: new Date().toISOString(),
      metadata: { source: scope ? 'network_intercept' : 'dom_capture' },
    };

    console.log('SVH: Sending snapshot...', { scope: finalScope, user: ctx.user_sc_login });
    chrome.runtime.sendMessage({ type: 'SNAPSHOT', payload });
  }

  private async handleSave() {
    const content = this.bridge.getValue();
    this.processSave(content);
  }

  private patchFetch() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject/fetch-patch.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);

    window.addEventListener('message', (e) => {
      if (e.source !== window) return;
      
      if (e.data?.type === 'SVH_SAVE_DATA') {
        const { code, scope } = e.data.payload;
        this.processSave(code, scope);
      }

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
