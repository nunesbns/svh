import { DomResolver } from './dom-resolver';
import { EditorBridge } from './editor-bridge';
import { SaveInterceptor } from './save-interceptor';
import { Sidebar } from './sidebar/sidebar';

const resolver = new DomResolver();
const bridge = new EditorBridge();
const interceptor = new SaveInterceptor(resolver, bridge);

function init() {
  // Check if we already injected in this window
  if ((window as any).SVH_INITIALIZED) return;
  (window as any).SVH_INITIALIZED = true;

  resolver.start();
  bridge.start();
  interceptor.start();

  // Initialize Sidebar UI
  const sidebarEl = document.createElement('div');
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

  // Attach SVH Button to #id_main_table
  const attachButton = () => {
    const target = document.querySelector('#id_main_table');
    if (!target || document.querySelector('#svh-toggle-btn')) return;

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
      const isVisible = sidebarEl.style.display === 'flex';
      sidebarEl.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        document.dispatchEvent(new CustomEvent('svh:refresh-history'));
      }
    };

    target.appendChild(toggle);
    console.log('SVH: Button attached to #id_main_table');
  };

  const observer = new MutationObserver(() => attachButton());
  observer.observe(document.body, { childList: true, subtree: true });
  attachButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
