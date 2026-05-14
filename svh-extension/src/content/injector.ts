import { DomResolver } from './dom-resolver';
import { EditorBridge } from './editor-bridge';
import { SaveInterceptor } from './save-interceptor';

const resolver = new DomResolver();
const bridge = new EditorBridge();
const interceptor = new SaveInterceptor(resolver, bridge);

function init() {
  resolver.start();
  bridge.start();
  interceptor.start();

  const sidebar = document.createElement('div');
  sidebar.id = 'svh-sidebar';
  sidebar.style.cssText = 'position:fixed;top:0;right:0;width:320px;height:100vh;z-index:99999;background:#fff;border-left:1px solid #e5e7eb;display:none;';
  document.body.appendChild(sidebar);

  const toggle = document.createElement('button');
  toggle.innerText = 'SVH';
  toggle.style.cssText = 'position:fixed;top:10px;right:10px;z-index:100000;background:#2563eb;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;';
  toggle.onclick = () => {
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
  };
  document.body.appendChild(toggle);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
