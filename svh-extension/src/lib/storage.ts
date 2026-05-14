export interface SvhConfig {
  apiUrl: string;
  apiKey: string;
  idePattern: string;
}

export class Storage {
  async getConfig(): Promise<SvhConfig> {
    const result = await chrome.storage.local.get(['config']);
    return result.config || { apiUrl: '', apiKey: '', idePattern: 'https://*/scriptcase/devel/*' };
  }

  async setConfig(config: SvhConfig): Promise<void> {
    await chrome.storage.local.set({ config });
  }

  async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.local.get(['config']);
    return result.config?.apiKey || null;
  }

  async getContext(): Promise<any | null> {
    const result = await chrome.storage.local.get(['context']);
    return result.context || null;
  }

  async setContext(ctx: any): Promise<void> {
    await chrome.storage.local.set({ context: ctx });
  }

  async saveLocalBackup(key: string, content: string): Promise<void> {
    const result = await chrome.storage.local.get(['backups']);
    const backups = result.backups || {};
    backups[key] = { content, ts: Date.now() };
    await chrome.storage.local.set({ backups });
  }
}
