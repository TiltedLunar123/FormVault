/**
 * FormVault — Background Service Worker
 * Handles cleanup scheduling, badge updates, and message routing.
 */

const CLEANUP_ALARM = 'formvault-cleanup';
const CLEANUP_INTERVAL_MINUTES = 24 * 60; // 24 hours

// ==================== INITIALIZATION ====================

chrome.runtime.onInstalled.addListener(() => {
  // Run initial cleanup
  runCleanup();

  // Set up recurring cleanup alarm
  chrome.alarms.create(CLEANUP_ALARM, {
    periodInMinutes: CLEANUP_INTERVAL_MINUTES
  });
});

chrome.runtime.onStartup.addListener(() => {
  runCleanup();

  // Re-create alarm on browser startup (alarms don't persist in MV3)
  chrome.alarms.create(CLEANUP_ALARM, {
    periodInMinutes: CLEANUP_INTERVAL_MINUTES
  });
});

// ==================== ALARM HANDLER ====================

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CLEANUP_ALARM) {
    runCleanup();
  }
});

// ==================== CLEANUP ====================

/**
 * Delete forms older than the user's configured retention period
 */
async function runCleanup() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    const retentionDays = settings.retentionDays || 30;

    // "never" is represented as 0
    if (retentionDays <= 0) return;

    const formsResult = await chrome.storage.local.get('forms');
    const forms = formsResult.forms || {};
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [key, form] of Object.entries(forms)) {
      if (form.savedAt < cutoff) {
        delete forms[key];
        deleted++;
      }
    }

    if (deleted > 0) {
      await chrome.storage.local.set({ forms });
    }
  } catch (e) {
    console.error('FormVault: Cleanup error', e);
  }
}

// ==================== BADGE UPDATES ====================

/**
 * Update badge text with form count for current tab's domain
 */
async function updateBadge(tabId, domain) {
  try {
    if (!domain) {
      await chrome.action.setBadgeText({ text: '', tabId });
      return;
    }

    const result = await chrome.storage.local.get('forms');
    const forms = result.forms || {};
    let count = 0;

    for (const form of Object.values(forms)) {
      try {
        const formDomain = new URL(form.url).hostname;
        if (formDomain === domain) count++;
      } catch (e) {
        // Skip invalid URLs
      }
    }

    await chrome.action.setBadgeText({
      text: count > 0 ? String(count) : '',
      tabId
    });
    await chrome.action.setBadgeBackgroundColor({
      color: '#22c55e',
      tabId
    });
  } catch (e) {
    // Tab may have been closed
  }
}

// ==================== TAB EVENT HANDLERS ====================

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      updateBadge(activeInfo.tabId, domain);
    }
  } catch (e) {
    // Tab may not be accessible
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const domain = new URL(tab.url).hostname;
      updateBadge(tabId, domain);
    } catch (e) {
      // Invalid URL
    }
  }
});

// ==================== MESSAGE HANDLER ====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'formSaved') {
    // Update badge for the tab that saved the form
    if (sender.tab) {
      updateBadge(sender.tab.id, message.domain);
    }
  }

  if (message.action === 'getBadgeCount') {
    updateBadge(message.tabId, message.domain);
  }

  return false;
});
