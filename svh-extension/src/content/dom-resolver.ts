export interface ScriptcaseContext {
  cod_prj: string;
  cod_apl: string;
  scope: string;
  user_sc_login: string;
  type: 'app_event' | 'lib_file';
}

export class DomResolver {
  private context: ScriptcaseContext | null = null;
  private observer: MutationObserver | null = null;

  start() {
    this.resolve();
    this.observer = new MutationObserver(() => this.resolve());
    this.observer.observe(document.body, { childList: true, subtree: true });
    
    // Also try to observe the top window if we are in an iframe
    if (window !== window.top) {
      try {
        const topObserver = new MutationObserver(() => this.resolve());
        topObserver.observe(window.top!.document.body, { childList: true, subtree: true });
      } catch (e) {
        // Cross-origin or other issue
      }
    }
  }

  stop() {
    this.observer?.disconnect();
  }

  getContext(): ScriptcaseContext | null {
    return this.context;
  }

  private resolve() {
    try {
      const cod_prj = this.extractCodPrj();
      const cod_apl = this.extractCodApl();
      const scope = this.extractScope();
      const user_sc_login = this.extractUser();

      if (cod_prj || cod_apl || scope || user_sc_login) {
        const newContext: ScriptcaseContext = {
          cod_prj: cod_prj || 'Unknown',
          cod_apl: cod_apl || 'Unknown',
          scope: scope || 'Unknown',
          user_sc_login: user_sc_login || 'Unknown',
          type: (scope && scope.startsWith('libs/')) ? 'lib_file' : 'app_event',
        };

        if (JSON.stringify(newContext) !== JSON.stringify(this.context)) {
          this.context = newContext;
          console.log('SVH: Context detected:', this.context);
          document.dispatchEvent(new CustomEvent('svh:context-updated', { detail: this.context }));
          
          // Notify background about current context for webRequest resolution
          chrome.runtime.sendMessage({ type: 'SET_CONTEXT', payload: this.context }).catch(() => {});

          // Notify top window to update sidebar
          if (window !== window.top) {
            window.top!.postMessage({ type: 'SVH_CONTEXT_UPDATED', payload: this.context }, '*');
          }
        }
      }
    } catch (e) {
      console.error('SVH: Error resolving context', e);
    }
  }

  private extractCodPrj(): string | null {
    try {
      // 1. Try global variable from Scriptcase (if accessible)
      const win = window as any;
      const topWin = window.top as any;
      
      const cod = win.NM_cod_prj || topWin?.NM_cod_prj || win.parent?.NM_cod_prj;
      if (cod) return String(cod);

      // 2. Try the tooltip/header
      let el = document.querySelector('#project_tooltip .project') as HTMLElement;
      if (!el && window.top) {
        try { el = window.top.document.querySelector('#project_tooltip .project') as HTMLElement; } catch {}
      }
      return el?.innerText?.trim() || null;
    } catch {
      return null;
    }
  }

  private extractCodApl(): string | null {
    try {
      // 1. Try global variable
      const win = window as any;
      const topWin = window.top as any;
      const cod = win.NM_cod_apl || topWin?.NM_cod_apl || win.parent?.NM_cod_apl;
      if (cod) return String(cod);

      // 2. Try the tab title
      let el = document.querySelector('li.nmAbaAppOn > span[id^="sys_aba_page_title_"]') as HTMLElement;
      if (!el && window.top) {
        try { el = window.top.document.querySelector('li.nmAbaAppOn > span[id^="sys_aba_page_title_"]') as HTMLElement; } catch {}
      }
      return el?.innerText?.trim() || null;
    } catch {
      return null;
    }
  }

  private extractScope(): string | null {
    try {
      let treeEvent = document.querySelector('#tree_events .selected');
      if (!treeEvent && window.top) {
        try { treeEvent = window.top.document.querySelector('#tree_events .selected'); } catch {}
      }
      if (treeEvent) return `events/${treeEvent.textContent}`;

      let treeLib = document.querySelector('#tree_libs .selected');
      if (!treeLib && window.top) {
        try { treeLib = window.top.document.querySelector('#tree_libs .selected'); } catch {}
      }
      if (treeLib) return `libs/${treeLib.textContent}`;
    } catch {}

    return null;
  }

  private extractUser(): string | null {
    try {
      let el = document.querySelector('.user') as HTMLElement;
      if (!el && window.top) {
        try { el = window.top.document.querySelector('.user') as HTMLElement; } catch {}
      }
      if (!el) return null;
      const text = el.parentElement?.innerText || '';
      return text.split('\n')[0].trim() || null;
    } catch {
      return null;
    }
  }
}
