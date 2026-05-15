export class Sidebar {
  private container: HTMLElement;
  private currentContext: any = null;
  private historyItems: any[] = [];
  private isLoading: boolean = false;
  private modalContainer: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
    this.createModal();
    
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

  private createModal() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'svh-code-modal';
    this.modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 1000000;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    `;
    document.body.appendChild(this.modalContainer);
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
          console.log('SVH Sidebar: History response received:', res);

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

  private highlightCode(code: string): string {
    // Simple regex-based highlighting for PHP/JS
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span style="color: #6a9955;">$1</span>') // Comments
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color: #ce9178;">$1</span>') // Strings
      .replace(/\b(function|return|if|else|for|while|foreach|as|switch|case|break|continue|public|private|protected|class|extends|implements|new|try|catch|finally|throw|use|namespace|var|let|const)\b/g, '<span style="color: #569cd6;">$1</span>') // Keywords
      .replace(/\b(\$[a-zA-Z_][a-zA-Z0-9_]*)\b/g, '<span style="color: #9cdcfe;">$1</span>') // PHP Variables
      .replace(/\b(0x[0-9a-fA-F]+|\d+)\b/g, '<span style="color: #b5cea8;">$1</span>'); // Numbers
  }

  private openModal(snapshot: any) {
    const code = snapshot.content || '';
    const highlighted = this.highlightCode(code);
    const date = this.formatDate(snapshot.captured_at);

    this.modalContainer!.style.display = 'flex';
    this.modalContainer!.innerHTML = `
      <div style="width: 90%; height: 90%; background: #1e1e1e; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #333; overflow: hidden;">
        <div style="padding: 12px 20px; background: #2d2d2d; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333;">
          <div style="color: #e2e8f0; font-size: 14px;">
            <span style="font-weight: bold; color: #569cd6;">${snapshot.user_sc_login}</span>
            <span style="color: #888; margin: 0 8px;">•</span>
            <span style="color: #aaa;">${date}</span>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="modal-copy" style="background: #3a3a3a; color: #fff; border: 1px solid #444; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>📋 Copy</span>
            </button>
            <button id="modal-restore" style="background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
              🚀 Restore to Editor
            </button>
            <button id="modal-close" style="background: none; border: none; color: #888; cursor: pointer; font-size: 24px; line-height: 1;">&times;</button>
          </div>
        </div>
        <div style="flex: 1; overflow: auto; padding: 20px; position: relative;">
          <pre style="margin: 0; color: #d4d4d4; font-size: 13px; line-height: 1.5; tab-size: 4; white-space: pre-wrap; word-break: break-all;"><code>${highlighted}</code></pre>
        </div>
      </div>
    `;

    this.modalContainer!.querySelector('#modal-close')?.addEventListener('click', () => {
      this.modalContainer!.style.display = 'none';
    });

    this.modalContainer!.querySelector('#modal-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(code).then(() => {
        const btn = this.modalContainer!.querySelector('#modal-copy span') as HTMLElement;
        btn.innerText = '✅ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy'; }, 2000);
      });
    });

    this.modalContainer!.querySelector('#modal-restore')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar esta versão do código? Isso substituirá o conteúdo atual do editor.')) {
        this.requestRestore(snapshot.id);
        this.modalContainer!.style.display = 'none';
      }
    });

    // Close on backdrop click
    this.modalContainer!.onclick = (e) => {
      if (e.target === this.modalContainer) {
        this.modalContainer!.style.display = 'none';
      }
    };
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
        this.fetchSnapshotAndOpenModal(id);
      });
    });
  }

  private fetchSnapshotAndOpenModal(id: string) {
    chrome.runtime.sendMessage({ type: 'RESTORE', snapshotId: id }, (res) => {
      if (res?.ok) {
        this.openModal(res.data);
      } else {
        alert('Erro ao carregar snapshot: ' + (res?.error || 'Erro desconhecido'));
      }
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
