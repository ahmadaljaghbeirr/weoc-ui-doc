# kpi-recipes.html → charts.html merge — final report

Date: 2026-07-31
Branch: `bao-weoc-ui-updates` (worked directly in the main checkout, no worktree isolation)
Commit: `145a584` — "Merge kpi-recipes.html into charts.html as a new section, delete standalone page"

## Step 0 sanity check

`grep -n "PAGE_INIT\|data-barba" docs/docs-shell.js docs/docs/charts.html` returned only two
comment lines (`docs-shell.js:965` and `:1374`) referencing the dead patterns historically, no
live usage. `tools/build-search-index.js` exists. Proceeded.

## What moved

- `docs/docs/kpi-recipes.html` deleted. Its content (Dashboard Overview bento gallery, 8 numbered
  recipe sections: Tile Shell, KPI Number+sparkline, Gauge, Donut, Bar-Row ×2, Sparkline/Line
  Chart, Progress Ring, Quick Action Grid, plus the "How to read a recipe" callout and the
  closing "Not seeing the visualization you need?" callout) is now appended to
  `docs/docs/charts.html` as new `.docs-section` blocks after the existing `destroy()` section,
  copied verbatim (markup, code panels, expressions).
- Page-scoped CSS (`.recipe-card`, `.kpi-card`, `.dash-overview`/`.dash-tile`, flash keyframes)
  merged into charts.html's existing `<style>` block inside `.docs-page` (not `<head>`).
- JS: the dashboard-gallery click-to-scroll handler and the live-preview randomization logic
  (KPI sparkline, two bar-rows, gauge, donut, timeline chart) were folded into the *existing*
  `Alpine.data('chartsPage', ...)` `init()`, inside the same `window.DocShell.ready.then(...)`
  block the 8 chart demos already use, with element-existence guards before each `WUI.*` call.
  Did **not** carry over kpi-recipes.html's old x-ignore/`Alpine.initTree()` bootstrap (that was
  a shim for grafting Alpine onto a page that predated the htmx/Alpine nav architecture;
  charts.html already has that architecture natively via its `x-data="chartsPage()"`). The
  document-level click delegate is bound once via `window.__chartsKpiClickBound` (new flag name,
  distinct from the old `window.__kpiRecipesClickBound`) so it isn't rebound on every htmx swap.
- TOC: added 9 entries (`dashboard-overview` + sections 1-8) to `#docs-toc-panel`'s
  `.docs-toc-list`, each reusing its section title's own i18n id (matching the existing
  convention where a TOC link's `data-wui-i18n-html` is literally the section-title's id).
- i18n: merged kpi-recipes.js's EN/AR pairs into `docs/i18n/charts.js` as `docs_charts_85`
  through `docs_charts_112` (previous max was `docs_charts_84`). Three ids from kpi-recipes.js
  (`docs_kpi_14`, `_17`, `_23`, all identical "Copy-paste template:" duplicates) were unused in
  the actual HTML and dropped rather than carried forward. Two originally-untranslated bits in
  kpi-recipes.html (the "Dashboard Overview" section title/body and the "8. Quick Action Grid"
  title/body — neither had `data-wui-i18n` markers in the source) were newly tagged and given
  fresh AR translations, since the migration's own TOC-entry requirement needed an i18n id for
  every entry, matching the existing convention throughout the rest of the page.
- `docs/i18n/kpi-recipes.js` deleted.
- `docs/docs-shell.js`: removed the `kpi-recipes` NAV item (was under "Conventions") and removed
  `'kpi-recipes'` from `I18N_PAGES`.
- `docs/docs/conventions.html`: retargeted `<a href="kpi-recipes.html">KPI & Tile Recipes</a>` to
  `charts.html#1-the-tile-shell-wui-tile` (the linking sentence was specifically about the
  header/footer/flush/is-scrollable tile-shell convention, so anchored to section 1 rather than
  the page top).
- `docs/index.html`: checked for a "KPI Recipes"/"Dashboard KPI" homepage card — none exists, so
  nothing to retarget (no-op, confirmed via grep, not assumed).

## Verification (live, claude-in-chrome against the already-running dev server on :8990,
confirmed serving this exact checkout via a content fingerprint check before reusing it)

- TOC panel opens; confirmed (via `find`) that both the `Dashboard Overview` and
  `8. Quick Action Grid` TOC links exist with correct `href`s alongside the pre-existing entries.
- All 8 recipe sections + Dashboard Overview render with correct content, verified directly:
  Tile Shell demo, KPI-sparkline card (opened, showing real markup/expressions/JS tabs), Donut
  card (opened, Prism-highlighted Expressions tab), Event-Timeline chart card, Progress Ring,
  Quick Action Grid.
- Dashboard-gallery scroll+flash tested on 3 different tiles with 3 different target recipes:
  "Total Events" → `recipe-kpi-sparkline`, "Events by Classification" → `recipe-donut`,
  "Event Timeline" → `recipe-chart`. All three correctly opened the target `<details>` and
  scrolled to it.
- Tab-switching + Prism highlighting confirmed on the KPI-sparkline card (Markup tab, default)
  and the Donut card (switched to Expressions tab, XML syntax-highlighted correctly).
- Copy button tested on the Donut card's code panel — showed the "Copied" confirmation state.
- Randomization confirmed changing across reloads: `demo-kpi-total-value`/`-percent` read
  `50|18%` on one hard reload and `26|12%` on the next.
- EN/AR toggle tested: "Dashboard Overview" → "نظرة عامة على لوحة المعلومات", "3. Gauge" →
  "٣. المقياس (Gauge)", full RTL layout mirroring (sidebar to the right, code-panel tabs
  mirrored, bento grid flowing RTL). Toggled back to EN cleanly.
- Genuine SPA htmx-boosted navigation tested: hard-loaded `grid.html`, clicked the "Charts"
  sidebar link (real in-page click via element ref, not the `navigate` tool), landed on
  charts.html with `#docs-main` swapped in place (sidebar scroll position preserved — proof it
  was an htmx swap, not a full reload). Dashboard-gallery click-to-scroll re-tested afterward and
  still worked correctly (confirms `window.__chartsKpiClickBound`'s bound-once click delegate,
  which lives on `document` and survives the swap, keeps firing correctly — this is the bug class
  the task called out and it does NOT reproduce here).
- Existing regression check: Line Chart and Area Chart demos (from the pre-existing 8-demo set)
  confirmed still rendering correctly after the edit; Neon Pie chart confirmed rendering with its
  glow effect intact.
- Console: 0 page-originated errors across all of the above (one benign chrome-extension-internal
  log line unrelated to the page — `Failed to get subsystem status for purpose Object` from the
  claude-in-chrome content script itself, and one transient `Could not establish connection`
  extension-messaging artifact after a navigate call — neither references anything in
  charts.html/charts.js).

## Pre-commit hook

Ran normally (not bypassed). `build-search-index.js` regenerated `docs/search-index.json` (293
documents) with zero missing-i18n-ref errors on the first pass — every `data-wui-i18n`/
`-html` id added to charts.html had a matching AR entry in charts.js, and no `docs-section-title`
needed an auto-generated id (all ids were assigned by hand up front and verified unique before
committing, along with a manual duplicate-id and div/details tag-balance check across the whole
file).

## Concerns / judgment calls

- Two small text blocks in the original kpi-recipes.html (Dashboard Overview's heading+body, and
  Quick Action Grid's heading+body) were never localized in the source page. I added i18n markers
  and AR translations for them during the merge rather than preserving the untranslated gap,
  since the TOC-entry requirement needed an id for every new link and the project's own
  convention (CLAUDE.md §10, EN/AR default-on for weoc-ui/doc pages) supports it. This is a minor
  content addition beyond pure copy-paste, flagged here for visibility.
- Did not touch `docs/superpowers/**` planning/spec markdown files that mention kpi-recipes.html
  in prose (historical records of prior sessions' work, out of scope) or the one comment in
  `docs/docs/browse.html` that references kpi-recipes.html as a styling precedent in a code
  comment (not a functional link, out of the task's listed scope).
