// Runs in the page's MAIN world (same JS context as the Scriptcase IDE),
// so it can access the CodeMirror instance attached to the `.CodeMirror`
// DOM element. The isolated content script injects this file and talks
// to it through window.postMessage in the SAME window — the isolated
// content script then uses chrome.runtime messaging to reach the sidebar.
(() => {
  if (window.__SVH_EDITOR_MAIN_INSTALLED) return;
  window.__SVH_EDITOR_MAIN_INSTALLED = true;

  const isDev = document.currentScript?.getAttribute('data-dev') !== 'false';
  function log(message, ...args) {
    if (isDev) {
      console.log(message, ...args);
    }
  }

  function getCodeMirrorInstance() {
    const el = document.querySelector('.CodeMirror');
    if (el && el.CodeMirror) return el.CodeMirror;
    if (window.editor && typeof window.editor.getValue === 'function') return window.editor;
    if (window.cm && typeof window.cm.getValue === 'function') return window.cm;
    return null;
  }

  function getValue() {
    const cm = getCodeMirrorInstance();
    if (cm && typeof cm.getValue === 'function') {
      try { return cm.getValue(); } catch (e) { console.error('SVH MAIN: getValue() threw', e); }
    }
    const ta = document.querySelector('#codigo_php');
    if (ta) return ta.value;
    return null;
  }

  function setValue(content) {
    const cm = getCodeMirrorInstance();
    if (cm && typeof cm.setValue === 'function') {
      try { cm.setValue(content); return true; }
      catch (e) { console.error('SVH MAIN: setValue() threw', e); }
    }
    const ta = document.querySelector('#codigo_php');
    if (ta) { ta.value = content; return true; }
    return false;
  }

  // Listen for requests from the isolated content script in the SAME window
  // and reply on the SAME window. The isolated injector then takes care of
  // forwarding the answer to the sidebar via chrome.runtime messaging.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return; // only same-window messages
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'SVH_MAIN_GET_EDITOR_VALUE') {
      const value = getValue();
      if (value === null) return; // no editor here; stay silent
      log('SVH MAIN: replying GET_EDITOR_VALUE, length=' + value.length);
      window.postMessage({ type: 'SVH_MAIN_EDITOR_VALUE_RESULT', payload: value }, '*');
    }

    if (data.type === 'SVH_MAIN_RESTORE_CONTENT') {
      const cm = getCodeMirrorInstance();
      const ta = document.querySelector('#codigo_php');
      if (!cm && !ta) return; // no editor here; stay silent
      const ok = setValue(typeof data.payload === 'string' ? data.payload : '');
      log('SVH MAIN: RESTORE_CONTENT applied=' + ok);
      window.postMessage({ type: 'SVH_MAIN_RESTORE_CONTENT_RESULT', ok }, '*');
    }
  });

  log('SVH MAIN: editor bridge installed');
})();
