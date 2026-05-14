export class Sidebar {
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
  }

  renderHistory(items: any[]) {
    this.container.innerHTML = `
      <div style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">History</div>
      <div style="padding:12px;">
        ${items.map(i => `
          <div style="padding:8px 0;border-bottom:1px solid #f3f4f6;cursor:pointer;" data-id="${i.id}">
            <div style="font-size:12px;color:#6b7280;">${i.captured_at}</div>
            <div style="font-size:13px;">${i.user_sc_login} &middot; ${i.scope}</div>
          </div>
        `).join('')}
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
