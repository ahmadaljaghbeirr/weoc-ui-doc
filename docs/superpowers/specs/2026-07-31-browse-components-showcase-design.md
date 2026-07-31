# weoc-ui-doc: "Browse Components" showcase page

**Date:** 2026-07-31
**Status:** Approved, ready for implementation
**Scope:** `weoc-ui-doc` docs site only (`docs/docs/browse.html`, new; `docs/index.html`, one-line href change). No changes to `docs/docs-shell.js` — deliberately, to stay independent of concurrent unrelated work on that file.

## Background

`docs/index.html`'s hero has two CTAs: "Get Started" (→ `tokens.html`) and "Browse Components" (→ `interactive.html`, an arbitrary placeholder target — it was never actually built as a real showcase). This is next-session-brief item #14: a client-presentable page for demoing the library, framed explicitly as a sales/presentation tool ("something so the clients have something good to look at while presenting"), MUI-homepage-style.

## Decision

A curated Bento-grid showcase (`browse.html`) built entirely on the existing `.wui-bento`/`.wui-bento-tile`/`wui-w-{cols}x{rows}` grid primitive (`CSS/weoc-ui/weoc-grid.css`) — no new grid mechanics. ~12-15 tiles, sized for visual rhythm (a few large tiles for the flashiest components, smaller ones for simpler ones), each a real live or statically-rendered instance of that component with realistic sample data, whole-tile-clickable through to that component's full doc page.

### Why not alternatives considered

- **Exhaustive (all ~28 pages)**: rejected — explicit user call. Several pages (JS API, Conventions, Localization) have no visual to show and would dilute a page whose whole point is visual impact.
- **Screenshots instead of live components**: rejected for the genuinely interactive/animated ones — explicit user call that live interactivity where it's impressive IS the actual "wow" moment; screenshots would undersell exactly the components most worth showing off.
- **Standalone gallery, no click-through**: rejected — explicit user call. A presenter needs to be able to click something a client points at and go deeper.
- **New grid CSS**: rejected — `.wui-bento` already exists, is documented (`grid.html`), and is already proven at showcase scale by `kpi-recipes.html`'s "Dashboard Overview" section. Building a second bento mechanism would be pure duplication.

## Design

### Curated tile set (12 tiles, sizes are starting points — adjust for visual balance during implementation)

| Component | Size | Live or static | Notes |
|---|---|---|---|
| Hero tile ("weoc-ui — see it in action") | 4x2 (full width) | static | Page's own title/subtitle, not a component demo |
| Charts (line/area) | 2x2 | live `WUI.chart()` | Reuse a charts.html-style sample dataset |
| Kanban | 2x2 | live `WUI.kanban()` | Small 3-column mini-board, real drag-and-drop |
| Heatmap | 2x2 | live `WUI.heatmap()` | Small grid, e.g. 4x4 |
| Calendar | 2x2 | live `WUICalendar` | Month view, a few sample events |
| Gauge | 1x1 | live `WUI.gauge()` | |
| Donut | 1x1 | live `WUI.donut()` | |
| Cards & Containers | 1x1 | static real markup | A `.wui-card`/`.wui-plane` example |
| Badges & Chips | 1x1 | static real markup | A row of `.wui-badge`/`.wui-chip` variants |
| Buttons | 1x1 | static real markup | A few `.wui-btn` variants |
| Tables | 1x1 | static real markup | A small `.wui-table-standard` sample |
| Progress | 1x1 | live `WUI.progress`-family or static | Ring/bar, whichever renders best at 1x1 |
| Date picker | 1x1 | live Flatpickr instance | |

Exact final set/sizing is an implementation-time visual-balance call, not a spec-locked requirement — the table above is the starting composition, not a contract.

### Markup shape

```html
<div class="wui-bento cols-4 is-page wui-gap-3">
  <a class="wui-bento-tile wui-w-4x2 browse-tile browse-tile-hero" href="#">...</a>
  <a class="wui-bento-tile wui-w-2x2 browse-tile" href="charts.html">
    <div class="browse-tile-label"><span class="material-symbols-outlined">show_chart</span>Charts</div>
    <div class="browse-tile-preview"><div id="browse-chart-demo"></div></div>
  </a>
  <!-- ...remaining tiles... -->
</div>
```

Each tile is an `<a>` (not a `<div>` + click handler) — real navigation, no JS needed for the click-through itself, works with middle-click/open-in-new-tab for free. Live-component tiles hold a small inner container that the page's own script initializes via the same `WUI.<name>()` factory calls every other doc page already uses (matching, e.g., `charts.html`'s own demo-init pattern) — no new initialization mechanism.

### Hover state

Reuse the neon-glow hover convention already established in this library (`.wui-plane.neon`-style inset glow, or the simpler `.dash-tile:hover` lift-and-border-highlight pattern from `kpi-recipes.html` — pick whichever reads better at implementation time; both are real, already-proven patterns in this codebase, not new ones).

### Wiring

`docs/index.html:51` — change `href="./docs/interactive.html"` to `href="./docs/browse.html"`. This is the ONLY change outside the new page. No `docs-shell.js` edit (no NAV entry — reached via the hero button only, same as "Get Started" today).

### Bilingual

Standard `data-wui-i18n`/`data-wui-i18n-html` markers on all prose, registered in a new `docs/i18n/browse.js`, per this lane's default-on localization convention. (Live component demo data — sample chart/calendar/kanban data — doesn't need i18n markers, matching how other pages' demo data isn't translated either.)

## Error handling

None beyond what each reused component factory already handles (`console.warn` + graceful no-render on bad config, per each component's own existing contract) — this page introduces no new failure modes of its own.

## Testing

Manual live-browser verification: load `index.html`, click "Browse Components", confirm it lands on `browse.html` (not the old `interactive.html` placeholder), confirm all live tiles actually render (chart draws, kanban drag works, heatmap/gauge/donut/calendar render), confirm every tile is clickable and lands on the correct destination page, confirm hover states work, confirm 0 console errors, confirm bilingual toggle works correctly on the page's own prose.
