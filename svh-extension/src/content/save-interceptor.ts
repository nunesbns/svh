import { EditorBridge } from './editor-bridge';
import { DomResolver } from './dom-resolver';

export class SaveInterceptor {
  private lastHash: Record<string, string> = {};

  constructor(
    private resolver: DomResolver,
    private bridge: EditorBridge,
  ) {}

  start() {
    console.log('SVH: SaveInterceptor starting (Form Intercept Mode)...');
    
    // Intercept form submissions
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      console.log('SVH: Form submit detected', { action: target.action });
      
      if (target.action.includes('event.php')) {
        this.handleFormSubmit(target);
      }
    }, true);

    // Backup: Intercept clicks on save buttons to capture data even if submit is handled strangely
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#sc_btn_save') || target.closest('button[onclick*="salvar"]')) {
        console.log('SVH: Save button clicked');
        this.handleSave();
      }
    }, true);
  }

  private handleFormSubmit(form: HTMLFormElement) {
    try {
      const formData = new FormData(form);
      const code = formData.get('code') as string;
      const eventName = formData.get('event_nome') as string;
      const option = formData.get('form_option') as string;

      console.log('SVH: Form data captured', { eventName, option, codeLength: code?.length });

      if (option === 'save' && code) {
        this.processSave(code, `events/${eventName}`);
      }
    } catch (e) {
      console.error('SVH: Error capturing form data', e);
    }
  }

  private async processSave(content: string, scope?: string) {
    console.log('SVH: processSave', { scope, length: content.length });
    const ctx = this.resolver.getContext();
    
    // Fallback context if resolver hasn't picked it up yet
    const finalScope = scope || ctx?.scope || 'Unknown';
    
    const hash = await this.sha256(content);
    const key = `${ctx?.cod_prj || 'Unknown'}:${finalScope}`;

    if (this.lastHash[key] === hash) return;
    this.lastHash[key] = hash;

    const payload = {
      cod_prj: ctx?.cod_prj || 'Unknown',
      cod_apl: ctx?.cod_apl || 'Unknown',
      user_sc_login: ctx?.user_sc_login || 'Unknown',
      type: (finalScope.startsWith('libs/')) ? 'lib_file' : 'app_event',
      scope: finalScope,
      content,
      hash,
      captured_at: new Date().toISOString(),
      metadata: { source: 'form_submit' },
    };

    console.log('SVH: Sending snapshot to background...', { scope: finalScope });
    chrome.runtime.sendMessage({ type: 'SNAPSHOT', payload }).catch(() => {});
  }

  private async handleSave() {
    const content = this.bridge.getValue();
    if (content) {
      this.processSave(content);
    }
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
