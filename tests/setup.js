/**
 * FormVault — Test Setup
 * Chrome API mocks for Jest test environment.
 */

/* eslint-disable no-undef */

// In-memory storage backend
let storageData = {};

function createChromeStorageLocal() {
  return {
    get: jest.fn(async (keys) => {
      if (typeof keys === 'string') {
        return { [keys]: storageData[keys] };
      }
      if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(k => { result[k] = storageData[k]; });
        return result;
      }
      return { ...storageData };
    }),
    set: jest.fn(async (items) => {
      Object.assign(storageData, items);
    }),
    remove: jest.fn(async (keys) => {
      const list = Array.isArray(keys) ? keys : [keys];
      list.forEach(k => { delete storageData[k]; });
    }),
    clear: jest.fn(async () => {
      storageData = {};
    }),
    getBytesInUse: jest.fn(async () => 0)
  };
}

function createListenerMock() {
  const listeners = [];
  return {
    addListener: jest.fn((fn) => listeners.push(fn)),
    removeListener: jest.fn((fn) => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    }),
    _listeners: listeners,
    _fire: (...args) => listeners.forEach(fn => fn(...args))
  };
}

global.chrome = {
  storage: {
    local: createChromeStorageLocal(),
    onChanged: createListenerMock()
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(),
    onAlarm: createListenerMock()
  },
  tabs: {
    query: jest.fn(async () => []),
    get: jest.fn(async (tabId) => ({ id: tabId, url: 'https://example.com' })),
    create: jest.fn(async () => ({})),
    onActivated: createListenerMock(),
    onUpdated: createListenerMock()
  },
  action: {
    setBadgeText: jest.fn(async () => {}),
    setBadgeBackgroundColor: jest.fn(async () => {})
  },
  runtime: {
    onInstalled: createListenerMock(),
    onStartup: createListenerMock(),
    onMessage: createListenerMock(),
    sendMessage: jest.fn(async () => {})
  }
};

// Reset storage between tests
global.__resetChromeStorage = () => {
  storageData = {};
  chrome.storage.local = createChromeStorageLocal();
};

// Reset all mocks between tests
global.__resetAllChromeMocks = () => {
  storageData = {};
  chrome.storage.local = createChromeStorageLocal();
  chrome.storage.onChanged = createListenerMock();
  chrome.alarms.create.mockClear();
  chrome.alarms.clear.mockClear();
  chrome.alarms.onAlarm = createListenerMock();
  chrome.tabs.query.mockClear();
  chrome.tabs.get = jest.fn(async (tabId) => ({ id: tabId, url: 'https://example.com' }));
  chrome.tabs.create.mockClear();
  chrome.tabs.onActivated = createListenerMock();
  chrome.tabs.onUpdated = createListenerMock();
  chrome.action.setBadgeText = jest.fn(async () => {});
  chrome.action.setBadgeBackgroundColor = jest.fn(async () => {});
  chrome.runtime.onInstalled = createListenerMock();
  chrome.runtime.onStartup = createListenerMock();
  chrome.runtime.onMessage = createListenerMock();
  chrome.runtime.sendMessage = jest.fn(async () => {});
};

// Provide CSS.escape for jsdom
if (typeof CSS === 'undefined') {
  global.CSS = {
    escape: (str) => String(str).replace(/([^\w-])/g, '\\$1')
  };
}
