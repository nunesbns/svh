import { DomResolver } from './dom-resolver';
import { EditorBridge } from './editor-bridge';
import { SaveInterceptor } from './save-interceptor';
import { Sidebar } from './sidebar/sidebar';
import { log, IS_DEV } from '../lib/logger';

let resolver: DomResolver | null = null;
let bridge: EditorBridge | null = null;
let interceptor: SaveInterceptor | null = null;
let conflictModal: HTMLElement | null = null;
let currentAppKey: string | null = null;

function isContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

function init() {
  if (!isContextValid()) return;

  const isTop = window === window.top;
  const frameId = isTop ? 'TOP' : `FRAME_${Math.random().toString(36).substring(7)}`;
  
  if ((window as any).SVH_INITIALIZED) return;
  (window as any).SVH_INITIALIZED = true;

  log(`SVH: Initializing in ${frameId}`, { url: window.location.href });

  resolver = new DomResolver();
  bridge = new EditorBridge();
  interceptor = new SaveInterceptor(resolver, bridge);

  resolver.start();
  bridge.start();
  interceptor.start();

  setupConflictMonitor();

  // Inject the main-world bridge so we can read/write the CodeMirror
  // instance attached to `.CodeMirror` (only accessible from the page's
  // own JS context).
  injectMainWorldBridge();

  // Self-destruct logic: if extension is reloaded, stop everything
  const checkInterval = setInterval(() => {
    if (!isContextValid()) {
      log(`SVH: Context invalidated in ${frameId}, cleaning up...`);
      clearInterval(checkInterval);
      resolver?.stop();
      bridge?.stop();
      // Add more cleanup if needed
      (window as any).SVH_INITIALIZED = false;
    }
  }, 2000);

  // ONLY UI logic
  const attachUI = async () => {
    if (!isContextValid()) return;
    if (document.querySelector('#svh-toggle-btn')) return;

    const isLibEditor = window.location.pathname.endsWith('/nm_edit_php_edit.php')
      || window.location.href.includes('nm_edit_php_edit.php');

    if (isLibEditor) {
      // Only show the button once we know which kind of library is being
      // edited. The background captures that from the open request
      // (`form_upload=open` + `field_module`); until we have a writable
      // kind cached, we keep the button hidden so it doesn't flash on
      // every helper page hosted by `nm_edit_php_edit.php`.
      const libKind = await fetchLibKindForTab();
      if (libKind !== 'project_lib' && libKind !== 'public_lib') {
        log(`SVH: Skipping UI in ${frameId}, libKind=${libKind ?? 'null'}`);
        return;
      }
    }

    const inlineTarget = document.querySelector('#id_main_table');

    // Outside the lib editor we wait for #id_main_table to exist; the lib
    // editor has no such anchor so we use a floating button anchored to the
    // viewport instead.
    if (!inlineTarget && !isLibEditor) return;

    log(`SVH: Attaching button in ${frameId} (lib=${isLibEditor})`);

    let sidebarEl = document.getElementById('svh-sidebar');
    if (!sidebarEl) {
      sidebarEl = document.createElement('div');
      sidebarEl.id = 'svh-sidebar';
      sidebarEl.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        z-index: 999999;
        background: #fff;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        border-left: 1px solid #ddd;
        font-family: sans-serif;
      `;
      document.body.appendChild(sidebarEl);
      new Sidebar();
    }

    const toggle = document.createElement('button');
    toggle.id = 'svh-toggle-btn';
    toggle.innerText = '🕒 SVH History';

    const checkSyntaxBtn = document.createElement('button');
    checkSyntaxBtn.id = 'svh-check-syntax-btn';
    checkSyntaxBtn.innerText = '🔍 Check Syntax';

    const formatBtn = document.createElement('button');
    formatBtn.id = 'svh-format-btn';
    formatBtn.innerText = '✨ Format';

    if (isLibEditor) {
      // Floating button container for the lib editor: fixed to the top-right corner
      // because the lib page has no top toolbar to attach to.
      let btnContainer = document.getElementById('svh-button-container');
      if (!btnContainer) {
        btnContainer = document.createElement('div');
        btnContainer.id = 'svh-button-container';
        btnContainer.style.cssText = `
          position: fixed;
          top: 8px;
          right: 12px;
          z-index: 999998;
          display: flex;
          gap: 8px;
        `;
        document.body.appendChild(btnContainer);
      }

      toggle.style.cssText = `
        padding: 6px 14px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      `;

      checkSyntaxBtn.style.cssText = `
        padding: 6px 14px;
        background: #0f766e;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      `;

      formatBtn.style.cssText = `
        padding: 6px 14px;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      `;

      btnContainer.appendChild(toggle);
      btnContainer.appendChild(checkSyntaxBtn);
      btnContainer.appendChild(formatBtn);
    } else {
      toggle.style.cssText = `
        margin-left: 10px;
        padding: 4px 12px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `;

      checkSyntaxBtn.style.cssText = `
        margin-left: 8px;
        padding: 4px 12px;
        background: #0f766e;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `;

      formatBtn.style.cssText = `
        margin-left: 8px;
        padding: 4px 12px;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `;

      inlineTarget!.appendChild(toggle);
      inlineTarget!.appendChild(checkSyntaxBtn);
      inlineTarget!.appendChild(formatBtn);
    }

    toggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = sidebarEl!.style.display === 'flex';
      sidebarEl!.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        // Force resolver to refresh context from current DOM before loading history
        if (resolver) resolver.resolve();
        document.dispatchEvent(new CustomEvent('svh:refresh-history'));
      }
    };

    checkSyntaxBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      runSyntaxCheck();
    };

    formatBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      runFormatCode();
    };
  };

  const broadcastToFrames = (message: any) => {
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
        // cross-origin
      }
    };
    visit(window.top || window);
  };

  const escapeHtml = (str: string): string => {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const showSyntaxResultModal = (result: { loading: boolean; valid?: boolean; error?: string; line?: number }) => {
    let modal = document.getElementById('svh-syntax-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'svh-syntax-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
        z-index: 2000000; display: flex; align-items: center; justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(modal);
    }

    if (result.loading) {
      modal.innerHTML = `
        <div style="background: #fff; border-radius: 8px; width: 350px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); overflow: hidden; border: 1px solid #e2e8f0; padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div class="svh-syntax-spinner" style="width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #0f766e; border-radius: 50%; animation: svh-syntax-spin 0.8s linear infinite;"></div>
          <div style="font-weight: 600; color: #0f766e; font-size: 15px;">Checking PHP Syntax...</div>
          <div style="color: #64748b; font-size: 13px;">Please wait while the code is validated.</div>
        </div>
        <style>
          @keyframes svh-syntax-spin { to { transform: rotate(360deg); } }
        </style>
      `;
      modal.style.display = 'flex';
      return;
    }

    if (result.valid) {
      modal.innerHTML = `
        <div style="background: #fff; border-radius: 8px; width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); overflow: hidden; border: 1px solid #bbf7d0;">
          <div style="background: #dcfce7; padding: 20px; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 32px;">✅</div>
            <div>
              <h3 style="margin: 0; color: #166534; font-size: 18px; font-weight: 700;">Syntax Valid!</h3>
              <p style="margin: 5px 0 0 0; color: #15803d; font-size: 14px;">No errors found.</p>
            </div>
          </div>
          <div style="padding: 24px; text-align: center;">
            <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.5;">
              The PHP code is syntactically correct.
            </p>
            <button id="close-syntax-modal" style="width: 100%; background: #166534; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
              OK
            </button>
          </div>
        </div>
      `;
    } else {
      const errorMsg = result.error || 'Unknown syntax error.';
      const lineInfo = result.line ? ` on line <b>${result.line}</b>` : '';
      modal.innerHTML = `
        <div style="background: #fff; border-radius: 8px; width: 450px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); overflow: hidden; border: 1px solid #fecaca;">
          <div style="background: #fee2e2; padding: 20px; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 32px;">❌</div>
            <div>
              <h3 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Syntax Error!</h3>
              <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 14px;">PHP compilation failed.</p>
            </div>
          </div>
          <div style="padding: 24px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-family: monospace; font-size: 13px; color: #334155; max-height: 150px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(errorMsg)}</div>
            <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
              A syntax error was detected${lineInfo}.
            </p>
            <div style="display: flex; gap: 12px;">
              ${result.line ? `
                <button id="go-to-error-line" style="flex: 1; background: #2563eb; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                  Go to Line ${result.line}
                </button>
              ` : ''}
              <button id="close-syntax-modal" style="flex: 1; background: #64748b; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      if (result.line) {
        modal.querySelector('#go-to-error-line')?.addEventListener('click', () => {
          broadcastToFrames({ type: 'SVH_FOCUS_ERROR_LINE', payload: result.line });
          modal!.style.display = 'none';
        });
      }
    }

    modal.style.display = 'flex';

    modal.querySelector('#close-syntax-modal')?.addEventListener('click', () => {
      modal!.style.display = 'none';
    });

    modal.onclick = (e) => {
      if (e.target === modal) modal!.style.display = 'none';
    };
  };

  const runSyntaxCheck = () => {
    showSyntaxResultModal({ loading: true });

    let settled = false;
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'SVH_EDITOR_VALUE_RESULT') {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', listener);
        clearTimeout(timeoutId);
        const payload = typeof event.data.payload === 'string' ? event.data.payload : '';
        
        chrome.runtime.sendMessage({ type: 'VALIDATE_PHP', content: payload }, (res) => {
          if (chrome.runtime.lastError) {
            console.error('SVH: Validate runtime error', chrome.runtime.lastError.message);
            showSyntaxResultModal({ loading: false, valid: false, error: 'Communication error: extension context may have been reloaded.' });
            return;
          }
          if (res?.ok && res.data) {
            showSyntaxResultModal({
              loading: false,
              valid: res.data.valid,
              error: res.data.error,
              line: res.data.line
            });
          } else {
            showSyntaxResultModal({
              loading: false,
              valid: false,
              error: res?.error || 'Failed to validate PHP.'
            });
          }
        });
      }
    };
    window.addEventListener('message', listener);

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', listener);
      showSyntaxResultModal({ loading: false, valid: false, error: 'Timeout waiting for editor content.' });
    }, 2000);

    broadcastToFrames({ type: 'SVH_GET_EDITOR_VALUE' });
  };

  const runFormatCode = () => {
    showSyntaxResultModal({ loading: true });

    let settled = false;
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'SVH_EDITOR_VALUE_RESULT') {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', listener);
        clearTimeout(timeoutId);
        const payload = typeof event.data.payload === 'string' ? event.data.payload : '';

        chrome.runtime.sendMessage({ type: 'FORMAT_PHP', content: payload }, (res) => {
          if (chrome.runtime.lastError) {
            console.error('SVH: Format runtime error', chrome.runtime.lastError.message);
            showSyntaxResultModal({ loading: false, valid: false, error: 'Communication error: extension context may have been reloaded.' });
            return;
          }
          if (res?.ok && res.data) {
            if (res.data.valid) {
              // Hide loading modal
              const modal = document.getElementById('svh-syntax-modal');
              if (modal) modal.style.display = 'none';

              // Restore the formatted content back into the editor
              broadcastToFrames({ type: 'SVH_RESTORE_CONTENT', payload: res.data.content });
            } else {
              // Syntax error prevented formatting: show the error details to user
              showSyntaxResultModal({
                loading: false,
                valid: false,
                error: res.data.error,
                line: res.data.line
              });
            }
          } else {
            showSyntaxResultModal({
              loading: false,
              valid: false,
              error: res?.error || 'Failed to format PHP.'
            });
          }
        });
      }
    };
    window.addEventListener('message', listener);

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', listener);
      showSyntaxResultModal({ loading: false, valid: false, error: 'Timeout waiting for editor content.' });
    }, 2000);

    broadcastToFrames({ type: 'SVH_GET_EDITOR_VALUE' });
  };

  /**
   * Removes the existing button (if any) and re-runs attachUI. Called when
   * the tab context changes (for instance, the user navigated from an event
   * to a library, or to a built-in scriptcase lib that shouldn't show it).
   */
  const reEvaluateUI = () => {
    const existing = document.getElementById('svh-toggle-btn');
    if (existing) existing.remove();
    const existingSyntax = document.getElementById('svh-check-syntax-btn');
    if (existingSyntax) existingSyntax.remove();
    const existingFormat = document.getElementById('svh-format-btn');
    if (existingFormat) existingFormat.remove();
    const existingContainer = document.getElementById('svh-button-container');
    if (existingContainer) existingContainer.remove();
    attachUI();
  };

  const observer = new MutationObserver(() => attachUI());
  observer.observe(document.body, { childList: true, subtree: true });
  attachUI();

  // The Scriptcase toolbar exposes the active project via the hidden input
  // `sys_toolbar_grpcod`. That input lives in the `main.php` frame, NOT in
  // the lib editor frame, so we report it from whichever frame happens to
  // host it. The background needs that value to tag lib snapshots with
  // the right project — without it, libraries land with cod_prj=Unknown
  // and the API rejects them with "Project Not Mapped".
  const reportProjectFromToolbar = () => {
    const input = document.querySelector('input[name="sys_toolbar_grpcod"]') as HTMLInputElement | null;
    const codPrj = input?.value?.trim();
    if (!codPrj) return;
    try {
      chrome.runtime.sendMessage({ type: 'SET_LIB_PROJECT', cod_prj: codPrj }).catch(() => {});
    } catch {
      // chrome.runtime may be unavailable during reload — ignore.
    }
  };
  reportProjectFromToolbar();
  const toolbarObserver = new MutationObserver(reportProjectFromToolbar);
  toolbarObserver.observe(document.body, { childList: true, subtree: true });

  // Top frame: dispatch context updates as a custom DOM event for the sidebar.
  if (isTop) {
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'SVH_CONTEXT_UPDATED') {
        document.dispatchEvent(new CustomEvent('svh:context-updated', { detail: e.data.payload }));
      }
    });
  }

  // Editor bridge messages: forward between the sidebar (isolated world)
  // and the page's main-world bridge (which can reach CodeMirror via
  // `document.querySelector('.CodeMirror').CodeMirror`).
  //
  // Cross-frame routing uses chrome.runtime messaging because plain
  // window.postMessage between iframes is unreliable in some Scriptcase
  // layouts (sandboxed/isolated frames). The flow is:
  //
  //   sidebar (top, isolated)
  //     -> broadcastToFrames(SVH_GET_EDITOR_VALUE)         [postMessage to every window]
  //   injector in each frame (isolated)
  //     -> window.postMessage(SVH_MAIN_GET_EDITOR_VALUE)   [same window]
  //   main-world bridge in the frame holding the editor
  //     -> window.postMessage(SVH_MAIN_EDITOR_VALUE_RESULT) [same window]
  //   injector in that frame
  //     -> chrome.runtime.sendMessage(SVH_RELAY_TO_TOP, …)
  //   background
  //     -> chrome.tabs.sendMessage(tabId, …, { frameId: 0 })
  //   injector in the TOP frame
  //     -> window.postMessage(SVH_EDITOR_VALUE_RESULT)     [top window]
  //   sidebar listener fires.
  window.addEventListener('message', (e) => {
    if (e.source !== window) return; // only same-window messages
    if (!e.data || typeof e.data !== 'object') return;

    const t = e.data.type;

    if (t === 'SVH_GET_EDITOR_VALUE') {
      window.postMessage({ type: 'SVH_MAIN_GET_EDITOR_VALUE' }, '*');
    }

    if (t === 'SVH_RESTORE_CONTENT') {
      window.postMessage(
        { type: 'SVH_MAIN_RESTORE_CONTENT', payload: e.data.payload },
        '*',
      );
    }

    if (t === 'SVH_FOCUS_ERROR_LINE') {
      window.postMessage(
        { type: 'SVH_MAIN_FOCUS_ERROR_LINE', payload: e.data.payload },
        '*',
      );
    }

    if (t === 'SVH_MAIN_EDITOR_VALUE_RESULT') {
      const payload = typeof e.data.payload === 'string' ? e.data.payload : '';
      log(`SVH Injector [${frameId}]: relaying editor value to top, length=${payload.length}`);
      try {
        chrome.runtime.sendMessage({
          type: 'SVH_RELAY_TO_TOP',
          payload: { type: 'SVH_EDITOR_VALUE_RESULT', payload },
        }).then(() => {
          log(`SVH Injector [${frameId}]: relay request acknowledged by background`);
        }).catch((err) => {
          console.error(`SVH Injector [${frameId}]: relay request FAILED`, err?.message || err);
        });
      } catch (err) {
        console.error(`SVH Injector [${frameId}]: chrome.runtime unavailable`, err);
      }
    }

    if (t === 'SVH_MAIN_RESTORE_CONTENT_RESULT') {
      log(`SVH Injector [${frameId}]: relaying restore ack to top, ok=${e.data.ok}`);
      try {
        chrome.runtime.sendMessage({
          type: 'SVH_RELAY_TO_TOP',
          payload: { type: 'SVH_RESTORE_CONTENT_RESULT', ok: e.data.ok },
        }).catch((err) => {
          console.error(`SVH Injector [${frameId}]: restore-ack relay FAILED`, err?.message || err);
        });
      } catch {
        // ignore
      }
    }
  });

  // Any frame that hosts the sidebar receives relays from background and
  // re-emits them as a window.postMessage so the sidebar listener fires.
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || typeof msg !== 'object') return false;

    // Editor bridge replies routed back from another frame (cross-frame
    // postMessage isn't reliable inside Scriptcase's iframe layout).
    if (msg.type === 'SVH_EDITOR_VALUE_RESULT' || msg.type === 'SVH_RESTORE_CONTENT_RESULT') {
      const sidebarEl = document.getElementById('svh-sidebar');
      if (!sidebarEl) return false;
      log(`SVH Injector [${frameId}]: relayed message arrived, type=${msg.type}`);
      window.postMessage(msg, '*');
      return false;
    }

    // Background tells every frame that the tab context changed (e.g. user
    // just opened a library). The frame hosting the sidebar updates its
    // header and reloads history; other frames re-evaluate whether the
    // history button should be visible.
    if (msg.type === 'SVH_CONTEXT_PUSH') {
      log(`SVH Injector [${frameId}]: SVH_CONTEXT_PUSH`, msg.payload);
      // Internal scriptcase libs are signalled with a marker payload that
      // doesn't carry a real context — only re-run attachUI to hide the
      // button, never overwrite the sidebar's current context.
      if (msg.payload?.__libKind) {
        reEvaluateUI();
        return false;
      }
      document.dispatchEvent(new CustomEvent('svh:context-updated', { detail: msg.payload }));
      // Re-run attachUI so the floating button appears/disappears as needed.
      reEvaluateUI();
      return false;
    }

    return false;
  });
}

function setupConflictMonitor() {
  document.addEventListener('svh:context-updated', (e: any) => {
    const ctx = e.detail;
    if (!ctx || !ctx.cod_prj || !ctx.cod_apl || ctx.cod_prj === 'Unknown' || ctx.cod_apl === 'Unknown') return;

    const appKey = `${ctx.cod_prj}:${ctx.cod_apl}`;
    if (appKey === currentAppKey) return;
    currentAppKey = appKey;

    chrome.runtime.sendMessage({ type: 'CONFLICTS', codPrj: ctx.cod_prj, codApl: ctx.cod_apl }, (res) => {
      if (res?.ok && res.data?.length > 0) {
        const others = res.data.filter((u: any) => u.user !== ctx.user_sc_login);
        if (others.length > 0) {
          showConflictModal(others.map((u: any) => u.user));
        }
      }
    });
  });
}

function showConflictModal(users: string[]) {
  if (!conflictModal) {
    conflictModal = document.createElement('div');
    conflictModal.id = 'svh-conflict-modal';
    conflictModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      z-index: 2000000; display: flex; align-items: center; justify-content: center;
      font-family: sans-serif;
    `;
    document.body.appendChild(conflictModal);
  }

  const usersText = users.join(', ');
  const titleText = users.length === 1 ? 'Usuário editando a tela' : 'Usuários editando a tela';
  const descriptionText = users.length === 1
    ? `O usuário <b>${usersText}</b> está editando esta tela.`
    : `Os usuários <b>${usersText}</b> estão editando esta tela.`;

  conflictModal.innerHTML = `
    <div style="background: #fff; border-radius: 8px; width: 450px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden; border: 1px solid #fecaca;">
      <div style="background: #fee2e2; padding: 20px; display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 32px;">⚠️</div>
        <div>
          <h3 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Conflito de Edição!</h3>
          <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 14px;">${titleText}</p>
        </div>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.5;">
          ${descriptionText}
        </p>
        <p style="margin: 0 0 24px 0; color: #64748b; font-size: 13px; font-style: italic;">
          Tenha cuidado ao salvar para não sobrescrever o trabalho alheio.
        </p>
        <button id="close-conflict-modal" style="width: 100%; background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
          Entendi, vou tomar cuidado
        </button>
      </div>
    </div>
  `;

  conflictModal.style.display = 'flex';
  
  const btn = conflictModal.querySelector('#close-conflict-modal');
  btn?.addEventListener('click', () => {
    conflictModal!.style.display = 'none';
  });

  // Also close on background click
  conflictModal.onclick = (e) => {
    if (e.target === conflictModal) conflictModal!.style.display = 'none';
  };
}

function injectMainWorldBridge() {
  if (!isContextValid()) {
    console.warn('SVH Injector: cannot inject main-world bridge, context invalid');
    return;
  }
  if ((document as any).__SVH_MAIN_BRIDGE_INJECTED) {
    log('SVH Injector: main-world bridge already injected, skipping');
    return;
  }
  (document as any).__SVH_MAIN_BRIDGE_INJECTED = true;

  const url = chrome.runtime.getURL('inject/editor-bridge-main.js');
  log('SVH Injector: injecting main-world bridge from', url);

  const script = document.createElement('script');
  script.src = url;
  script.setAttribute('data-dev', String(IS_DEV));
  script.onload = () => {
    log('SVH Injector: main-world bridge script loaded');
    script.remove();
  };
  script.onerror = (e) => {
    console.error('SVH Injector: FAILED to load main-world bridge', e);
  };
  (document.head || document.documentElement).appendChild(script);
}

/**
 * Asks the background for the library kind cached for this tab. Returns
 * one of `'project_lib' | 'public_lib' | 'scriptcase_internal' | null`.
 * The injector uses this to decide whether to render the history button on
 * a given lib page.
 */
async function fetchLibKindForTab(): Promise<string | null> {
  try {
    if (!chrome.runtime?.id) return null;
    const reply = await chrome.runtime.sendMessage({ type: 'GET_LIB_KIND' });
    return reply?.kind ?? null;
  } catch {
    return null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
