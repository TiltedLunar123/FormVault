# Contributing to FormVault

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FormVault.git
   cd FormVault
   npm install
   ```
3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the project folder
4. Make your changes and test them locally

## Development Notes

- **No build step** — FormVault is vanilla JS with no bundler, transpiler, or framework. Edit files and reload the extension.
- **Manifest V3** — The extension uses Chrome's Manifest V3 with a service worker (`background.js`) instead of a persistent background page.
- **Shadow DOM** — The restore toast is rendered inside a closed Shadow DOM to prevent style leaks. Keep any injected UI isolated.
- **Zero runtime dependencies** — There are no npm runtime dependencies. Dev dependencies (ESLint, Jest) are for linting and testing only.

## Testing

Run tests before submitting a PR:

```bash
npm install        # Install dev dependencies (first time only)
npm test           # Run all tests
npm run lint       # Check code style
npm run test:ci    # Run tests with coverage report
```

When adding new functionality, add corresponding tests in the `tests/` directory. Tests use Jest with jsdom for DOM simulation and mock Chrome APIs defined in `tests/setup.js`.

## What to Work On

Check the [roadmap in the README](README.md#roadmap) for planned features. Issues labeled `good first issue` are a great starting point.

Some areas where help is appreciated:

- **Cross-browser support** — Porting to Firefox and Edge
- **iframe support** — Saving/restoring fields inside iframes
- **Test coverage** — Unit tests for `storage.js` and integration tests for content script behavior
- **Accessibility** — Improving keyboard navigation and screen reader support in the popup and toast

## Pull Request Guidelines

1. **Keep PRs focused** — One feature or fix per PR.
2. **Test manually** — Load the extension, verify your change works on a real form, and check the popup.
3. **Follow existing style** — Match the code style you see in the project (single quotes, 2-space indentation, `'use strict'`).
4. **Update the README** if your change adds or modifies user-facing behavior.
5. **No new dependencies** unless absolutely necessary and discussed in an issue first.

## Reporting Bugs

Open an issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Chrome version and OS
- Console errors (if any) from `chrome://extensions/` → FormVault → "Inspect views"

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to make a useful tool better.
