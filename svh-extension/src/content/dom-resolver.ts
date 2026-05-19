import { resolveSnapshotType } from '../lib/snapshot-type';

export interface ScriptcaseContext {
  cod_prj: string;
  cod_apl: string;
  scope: string;
  user_sc_login: string;
  type: 'app_event' | 'lib_file' | 'function' | 'project_lib' | 'public_lib';
}

export class DomResolver {
  private context: ScriptcaseContext | null = null;
  private observer: MutationObserver | null = null;

  start() {
    this.resolve();
    this.observer = new MutationObserver(() => this.resolve());
    this.observer.observe(document.body, { childList: true, subtree: true });
    
    // Check on interval as well to be safe
    setInterval(() => this.resolve(), 2000);
  }

  stop() {
    this.observer?.disconnect();
  }

  getContext(): ScriptcaseContext | null {
    return this.context;
  }

  resolve() {
    try {
      if (!chrome.runtime?.id) return;

      // The lib editor and the lib list are handled exclusively by the
      // background script.
      const inLibFlow = window.location.href.includes('nm_edit_php_edit.php')
        || window.location.href.includes('nm_edit_php_list.php');
      if (inLibFlow) return;

      const cod_prj = this.extractCodPrj();
      const cod_apl = this.extractCodApl();
      const scope = this.extractScope();
      const user_sc_login = this.extractUser();

      const spanTit = document.querySelector('[id^="span_tit_"]') as HTMLElement;
      const isLib = spanTit && spanTit.id.includes('libs');

      // Only build a context if we found AT LEAST ONE real piece of info
      if (cod_prj || cod_apl || scope || user_sc_login) {
        const rawScope = scope || 'Unknown';
        const resolved = resolveSnapshotType(rawScope);
        const finalType: ScriptcaseContext['type'] = resolved.type !== 'app_event'
          ? resolved.type
          : (isLib ? 'lib_file' : 'app_event');

        const newContext: ScriptcaseContext = {
          cod_prj: cod_prj || 'Unknown',
          cod_apl: cod_apl || 'Unknown',
          scope: resolved.scope || 'Unknown',
          user_sc_login: user_sc_login || 'Unknown',
          type: finalType,
        };

        if (JSON.stringify(newContext) !== JSON.stringify(this.context)) {
          this.context = newContext;
          if (scope) {
            console.log(`SVH: Frame found scope -> ${scope}`);
          }
          this.publishContext();
        }
      }
    } catch (e) {}
  }

  private publishContext() {
    if (!this.context) return;
    try {
      chrome.runtime.sendMessage({ type: 'SET_CONTEXT', payload: this.context }).catch(() => {});
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('svh:context-updated', { detail: this.context }));
  }

  private extractCodPrj(): string | null {
    try {
      const win = window as any;
      if (win.NM_cod_prj) return String(win.NM_cod_prj);
      const el = document.querySelector('#project_tooltip .project') as HTMLElement;
      return el?.innerText?.trim() || null;
    } catch { return null; }
  }

  private extractCodApl(): string | null {
    try {
      const win = window as any;
      if (win.NM_cod_apl) return String(win.NM_cod_apl);
      const el = document.querySelector('li.nmAbaAppOn > span[id^="sys_aba_page_title_"]') as HTMLElement;
      return el?.innerText?.trim() || null;
    } catch { return null; }
  }

  private extractScope(): string | null {
    try {
      // 1. Try the mTitle element in the main table
      // Format: "Category - ScopeName" (e.g., "Consulta - onInit")
      const mTitle = document.querySelector('#id_main_table td.nmText.nmTitle') as HTMLElement;

      if (mTitle) {
        const text = mTitle.textContent?.trim() || '';
        const parts = text.split(' - ');
        if (parts.length >= 2) {
          return parts[1].trim();
        }
      }

      const spanTit = document.querySelector('[id^="span_tit_"]') as HTMLElement;
      if (spanTit) {
        const text = spanTit.textContent?.trim();
        if (text) return text;
      }
      const eventsTit = document.getElementById('events_tit');
      if (eventsTit) {
        const clicked = eventsTit.querySelector('.jstree-clicked');
        if (clicked) {
          return clicked.getAttribute('title') || clicked.textContent?.trim() || null;
        }
      }
      const clicked = document.querySelector('.jstree-clicked');
      if (clicked && (clicked.id?.includes('events_') || clicked.closest('#events_tit'))) {
        return clicked.getAttribute('title') || clicked.textContent?.trim() || null;
      }
      return null;
    } catch (e) { return null; }
  }

  private extractUser(): string | null {
    try {
      const el = document.querySelector('.user') as HTMLElement;
      if (!el) return null;
      const text = el.parentElement?.innerText || '';
      return text.split('\n')[0].trim() || null;
    } catch { return null; }
  }
}
