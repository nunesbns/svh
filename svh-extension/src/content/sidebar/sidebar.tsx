export class Sidebar {
  private container: HTMLElement;
  private currentContext: any = null;
  private historyItems: any[] = [];
  private isLoading: boolean = false;
  private modalContainer: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
    this.createModal();
    this.injectDependencies();
    
    this.fetchInitialContext();

    document.addEventListener('svh:context-updated', (e: any) => {
      const oldContext = JSON.stringify(this.currentContext);
      this.currentContext = e.detail;
      if (oldContext !== JSON.stringify(this.currentContext)) {
        if (this.container.style.display === 'flex') {
          this.loadHistory();
        } else {
          this.render();
        }
      }
    });

    document.addEventListener('svh:refresh-history', () => {
      this.fetchInitialContext(() => this.loadHistory());
    });
  }

  private injectDependencies() {
    // Inject Diff2Html CSS and JS from Local Extension Files to avoid CSP issues
    if (!document.getElementById('svh-diff-css')) {
      const css = document.createElement('link');
      css.id = 'svh-diff-css';
      css.rel = 'stylesheet';
      css.href = chrome.runtime.getURL('vendor/diff2html.min.css');
      document.head.appendChild(css);
    }
    if (!document.getElementById('svh-diff-js')) {
      const js = document.createElement('script');
      js.id = 'svh-diff-js';
      js.src = chrome.runtime.getURL('vendor/diff2html-ui.min.js');
      document.head.appendChild(js);
    }
  }

  private createModal() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'svh-code-modal';
    this.modalContainer.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
      z-index: 1000000; display: none; align-items: center; justify-content: center;
    `;
    document.body.appendChild(this.modalContainer);
  }

  private fetchInitialContext(callback?: () => void) {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ type: 'GET_CONTEXT' }, (res) => {
        if (res?.ok && res.data) {
          this.currentContext = res.data;
          this.render();
          if (callback) callback();
        }
      });
    }
  }

  private loadHistory() {
    if (!this.currentContext || !this.currentContext.cod_prj || this.currentContext.cod_prj === 'Unknown') return;
    this.isLoading = true;
    this.render();
    const { cod_prj, cod_apl, scope } = this.currentContext;
    try {
      chrome.runtime.sendMessage({ type: 'HISTORY', params: { cod_prj, cod_apl, scope } }, (res) => {
        this.isLoading = false;
        if (res?.ok) {
          this.historyItems = res.data.data || res.data || [];
          this.render();
        }
      });
    } catch (e) {
      this.isLoading = false;
      this.render();
    }
  }

  private openModal(snapshot: any, diffData: any) {
    const date = new Date(snapshot.captured_at).toLocaleString('pt-BR');
    this.modalContainer!.style.display = 'flex';
    this.modalContainer!.innerHTML = `
      <div style="width: 95%; height: 90%; background: #fff; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden;">
        <div style="padding: 16px 24px; background: #1e293b; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <b style="color: #38bdf8;">${snapshot.user_sc_login}</b>
            <span style="margin: 0 10px; color: #475569;">|</span>
            <span>${date}</span>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="modal-copy" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">📋 Copiar Código</button>
            <button id="modal-restore" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">🚀 Restaurar para o Editor</button>
            <button id="modal-close" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 28px; line-height: 1;">&times;</button>
          </div>
        </div>
        <div id="diff-target" style="flex: 1; overflow: auto; background: #f8fafc; padding: 0;"></div>
      </div>
    `;

    // Render Diff using Diff2Html
    if ((window as any).Diff2HtmlUI) {
      const diffTarget = this.modalContainer!.querySelector('#diff-target') as HTMLElement;
      const diff2htmlUi = new (window as any).Diff2HtmlUI(diffTarget, diffData.diff, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        rawEditorDiff: false,
        renderNothingWhenEmpty: false,
      });
      diff2htmlUi.draw();
      diff2htmlUi.highlightCode();
    }

    this.modalContainer!.querySelector('#modal-close')?.addEventListener('click', () => {
      this.modalContainer!.style.display = 'none';
    });

    this.modalContainer!.querySelector('#modal-copy')?.addEventListener('click', () => {
      this.copyToClipboard(snapshot.content);
    });

    this.modalContainer!.querySelector('#modal-restore')?.addEventListener('click', () => {
      if (confirm('Deseja restaurar esta versão do código? Isso substituirá o conteúdo atual do editor.')) {
        window.postMessage({ type: 'SVH_RESTORE_CONTENT', payload: snapshot.content }, '*');
        this.modalContainer!.style.display = 'none';
        alert('Conteúdo restaurado! Salve para confirmar.');
      }
    });

    this.modalContainer!.onclick = (e) => { if (e.target === this.modalContainer) this.modalContainer!.style.display = 'none'; };
  }

  private async copyToClipboard(text: string) {
    try {
      // Use a hidden textarea as fallback for better compatibility in extension frames
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      const btn = this.modalContainer!.querySelector('#modal-copy') as HTMLElement;
      const oldText = btn.innerText;
      btn.innerText = successful ? '✅ Copiado!' : '❌ Erro ao copiar';
      setTimeout(() => { btn.innerText = oldText; }, 2000);
    } catch (err) {
      console.error('SVH: Fallback copy failed', err);
    }
  }

  render() {
    const ctx = this.currentContext;
    const items = this.historyItems;
    this.container.innerHTML = `
      <div style="padding:16px; background:#1e293b; color:#fff; border-bottom:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="margin:0; font-size:16px; font-weight:600;">SVH History</h2>
          <button id="svh-close-sidebar" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:20px;">&times;</button>
        </div>
        <div style="font-size:11px; color:#94a3b8; display:grid; gap:4px; background:#0f172a; padding:8px; border-radius:4px;">
          <div><b>App:</b> <span style="color:#e2e8f0">${ctx?.cod_apl || '...'}</span></div>
          <div><b>Event:</b> <span style="color:#cbd5e1">${ctx?.scope || '...'}</span></div>
        </div>
      </div>
      <div style="flex:1; overflow-y:auto; background:#f8fafc;">
        ${this.isLoading ? '<div style="padding:40px; text-align:center; color:#64748b;">Carregando...</div>' : `
          <div style="padding:12px; font-size:11px; font-weight:bold; color:#475569; background:#f1f5f9; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between;">
            <span>TIMELINE</span>
            <button id="svh-manual-refresh" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:11px;">Refresh</button>
          </div>
          ${items.map(i => `
            <div class="svh-history-item" style="padding:10px 16px; border-bottom:1px solid #e2e8f0; cursor:pointer;" data-id="${i.id}">
              <div style="font-weight:600; font-size:13px; color:#1e293b; margin-bottom:2px;">${i.user_sc_login}</div>
              <div style="font-size:11px; color:#64748b;">${new Date(i.captured_at).toLocaleString('pt-BR')}</div>
            </div>
          `).join('')}
        `}
      </div>
      <style>.svh-history-item:hover { background: #eff6ff !important; }</style>
    `;

    this.container.querySelector('#svh-close-sidebar')?.addEventListener('click', () => { this.container.style.display = 'none'; });
    this.container.querySelector('#svh-manual-refresh')?.addEventListener('click', () => { this.loadHistory(); });
    this.container.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.id!;
        this.startDiffProcess(id);
      });
    });
  }

  private startDiffProcess(snapshotId: string) {
    // 1. Get current editor value
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'SVH_EDITOR_VALUE_RESULT') {
        window.removeEventListener('message', listener);
        this.fetchDiffAndOpen(snapshotId, event.data.payload);
      }
    };
    window.addEventListener('message', listener);
    window.postMessage({ type: 'SVH_GET_EDITOR_VALUE' }, '*');
  }

  private fetchDiffAndOpen(snapshotId: string, currentContent: string) {
    chrome.runtime.sendMessage({ type: 'RAW_DIFF', snapshotId, content: currentContent }, (res) => {
      if (res?.ok) {
        const diffData = res.data;
        chrome.runtime.sendMessage({ type: 'RESTORE', snapshotId }, (snapRes) => {
          if (snapRes?.ok) {
            this.openModal(snapRes.data, diffData);
          }
        });
      }
    });
  }
}
