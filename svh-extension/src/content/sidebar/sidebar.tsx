export class Sidebar {
  private container: HTMLElement;
  private currentContext: any = null;
  private historyItems: any[] = [];
  private isLoading: boolean = false;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
    
    // Initial fetch of context from background
    this.fetchInitialContext();

    document.addEventListener('svh:context-updated', (e: any) => {
      console.log('SVH Sidebar: Context event received:', e.detail);
      const oldContext = JSON.stringify(this.currentContext);
      this.currentContext = e.detail;
      
      // If context changed significantly, reload history if sidebar is visible
      if (oldContext !== JSON.stringify(this.currentContext)) {
        if (this.container.style.display === 'flex') {
          this.loadHistory();
        } else {
          this.render();
        }
      }
    });

    document.addEventListener('svh:refresh-history', () => {
      // Re-fetch context from background to be sure before loading history
      this.fetchInitialContext(() => this.loadHistory());
    });
  }

  private fetchInitialContext(callback?: () => void) {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ type: 'GET_CONTEXT' }, (res) => {
        if (res?.ok && res.data) {
          console.log('SVH Sidebar: Context retrieved from background:', res.data);
          this.currentContext = res.data;
          this.render();
          if (callback) callback();
        }
      });
    }
  }

  private loadHistory() {
    console.log('SVH Sidebar: Attempting to load history. Current context:', this.currentContext);

    if (!this.currentContext || !this.currentContext.cod_prj || this.currentContext.cod_prj === 'Unknown') {
      console.warn('SVH Sidebar: Cannot load history - Invalid or missing project context in currentContext');
      return;
    }
    
    this.isLoading = true;
    this.render();

    const { cod_prj, cod_apl, scope } = this.currentContext;
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        chrome.runtime.sendMessage({ 
          type: 'HISTORY', 
          params: { cod_prj, cod_apl, scope } 
        }, (res) => {
          this.isLoading = false;
          if (chrome.runtime.lastError) {
            console.warn('SVH: Runtime error during history load', chrome.runtime.lastError.message);
            this.render();
            return;
          }
          if (res?.ok) {
            this.historyItems = res.data.data || res.data || [];
            this.render();
          } else {
            console.error('SVH: API error loading history', res?.error);
            this.render();
          }
        });
      }
    } catch (e) {
      this.isLoading = false;
      this.render();
    }
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }

  private renderValue(val: any): string {
    if (!val) return 'Unknown';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch (e) {
        return '[Object]';
      }
    }
    return String(val);
  }

  render() {
    const ctx = this.currentContext;
    const items = this.historyItems;

    if (ctx) {
      console.log(`SVH Sidebar: Rendering context. Scope type: ${typeof ctx.scope}, value:`, ctx.scope);
    }

    this.container.innerHTML = `
      <div style="padding:16px; background:#1e293b; color:#fff; border-bottom:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="margin:0; font-size:16px; font-weight:600;">SVH History</h2>
          <button id="svh-close-sidebar" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:20px;">&times;</button>
        </div>
        <div style="font-size:11px; color:#94a3b8; display:grid; gap:4px; background:#0f172a; padding:8px; border-radius:4px;">
          <div><b>Project:</b> <span style="color:#e2e8f0">${this.renderValue(ctx?.cod_prj)}</span></div>
          <div><b>App:</b> <span style="color:#e2e8f0">${this.renderValue(ctx?.cod_apl)}</span></div>
          <div><b>Event:</b> <span style="color:#cbd5e1">${this.renderValue(ctx?.scope)}</span></div>
          <div><b>User:</b> <span style="color:#cbd5e1">${this.renderValue(ctx?.user_sc_login)}</span></div>
        </div>
      </div>
      
      <div style="flex:1; overflow-y:auto; background:#f8fafc; display:flex; flex-direction:column;">
        ${this.isLoading ? `
          <div style="padding:40px; text-align:center; color:#64748b;">
            <div style="margin-bottom:8px;">Loading history...</div>
          </div>
        ` : `
          <div style="padding:12px; font-size:12px; font-weight:bold; color:#475569; background:#f1f5f9; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <span>TIMELINE</span>
            <button id="svh-manual-refresh" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:11px;">Refresh</button>
          </div>
          <div style="display:flex; flex-direction:column;">
            ${items.length ? items.map(i => `
              <div class="svh-history-item" style="padding:10px 16px; border-bottom:1px solid #e2e8f0; cursor:pointer; transition:background 0.2s;" data-id="${i.id}">
                <div style="font-weight:600; font-size:13px; color:#1e293b; margin-bottom:2px;">${i.user_sc_login}</div>
                <div style="font-size:11px; color:#64748b;">${this.formatDate(i.captured_at)}</div>
              </div>
            `).join('') : `
              <div style="padding:40px 20px; color:#94a3b8; text-align:center;">
                <div style="font-size:24px; margin-bottom:8px;">empty</div>
                <div style="font-size:13px;">No snapshots found for this scope.</div>
              </div>
            `}
          </div>
        `}
      </div>
      
      <div style="padding:12px; background:#fff; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; text-align:center;">
        SVH Extension &copy; 2026
      </div>

      <style>
        .svh-history-item:hover { background: #eff6ff !important; }
        .svh-history-item:active { background: #dbeafe !important; }
      </style>
    `;

    // Event Listeners
    this.container.querySelector('#svh-close-sidebar')?.addEventListener('click', () => {
      this.container.style.display = 'none';
    });

    this.container.querySelector('#svh-manual-refresh')?.addEventListener('click', () => {
      this.loadHistory();
    });

    this.container.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.id!;
        if (confirm('Deseja restaurar esta versão do código? Isso substituirá o conteúdo atual do editor.')) {
          this.requestRestore(id);
        }
      });
    });
  }

  private requestRestore(id: string) {
    chrome.runtime.sendMessage({ type: 'RESTORE', snapshotId: id }, (res) => {
      if (chrome.runtime.lastError) {
        console.error('SVH: Runtime error during restore', chrome.runtime.lastError);
        alert('Erro de comunicação com a extensão.');
        return;
      }
      if (res?.ok) {
        // Here we need to inject the content back to the editor.
        // The Restore logic in background only returns the snapshot data.
        // We need to send another message to the editor bridge.
        window.postMessage({ type: 'SVH_RESTORE_CONTENT', payload: res.data.content || res.data }, '*');
        alert('Conteúdo restaurado no editor! Lembre-se de salvar no Scriptcase para confirmar.');
      } else {
        alert('Erro ao recuperar snapshot: ' + (res?.error || 'Erro desconhecido'));
      }
    });
  }
}
