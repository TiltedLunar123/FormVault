# Changelog

All notable changes to FormVault are documented here.

## [1.2.0] — 2026-04-04

### Added
- Screenshots of popup, settings, and restore toast embedded in README
- CONTRIBUTING.md with dev setup, PR guidelines, and areas needing help
- CHANGELOG.md for version history
- GitHub issue templates (bug report, feature request) and PR template

### Improved
- README overhauled with centered header, badge row, and "How It Works" table

## [1.1.0] — 2026-04-01

### Fixed
- Storage quota handling now pre-checks available space before every save
- Badge count updates correctly when switching between tabs
- Blocklist matching uses exact domain or subdomain match instead of substring
- Cleanup alarm re-created on browser startup (MV3 alarms don't persist)

### Improved
- Flush pending saves on `beforeunload` and `visibilitychange` to prevent data loss on tab close
- Restore toast respects user retention setting instead of a hardcoded max age
- Favicon URLs are validated before use (protocol check)
- DOM-built toast elements replace innerHTML for safer rendering

## [1.0.0] — 2026-03-27

### Added
- Auto-save form data after 3 seconds of inactivity
- One-click restore via Shadow DOM toast notification
- React/SPA support with MutationObserver and native value setters
- Full-text search across saved forms (title, URL, field content)
- Configurable retention: 7, 30, 90 days, or forever
- Domain blocklist with banking sites excluded by default
- Sensitive field detection (passwords, credit cards, SSNs)
- Storage quota management with automatic pruning
- Live popup updates via `chrome.storage.onChanged`
- Privacy policy page
