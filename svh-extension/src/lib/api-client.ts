import { Storage } from './storage';

export class ApiClient {
  constructor(private storage: Storage) {}

  private async headers() {
    const key = await this.storage.getApiKey();
    return {
      'Content-Type': 'application/json',
      'X-API-Key': key || '',
    };
  }

  private async baseUrl() {
    return (await this.storage.getConfig()).apiUrl || '';
  }

  async sendSnapshot(payload: any): Promise<void> {
    const url = `${await this.baseUrl()}/api/v1/snapshots`;
    const res = await fetch(url, {
      method: 'POST',
      headers: await this.headers(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  async presence(ctx: any): Promise<void> {
    const url = `${await this.baseUrl()}/api/v1/presence`;
    await fetch(url, {
      method: 'POST',
      headers: await this.headers(),
      body: JSON.stringify(ctx),
    });
  }

  async getHistory(params: any): Promise<any> {
    const url = new URL(`${await this.baseUrl()}/api/v1/history`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString(), { headers: await this.headers() });
    return res.json();
  }

  async getSnapshot(id: string): Promise<any> {
    const url = `${await this.baseUrl()}/api/v1/snapshots/${id}`;
    const res = await fetch(url, { headers: await this.headers() });
    return res.json();
  }

  async healthCheck(): Promise<void> {
    const url = `${await this.baseUrl()}/health`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Health check failed');
  }
}
