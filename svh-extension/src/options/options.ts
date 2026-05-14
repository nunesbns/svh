import { Storage } from '../lib/storage';

const storage = new Storage();

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
  document.getElementById('status')!.textContent = 'Saved!';
  setTimeout(() => { document.getElementById('status')!.textContent = ''; }, 2000);
});

load();
