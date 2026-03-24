# FormVault

FormVault is a Chrome extension that automatically saves web form data locally as you type. If a page crashes, refreshes, or you accidentally navigate away, FormVault detects your saved data and offers to restore it instantly — no accounts, no cloud, no data ever leaving your browser.

## Features

- **Auto-Save**: Automatically saves form data every 3 seconds after your last keystroke
- **Smart Restore**: Shows a non-intrusive toast notification when saved data is available for the current page
- **React/SPA Compatible**: Uses MutationObserver to detect dynamically added fields and native value setters for React controlled components
- **Privacy-First**: 100% local storage — zero network requests, zero analytics, zero data exfiltration
- **Sensitive Field Detection**: Automatically skips passwords, credit card numbers, SSNs, and other sensitive fields
- **Search & Browse**: Full-text search across saved forms by title, URL, or field content
- **Configurable Retention**: Auto-delete saved forms after 7, 30, or 90 days (or keep forever)
- **Domain Blocklist**: Exclude specific domains (banking sites, etc.) from auto-saving
- **Shadow DOM Isolation**: All injected UI is fully isolated from host page styles
- **Storage Management**: Automatic pruning when approaching Chrome's 10MB storage limit

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `formvault/` directory
6. The FormVault icon (green shield) will appear in your extensions toolbar

## Screenshots

- `screenshots/popup-main.png` — Main popup with saved form list
- `screenshots/popup-settings.png` — Settings panel
- `screenshots/restore-toast.png` — In-page restore notification
- `screenshots/popup-empty.png` — Empty state

## Privacy

FormVault is built with privacy as a core principle:

- All data is stored locally using `chrome.storage.local`
- The extension makes **zero network requests** — no fetch, no XMLHttpRequest, no external scripts
- No analytics, no tracking, no telemetry
- Sensitive fields (passwords, credit cards, SSNs) are never saved
- Banking sites are excluded by default, with user-configurable blocklist

## Future Roadmap

- **iframe Support**: Save and restore form data inside iframes
- **Cross-Browser Port**: Firefox (Manifest V3) and Edge compatibility
- **Optional Encrypted Cloud Sync**: End-to-end encrypted backup to user's own cloud storage
- **Export/Import**: Export saved forms as JSON for backup and migration
- **Per-Site Settings**: Fine-grained control over which sites to auto-save
- **Keyboard Shortcuts**: Quick restore via keyboard shortcut
- **Freemium Tier Structure**: Free tier with core features, premium tier with cloud sync and advanced options

## License

MIT
