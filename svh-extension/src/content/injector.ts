import { DomResolver } from './dom-resolver';
import { EditorBridge } from './editor-bridge';
import { SaveInterceptor } from './save-interceptor';
import { Sidebar } from './sidebar/sidebar';

let resolver: DomResolver | null = null;
let bridge: EditorBridge | null = null;
let interceptor: SaveInterceptor | null = null;

function isContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

function init() {
  if (!isContextValid()) return;

  const isTop = window === window.top;
  const frameId = isTop ? 'TOP' : `FRAME_${Math.random().toString(36).substring(7)}`;
  
  if ((window as any).SVH_INITIALIZED) return;
  (window as any).SVH_INITIALIZED = true;

  console.log(`SVH: Initializing in ${frameId}`, { url: window.location.href });

  resolver = new DomResolver();
  bridge = new EditorBridge();
  interceptor = new SaveInterceptor(resolver, bridge);

  resolver.start();
  bridge.start();
  interceptor.start();

  // Self-destruct logic: if extension is reloaded, stop everything
  const checkInterval = setInterval(() => {
    if (!isContextValid()) {
      console.log(`SVH: Context invalidated in ${frameId}, cleaning up...`);
      clearInterval(checkInterval);
      resolver?.stop();
      bridge?.stop();
      // Add more cleanup if needed
      (window as any).SVH_INITIALIZED = false;
    }
  }, 2000);

  // ONLY UI logic
  const attachUI = () => {
    if (!isContextValid()) return;
    const target = document.querySelector('#id_main_table');
    if (!target) return;
    
    if (document.querySelector('#svh-toggle-btn')) return;

    console.log(`SVH: Found #id_main_table in ${frameId}, attaching button`);

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

    target.appendChild(toggle);
  };

  const observer = new MutationObserver(() => attachUI());
  observer.observe(document.body, { childList: true, subtree: true });
  attachUI();

  // Top frame: dispatch context updates as a custom DOM event for the sidebar.
  if (isTop) {
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'SVH_CONTEXT_UPDATED') {
        document.dispatchEvent(new CustomEvent('svh:context-updated', { detail: e.data.payload }));
      }
    });
  }

  // Editor bridge messages must be handled in EVERY frame, because the
  // Scriptcase code editor lives inside a nested iframe and only that
  // frame can read/write `window.editor`. The frame that holds the editor
  // answers; the others stay silent.
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'SVH_GET_EDITOR_VALUE') {
      if (!bridge?.hasEditor()) return;
      const val = bridge.getValue();
      const normalized = typeof val === 'string' ? val : '';
      console.log(`SVH Injector [${frameId}]: responding to GET_EDITOR_VALUE, length=${normalized.length}`);
      // Reply via the top window so the sidebar listener (which is in top) hears it.
      try {
        window.top?.postMessage({ type: 'SVH_EDITOR_VALUE_RESULT', payload: normalized }, '*');
      } catch {
        window.postMessage({ type: 'SVH_EDITOR_VALUE_RESULT', payload: normalized }, '*');
      }
    }

    if (e.data?.type === 'SVH_RESTORE_CONTENT') {
      if (!bridge?.hasEditor()) return;
      const ok = bridge.setValue(e.data.payload ?? '');
      console.log(`SVH Injector [${frameId}]: SVH_RESTORE_CONTENT applied=${ok}`);
      try {
        window.top?.postMessage({ type: 'SVH_RESTORE_CONTENT_RESULT', ok }, '*');
      } catch {
        window.postMessage({ type: 'SVH_RESTORE_CONTENT_RESULT', ok }, '*');
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
