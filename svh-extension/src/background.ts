import { ApiClient } from './lib/api-client';
import { Storage } from './lib/storage';

const storage = new Storage();
const api = new ApiClient(storage);

// Context tracking: Map<tabId, context> stored in local storage for persistence
async function getTabContext(tabId: number) {
  try {
    const result = await chrome.storage.local.get(`tab_ctx_${tabId}`);
    return result[`tab_ctx_${tabId}`] || {};
  } catch (e) {
    return {};
  }
}

async function setTabContext(tabId: number, context: any) {
  try {
    const current = await getTabContext(tabId);
    
    // Only overwrite if the new context has real data or is different
    const updated = { ...current };
    let changed = false;

    for (const key of ['cod_prj', 'cod_apl', 'user_sc_login']) {
      if (context[key] && context[key] !== 'Unknown' && context[key] !== current[key]) {
        updated[key] = context[key];
        changed = true;
      }
    }

    if (context.scope && context.scope !== 'Unknown' && context.scope !== current.scope) {
      updated.scope = context.scope;
      changed = true;
    }

    if (changed) {
      await chrome.storage.local.set({ [`tab_ctx_${tabId}`]: updated });
      console.log(`SVH Background: Context MERGED for tab ${tabId}:`, updated);
    } else {
      // Log even if not changed to see what's coming
      console.log(`SVH Background: Context received (No Change) for tab ${tabId}:`, context);
    }
  } catch (e) {
    console.error('SVH: Error setting tab context', e);
  }
}

// Clean up contexts on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`tab_ctx_${tabId}`).catch(() => {});
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
  
  try {
    const alarms = await chrome.alarms.getAll();
    if (!alarms.find(a => a.name === 'healthCheck')) {
      chrome.alarms.create('healthCheck', { periodInMinutes: 1 });
    }
    if (!alarms.find(a => a.name === 'presence')) {
      chrome.alarms.create('presence', { periodInMinutes: 0.5 });
    }
  } catch (e) {}

  await processOutbox();
}

chrome.runtime.onInstalled.addListener(() => {
  initialize().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  initialize().catch(() => {});
});

// Listen for context updates and snapshot requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_CONTEXT') {
    const tabId = sender.tab?.id;
    if (tabId !== undefined) {
      setTabContext(tabId, message.payload);
    }
    // No response needed for SET_CONTEXT
    return false;
  }

  if (message.type === 'GET_CONTEXT') {
    const tabId = sender.tab?.id;
    if (tabId !== undefined) {
      getTabContext(tabId).then(ctx => {
        sendResponse({ ok: true, data: ctx });
      });
      return true;
    }
    sendResponse({ ok: false, error: 'No tab ID' });
    return false;
  }

  if (message.type === 'SNAPSHOT') {
    api.sendSnapshot(message.payload)
      .then(() => {
        try { sendResponse({ ok: true }); } catch (e) {}
      })
      .catch((err) => {
        console.error('SVH: Snapshot error', err);
        try { sendResponse({ ok: false, error: err.message || 'Unknown error' }); } catch (e) {}
      });
    return true; 
  }

  if (message.type === 'RESTORE') {
    api.getSnapshot(message.snapshotId)
      .then((data) => {
        try { sendResponse({ ok: true, data }); } catch (e) {}
      })
      .catch((err) => {
        console.error('SVH: Restore error', err);
        try { sendResponse({ ok: false, error: err.message || 'Unknown error' }); } catch (e) {}
      });
    return true;
  }

  if (message.type === 'HISTORY') {
    api.getHistory(message.params)
      .then((data) => {
        try { sendResponse({ ok: true, data }); } catch (e) {}
      })
      .catch((err) => {
        console.error('SVH: History error', err);
        try { sendResponse({ ok: false, error: err.message || 'Unknown error' }); } catch (e) {}
      });
    return true;
  }

  // Fallback for any other message
  return false;
});

// Intercept the actual POST request to event.php
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method === 'POST' && details.requestBody?.formData) {
      const data = details.requestBody.formData;
      
      const isSave = data.form_option?.[0] === 'save' || data.form_edit?.[0];
      const code = data.code?.[0];
      const eventName = data.event_nome?.[0] || data.event_title?.[0];

      if (isSave && code) {
        // Run async context resolution
        (async () => {
          const context = await getTabContext(details.tabId);
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
              tab_id: details.tabId,
              context_source: context.cod_prj ? 'persistent_tab_storage' : 'none'
            }
          };

          console.log(`SVH: Intercepted save. Project: [${payload.cod_prj}], App: [${payload.cod_apl}], Scope: [${payload.scope}]`);
          try {
            await api.sendSnapshot(payload);
          } catch (err) {
            console.error(`SVH: Background send error for project ${payload.cod_prj}:`, err);
          }
        })();
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
