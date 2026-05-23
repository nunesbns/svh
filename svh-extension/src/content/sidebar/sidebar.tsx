import { Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui-base';
import hljs from 'highlight.js/lib/core';
import phpLang from 'highlight.js/lib/languages/php';
import xmlLang from 'highlight.js/lib/languages/xml';
import javascriptLang from 'highlight.js/lib/languages/javascript';
import { log } from '../../lib/logger';

// Register only the languages we care about. Smaller bundle, predictable
// detection (highlight.js auto-detect can pick odd languages on short
// snippets if too many are loaded).
hljs.registerLanguage('php', phpLang);
hljs.registerLanguage('xml', xmlLang); // also covers HTML
hljs.registerLanguage('html', xmlLang);
hljs.registerLanguage('javascript', javascriptLang);
hljs.registerLanguage('js', javascriptLang);
hljs.configure({ languages: ['php', 'xml', 'html', 'javascript', 'js'] });

export class Sidebar {
  private container: HTMLElement;
  private currentContext: any = null;
  private historyItems: any[] = [];
  private isLoading: boolean = false;
  private loadingItemId: string | null = null;
  private modalContainer: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('svh-sidebar')!;
    this.createModal();
    this.injectStyles();

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
      this.fetchInitialContext(() => {
        this.loadHistory();
      });
    });
  }

  private injectStyles() {
    // Inject Diff2Html stylesheet from the bundled vendor file. The JS is
    // imported as an npm module above, so we don't have to load any external
    // script (which would be blocked by Scriptcase's CSP).
    if (!document.getElementById('svh-diff-css')) {
      const css = document.createElement('link');
      css.id = 'svh-diff-css';
      css.rel = 'stylesheet';
      css.href = chrome.runtime.getURL('vendor/diff2html.min.css');
      document.head.appendChild(css);
    }

    // Highlight.js theme for syntax-coloring code inside the diff.
    if (!document.getElementById('svh-hljs-css')) {
      const css = document.createElement('link');
      css.id = 'svh-hljs-css';
      css.rel = 'stylesheet';
      css.href = chrome.runtime.getURL('vendor/highlight-github.min.css');
      document.head.appendChild(css);
    }

    // Override: highlight.js themes set `.hljs { background: #fff }`, which
    // would erase diff2html's red/green row tinting. Strip the background
    // (and any padding/display the theme tries to enforce) when .hljs is
    // applied inside a diff line.
    if (!document.getElementById('svh-hljs-override')) {
      const style = document.createElement('style');
      style.id = 'svh-hljs-override';
      style.textContent = `
        .d2h-code-line-ctn.hljs,
        .d2h-code-line .hljs,
        .d2h-code-side-line .hljs {
          background: transparent !important;
          padding: 0 !important;
          display: inline !important;
          color: inherit;
        }
      `;
      document.head.appendChild(style);
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
    const ctx = this.currentContext;
    if (!ctx) {
      console.warn('SVH Sidebar: Cannot load history - no context yet');
      return;
    }

    const isPublicLib = ctx.type === 'public_lib';
    const isLib = isPublicLib || ctx.type === 'project_lib' || ctx.type === 'lib_file';

    // Public libraries are global so we tolerate a missing project.
    // All other types need a project.
    if (!isPublicLib && (!ctx.cod_prj || ctx.cod_prj === 'Unknown')) {
      console.warn('SVH Sidebar: Cannot load history - missing project context', ctx);
      return;
    }

    this.isLoading = true;
    this.render();

    const params: Record<string, string> = {
      cod_prj: ctx.cod_prj,
      scope: ctx.scope,
      type: ctx.type,
    };
    // cod_apl is only meaningful for application-scoped types.
    if (!isLib && ctx.cod_apl && ctx.cod_apl !== 'Unknown') {
      params.cod_apl = ctx.cod_apl;
    }

    try {
      chrome.runtime.sendMessage({ type: 'HISTORY', params }, (res) => {
        this.isLoading = false;
        if (chrome.runtime.lastError) {
          console.warn('SVH: Runtime error during history load', chrome.runtime.lastError.message);
          this.render();
          return;
        }
        if (res?.ok) {
          this.historyItems = res.data?.data || res.data || [];
        } else {
          console.error('SVH: API error loading history', res?.error);
          this.historyItems = [];
        }
        this.render();
      });
    } catch (e) {
      this.isLoading = false;
      console.error('SVH: Exception loading history', e);
      this.render();
    }
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  }

  private renderValue(val: any): string {
    if (val === null || val === undefined || val === '') return 'Unknown';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return '[Object]';
      }
    }
    return String(val);
  }

  private escapeHtml(str: string): string {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Header label adapts to the kind of asset currently in scope so the user
   * knows whether they're looking at history for an event, a library file
   * or a PHP method.
   */
  private scopeLabel(type: string | undefined): string {
    switch (type) {
      case 'function': return 'Function';
      case 'lib_file': return 'Library';
      case 'project_lib': return 'Project library';
      case 'public_lib': return 'Public library';
      default: return 'Event';
    }
  }

  /**
   * Broadcasts a message to the top window AND every (nested) iframe.
   * Returns the count of frames that were notified.
   */
  private broadcastToFrames(message: any) {
    const visit = (win: Window) => {
      try {
        win.postMessage(message, '*');
      } catch {
        // ignore
      }
      try {
        for (let i = 0; i < win.frames.length; i++) {
          visit(win.frames[i]);
        }
      } catch {
        // cross-origin – cannot recurse, but its children received via the parent broadcast
      }
    };
    visit(window.top || window);
  }

  private openModal(snapshot: any, diffData: any) {
    const date = this.formatDate(snapshot.captured_at);
    this.modalContainer!.style.display = 'flex';
    this.modalContainer!.innerHTML = `
      <div style="width: 95%; height: 90%; background: #fff; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden;">
        <div style="padding: 16px 24px; background: #1e293b; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <b style="color: #38bdf8;">${this.escapeHtml(snapshot.user_sc_login)}</b>
            <span style="margin: 0 10px; color: #475569;">|</span>
            <span>${this.escapeHtml(date)}</span>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="modal-copy" style="background: #334155; color: #fff; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">📋 Copy code</button>
            <button id="modal-restore" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">🚀 Restore to editor</button>
            <button id="modal-close" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 28px; line-height: 1;">&times;</button>
          </div>
        </div>
        <div style="display: flex; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #1e293b;">
          <div style="flex: 1; padding: 8px 16px; border-right: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #f87171; border-radius: 50%;"></span>
            Editor · Current on-screen content
          </div>
          <div style="flex: 1; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></span>
            API · Saved snapshot
            <span style="font-weight: 400; color: #64748b;">${this.escapeHtml(this.formatDate(snapshot.captured_at))}</span>
          </div>
        </div>
        <div id="diff-target" style="flex: 1; overflow: auto; background: #f8fafc; padding: 0;"></div>
      </div>
    `;

    const diffTarget = this.modalContainer!.querySelector('#diff-target') as HTMLElement;

    if (!diffData?.diff || !this.hasRealHunks(diffData.diff)) {
      diffTarget.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;">No differences detected between the snapshot and the current editor content.</div>`;
    } else {
      try {
        const diffInput = this.normalizeDiff(diffData.diff);
        log('SVH Sidebar: rendering diff with hljs', { hljsAvailable: !!hljs, listed: hljs.listLanguages() });
        const ui = new Diff2HtmlUI(diffTarget, diffInput, {
          drawFileList: false,
          matching: 'lines',
          outputFormat: 'side-by-side',
          renderNothingWhenEmpty: false,
          highlight: true,
        }, hljs);
        ui.draw();
        // Inspect what diff2html generated.
        const fileWrappers = diffTarget.querySelectorAll('.d2h-file-wrapper');
        fileWrappers.forEach((fw, i) => {
          log(`SVH Sidebar: file wrapper ${i} data-lang="${fw.getAttribute('data-lang')}"`);
        });
        ui.highlightCode();
        const highlightedLines = diffTarget.querySelectorAll('.hljs').length;
        log(`SVH Sidebar: ${highlightedLines} lines received the .hljs class`);
        diffTarget.querySelectorAll('.d2h-file-header').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      } catch (err) {
        console.error('SVH Sidebar: error rendering diff', err);
        diffTarget.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626;">Failed to render diff.</div>`;
      }
    }

    this.modalContainer!.querySelector('#modal-close')?.addEventListener('click', () => {
      this.modalContainer!.style.display = 'none';
    });

    this.modalContainer!.querySelector('#modal-copy')?.addEventListener('click', () => {
      this.copyToClipboard(snapshot.content);
    });

    this.modalContainer!.querySelector('#modal-restore')?.addEventListener('click', () => {
      this.requestRestore(snapshot.content);
    });

    this.modalContainer!.onclick = (e) => {
      if (e.target === this.modalContainer) this.modalContainer!.style.display = 'none';
    };
  }

  /**
   * A unified diff is "real" only if it contains at least one hunk header
   * (e.g. `@@ -1,5 +1,5 @@`). Otherwise it's just the file headers and
   * diff2html will throw "Failed to parse lines, starting in 0!".
   */
  private hasRealHunks(diff: string): boolean {
    return /^@@\s/m.test(diff);
  }

  /**
   * Ensures the unified diff string starts with a `diff --git` style header,
   * which makes diff2html attach a stable file id. The backend now emits
   * `--- a/editor.php / +++ b/snapshot.php`, so an extra `diff --git` line
   * is purely cosmetic but harmless.
   */
  private normalizeDiff(rawDiff: string): string {
    if (rawDiff.startsWith('diff --git')) return rawDiff;
    return `diff --git a/editor.php b/snapshot.php\n${rawDiff}`;
  }

  private async copyToClipboard(text: string) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      const btn = this.modalContainer!.querySelector('#modal-copy') as HTMLElement;
      if (btn) {
        const oldText = btn.innerText;
        btn.innerText = successful ? '✅ Copied!' : '❌ Failed to copy';
        setTimeout(() => { btn.innerText = oldText; }, 2000);
      }
    } catch (err) {
      console.error('SVH: Fallback copy failed', err);
    }
  }

  private requestRestore(content: string) {
    if (!confirm('Restore this version of the code? It will replace the current editor content.')) {
      return;
    }

    let acknowledged = false;
    const ackListener = (e: MessageEvent) => {
      if (e.data?.type === 'SVH_RESTORE_CONTENT_RESULT') {
        acknowledged = true;
        window.removeEventListener('message', ackListener);
        clearTimeout(timeoutId);
        if (e.data.ok) {
          this.modalContainer!.style.display = 'none';
        } else {
          alert('Could not apply content to the editor. Make sure the editor is visible.');
        }
      }
    };
    window.addEventListener('message', ackListener);

    const timeoutId = window.setTimeout(() => {
      if (acknowledged) return;
      window.removeEventListener('message', ackListener);
      alert('Timed out while restoring. The editor may be hidden or unavailable.');
    }, 2000);

    this.broadcastToFrames({ type: 'SVH_RESTORE_CONTENT', payload: content });
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
          <div><b>Project:</b> <span style="color:#e2e8f0">${this.escapeHtml(this.renderValue(ctx?.cod_prj))}</span></div>
          <div><b>App:</b> <span style="color:#e2e8f0">${this.escapeHtml(this.renderValue(ctx?.cod_apl))}</span></div>
          <div><b>${this.scopeLabel(ctx?.type)}:</b> <span style="color:#cbd5e1">${this.escapeHtml(this.renderValue(ctx?.scope))}</span></div>
          <div><b>User:</b> <span style="color:#cbd5e1">${this.escapeHtml(this.renderValue(ctx?.user_sc_login))}</span></div>
        </div>
      </div>

      <div style="flex:1; overflow-y:auto; background:#f8fafc; display:flex; flex-direction:column;">
        ${this.isLoading ? `
          <div style="padding:40px; text-align:center; color:#64748b;">
            <div style="margin-bottom:8px;">Loading...</div>
          </div>
        ` : `
          <div style="padding:12px; font-size:11px; font-weight:bold; color:#475569; background:#f1f5f9; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <span>TIMELINE</span>
            <button id="svh-manual-refresh" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:11px;">Refresh</button>
          </div>
          <div style="display:flex; flex-direction:column;">
            ${items.length ? items.map(i => {
              const loading = this.loadingItemId === i.id;
              return `
                <div class="svh-history-item${loading ? ' is-loading' : ''}" style="padding:10px 16px; border-bottom:1px solid #e2e8f0; cursor:${loading ? 'wait' : 'pointer'}; transition:background 0.2s; display:flex; align-items:center; justify-content:space-between; gap:8px;" data-id="${this.escapeHtml(i.id)}">
                  <div style="min-width:0; flex:1;">
                    <div style="font-weight:600; font-size:13px; color:#1e293b; margin-bottom:2px;">${this.escapeHtml(i.user_sc_login)}</div>
                    <div style="font-size:11px; color:#64748b;">${this.escapeHtml(this.formatDate(i.captured_at))}</div>
                  </div>
                  ${loading ? `<div class="svh-spinner" aria-label="Loading"></div>` : ''}
                </div>
              `;
            }).join('') : `
              <div style="padding:40px 20px; color:#94a3b8; text-align:center;">
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
        .svh-history-item.is-loading { background: #f1f5f9 !important; pointer-events: none; opacity: 0.85; }
        .svh-spinner {
          width: 16px; height: 16px; flex: none;
          border: 2px solid #cbd5e1;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: svh-spin 0.8s linear infinite;
        }
        @keyframes svh-spin { to { transform: rotate(360deg); } }
      </style>
    `;

    this.container.querySelector('#svh-close-sidebar')?.addEventListener('click', () => {
      this.container.style.display = 'none';
    });
    this.container.querySelector('#svh-manual-refresh')?.addEventListener('click', () => {
      this.loadHistory();
    });
    this.container.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        if (this.loadingItemId) return; // ignore clicks while another item is loading
        const id = (el as HTMLElement).dataset.id!;
        this.startDiffProcess(id);
      });
    });
  }

  private setLoadingItem(id: string | null) {
    this.loadingItemId = id;
    this.render();
  }

  private startDiffProcess(snapshotId: string) {
    log('SVH Sidebar: startDiffProcess', { snapshotId });

    this.setLoadingItem(snapshotId);

    let settled = false;

    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'SVH_EDITOR_VALUE_RESULT') {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', listener);
        clearTimeout(timeoutId);
        const payload = typeof event.data.payload === 'string' ? event.data.payload : '';
        log('SVH Sidebar: editor value received', { length: payload.length });
        this.fetchDiffAndOpen(snapshotId, payload);
      }
    };
    window.addEventListener('message', listener);

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', listener);
      console.warn('SVH Sidebar: timeout waiting for editor value, falling back to empty content');
      this.fetchDiffAndOpen(snapshotId, '');
    }, 2000);

    this.broadcastToFrames({ type: 'SVH_GET_EDITOR_VALUE' });
  }

  private fetchDiffAndOpen(snapshotId: string, currentContent: string) {
    log('SVH Sidebar: fetchDiffAndOpen', { snapshotId, contentLength: currentContent?.length ?? 0 });
    chrome.runtime.sendMessage({ type: 'RAW_DIFF', snapshotId, content: currentContent ?? '' }, (res) => {
      if (chrome.runtime.lastError) {
        console.error('SVH: Runtime error during diff load', chrome.runtime.lastError.message);
        alert('Extension communication error.');
        this.setLoadingItem(null);
        return;
      }
      if (!res?.ok) {
        console.error('SVH: API error generating diff', res?.error);
        alert('Failed to generate diff: ' + (res?.error || 'Unknown error'));
        this.setLoadingItem(null);
        return;
      }
      const diffData = res.data;
      log('SVH Sidebar: diff received', { hasDiff: !!diffData?.diff, diffLength: diffData?.diff?.length });
      chrome.runtime.sendMessage({ type: 'RESTORE', snapshotId }, (snapRes) => {
        this.setLoadingItem(null);
        if (chrome.runtime.lastError) {
          console.error('SVH: Runtime error during snapshot fetch', chrome.runtime.lastError.message);
          alert('Extension communication error.');
          return;
        }
        if (snapRes?.ok) {
          this.openModal(snapRes.data, diffData);
        } else {
          console.error('SVH: API error loading snapshot', snapRes?.error);
          alert('Failed to load snapshot: ' + (snapRes?.error || 'Unknown error'));
        }
      });
    });
  }
}
