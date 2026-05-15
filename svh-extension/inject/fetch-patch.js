(() => {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const options = args[1] || {};

    if (url && url.includes('event.php') && options.method === 'POST') {
      try {
        const body = options.body;
        if (typeof body === 'string' && body.includes('form_option=save')) {
          const params = new URLSearchParams(body);
          const code = params.get('code');
          const eventName = params.get('event_nome');
          if (code && eventName) {
            window.postMessage({ 
              type: 'SVH_SAVE_DATA', 
              payload: { code, scope: `events/${eventName}` } 
            }, '*');
          }
        }
      } catch (e) {
        console.error('SVH: Error capturing fetch save', e);
      }
    }
    
    return originalFetch.apply(this, args);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this._url && this._url.includes('event.php') && typeof body === 'string' && body.includes('form_option=save')) {
      try {
        const params = new URLSearchParams(body);
        const code = params.get('code');
        const eventName = params.get('event_nome');
        if (code && eventName) {
          window.postMessage({ 
            type: 'SVH_SAVE_DATA', 
            payload: { code, scope: `events/${eventName}` } 
          }, '*');
        }
      } catch (e) {
        console.error('SVH: Error capturing XHR save', e);
      }
    }
    return originalSend.apply(this, arguments);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
  };
})();
