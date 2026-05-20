import { Storage } from '../lib/storage';

const storage = new Storage();

// Load logo using chrome.runtime.getURL so it works in extension context
const logoEl = document.getElementById('logo') as HTMLImageElement | null;
if (logoEl) {
  logoEl.src = chrome.runtime.getURL('images/icon128.png');
}

async function load() {
  const config = await storage.getConfig();
  (document.getElementById('apiUrl') as HTMLInputElement).value = config.apiUrl;
  (document.getElementById('apiKey') as HTMLInputElement).value = config.apiKey;
  (document.getElementById('idePattern') as HTMLInputElement).value = config.idePattern;
}

document.getElementById('save')?.addEventListener('click', async () => {
  await storage.setConfig({
    apiUrl: (document.getElementById('apiUrl') as HTMLInputElement).value,
    apiKey: (document.getElementById('apiKey') as HTMLInputElement).value,
    idePattern: (document.getElementById('idePattern') as HTMLInputElement).value,
  });

  const statusEl = document.getElementById('status')!;
  statusEl.classList.add('visible');
  setTimeout(() => { statusEl.classList.remove('visible'); }, 2500);
});

load();
