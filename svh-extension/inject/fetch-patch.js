(() => {
  const isDev = document.currentScript?.getAttribute('data-dev') !== 'false';
  function log(message, ...args) {
    if (isDev) {
      console.log(message, ...args);
    }
  }

  log('SVH: Network patch (fetch/XHR) active and monitoring...');

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0].url || '');
    const options = args[1] || {};

    if (options.method === 'POST') {
      log(`SVH [Fetch POST]: ${url}`);
      try {
        const body = options.body;
        if (typeof body === 'string') {
          // Broad check for code saving indicators
          if (body.includes('form_option=save') || body.includes('code=') || body.includes('codigo_php')) {
            log('SVH: Intercepted potential code save via Fetch', { url, bodyLength: body.length });
            const params = new URLSearchParams(body);
            const code = params.get('code') || params.get('codigo_php');
            const eventName = params.get('event_nome') || params.get('nome_evento');
            
            if (code) {
               window.postMessage({ 
                type: 'SVH_SAVE_DATA', 
                payload: { code, scope: eventName ? `events/${eventName}` : null } 
              }, '*');
            }
          }
        }
      } catch (e) {
        console.error('SVH: Error analyzing fetch body', e);
      }
    }
    
    return originalFetch.apply(this, args);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this._method === 'POST') {
      log(`SVH [XHR POST]: ${this._url}`);
      if (typeof body === 'string') {
        if (body.includes('form_option=save') || body.includes('code=') || body.includes('codigo_php')) {
          log('SVH: Intercepted potential code save via XHR', { url: this._url, bodyLength: body.length });
          try {
            const params = new URLSearchParams(body);
            const code = params.get('code') || params.get('codigo_php');
            const eventName = params.get('event_nome') || params.get('nome_evento');
            
            if (code) {
              window.postMessage({ 
                type: 'SVH_SAVE_DATA', 
                payload: { code, scope: eventName ? `events/${eventName}` : null } 
              }, '*');
            }
          } catch (e) {
            console.error('SVH: Error analyzing XHR body', e);
          }
        }
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
