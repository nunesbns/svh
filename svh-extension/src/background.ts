import { ApiClient } from './lib/api-client';
import { Storage } from './lib/storage';

const storage = new Storage();
const api = new ApiClient(storage);

chrome.alarms.create('healthCheck', { periodInMinutes: 1 });
chrome.alarms.create('presence', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'healthCheck') {
    try {
      await api.healthCheck();
      await chrome.action.setBadgeText({ text: '' });
    } catch {
      await chrome.action.setBadgeText({ text: '!' });
      await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
  }

  if (alarm.name === 'presence') {
    const ctx = await storage.getContext();
    if (ctx) {
      await api.presence(ctx).catch(() => {});
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SNAPSHOT') {
    api.sendSnapshot(message.payload)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message.type === 'RESTORE') {
    api.getSnapshot(message.snapshotId)
      .then((data) => sendResponse({ ok: true, data }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message.type === 'HISTORY') {
    api.getHistory(message.params)
      .then((data) => sendResponse({ ok: true, data }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});

chrome.storage.local.get('outbox').then(({ outbox }) => {
  const queue = outbox || [];
  if (queue.length > 0) {
    processOutbox();
  }
});

async function processOutbox() {
  const { outbox = [] } = await chrome.storage.local.get('outbox');
  const remaining = [];

  for (const item of outbox) {
    try {
      await api.sendSnapshot(item);
    } catch {
      remaining.push(item);
    }
  }

  await chrome.storage.local.set({ outbox: remaining });
}
