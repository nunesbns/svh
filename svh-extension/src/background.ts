import { ApiClient } from './lib/api-client';
import { resolveSnapshotType } from './lib/snapshot-type';
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

    // While the active asset is a library, we don't let the dom-resolver
    // overwrite cod_prj/cod_apl/scope: the resolver pulls those from the
    // surrounding Scriptcase chrome (e.g. "Internal libraries" as the app
    // title), which would clobber the precise values the lib interceptor
    // already wrote into storage. The only field we still take from the
    // resolver is `user_sc_login`.
    const isCurrentLib = current.type === 'project_lib'
      || current.type === 'public_lib'
      || current.type === 'lib_file';

    const updated = { ...current };
    let changed = false;

    if (isCurrentLib) {
      if (context.user_sc_login
          && context.user_sc_login !== 'Unknown'
          && context.user_sc_login !== current.user_sc_login) {
        updated.user_sc_login = context.user_sc_login;
        changed = true;
      }
      // Allow type to switch AWAY from a library (user navigated back to
      // an app) — that signals it's safe to accept new cod_prj/cod_apl too.
      if (context.type
          && context.type !== current.type
          && context.type !== 'project_lib'
          && context.type !== 'public_lib'
          && context.type !== 'lib_file') {
        updated.type = context.type;
        changed = true;
        // Take everything else from the new context.
        for (const key of ['cod_prj', 'cod_apl', 'scope']) {
          if (context[key] && context[key] !== 'Unknown') {
            updated[key] = context[key];
          }
        }
      }
    } else {
      // Normal merge: only overwrite if the new context has real data.
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

      if (context.type && context.type !== current.type) {
        updated.type = context.type;
        changed = true;
      }
    }

    if (changed) {
      await chrome.storage.local.set({ [`tab_ctx_${tabId}`]: updated });
      console.log(`SVH Background: Context MERGED for tab ${tabId}:`, updated);
    } else {
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
  // Cross-frame relay: a child frame sends an editor value or restore ack;
  // we broadcast to every frame of the same tab. The frame that hosts the
  // sidebar will pick it up and re-emit it as a window message; others
  // ignore.
  if (message.type === 'SVH_RELAY_TO_TOP') {
    const tabId = sender.tab?.id;
    console.log(`SVH Background: SVH_RELAY_TO_TOP from tab=${tabId} frame=${sender.frameId} payload.type=${message.payload?.type}`);
    if (tabId !== undefined) {
      chrome.webNavigation.getAllFrames({ tabId }).then((frames) => {
        if (!frames) return;
        let delivered = 0;
        frames.forEach((f) => {
          chrome.tabs.sendMessage(tabId, message.payload, { frameId: f.frameId })
            .then(() => { delivered++; })
            .catch(() => { /* this frame has no listener — ignore */ });
        });
        // Best-effort log; we can't easily await the per-frame promises here.
        setTimeout(() => console.log(`SVH Background: relay attempted on ${frames.length} frames (tab=${tabId})`), 50);
      }).catch((err) => {
        console.error('SVH Background: webNavigation.getAllFrames failed', err);
      });
    } else {
      console.warn('SVH Background: relay request without tabId, dropping');
    }
    return false;
  }

  if (message.type === 'SET_LIB_PROJECT') {
    const tabId = sender.tab?.id;
    if (tabId !== undefined && typeof message.cod_prj === 'string' && message.cod_prj) {
      chrome.storage.local.set({ [`lib_cod_prj_${tabId}`]: message.cod_prj }).catch(() => {});
    }
    return false;
  }

  if (message.type === 'GET_LIB_KIND') {
    const tabId = sender.tab?.id;
    if (tabId === undefined) {
      sendResponse({ kind: null });
      return false;
    }
    getLibKind(tabId).then((kind) => sendResponse({ kind }));
    return true;
  }

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

  if (message.type === 'RAW_DIFF') {
    api.getRawDiff(message.snapshotId, message.content)
      .then((data) => {
        try { sendResponse({ ok: true, data }); } catch (e) {}
      })
      .catch((err) => {
        console.error('SVH: Raw Diff error', err);
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
        console.log('SVH Background: History API raw response:', data);
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

// Intercept Scriptcase save requests for events, PHP methods and libraries.
// Each endpoint posts a slightly different form, but the high-level flow is
// the same: detect the save, build the payload, send it to the API.
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;

    // Always log lib endpoints so we can diagnose missing context updates.
    if (url.includes('nm_edit_php_edit.php') || url.includes('nm_edit_php_list.php')) {
      const formKeys = details.requestBody?.formData
        ? Object.keys(details.requestBody.formData)
        : null;
      console.log(
        `SVH Background: lib endpoint hit url=${url} method=${details.method}` +
        ` formKeys=${JSON.stringify(formKeys)}`,
      );
    }

    if (details.method !== 'POST' || !details.requestBody?.formData) return;

    // Library editor (`nm_edit_php_edit.php`) handles both opening a lib
    // and saving it; we route both inside handleLibRequest.
    if (url.includes('nm_edit_php_edit.php')) {
      handleLibRequest(details);
      return;
    }

    if (url.includes('event.php') || url.includes('methods.php')) {
      handleEventOrMethodSave(details);
    }
  },
  {
    urls: [
      "*://*/scriptcase/devel/iface/event.php*",
      "*://*/scriptcase/devel/iface/methods.php*",
      // Library files sit under /compat/ in current Scriptcase versions,
      // not /iface/. We match both to be safe across versions.
      "*://*/scriptcase/devel/compat/nm_edit_php_edit.php*",
      "*://*/scriptcase/devel/iface/nm_edit_php_edit.php*",
    ],
  },
  ["requestBody"]
);

function handleEventOrMethodSave(details: chrome.webRequest.WebRequestBodyDetails) {
  const data = details.requestBody!.formData!;

  const isSave = data.form_option?.[0] === 'save' || data.form_edit?.[0];
  const code = data.code?.[0];
  const isMethodsUrl = details.url.includes('methods.php');
  const formName = data.event_title?.[0] || data.event_nome?.[0];

  if (!isSave || !code) return;

  (async () => {
    const context = await getTabContext(details.tabId);
    const rawScope = formName || context.scope || 'Unknown';
    const { type, scope } = resolveSnapshotType(rawScope);
    const finalType = (isMethodsUrl && type === 'app_event') ? 'function' : type;

    const payload = {
      cod_prj: context.cod_prj || 'Unknown',
      cod_apl: context.cod_apl || 'Unknown',
      user_sc_login: context.user_sc_login || 'Unknown',
      type: finalType,
      scope,
      content: code,
      hash: '',
      captured_at: new Date().toISOString(),
      metadata: {
        source: 'web_request_interception',
        tab_id: details.tabId,
        context_source: context.cod_prj ? 'persistent_tab_storage' : 'none',
        endpoint: isMethodsUrl ? 'methods.php' : 'event.php',
      },
    };

    console.log(`SVH: Intercepted save. Project: [${payload.cod_prj}], App: [${payload.cod_apl}], Type: [${payload.type}], Scope: [${payload.scope}]`);
    try {
      await api.sendSnapshot(payload);
    } catch (err) {
      console.error(`SVH: Background send error for project ${payload.cod_prj}:`, err);
    }
  })();
}

/**
 * Library workflow in current Scriptcase versions:
 *
 *   1. The user clicks a specific library in the tree. Scriptcase POSTs to
 *      `nm_edit_php_edit.php` with `form_upload=open`,
 *      `field_module=<grp|sys|scriptcase>` and `field_file=<filename.php>`.
 *      That single request carries everything we need:
 *        - the lib kind (project / public / built-in)
 *        - the lib name (file name)
 *      We update the tab context and tell the injector to show or hide the
 *      history button accordingly.
 *
 *   2. Ctrl+S sends `nm_edit_php_edit.php` with
 *      `enviado=S_EditPhp&txt_nome_lib=<name>&field_data=<code>`. We pair
 *      the lib name from this body with the cached kind to produce a
 *      `project_lib` or `public_lib` snapshot.
 *
 *   Anything else hitting `nm_edit_php_edit.php` (the initial GET that
 *   loads the page chrome, modal helpers, etc.) is ignored: we never write
 *   to the tab context unless we have an unambiguous open or save signal.
 */

type LibKind = 'project_lib' | 'public_lib' | 'scriptcase_internal';

function classifyLibFieldModule(value: string | undefined | null): LibKind | null {
  switch (value) {
    case 'sys': return 'public_lib';
    case 'grp': return 'project_lib';
    case 'scriptcase': return 'scriptcase_internal';
    default: return null;
  }
}

function stripPhpExtension(filename: string): string {
  return filename.replace(/\.php$/i, '');
}

async function handleLibRequest(details: chrome.webRequest.WebRequestBodyDetails) {
  const data = details.requestBody!.formData!;
  const isOpen = data.form_upload?.[0] === 'open';
  const isSave = data.enviado?.[0] === 'S_EditPhp';

  if (isOpen) {
    await handleLibOpen(details);
  } else if (isSave) {
    await handleLibSave(details);
  }
  // Other requests (page load, helper modals) aren't actionable — we
  // intentionally don't touch the tab context here.
}

async function handleLibOpen(details: chrome.webRequest.WebRequestBodyDetails) {
  const data = details.requestBody!.formData!;
  const fieldModule = data.field_module?.[0];
  const fieldFile = data.field_file?.[0] || '';
  const kind = classifyLibFieldModule(fieldModule);

  if (!kind) {
    console.log(`SVH: Lib open ignored, unknown field_module=${fieldModule}`);
    return;
  }

  const libName = stripPhpExtension(fieldFile);
  console.log(`SVH: Lib opened, tab=${details.tabId} kind=${kind} file=${fieldFile} name=${libName}`);

  await rememberLibKind(details.tabId, kind);

  // Built-in Scriptcase libs are read-only: we still cache the kind so the
  // injector hides the history button, but we don't poison the tab context
  // (the user might switch back to a regular app and we want their old
  // event/method context to come right back).
  if (kind === 'scriptcase_internal') {
    await broadcastContextPush(details.tabId, { __libKind: kind });
    return;
  }

  if (!libName) {
    console.warn('SVH: Lib open had no field_file, skipping context update');
    return;
  }

  // Pull the project code — preferring the value reported by the lib
  // editor frame (`sys_toolbar_grpcod`) over the regular tab context, which
  // can still hold the previous app's project.
  const reportedCodPrj = await getLibCodPrj(details.tabId);
  const current = await getTabContext(details.tabId);
  const cod_prj = reportedCodPrj || current.cod_prj || 'Unknown';

  const updated = {
    ...current,
    type: kind,
    cod_prj,
    cod_apl: 'Unknown',
    scope: libName,
  };

  await chrome.storage.local.set({ [`tab_ctx_${details.tabId}`]: updated });
  console.log(`SVH: Lib context updated for tab ${details.tabId}:`, updated);
  await broadcastContextPush(details.tabId, updated);
}

async function handleLibSave(details: chrome.webRequest.WebRequestBodyDetails) {
  const data = details.requestBody!.formData!;
  // Save requests carry the lib filename in `field_file` (same key the open
  // request uses) and the source in `field_data`. They do NOT carry
  // `field_module`, so we always rely on the lib kind cached during the
  // open step.
  const fieldFile = data.field_file?.[0];
  const libCode = data.field_data?.[0];

  if (!fieldFile || !libCode) {
    console.log('SVH: Lib save missing field_file or field_data, skipping', {
      hasFieldFile: !!fieldFile,
      hasFieldData: !!libCode,
    });
    return;
  }

  const cachedKind = await getLibKind(details.tabId);

  if (cachedKind === 'scriptcase_internal') {
    console.log('SVH: Skipping save of built-in Scriptcase library');
    return;
  }

  // Default to project_lib when we somehow missed the open request — the
  // user is editing a writable library either way.
  const libType: 'project_lib' | 'public_lib' = cachedKind === 'public_lib' ? 'public_lib' : 'project_lib';
  const context = await getTabContext(details.tabId);
  const reportedCodPrj = await getLibCodPrj(details.tabId);

  // Public libs are global, but the API still requires a registered
  // project_id (its schema makes it NOT NULL). The lib editor frame
  // exposes the active project via `sys_toolbar_grpcod`, so we use that
  // value to associate every lib snapshot with a real project — even
  // public ones. The HistoryController then aggregates `public_lib`
  // snapshots across projects when listing history.
  const cod_prj = reportedCodPrj || context.cod_prj || 'Unknown';

  const cleanScope = stripPhpExtension(fieldFile);

  const payload = {
    cod_prj,
    cod_apl: undefined as undefined | string,
    user_sc_login: context.user_sc_login || 'Unknown',
    type: libType,
    scope: cleanScope,
    content: libCode,
    hash: '',
    captured_at: new Date().toISOString(),
    metadata: {
      source: 'web_request_interception',
      tab_id: details.tabId,
      endpoint: 'nm_edit_php_edit.php',
      lib_kind: cachedKind ?? null,
    },
  };

  console.log(`SVH: Intercepted lib save. Project: [${payload.cod_prj}], Type: [${payload.type}], Scope: [${payload.scope}]`);

  try {
    await api.sendSnapshot(payload);
  } catch (err) {
    console.error(`SVH: Background lib send error for project ${payload.cod_prj}:`, err);
  }
}

async function broadcastContextPush(tabId: number, payload: any) {
  try {
    const frames = await chrome.webNavigation.getAllFrames({ tabId });
    if (!frames) return;
    for (const f of frames) {
      chrome.tabs.sendMessage(
        tabId,
        { type: 'SVH_CONTEXT_PUSH', payload },
        { frameId: f.frameId },
      ).catch(() => { /* frame has no listener — ignore */ });
    }
  } catch {
    // ignore
  }
}

async function rememberLibKind(tabId: number, kind: LibKind): Promise<void> {
  try {
    await chrome.storage.local.set({ [`lib_kind_${tabId}`]: kind });
  } catch { /* ignore */ }
}

async function getLibKind(tabId: number): Promise<LibKind | null> {
  try {
    const result = await chrome.storage.local.get(`lib_kind_${tabId}`);
    return (result[`lib_kind_${tabId}`] as LibKind | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * Project code reported by the lib editor frame (`sys_toolbar_grpcod`
 * hidden input). It is the only authoritative cod_prj available while
 * the user is editing a library, so we cache it per tab.
 */
async function getLibCodPrj(tabId: number): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(`lib_cod_prj_${tabId}`);
    return (result[`lib_cod_prj_${tabId}`] as string | undefined) ?? null;
  } catch {
    return null;
  }
}

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
