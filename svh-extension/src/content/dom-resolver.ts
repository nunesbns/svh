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
  }

  stop() {
    this.observer?.disconnect();
  }

  getContext(): ScriptcaseContext | null {
    return this.context;
  }

  private resolve() {
    const cod_prj = this.extractCodPrj();
    const cod_apl = this.extractCodApl();
    const scope = this.extractScope();
    const user_sc_login = this.extractUser();

    if (cod_prj && cod_apl && scope && user_sc_login) {
      this.context = {
        cod_prj,
        cod_apl,
        scope,
        user_sc_login,
        type: scope.startsWith('libs/') ? 'lib_file' : 'app_event',
      };
    }
  }

  private extractCodPrj(): string | null {
    const el = document.querySelector('[data-project]');
    if (el) return el.getAttribute('data-project');
    try {
      return (window as any).parent?.NM_cod_prj || null;
    } catch {
      return null;
    }
  }

  private extractCodApl(): string | null {
    const el = document.querySelector('[data-app-id]');
    if (el) return el.getAttribute('data-app-id');
    try {
      return (window as any).NM_cod_apl || null;
    } catch {
      return null;
    }
  }

  private extractScope(): string | null {
    const treeEvent = document.querySelector('#tree_events .selected');
    if (treeEvent) return `events/${treeEvent.textContent}`;

    const treeLib = document.querySelector('#tree_libs .selected');
    if (treeLib) return `libs/${treeLib.textContent}`;

    const iframe = document.querySelector('iframe[id^="frm_sc_code"]') as HTMLIFrameElement;
    if (iframe?.src) {
      const url = new URL(iframe.src);
      return url.searchParams.get('event') || url.searchParams.get('lib');
    }

    return null;
  }

  private extractUser(): string | null {
    const el = document.querySelector('#sc_user_logged');
    if (el) return el.textContent?.trim() || null;

    try {
      const match = document.cookie.match(/sc_session_user=([^;]+)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {
      return null;
    }

    return null;
  }
}
