# weoc-ui-doc: htmx + Alpine navigation architecture (Phase 1)

**Date:** 2026-07-30
**Status:** Approved, ready for implementation planning
**Scope:** Docs site (`weoc-ui-doc`) navigation/state architecture only. Search/indexing is a separate, later phase that depends on this one landing first.

## Background

The docs site (`docs/docs/*.html`, 29 pages) is served as static assets behind a Cloudflare Worker (`worker.js`/`wrangler.jsonc`). It originally used Barba.js for SPA-style page transitions. A prior session removed Barba but replaced it with a hand-rolled `fetch()` → `innerHTML` swap router in `docs-shell.js` (`navigate()`/`swapContent()`/`bindRouter()`, ~lines 1409-1463), plus a small Alpine.js global store (`window.Alpine.store('docs')`, theme + active-page only). Alpine was not actually driving navigation or page lifecycle — it was decoration on the same fragile shape Barba had:

- Per-page live JS (chart draws, TomSelect/Flatpickr wiring, etc.) has to be centrally registered in a `PAGE_INIT` dispatch object (~line 445+) and manually re-invoked after every swap. A page's interactivity silently breaks if it isn't kept in sync with this registry.
- Raw `element.innerHTML = html` does not execute embedded `<script>` tags (a DOM-spec behavior, not a bug) — the swap mechanism structurally cannot run inline page scripts, which is why all live demo wiring was pushed into the central registry in the first place.
- Stale Barba-era markup (`data-barba="wrapper"`, `data-barba="container"`, `data-barba-namespace="..."`) is still present across all 29 pages, unused by the current router but misleading.
- A GSAP wipe-curtain transition (`coverIn`/`revealOut`, ~lines 1394-1407) is wired directly into the hand-rolled `navigate()` chain.

Site-wide search (`docs-shell.js` ~1488-1544, Cmd+K) exists today but only matches nav item labels/keywords, not page content. Deep content search is explicitly deferred to Phase 2, which depends on whatever navigation model Phase 1 lands.

## Decision

Replace the hand-rolled router with **htmx** (boosted navigation, real swap engine, reliable lifecycle hooks) and expand **Alpine.js** from "global store only" to "owns each page's component state," replacing the `PAGE_INIT` registry with per-page `Alpine.data()` components.

Both are zero-build, script-tag dependencies — no change to the "zero-build vanilla" constraint or the Cloudflare Worker + static-assets deploy model.

### Why not alternatives considered

- **Full reload, no SPA:** simplest, rejected in favor of keeping the GSAP transition (explicit user call — the curtain effect is worth keeping).
- **Alpine alone as a router:** rejected — Alpine has no router or swap lifecycle; it's a component-reactivity library, not a navigation framework. This mismatch is the likely root cause of the previous "Alpine migration" landing incomplete.
- **Full JS framework (React/Vue/Svelte):** rejected — full rewrite + build step, misaligned with the site's static-pages nature.
- **Static-site generator (Astro/11ty):** rejected for Phase 1 — adds a build pipeline and a migration pass over all 29 pages for a benefit (templating, content-driven search) not needed until Phase 2.

## Architecture

### 1. Navigation / swap engine

- Self-host `htmx.min.js` under `docs/vendor/htmx/`, matching the existing vendor convention (`vendor/prism/`, `vendor/tinymce-8.6.0/`, `vendor/alpine/`).
- `hx-boost="true"` + `hx-target="#docs-main"` + `hx-select="#docs-main"` on a stable ancestor that is never itself swapped (e.g. `#docs-split`). This preserves the current UX (persistent header/sidebar, only the main content pane changes) while htmx owns link interception, `history.pushState`, and same-origin request handling.
- htmx re-executes `<script>` tags present in the swapped fragment (its documented default swap behavior) — the structural limitation that forced everything into `PAGE_INIT` goes away.

### 2. Transition (GSAP curtain, kept)

The existing `coverIn()`/`revealOut()`/`wipeEl()`/`placeWipe()` GSAP functions are kept, re-wired to htmx's event lifecycle instead of the custom fetch chain:

- `htmx:beforeSwap` → prevent the default swap, run `coverIn()`.
- Once `coverIn()` resolves, manually call `htmx.swap()` with the response content.
- `htmx:afterSettle` → run `revealOut()`, then chrome re-render + page init (below).

This is a documented htmx pattern (deferring/driving the swap manually from `beforeSwap`), not a workaround.

### 3. Chrome (header + sidebar)

Stays JS-rendered from the single `NAV` array (`renderChrome()`/`renderSidebar()`) — no change to that decision. Trigger point moves from the old custom swap callback to `htmx:afterSettle`. New requirement: call `htmx.process(el)` on the freshly re-rendered header/sidebar elements after each render, since htmx only auto-scans DOM it swapped itself — content injected via plain `.innerHTML` writes (our own chrome render) needs an explicit `htmx.process()` call to activate `hx-boost` on the new links.

### 4. Per-page demo JS: PAGE_INIT → Alpine components

Each page's `PAGE_INIT.<key>` function is converted to one or more `Alpine.data('name', factory)` registrations. Structural rule: the registration `<script>` and any `x-data="name()"` usage must live **inside** `#docs-main`, not after it (unlike today's trailing `<script>DocShell.init('cards')</script>` which sits outside the swap target). Only content inside the swap target travels with htmx and gets its scripts re-executed on every visit; re-registering the same Alpine component name repeatedly is harmless.

Underlying component factories (`WUI.chart`, `TomSelectFactory`, `FlatpickrFactory`, `WUICalendar`, etc.) are untouched — only the per-page glue code that wires a factory to a specific DOM element moves out of the central registry and into that page's own markup.

**Known risk to verify per page during implementation:** global asset loading order (`ensureGlobalAssets` — TomSelect/Flatpickr/uPlot/chart libs) must still resolve before a page's `Alpine.data` factory runs its `x-init`. This dependency-timing concern exists today too; each page conversion needs to confirm it explicitly rather than assume it carries over for free.

### 5. Cleanup

- Remove `docs/vendor/barba.min.js` (unused since the prior session's removal, never deleted).
- Remove dead `data-barba="wrapper"`, `data-barba="container"`, `data-barba-namespace="..."` attributes across all 29 pages (leftover markup, not read by any current code).

## Rollout plan

1. Implementation planning (next step, via `writing-plans`) nails the exact `Alpine.data()` conversion pattern against one representative page, live-verified in-browser.
2. Once the pattern is proven, remaining pages are converted in parallel — one agent per page (or small batch), matching the fan-out pattern already used successfully in this project (the 5-agent neon-glow rollout, the kpi-recipes "pattern first, then repeat" methodology).
3. `docs-shell.js`'s `PAGE_INIT` object shrinks as each page's entry is deleted after conversion. When empty, the registry itself is removed.
4. Barba-attribute + vendor file cleanup can happen as part of the first page's conversion pass (mechanical, low-risk) or as a small standalone pass — decide during implementation planning.

## Non-goals (explicit)

- Deep content search / indexing across pages (Phase 2, separate spec, depends on this phase).
- Baking header/sidebar chrome statically into each of the 29 HTML files (considered, rejected — staying JS-rendered).
- Migrating to a static-site generator or full JS framework.
- Any change to the `weoc-ui` component library itself (`JS/weoc-ui.js`, `JS/wui-charts.js`, CSS) — this spec is scoped entirely to the docs site's own navigation shell.
