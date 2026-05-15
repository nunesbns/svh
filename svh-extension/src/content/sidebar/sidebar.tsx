export class Sidebar {
  private container: HTMLElement;
  private currentContext: any = null;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
    
    document.addEventListener('svh:context-updated', (e: any) => {
      this.currentContext = e.detail;
      this.render();
    });

    document.addEventListener('svh:refresh-history', () => {
      this.loadHistory();
    });
  }

  private loadHistory() {
    if (!this.currentContext) return;
    
    const { cod_prj, cod_apl, scope } = this.currentContext;
    chrome.runtime.sendMessage({ 
      type: 'HISTORY', 
      params: { cod_prj, cod_apl, scope } 
    }, (res) => {
      if (res?.ok) {
        this.render(res.data);
      }
    });
  }

  render(items: any[] = []) {
    const ctx = this.currentContext;
    this.container.innerHTML = `
      <div style="padding:16px; background:#f8fafc; border-bottom:1px solid #e2e8f0;">
        <h2 style="margin:0 0 12px 0; font-size:16px; color:#1e293b;">SVH Dashboard</h2>
        <div style="font-size:12px; color:#64748b; display:grid; gap:4px;">
          <div><b>User:</b> ${ctx?.user_sc_login || 'Detecting...'}</div>
          <div><b>Project:</b> ${ctx?.cod_prj || 'Detecting...'}</div>
          <div><b>App:</b> ${ctx?.cod_apl || 'Detecting...'}</div>
          <div><b>Scope:</b> ${ctx?.scope || 'Detecting...'}</div>
        </div>
      </div>
      <div style="padding:12px; font-weight:bold; color:#475569; border-bottom:1px solid #f1f5f9;">History Timeline</div>
      <div style="padding:0 12px; overflow-y:auto; flex:1;">
        ${items.length ? items.map(i => `
          <div style="padding:12px 0; border-bottom:1px solid #f1f5f9; cursor:pointer;" data-id="${i.id}">
            <div style="font-size:11px; color:#94a3b8;">${new Date(i.captured_at).toLocaleString()}</div>
            <div style="font-size:13px; color:#334155;">${i.user_sc_login}</div>
            <div style="font-size:12px; color:#64748b;">${i.scope}</div>
          </div>
        `).join('') : '<div style="padding:20px; color:#94a3b8; text-align:center;">No history found for this scope</div>'}
      </div>
    `;

    this.container.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.id!;
        this.requestRestore(id);
      });
    });
  }

  private requestRestore(id: string) {
    chrome.runtime.sendMessage({ type: 'RESTORE', snapshotId: id }, (res) => {
      if (res?.ok) {
        alert('Restored. Please save on IDE to confirm.');
      }
    });
  }
}
