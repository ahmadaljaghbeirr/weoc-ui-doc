# weoc-ui-doc

weoc-ui component library — CSS + JS for WebEOC EOC boards.

- **`docs/`** — human-facing docs site, live interactive demos.
- **`docs-md/`** — 1:1 Markdown mirror of every `docs/docs/*.html` page (full content, not a summary). Start at [`docs-md/README.md`](docs-md/README.md).
- **`llm-docs/`** — compact, fast-to-grep reference for AI agents / quick lookups. Start at [`llm-docs/README.md`](llm-docs/README.md).
- **`build/`** — ESM source for the core JS bundle (`npm run build`/`npm test` from here).
- **`CSS/`**, **`JS/`** — the deployed library files boards actually load.

Deploys as a Cloudflare Worker (`wrangler.jsonc`, `assets.directory: "."`) — every file in this repo is served as a static asset at its matching path.