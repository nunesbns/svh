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
      }
    }
  }

  private extractCodPrj(): string | null {
    const el = document.querySelector('#project_tooltip .project') as HTMLElement;
    return el?.innerText?.trim() || null;
  }

  private extractCodApl(): string | null {
    const el = document.querySelector('li.nmAbaAppOn > span[id^="sys_aba_page_title_"]') as HTMLElement;
    return el?.innerText?.trim() || null;
  }

  private extractScope(): string | null {
    const treeEvent = document.querySelector('#tree_events .selected');
    if (treeEvent) return `events/${treeEvent.textContent}`;

    const treeLib = document.querySelector('#tree_libs .selected');
    if (treeLib) return `libs/${treeLib.textContent}`;

    return null;
  }

  private extractUser(): string | null {
    const el = document.querySelector('.user') as HTMLElement;
    if (!el) return null;
    const text = el.parentElement?.innerText || '';
    return text.split('\n')[0].trim() || null;
  }
}
