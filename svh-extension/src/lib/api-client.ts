import { Storage } from './storage';
import { log } from './logger';

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
    let url = (await this.storage.getConfig()).apiUrl || '';
    return url.replace(/\/+$/, '');
  }

  private async logRequest(method: string, url: string, headers: any, body?: any) {
    const headerStr = Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
    const bodyStr = body ? `-d '${JSON.stringify(body)}'` : '';
    log(`SVH API Request: curl -X ${method} "${url}" ${headerStr} ${bodyStr}`);
  }

  async sendSnapshot(payload: any): Promise<void> {
    const base = await this.baseUrl();
    if (!base) {
      console.warn('SVH: API URL not configured, skipping snapshot');
      return;
    }

    const url = `${base}/api/v1/snapshots`;
    const headers = await this.headers();
    await this.logRequest('POST', url, headers, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'No error body');
      console.error(`SVH: Snapshot failed (HTTP ${res.status}): ${errText}`);
      throw new Error(`HTTP ${res.status}`);
    }
    log('SVH: Snapshot sent successfully');
  }

  async presence(ctx: any): Promise<void> {
    const base = await this.baseUrl();
    if (!base) return;

    const url = `${base}/api/v1/presence`;
    const headers = await this.headers();
    // Presence is high frequency, maybe log it less or with a flag, but for now let's log everything
    await this.logRequest('POST', url, headers, ctx);

    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(ctx),
    }).catch(err => console.error('SVH: Presence failed', err));
  }

  async getConflicts(codPrj: string, codApl: string): Promise<any[]> {
    const base = await this.baseUrl();
    if (!base) return [];

    const url = new URL(`${base}/api/v1/presence/conflicts`);
    url.searchParams.set('cod_prj', codPrj);
    url.searchParams.set('cod_apl', codApl);
    const headers = await this.headers();

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  async getHistory(params: any): Promise<any> {
    const base = await this.baseUrl();
    if (!base) return [];

    const url = new URL(`${base}/api/v1/history`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const headers = await this.headers();
    await this.logRequest('GET', url.toString(), headers);

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      console.error(`SVH: History failed (HTTP ${res.status})`);
      return [];
    }
    return res.json();
  }

  async getRawDiff(snapshotId: string, content: string): Promise<any> {
    const base = await this.baseUrl();
    if (!base) throw new Error('API URL not configured');

    const url = `${base}/api/v1/diff/raw`;
    const headers = await this.headers();
    const payload = { snapshot_id: snapshotId, content };
    await this.logRequest('POST', url, headers, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getSnapshot(id: string): Promise<any> {
    const base = await this.baseUrl();
    if (!base) throw new Error('API URL not configured');

    const url = `${base}/api/v1/snapshots/${id}`;
    const headers = await this.headers();
    await this.logRequest('GET', url, headers);

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async validatePhp(content: string): Promise<any> {
    const base = await this.baseUrl();
    if (!base) throw new Error('API URL not configured');

    const url = `${base}/api/v1/validate-php`;
    const headers = await this.headers();
    const payload = { content };
    await this.logRequest('POST', url, headers, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async formatPhp(content: string): Promise<any> {
    const base = await this.baseUrl();
    if (!base) throw new Error('API URL not configured');

    const url = `${base}/api/v1/format-php`;
    const headers = await this.headers();
    const payload = { content };
    await this.logRequest('POST', url, headers, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async healthCheck(): Promise<void> {
    const base = await this.baseUrl();
    if (!base) throw new Error('API URL not configured');

    const url = `${base}/api/health`;
    log(`SVH: Health check -> ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Health check failed');
  }
}
