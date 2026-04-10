/**
 * FormVault — Background Service Worker Tests
 */

const fs = require('fs');
const path = require('path');

const backgroundSource = fs.readFileSync(
  path.resolve(__dirname, '..', 'background.js'),
  'utf-8'
);

let listeners;

beforeAll(() => {
  global.__resetAllChromeMocks();
  // Evaluate background.js — it registers Chrome listeners at module scope
  const fn = new Function(backgroundSource);
  fn();

  // Capture registered listener callbacks
  listeners = {
    onInstalled: chrome.runtime.onInstalled._listeners[0],
    onStartup: chrome.runtime.onStartup._listeners[0],
    onAlarm: chrome.alarms.onAlarm._listeners[0],
    onActivated: chrome.tabs.onActivated._listeners[0],
    onUpdated: chrome.tabs.onUpdated._listeners[0],
    onMessage: chrome.runtime.onMessage._listeners[0]
  };
});

beforeEach(() => {
  global.__resetChromeStorage();
  chrome.action.setBadgeText.mockClear();
  chrome.action.setBadgeBackgroundColor.mockClear();
  chrome.alarms.create.mockClear();
});

// ==================== LISTENER REGISTRATION ====================

describe('listener registration', () => {
  test('registers all expected Chrome listeners', () => {
    expect(listeners.onInstalled).toBeDefined();
    expect(listeners.onStartup).toBeDefined();
    expect(listeners.onAlarm).toBeDefined();
    expect(listeners.onActivated).toBeDefined();
    expect(listeners.onUpdated).toBeDefined();
    expect(listeners.onMessage).toBeDefined();
  });
});

// ==================== CLEANUP via onInstalled ====================

describe('runCleanup via onInstalled', () => {
  test('creates cleanup alarm', async () => {
    await listeners.onInstalled();
    expect(chrome.alarms.create).toHaveBeenCalledWith('formvault-cleanup', {
      periodInMinutes: 1440 // 24 * 60
    });
  });

  test('deletes expired forms based on retention setting', async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      settings: { retentionDays: 7 },
      forms: {
        'old': { url: 'https://old.com', savedAt: now - (10 * oneDay) },
        'fresh': { url: 'https://fresh.com', savedAt: now }
      }
    });

    await listeners.onInstalled();

    const stored = await chrome.storage.local.get('forms');
    expect(stored.forms.old).toBeUndefined();
    expect(stored.forms.fresh).toBeDefined();
  });

  test('skips cleanup when retentionDays is 0 (never delete)', async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      settings: { retentionDays: 0 },
      forms: {
        'ancient': { url: 'https://old.com', savedAt: now - (365 * oneDay) }
      }
    });

    await listeners.onInstalled();

    const stored = await chrome.storage.local.get('forms');
    expect(stored.forms.ancient).toBeDefined();
  });

  test('uses default 30-day retention when no settings saved', async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      forms: {
        'old': { url: 'https://old.com', savedAt: now - (31 * oneDay) },
        'recent': { url: 'https://new.com', savedAt: now - (5 * oneDay) }
      }
    });

    await listeners.onInstalled();

    const stored = await chrome.storage.local.get('forms');
    expect(stored.forms.old).toBeUndefined();
    expect(stored.forms.recent).toBeDefined();
  });
});

// ==================== CLEANUP via onAlarm ====================

describe('runCleanup via onAlarm', () => {
  test('runs cleanup for the correct alarm name', async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      settings: { retentionDays: 7 },
      forms: {
        'expired': { url: 'https://old.com', savedAt: now - (10 * oneDay) }
      }
    });

    await listeners.onAlarm({ name: 'formvault-cleanup' });

    const stored = await chrome.storage.local.get('forms');
    expect(stored.forms.expired).toBeUndefined();
  });

  test('ignores alarms with different names', async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await chrome.storage.local.set({
      settings: { retentionDays: 7 },
      forms: {
        'old': { url: 'https://old.com', savedAt: now - (10 * oneDay) }
      }
    });

    await listeners.onAlarm({ name: 'some-other-alarm' });

    const stored = await chrome.storage.local.get('forms');
    expect(stored.forms.old).toBeDefined();
  });
});

// ==================== onStartup ====================

describe('onStartup', () => {
  test('recreates cleanup alarm on browser startup', async () => {
    await listeners.onStartup();
    expect(chrome.alarms.create).toHaveBeenCalledWith('formvault-cleanup', {
      periodInMinutes: 1440
    });
  });
});

// ==================== BADGE UPDATES via onActivated ====================

describe('updateBadge via onActivated', () => {
  test('sets badge text with form count for domain', async () => {
    chrome.tabs.get.mockResolvedValueOnce({ id: 1, url: 'https://example.com/page' });

    await chrome.storage.local.set({
      forms: {
        'a': { url: 'https://example.com/form1', savedAt: 1000 },
        'b': { url: 'https://example.com/form2', savedAt: 2000 },
        'c': { url: 'https://other.com/form', savedAt: 3000 }
      }
    });

    await listeners.onActivated({ tabId: 1 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '2',
      tabId: 1
    });
  });

  test('clears badge when domain has no saved forms', async () => {
    chrome.tabs.get.mockResolvedValueOnce({ id: 1, url: 'https://empty.com/page' });
    await chrome.storage.local.set({ forms: {} });

    await listeners.onActivated({ tabId: 1 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 1
    });
  });

  test('sets badge background color', async () => {
    chrome.tabs.get.mockResolvedValueOnce({ id: 1, url: 'https://example.com' });
    await chrome.storage.local.set({
      forms: { 'a': { url: 'https://example.com', savedAt: 1000 } }
    });

    await listeners.onActivated({ tabId: 1 });

    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#3b82f6',
      tabId: 1
    });
  });
});

// ==================== BADGE UPDATES via onUpdated ====================

describe('updateBadge via onUpdated', () => {
  test('updates badge on page load complete', async () => {
    await chrome.storage.local.set({
      forms: { 'a': { url: 'https://example.com/page', savedAt: 1000 } }
    });

    await listeners.onUpdated(
      1,
      { status: 'complete' },
      { url: 'https://example.com/page' }
    );

    expect(chrome.action.setBadgeText).toHaveBeenCalled();
  });

  test('ignores non-complete status changes', async () => {
    await listeners.onUpdated(
      1,
      { status: 'loading' },
      { url: 'https://example.com/page' }
    );

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });
});

// ==================== MESSAGE HANDLER ====================

describe('message handler', () => {
  test('updates badge on formSaved message', async () => {
    await chrome.storage.local.set({
      forms: { 'a': { url: 'https://test.com/form', savedAt: 1000 } }
    });

    const sender = { tab: { id: 5 } };
    const sendResponse = jest.fn();

    listeners.onMessage(
      { action: 'formSaved', domain: 'test.com' },
      sender,
      sendResponse
    );

    // Wait for async badge update
    await new Promise(r => setTimeout(r, 50));

    expect(chrome.action.setBadgeText).toHaveBeenCalled();
  });

  test('updates badge on getBadgeCount message', async () => {
    await chrome.storage.local.set({ forms: {} });

    const sender = {};
    const sendResponse = jest.fn();

    listeners.onMessage(
      { action: 'getBadgeCount', tabId: 3, domain: 'test.com' },
      sender,
      sendResponse
    );

    await new Promise(r => setTimeout(r, 50));

    expect(chrome.action.setBadgeText).toHaveBeenCalled();
  });

  test('returns false (no async sendResponse)', () => {
    const sender = {};
    const sendResponse = jest.fn();

    const result = listeners.onMessage(
      { action: 'unknownAction' },
      sender,
      sendResponse
    );

    expect(result).toBe(false);
  });
});
