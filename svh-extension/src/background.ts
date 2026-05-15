import { ApiClient } from './lib/api-client';
import { Storage } from './lib/storage';

const storage = new Storage();
const api = new ApiClient(storage);

// Context tracking: Map<tabId, Map<frameId, context>>
const tabContexts: Record<number, Record<number, any>> = {};

// Clean up contexts on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabContexts[tabId];
});

// Process outbox logic
async function processOutbox() {
  try {
    const { outbox = [] } = await chrome.storage.local.get('outbox');
    if (outbox.length === 0) return;

    console.log(`SVH: Processing outbox with ${outbox.length} items`);
    const remaining = [];
    for (const item of outbox) {
      try {
        await api.sendSnapshot(item);
      } catch (e) {
        console.warn('SVH: Failed to send snapshot from outbox', e);
        remaining.push(item);
      }
    }

    await chrome.storage.local.set({ outbox: remaining });
  } catch (e) {
    console.error('SVH: Outbox processing error', e);
  }
}

// Initialize alarms and outbox
async function initialize() {
  console.log('SVH: Initializing background service worker');
  
  // Setup alarms if they don't exist
  const alarms = await chrome.alarms.getAll();
  if (!alarms.find(a => a.name === 'healthCheck')) {
    chrome.alarms.create('healthCheck', { periodInMinutes: 1 });
  }
  if (!alarms.find(a => a.name === 'presence')) {
    chrome.alarms.create('presence', { periodInMinutes: 0.5 });
  }

  await processOutbox();
}

// Listeners must be registered synchronously at the top level
chrome.runtime.onInstalled.addListener(() => {
  initialize();
});

chrome.runtime.onStartup.addListener(() => {
  initialize();
});

// Listen for context updates from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_CONTEXT') {
    const tabId = sender.tab?.id;
    const frameId = sender.frameId;
    if (tabId !== undefined && frameId !== undefined) {
      if (!tabContexts[tabId]) tabContexts[tabId] = {};
      tabContexts[tabId][frameId] = message.payload;
      console.log(`SVH: Context stored for tab ${tabId} frame ${frameId}`, message.payload.scope);
    }
    return false;
  }

  if (message.type === 'SNAPSHOT') {
    api.sendSnapshot(message.payload)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => {
        console.error('SVH: Snapshot error', err);
        sendResponse({ ok: false, error: err.message || 'Unknown error' });
      });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'RESTORE') {
    api.getSnapshot(message.snapshotId)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => {
        console.error('SVH: Restore error', err);
        sendResponse({ ok: false, error: err.message || 'Unknown error' });
      });
    return true;
  }

  if (message.type === 'HISTORY') {
    api.getHistory(message.params)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => {
        console.error('SVH: History error', err);
        sendResponse({ ok: false, error: err.message || 'Unknown error' });
      });
    return true;
  }

  return false;
});

// Intercept the actual POST request to event.php
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method === 'POST' && details.requestBody?.formData) {
      const data = details.requestBody.formData;
      
      // Check for save trigger
      const isSave = data.form_option?.[0] === 'save' || data.form_edit?.[0];
      const code = data.code?.[0];
      const eventName = data.event_nome?.[0] || data.event_title?.[0];

      if (isSave && code) {
        // Resolve context
        const context = tabContexts[details.tabId]?.[details.frameId] || {};
        
        const payload = {
          cod_prj: context.cod_prj || 'Unknown',
          cod_apl: context.cod_apl || 'Unknown',
          user_sc_login: context.user_sc_login || 'Unknown',
          type: 'app_event',
          scope: eventName ? `events/${eventName}` : (context.scope || 'Unknown'),
          content: code,
          hash: '',
          captured_at: new Date().toISOString(),
          metadata: { 
            source: 'web_request_interception',
            context_found: !!context.cod_prj
          }
        };

        // CRITICAL: Log project code clearly so the user can see it in the error list
        console.log(`SVH: Intercepted save. Project: [${payload.cod_prj}], App: [${payload.cod_apl}], Scope: [${payload.scope}]`);
        console.log('SVH: Full Payload:', JSON.stringify(payload));

        api.sendSnapshot(payload).catch(err => {
          console.error(`SVH: Background send error for project ${payload.cod_prj}:`, err);
        });
      }
    }
  },
  { urls: ["*://*/scriptcase/devel/iface/event.php*"] },
  ["requestBody"]
);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
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
  } catch (e) {
    console.error('SVH: Alarm error', e);
  }
});

// Trigger initial check without blocking
initialize().catch(err => console.error('SVH: Initialization error', err));
