# Contributing

```bash
git clone https://github.com/YOUR_USERNAME/FormVault.git
cd FormVault
npm install
```

Then load it: `chrome://extensions/`, Developer mode on, Load unpacked, pick the folder.
Reload the extension from that page after each edit.

There is no build step. It is vanilla JS, no bundler and no framework, and there are no
runtime dependencies at all. ESLint and Jest are dev dependencies and that is the whole
list. I would like to keep it that way, so if a change needs a new dependency, open an
issue about it first.

## Two things to be careful with

The restore toast lives in a **closed shadow root**. That is what stops the host page
from styling it and stops it from styling the host page. Any UI you inject should go in
there too, and if you find yourself reaching outside it, that is usually a sign the
approach is wrong.

Writes to form fields go through the **native value setter**, not `element.value = x`.
React controlled components do not notice a plain assignment, so a change that looks
fine on a static HTML form will silently do nothing on half the real web. There is a
helper for this already; use it.

## Tests

```bash
npm test           # jest
npm run lint       # eslint
npm run test:ci    # with coverage
```

Jest with jsdom, and the `chrome` API is mocked in `tests/setup.js`. If you add
behaviour, add a test next to the existing ones.

## Style

Single quotes, two-space indent, `'use strict'`. One thing per pull request. Test it
against a real form in the browser, not just in jest, because jsdom will happily let
through things that break on an actual page. Update the README if you changed something
a user would notice.

## Bugs

Open an issue with what you expected, what happened, and how to reproduce it. Include
your Chrome version and OS. If there is anything in the console, get it from
`chrome://extensions/` then FormVault then "Inspect views", since the service worker
and the content script log to different places and the interesting error is usually in
whichever one you did not check.

Sites that break restore are worth reporting even without a diagnosis. Field matching
is the fragile part and I collect the cases that beat it.
