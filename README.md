# FormVault

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Chrome Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)

Auto-save and restore web form data locally. FormVault is a Chrome extension that protects your form inputs from page crashes, refreshes, and accidental navigation — no accounts, no cloud, no data ever leaving your browser.

## Features

- **Auto-Save** — Automatically saves form data every 3 seconds after your last keystroke
- **Smart Restore** — Shows a non-intrusive toast notification when saved data is available for the current page
- **React/SPA Compatible** — Uses MutationObserver to detect dynamically added fields and native value setters for React controlled components
- **Privacy-First** — 100% local storage — zero network requests, zero analytics, zero data exfiltration
- **Sensitive Field Detection** — Automatically skips passwords, credit card numbers, SSNs, and other sensitive fields
- **Search & Browse** — Full-text search across saved forms by title, URL, or field content
- **Configurable Retention** — Auto-delete saved forms after 7, 30, or 90 days (or keep forever)
- **Domain Blocklist** — Exclude specific domains (banking sites, etc.) from auto-saving
- **Shadow DOM Isolation** — All injected UI is fully isolated from host page styles
- **Storage Management** — Automatic pruning when approaching Chrome's 10 MB storage limit

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the root `FormVault` directory (the folder containing `manifest.json`)
6. The FormVault icon (green shield) will appear in your extensions toolbar

## How It Works

1. **Auto-save** — When you type in any form field, FormVault debounces your input and saves all non-sensitive field data to `chrome.storage.local` after 3 seconds of inactivity.
2. **Page key** — Each page gets a stable key derived from its URL (volatile query params stripped, form-identifying params kept) so saves persist across refreshes.
3. **Restore toast** — When you revisit a page with saved data, a Shadow DOM-isolated toast appears offering one-click restore. Fields are matched by CSS selector, `name` attribute, or XPath fallback.
4. **Cleanup** — A background alarm prunes expired entries every 24 hours based on your retention setting.

## Project Structure

```
FormVault/
├── manifest.json        # Extension manifest (MV3)
├── background.js        # Service worker — cleanup scheduling, badge updates
├── content.js           # Content script — form detection, auto-save, restore toast
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic — form list, search, settings
├── popup.css            # Popup styles
├── privacy.html         # Privacy policy page
├── utils/
│   └── storage.js       # Shared storage helpers (forms CRUD, settings, quota)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Privacy

FormVault is built with privacy as a core principle:

- All data is stored locally using `chrome.storage.local`
- The extension makes **zero network requests** — no fetch, no XMLHttpRequest, no external scripts
- No analytics, no tracking, no telemetry
- Sensitive fields (passwords, credit cards, SSNs) are never saved
- Banking sites are excluded by default, with a user-configurable blocklist

See [`privacy.html`](privacy.html) for the full privacy policy.

## Roadmap

- [ ] **iframe Support** — Save and restore form data inside iframes
- [ ] **Cross-Browser Port** — Firefox (Manifest V3) and Edge compatibility
- [ ] **Export/Import** — Export saved forms as JSON for backup and migration
- [ ] **Per-Site Settings** — Fine-grained control over which sites to auto-save
- [ ] **Keyboard Shortcuts** — Quick restore via keyboard shortcut

## License

[MIT](LICENSE)
