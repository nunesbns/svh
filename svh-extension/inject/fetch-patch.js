(() => {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    if (url && /save|gravar|update_event/i.test(url)) {
      window.postMessage({ type: 'SVH_SAVE_DETECTED' }, '*');
    }
    return originalFetch.apply(this, args);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this._url && /save|gravar|update_event/i.test(this._url)) {
      window.postMessage({ type: 'SVH_SAVE_DETECTED' }, '*');
    }
    return originalSend.apply(this, arguments as any);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    (this as any)._url = url;
    return originalOpen.apply(this, arguments as any);
  };
})();
