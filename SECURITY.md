# Security Policy

FormVault is built with a privacy-first, local-only architecture. This document describes the extension's security model and how to report vulnerabilities.

## Permissions

FormVault requests the minimum Chrome permissions needed to function:

| Permission | Purpose |
|---|---|
| `storage` | Save and retrieve form data in `chrome.storage.local` (local to the browser, never synced) |
| `activeTab` | Update the badge count for the current tab's domain |
| `alarms` | Schedule daily cleanup of expired form entries |

**No host permissions** are requested. The content script runs on `<all_urls>` but has no elevated access — it only reads form field values from the page DOM.

## Data Handling

- **100% local storage.** All form data is stored in `chrome.storage.local`. Nothing is sent over the network — ever.
- **Zero network requests.** FormVault makes no HTTP requests, no analytics calls, no telemetry, no phone-home. You can verify this in Chrome DevTools → Network tab.
- **No remote code.** All JavaScript is bundled with the extension. No CDN scripts, no dynamic imports.

## Sensitive Field Protection

FormVault actively detects and **skips** sensitive fields to prevent accidental capture of credentials or financial data:

- **By input type:** `password`, `hidden`
- **By autocomplete attribute:** `cc-number`, `cc-exp`, `cc-csc`, `cc-name`, `new-password`, `current-password`, and related values
- **By name/ID/placeholder/aria-label pattern:** Matches against `password`, `ssn`, `social security`, `credit card`, `card number`, `cvv`, `routing number`, `account number`, `pin code`, and related patterns

## Banking Site Exclusions

The content script is completely excluded from running on major financial sites via `exclude_matches` in the manifest:

- Bank of America, Chase, Wells Fargo, Citi, US Bank, Capital One
- PayPal, Venmo, Stripe
- IRS, SSA, Login.gov

Users can add additional domains to the blocklist in extension settings.

## DOM Security

- The restore toast UI is rendered inside a **closed Shadow DOM** to prevent style leaks and DOM access from the host page.
- All DOM elements are created with `document.createElement` and `textContent` — **no `innerHTML`** is used anywhere, preventing XSS.
- Favicon URLs are validated to only allow `http:` and `https:` protocols before rendering.

## Quota Management

Storage is capped at 10 MB with automatic pruning:

- A warning appears at 80% usage
- The oldest 20% of entries are pruned when nearing the quota
- Users can configure retention periods (7, 30, 90 days, or forever)

## Reporting a Vulnerability

If you discover a security vulnerability in FormVault, please report it responsibly:

1. **Do not** open a public issue.
2. Email the maintainer at the address listed in the GitHub profile, or use GitHub's private vulnerability reporting feature.
3. Include:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

I take security issues seriously and will respond as quickly as possible.

## Supported Versions

Only the latest release is actively maintained. Please ensure you're running the most recent version before reporting.
