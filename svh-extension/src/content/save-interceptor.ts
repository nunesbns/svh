import { EditorBridge } from './editor-bridge';
import { DomResolver } from './dom-resolver';
import { resolveSnapshotType } from '../lib/snapshot-type';
import { createSnapshotPayload, SnapshotDTO } from '../lib/snapshot-dto';

export class SaveInterceptor {
  private lastHash: Record<string, string> = {};

  constructor(
    private resolver: DomResolver,
    private bridge: EditorBridge,
  ) {}

  start() {
    console.log('SVH: SaveInterceptor starting (Form Intercept Mode)...');

    // Intercept form submissions. Scriptcase posts events to `event.php`
    // and PHP methods to `methods.php`.
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      console.log('SVH: Form submit detected', { action: target.action });

      if (target.action.includes('event.php')) {
        this.handleEventFormSubmit(target);
      } else if (target.action.includes('methods.php')) {
        this.handleMethodFormSubmit(target);
      }
    }, true);

    // Backup: Intercept clicks on save buttons to capture data even if submit is handled strangely
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#sc_btn_save') || target.closest('button[onclick*="salvar"]')) {
        console.log('SVH: Save button clicked');
        this.handleManualSave();
      }
    }, true);
  }

  private handleEventFormSubmit(form: HTMLFormElement) {
    try {
      const formData = new FormData(form);
      const code = formData.get('code') as string;
      const option = formData.get('form_option') as string;
      const formName = (formData.get('event_nome') as string) || '';

      if (option === 'save' && code) {
        this.processEventSave(code, formName);
      }
    } catch (e) {
      console.error('SVH: Error capturing event form data', e);
    }
  }

  private handleMethodFormSubmit(form: HTMLFormElement) {
    try {
      const formData = new FormData(form);
      const code = formData.get('code') as string;
      const option = formData.get('form_option') as string;
      const formName = (formData.get('event_nome') as string) || '';

      if (option === 'save' && code) {
        this.processMethodSave(code, formName);
      }
    } catch (e) {
      console.error('SVH: Error capturing method form data', e);
    }
  }

  private async processEventSave(content: string, formName?: string) {
    const ctx = this.resolver.getContext();
    const rawScope = `events/${formName || ctx?.scope || 'Unknown'}`;
    const { type, scope } = resolveSnapshotType(rawScope);

    const payload = createSnapshotPayload(ctx, type, scope, content, 'form_submit');
    await this.dispatchSnapshot(payload);
  }

  private async processMethodSave(content: string, formName?: string) {
    const ctx = this.resolver.getContext();
    const scope = formName || ctx?.scope || 'Unknown';
    // Methods always have type 'function'
    const payload = createSnapshotPayload(ctx, 'function', scope, content, 'form_submit');
    await this.dispatchSnapshot(payload);
  }

  private async dispatchSnapshot(payload: SnapshotDTO) {
    const hash = await this.sha256(payload.content);
    const key = `${payload.cod_prj}:${payload.type}:${payload.scope}`;

    if (this.lastHash[key] === hash) return;
    this.lastHash[key] = hash;

    payload.hash = hash;

    console.log('SVH: Sending snapshot to background...', { type: payload.type, scope: payload.scope });
    chrome.runtime.sendMessage({ type: 'SNAPSHOT', payload }).catch(() => {});
  }

  private async handleManualSave() {
    const content = this.bridge.getValue();
    if (!content) return;

    const ctx = this.resolver.getContext();
    const rawScope = ctx?.scope || 'Unknown';
    const { type, scope } = resolveSnapshotType(rawScope);

    const payload = createSnapshotPayload(ctx, type, scope, content, 'manual_save');
    await this.dispatchSnapshot(payload);
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
        // For patch-based saves, we use the manual save logic as a base
        const { type, scope: finalScope } = resolveSnapshotType(scope || 'Unknown');
        this.dispatchSnapshot(createSnapshotPayload(this.resolver.getContext(), type, finalScope, code, 'patch_fetch'));
      }

      if (e.data?.type === 'SVH_SAVE_DETECTED') {
        this.handleManualSave();
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
