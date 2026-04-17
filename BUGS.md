# Known Bugs

## [Severity: High] README's "zero network requests" claim violated by favicon rendering
- **File:** content.js:295-301, popup.js:115
- **Issue:** Stored favicon URLs are rendered as `<img src="...">` in the popup, causing Chrome to fetch the remote favicon — contradicting the README and popup copy.
- **Repro:** Save a form on any site, open the FormVault popup with DevTools Network tab open — favicon fetch is visible.
- **Fix:** Convert favicons to data URIs at save time, or drop favicon display entirely.

## [Severity: High] Data loss on unload from unawaited async save
- **File:** content.js:345
- **Issue:** `flushSave()` calls async `saveCurrentForms()` without awaiting; `beforeunload`/`visibilitychange` do not wait on promises, so `chrome.storage.local.set` can be canceled mid-flight.
- **Repro:** Type into a form and close the tab immediately — last keystrokes may never persist.
- **Fix:** Pre-serialize pending state synchronously and `chrome.storage.local.set()` before navigation, or use a short timer-driven persistence cadence so there is always a recent durable snapshot.

## [Severity: High] Multi-tab race overwrites concurrent form saves
- **File:** utils/storage.js:52-65
- **Issue:** `saveForm()` is a non-atomic read-modify-write over the full forms dict; two tabs saving near-simultaneously clobber each other.
- **Repro:** Save a form in two tabs on the same origin within ~3s — one tab's save disappears.
- **Fix:** Use a version counter + CAS retry loop, or serialize writes through the service worker.

## [Severity: Medium] Unhandled sendMessage rejection is swallowed
- **File:** content.js:315-320
- **Issue:** `chrome.runtime.sendMessage(...).catch(() => {})` drops all errors; a broken background worker silently stops badge updates.
- **Repro:** Throw in background.js on message receive — content script keeps saving but badge never refreshes and no diagnostic is logged.
- **Fix:** Only swallow the "Receiving end does not exist" case; log/re-throw everything else.

## [Severity: Medium] Quota pruning removes too little to fit the next write
- **File:** utils/storage.js:168
- **Issue:** `Math.max(1, Math.ceil(entries.length * 0.2))` can free far less than the next write needs, so the subsequent `set()` still fails.
- **Repro:** Fill storage with many tiny entries, then save one large form — save fails silently even after pruning.
- **Fix:** Iterate pruning until `bytesUsed < MAX_BYTES * QUOTA_WARNING_THRESHOLD`, or compute required headroom from the pending payload.

## [Severity: Medium] Missing savedAt skips old forms in cleanup forever
- **File:** utils/storage.js:142, background.js:58
- **Issue:** `form.savedAt < cutoff` is always false when `savedAt` is `undefined`, leaving legacy/corrupt entries in storage indefinitely.
- **Repro:** Hand-edit storage to remove `savedAt` from a form — subsequent cleanups never delete it.
- **Fix:** Treat missing `savedAt` as stale: `if (!form.savedAt || form.savedAt < cutoff)`.

## [Severity: Low] Stored XPath is passed unchecked to document.evaluate
- **File:** content.js:407-416
- **Issue:** `fieldData.xpath` is used directly in `document.evaluate()`; if local storage is tampered with, attacker-controlled XPath runs against the page.
- **Repro:** Requires compromised local storage — not a direct vector, but no defense-in-depth.
- **Fix:** Validate XPath against a conservative allow-pattern or drop XPath restoration and rely on selectors + `name`.
