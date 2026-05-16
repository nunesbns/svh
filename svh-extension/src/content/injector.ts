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

  // Inject the main-world bridge so we can read/write the CodeMirror
  // instance attached to `.CodeMirror` (only accessible from the page's
  // own JS context).
  injectMainWorldBridge();

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

    if (t === 'SVH_MAIN_EDITOR_VALUE_RESULT') {
      const payload = typeof e.data.payload === 'string' ? e.data.payload : '';
      console.log(`SVH Injector [${frameId}]: relaying editor value to top, length=${payload.length}`);
      try {
        chrome.runtime.sendMessage({
          type: 'SVH_RELAY_TO_TOP',
          payload: { type: 'SVH_EDITOR_VALUE_RESULT', payload },
        }).then(() => {
          console.log(`SVH Injector [${frameId}]: relay request acknowledged by background`);
        }).catch((err) => {
          console.error(`SVH Injector [${frameId}]: relay request FAILED`, err?.message || err);
        });
      } catch (err) {
        console.error(`SVH Injector [${frameId}]: chrome.runtime unavailable`, err);
      }
    }

    if (t === 'SVH_MAIN_RESTORE_CONTENT_RESULT') {
      console.log(`SVH Injector [${frameId}]: relaying restore ack to top, ok=${e.data.ok}`);
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
    if (msg.type !== 'SVH_EDITOR_VALUE_RESULT' && msg.type !== 'SVH_RESTORE_CONTENT_RESULT') {
      return false;
    }
    // Only the frame that owns the sidebar should re-emit.
    const sidebarEl = document.getElementById('svh-sidebar');
    if (!sidebarEl) return false;
    console.log(`SVH Injector [${frameId}]: relayed message arrived, type=${msg.type}`);
    window.postMessage(msg, '*');
    return false;
  });
}

function injectMainWorldBridge() {
  if (!isContextValid()) {
    console.warn('SVH Injector: cannot inject main-world bridge, context invalid');
    return;
  }
  if ((document as any).__SVH_MAIN_BRIDGE_INJECTED) {
    console.log('SVH Injector: main-world bridge already injected, skipping');
    return;
  }
  (document as any).__SVH_MAIN_BRIDGE_INJECTED = true;

  const url = chrome.runtime.getURL('inject/editor-bridge-main.js');
  console.log('SVH Injector: injecting main-world bridge from', url);

  const script = document.createElement('script');
  script.src = url;
  script.onload = () => {
    console.log('SVH Injector: main-world bridge script loaded');
    script.remove();
  };
  script.onerror = (e) => {
    console.error('SVH Injector: FAILED to load main-world bridge', e);
  };
  (document.head || document.documentElement).appendChild(script);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
