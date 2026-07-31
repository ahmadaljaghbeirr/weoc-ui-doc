# weoc-ui-doc

weoc-ui component library — CSS + JS for WebEOC EOC boards.

- **`docs/`** — human-facing docs site, live interactive demos.
- **`docs-md/`** — 1:1 Markdown mirror of every `docs/docs/*.html` page (full content, not a summary). Start at [`docs-md/README.md`](docs-md/README.md).
- **`llm-docs/`** — compact, fast-to-grep reference for AI agents / quick lookups. Start at [`llm-docs/README.md`](llm-docs/README.md).
- **`build/`** — ESM source for the core JS bundle (`npm run build`/`npm test` from here).
- **`CSS/`**, **`JS/`** — the deployed library files boards actually load.

Deploys as a Cloudflare Worker (`wrangler.jsonc`, `assets.directory: "."`) — every file in this repo is served as a static asset at its matching path.

## Tooling

`tools/build-search-index.js` builds `docs/search-index.json`, the search index the docs site's `#docs-search` box queries at runtime (via a vendored MiniSearch instance in `docs/docs-shell.js`). For every page under `docs/docs/*.html`, plus the home page (`docs/index.html`), it walks each `.docs-section-title` block, resolves its EN/AR text against `docs/i18n/<page>.js`, generates a stable section id (writing it back into the HTML if missing), and emits one search document per section plus one per `NAV` entry in `docs-shell.js`. It aborts (and prints which id) if a page references an i18n id that has no matching entry in its `i18n/*.js` file.

Run it manually with:

```
npm run build:search-index
```

**One-time per clone:** enable the pre-commit hook that keeps the index from going stale — it regenerates `docs/search-index.json` automatically whenever a commit touches `docs/docs/*.html`, `docs/index.html`, `docs/i18n/*.js`, or `docs/docs-shell.js` (its `NAV` array drives the search index's nav docs, so a NAV-only edit still needs to trigger a rebuild), and aborts the commit if it finds an unresolved i18n reference.

```
npm run hooks:install
```

This points git at `tools/git-hooks/` (`git config core.hooksPath tools/git-hooks`) instead of the default `.git/hooks/`. Without running it once, commits that change docs content will silently ship a stale search index.

Run the indexer's own test suite with:

```
npm run test:search-index
```
