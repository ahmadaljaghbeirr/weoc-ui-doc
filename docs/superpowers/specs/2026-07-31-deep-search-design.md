# weoc-ui-doc: deep content search (Phase 2)

**Date:** 2026-07-31
**Status:** Approved, ready for implementation planning
**Scope:** Docs site (`weoc-ui-doc`) search only. Depends on the htmx/Alpine navigation architecture from Phase 1 (`2026-07-30-htmx-alpine-nav-architecture-design.md`), already implemented and merged (`bao-weoc-ui-updates`, commit `f8c762a`).

## Background

Site-wide search (`docs-shell.js` `searchMatches()`/`renderSearchResults()`/`bindSearch()`, ~lines 941-1029) exists today but only matches `NAV` array entries — page label, group name, and a per-item `kw` keyword string. It has no visibility into actual page content: a user searching for text that appears inside a page's body (a prop name, an expression example, prose describing a behavior) gets no hit unless that exact term happens to be in the nav label or keyword list.

Two structural facts about the current site shape this design:

- **The docs site itself has zero build step.** `docs/docs/*.html` are static files served as-is (Cloudflare Worker + static assets); there is no `package.json` at the repo root and no bundler for the docs site (the `weoc-ui` component library has its own separate Rollup/Babel setup, unrelated to this site).
- **Content sections have no stable identity.** Each page's sections are `<div class="docs-section-title" data-wui-i18n-html="docs_<page>_<n>">...</div>` — not heading tags, and **no `id` attribute at all**, on any of the 30 pages. Bilingual text lives in `docs/i18n/<page>.js`, which registers `{lang:'en'|'ar', id, value}` pairs consumed by `WUI.i18n`.

## Decision

Add a small **build-time indexer**, enforced by a **git pre-commit hook**, that produces a static `docs/search-index.json`. At runtime, `docs-shell.js` loads that JSON lazily and queries it through a vendored **MiniSearch** instance, replacing `searchMatches()` entirely (the existing `NAV`-label search is folded into the same index rather than kept as a second system). Search becomes section-level, bilingual (EN/AR), and results deep-link to the matched section with an anchor-scroll-and-highlight, not just the top of the page.

### Why not alternatives considered

- **Fully build-free, live client-side index** (fetch all 30 pages at first search, parse DOM, build an in-memory index, cache to `localStorage`): rejected as the primary mechanism. Zero tooling, but the index can only ever be as fresh as whatever the browser fetches at runtime, and the parsing logic (DOM walking + i18n resource lookups) would have to be duplicated in the browser instead of living once in a build script. First-search latency (30 parallel fetches) is also a real cost this design avoids entirely.
- **Manual "remember to run this" indexer with no enforcement**: rejected outright — it will go stale the first time someone edits a page and forgets to regenerate the index. A pre-commit hook makes staleness structurally impossible instead of relying on discipline.
- **Hand-rolled substring/AND-terms matcher extended to section text** (same technique `searchMatches()` already uses): rejected — no relevance ranking, no typo/fuzzy tolerance, and it's reimplementing a solved problem. MiniSearch is ~9KB, zero-dependency, and built for exactly this shape (prebuilt JSON index + client-side query).
- **Full-text field per page instead of per section**: rejected — a hit on a long page (e.g. `charts.html`, 10+ sections) would still just land the user at the top of the page, defeating the purpose of "deep" search.

## Architecture

### 1. Build-time indexer (`tools/build-search-index.js`, new)

For each `docs/docs/*.html` page:

- Walk the file, grouping content into "sections": everything from one `.docs-section-title` div up to (not including) the next one, or end of page.
- For each section, collect all `data-wui-i18n*` ids present in that span and resolve their EN + AR text by reading the matching `{lang, id, value}` entries out of `docs/i18n/<page>.js` — the actual bilingual source of truth, not the rendered (English-fallback) HTML text.
- Generate a stable id: kebab-slug of the section's EN title, deduplicated with a numeric suffix on collision within the page (`overview`, `overview-2`, ...).
- **Write that id back into the section's `.docs-section-title` div** (`id="…"`) if it doesn't already have one. This is a real prerequisite for anchor-scroll navigation, not just index metadata — sections currently have no addressable identity at all.
- Also emit one index document per existing `NAV` array entry (page/group-level), so page-label search keeps working through the same index instead of a second parallel system.

Output: `docs/search-index.json`, an array of documents:

```json
{ "id": "charts#overview", "kind": "section", "page": "charts.html", "pageTitle": "Charts", "group": "Data Display", "sectionId": "overview", "textEn": "...", "textAr": "..." }
{ "id": "nav#charts", "kind": "nav", "page": "charts.html", "pageTitle": "Charts", "group": "Data Display", "textEn": "Charts chart chart.js uplot", "textAr": "..." }
```

### 2. Enforcement — git pre-commit hook

The hook runs `tools/build-search-index.js` whenever the commit touches `docs/docs/*.html` or `docs/i18n/*.js`, then:

- Re-stages `docs/search-index.json` plus any HTML files the script patched with new section ids.
- **Aborts the commit** (non-zero exit, clear stderr naming the offending file/id) on a parse failure — e.g. a `data-wui-i18n-html` id with no matching entry in the page's `i18n/*.js` file. The index is never allowed to ship stale or partial.

No CI dependency, no server-side step — this keeps the "zero-build, static-assets deploy" constraint intact for the actual served site; the build step only runs locally, at commit time.

### 3. Runtime — vendored MiniSearch

- Self-host MiniSearch under `docs/vendor/minisearch/`, matching the existing vendor convention (`vendor/htmx/`, `vendor/alpine/`, `vendor/prism/`).
- `docs-shell.js`: `searchMatches()` is replaced. On first focus of `#docs-search` (not page load — avoid blocking initial render), lazy-`fetch()` `docs/search-index.json`, build a `MiniSearch` instance indexing both `textEn` and `textAr` as separate fields, cache the built index in memory for the session (no need to rebuild per keystroke).
- Query runs against whichever field (`textEn`/`textAr`) matches the site's current active language, read from the existing Alpine/`DocShell` language store — an AR-mode user typing Arabic terms gets Arabic-matched results, not just Arabic-rendered UI around English-only matching.

### 4. Result UI

Same dropdown panel and interaction model as today (`Ctrl+K` focus, `Enter` opens top hit, `Escape`/click-outside closes) — `renderSearchResults()` changes what it renders, not how the panel behaves:

- Results grouped by page (page title as a sub-header within the dropdown), not a flat list.
- Each hit shows the matched section title plus a short snippet of the matching text, highlighted via MiniSearch's match-term data (wrap matched substrings in `<mark>` or an equivalent inline highlight span).

### 5. Navigation integration

Hit `href` becomes `page.html#sectionId`. Two cases, both building on the existing `applySwappedPage()`/`htmx:afterSettle` hook from Phase 1:

- **Cross-page hit** (target page ≠ current page): identical `hx-get`/`hx-push-url`/`hx-target`/`hx-select`/`hx-swap` attribute pattern `renderSearchResults()` already applies to hits (see the existing detached-anchor rationale in `docs-shell.js` ~962-985 — attributes stay on the anchor itself, not inherited). After swap, the post-swap hook checks `location.hash`: if present, `scrollIntoView()` that section element instead of the current unconditional `main.scrollTop = 0`, and applies a brief flash-highlight (reusing the flash-outline pattern already built for `kpi-recipes.html`'s bento-tile click nav — no new visual language).
- **Same-page hit** (target page = current page): skip htmx entirely — `closeSearch()`, then scroll+flash the target section directly, same as the cross-page case's post-swap step but without a navigation round-trip.

This also lays reusable groundwork (stable per-section ids, scroll-to-anchor-and-highlight) for the separately-scoped "per-page index/TOC" item from the next-session brief — that item can reuse these same ids rather than inventing its own scheme, though it is not implemented as part of this spec.

### Error handling

- Index fetch fails at runtime (network error, 404): search box degrades to a visibly disabled state with a small inline note ("Search unavailable") — never throws, never blocks the rest of the page.
- Build script fails at commit time: commit is blocked, stderr names the specific file and id that failed to resolve, so the fix is immediate and local rather than a downstream mystery.

## Testing / verification plan

Manual live-browser pass (per this project's established convention — fresh reload, check console for errors):

1. Search a known EN term that only exists in a page's body text (not in any nav label) → confirms section-level indexing works, not just the old nav-label matching.
2. Switch site language to AR, search a known AR term → confirms bilingual indexing and language-aware field querying.
3. Click a cross-page result → confirms htmx nav fires, target section scrolls into view and flashes, `location.hash` is correct, back/forward still works.
4. Click a same-page result (search while already on the target page) → confirms the no-htmx-roundtrip path scrolls+flashes correctly.
5. Edit a page's section text, stage it, attempt a commit → confirms the pre-commit hook regenerates `search-index.json`, re-stages it, and the new text is searchable afterward.
6. Deliberately break an i18n reference (remove a `data-wui-i18n-html` id's entry from its `i18n/*.js` file), attempt a commit → confirms the hook blocks the commit with a clear error naming the broken id.
7. Zero console errors across all of the above, including a repeat pass with the browser cache cold (first-visit lazy-fetch path).

## Open items (explicitly out of scope for this spec)

- Per-page index/TOC (next-session-brief item #2) — reuses this spec's section-id scheme, not designed here.
- Fuzzy/typo-tolerance tuning (MiniSearch options like `fuzzy`/`prefix` thresholds) — ship with MiniSearch defaults first, tune only if real usage shows it's needed.
- Code-block-specific indexing (searching by class name/attribute/API call inside `<pre>`/`<code>` blocks) — considered during brainstorming, deferred; this spec indexes section prose only.
