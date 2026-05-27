import { Storage } from '../lib/storage';

const storage = new Storage();

// Load logo using chrome.runtime.getURL so it works in extension context
const logoEl = document.getElementById('logo') as HTMLImageElement | null;
if (logoEl) {
  logoEl.src = chrome.runtime.getURL('images/icon128.png');
}

function getOriginPattern(input: string): string | null {
  try {
    let testStr = input.trim();
    if (!testStr) return null;
    
    // Convert protocol wildcards
    if (testStr.startsWith('*://')) {
      testStr = 'http://' + testStr.substring(4);
    }
    
    // Replace host wildcards for parsing
    const protocolAndRest = testStr.split('://');
    if (protocolAndRest.length === 2) {
      let hostAndPath = protocolAndRest[1];
      const pathIndex = hostAndPath.indexOf('/');
      let host = pathIndex === -1 ? hostAndPath : hostAndPath.substring(0, pathIndex);
      if (host.includes('*')) {
        host = host.replace(/\*/g, 'wildcard-host');
      }
      testStr = protocolAndRest[0] + '://' + host;
    } else {
      // If it doesn't have a protocol, prepend one for parsing
      testStr = 'http://' + testStr;
    }
    
    const url = new URL(testStr);
    const protocol = input.trim().startsWith('*://') ? '*' : url.protocol.replace(':', '');
    const host = url.host.includes('wildcard-host') ? '*' : url.host;
    
    return `${protocol}://${host}/*`;
  } catch (e) {
    return null;
  }
}

async function registerDynamicContentScript(idePattern: string) {
  try {
    // Unregister first if it exists to avoid conflicts
    try {
      await chrome.scripting.unregisterContentScripts({ ids: ['svh-injector'] });
    } catch (e) {}

    // Register with the new pattern
    await chrome.scripting.registerContentScripts([{
      id: 'svh-injector',
      js: ['content/injector.js'],
      matches: [idePattern],
      allFrames: true,
      runAt: 'document_idle'
    }]);
    console.log(`SVH Options: Dynamically registered content script for ${idePattern}`);
  } catch (err) {
    console.error('SVH Options: Script registration error:', err);
    throw err;
  }
}

async function load() {
  const config = await storage.getConfig();
  (document.getElementById('apiUrl') as HTMLInputElement).value = config.apiUrl;
  (document.getElementById('apiKey') as HTMLInputElement).value = config.apiKey;
  (document.getElementById('idePattern') as HTMLInputElement).value = config.idePattern;
}

document.getElementById('save')?.addEventListener('click', async () => {
  const apiUrlVal = (document.getElementById('apiUrl') as HTMLInputElement).value;
  const apiKeyVal = (document.getElementById('apiKey') as HTMLInputElement).value;
  const idePatternVal = (document.getElementById('idePattern') as HTMLInputElement).value;

  const statusEl = document.getElementById('status')!;
  statusEl.className = ''; // Reset classes
  
  const origins: string[] = [];
  
  const apiOrigin = getOriginPattern(apiUrlVal);
  if (apiOrigin) {
    origins.push(apiOrigin);
  }
  
  const ideOrigin = getOriginPattern(idePatternVal);
  if (ideOrigin) {
    origins.push(ideOrigin);
  }

  if (origins.length === 0) {
    statusEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:15px; height:15px; flex-shrink:0;">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Please enter a valid API URL and IDE Pattern.
    `;
    statusEl.classList.add('visible', 'error');
    return;
  }

  // Request permissions dynamically
  chrome.permissions.request({ origins }, async (granted) => {
    if (granted) {
      try {
        // Save config
        await storage.setConfig({
          apiUrl: apiUrlVal,
          apiKey: apiKeyVal,
          idePattern: idePatternVal,
        });

        // Register content scripts for this pattern
        await registerDynamicContentScript(idePatternVal);

        // Notify background worker to refresh its listeners and state
        chrome.runtime.sendMessage({ type: 'CONFIG_UPDATED' }).catch(() => {});

        statusEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:15px; height:15px; flex-shrink:0;">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Settings saved and permissions granted successfully!
        `;
        statusEl.classList.add('visible');
        setTimeout(() => { statusEl.classList.remove('visible'); }, 4000);
      } catch (err: any) {
        statusEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:15px; height:15px; flex-shrink:0;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Error registering content scripts: ${err.message || err}
        `;
        statusEl.classList.add('visible', 'error');
      }
    } else {
      statusEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:15px; height:15px; flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Permission denied! Host access is required to capture snapshots.
      `;
      statusEl.classList.add('visible', 'error');
    }
  });
});

load();

