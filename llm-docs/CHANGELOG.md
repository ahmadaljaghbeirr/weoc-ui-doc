# Changelog

[← Index](README.md)

Dated, append-only log of every meaningful CSS/JS edit to weoc-ui. See the
sync-discipline rule in [README.md](README.md) — this file gets one new
entry per session that touches source, in the same session as the edit.

- 2026-07-27 — Added an opt-in "neon" glow variant across 5 more component
  families, extending the pre-existing `.wui-btn.neon-outline`/
  `.wui-fab.neon-outline` convention (`weoc-interactive.css`) rather than
  inventing a new visual language: `.wui-badge.neon`/`.wui-chip.neon`
  (`weoc-labels.css`), `.wui-plane.neon` (`weoc-containers.css`),
  `.wui-progress-ring.neon`/`.wui-progress-bar.neon` (`weoc-progress.css`,
  `filter:drop-shadow` not `box-shadow` — SVG stroke/rounded-fill shapes),
  and `opts.neon` on all 5 `wui-charts.js` factories (`chart`/`pie`/`donut`/
  `gauge`/`barRow` — canvas-drawn ones glow via `ctx.shadowBlur`, DOM-drawn
  ones via a new `weoc-charts.css` file + toggled class, now imported by
  `weoc-ui-core.css` as module #21). Full detail in
  [css-classes.md](css-classes.md) and [js-api.md](js-api.md)'s `opts.neon`
  row. Docs updated on `interactive.html`, `containers.html`, `progress.html`,
  and `charts.html` (new "Neon Glow" section) — each with matching EN/AR
  i18n entries, per the lane's default-on localization rule. Dispatched as
  5 parallel background agents (bar-row's ran after the other 4 landed,
  since it shares `wui-charts.js` with the chart-neon work). Zero console
  errors across every verification pass; one pre-existing unrelated bug
  noticed-but-not-fixed on `interactive.html` (hero title double-escapes
  `&amp;amp;`, predates this work).
- 2026-07-24 — Added `WUI.responsive.observe()` primitive
  (`build/src/core/responsive.js`); wired into `wui-charts.js` (chart/pie/donut/gauge
  — **not** barRow, which is CSS-only and already responsive) and `weoc-map.js`;
  `.wui-progress-ring` switched to fluid CSS sizing; canvas devicePixelRatio
  correctness added to pie/donut/gauge. Full test suite (`build/test/`,
  `node --test`) at 109/109 passing after all three wiring tasks landed.
- 2026-07-24 — `.wui-skeleton` gained `--wui-skeleton-w` custom-property sizing
  (fixes the dominant inline-style violation source in `eoc-makeover` — an
  audit found 47.5% no-inline-style adherence against a prior ~70% estimate,
  with skeleton-loader `style="width:...px"` as the single biggest cause).
- 2026-07-24 — Added opt-in `weoc-display-tv.css` (TV/projector scale mode,
  first-pass values pending real-TV QA) and a canonical device-tier
  breakpoint table (see [conventions.md](conventions.md)). Deliberately NOT
  in the `weoc-ui-core.css` barrel.
- 2026-07-24 — Fixed 3 confirmed docs/code drift points: `charts.html` was
  missing `WUI.gauge()`/`WUI.barRow()` entirely (both implemented, exported,
  just undocumented); `localization.html` was missing `mountTopToggle()`, the
  cross-frame `storage`-event sync, and the `wui:langchange` event;
  `grid.html` understated the tile-size matrix as `1x1`-`2x3` (actual: full
  `1x1`-`12x12`, 144 classes) and was missing the 3 overflow utility classes.
- 2026-07-24 — Added `docs/docs/conventions.html` (first conventions/rules
  page on the docs site — none existed before) and an LLM-friendly reference.
  (That reference's first version was a single vault-only file; superseded
  2026-07-24 by this in-repo, multi-page wiki — see the entry below.)
- 2026-07-24 — Built two local static test harnesses under
  `tests/responsive/` (`index.html` minimal, `facility-dashboard-showcase.html`
  dense ~15-widget stress test using an EOC KPI-recommendations doc's
  Left/Middle/Right layout skeleton with static data — does NOT touch any
  real `.weoc` board). Found and documented a real `.wui-bento.is-page`
  overflow-clipping gotcha (see [css-classes.md](css-classes.md)).
- 2026-07-24 — Post-completion fix: both harness pages' theme-toggle buttons
  were bypassing `WUI.toggleTheme()` (raw `setAttribute('data-theme', ...)`),
  so `wui:themechange` never fired and charts only picked up the new theme
  on an unrelated resize. Fixed by switching both to `[data-wui-theme-toggle]`.
  Confirmed this was a harness bug, not a library regression — see the
  `WUI.setTheme` gotcha in [js-api.md](js-api.md).
- 2026-07-24 — Added `.wui-tile` (hdr/body/footer dashboard-tile component)
  and generalized a new `.flush` border-removal modifier across it plus
  `.wui-panel`, `.wui-collapse-panel`, and `.wui-card-footer`. Found and
  fixed a real bug live in an obsidian-themed test dashboard: `.wui-bar-row`
  had a fixed `height:22px` but no `flex-shrink:0`, so it silently squished
  under a shrinking flex-column parent instead of the parent's
  `overflow-y:auto` kicking in — now fixed in `weoc-progress.css`. See
  [css-classes.md](css-classes.md) for `.wui-tile`/`.flush` details.
- 2026-07-24 — Built a single-page replica matching
  `Display - Facility Dashboard.weoc`'s real markup verbatim
  (`.wui-main-div`/`.wui-band-wrap` chrome, nested `.wui-bento.is-page` with
  the real board's exact tile spans, `.wui-card` not `.wui-tile`) at
  `tests/responsive/facility-dashboard-real.html` — body is genuinely
  unscrollable for free from the shared reset (`body{height:100vh;
  overflow:hidden}` + `.wui-main-div{height:100vh}` +
  `.wui-fill-area{flex:1 1 auto; overflow:hidden}`), no extra CSS needed.
  `<returnlink>` (WebEOC-only tag) has zero CSS targeting it anywhere — swap
  for a plain `<button>` with the same classes and the look is identical.
- 2026-07-24 — Added `docs/docs/kpi-recipes.html` ("Dashboard KPI & Tile
  Recipes") — 7 ready-made recipes (tile shell, KPI number, gauge, donut,
  bar-row, sparkline/line chart, progress ring), each a live working demo
  plus a `{{placeholder}}` copy-paste template. Gotcha hit while building
  it: `data-wui-i18n` sets `textContent`, not `innerHTML` — any translated
  string containing `<strong>`/`<code>` markup MUST use
  `data-wui-i18n-html` or the tags render as literal visible text.
- 2026-07-24 — Moved the LLM-friendly reference out of the private vault
  (was a single file at `03_DOMAINS/webeoc/reference/`, Obsidian-only,
  `[[wikilinks]]`, not reachable by anyone outside that vault) into this
  repo as a proper multi-page wiki under `llm-docs/` (this folder), so it's
  git-tracked, portable to any dev with a checkout, and deployable via the
  same Cloudflare Worker (`assets.directory: "."`, see `wrangler.jsonc`)
  that already hosts `/docs/`. The vault file now just points here.
- 2026-07-25 — Added a full 1:1 Markdown mirror of every `docs/docs/*.html`
  page under `docs-md/` (29 pages, full variant completeness, plain relative
  links) — distinct from this `llm-docs/` wiki (compact cheat-sheet vs full
  replica). See `docs-md/README.md`.
- 2026-07-25 — Reworked `.wui-tile`'s base variant to match the real
  eoc-makeover dashboard-widget convention instead of an invented default:
  uniform `padding:var(--space-2)` on `.wui-tile` itself (was per-region),
  hdr/footer borderless by default with `.has-border` as the additive opt-in
  (flipped polarity from the original `.flush`-based design — grounded in
  auditing the real Operation Home Page, where all 5 dashboard widgets use
  this exact borderless/uniform-padding look), new `.wui-tile-icon` chip slot
  (matches the real `.widget-icon`), and a new `.wui-tile-legend` anatomical
  slot (pins to the bottom of `.wui-tile-body` via `margin-top:auto`,
  answering "where does a chart legend go" — body, not footer). See
  [css-classes.md](css-classes.md) and [js-api.md](js-api.md) for the
  `WUI.donut()` legend-relocation gotcha this slot depends on.
  Also fetched and rebuilt the real "Events by Classification" donut card
  from `HomePage/out/board.web` (Operation Home Page view) as a standalone,
  rely-only-on-weoc-ui test: `tests/responsive/classification-donut-tile.html`,
  exact real grid dimensions (`cols-10 rows-12 is-page`, tile `wui-w-2x5`).
  Found + fixed a real dead-CSS bug while auditing the source: `widget-card.css`'s
  `.wui-grid > .widget-card` rule never matched (the real markup nests inside
  `.wui-bento`, not `.wui-grid`) — removed just that dead rule, kept the rest
  of the file (`.widget-header`/`.widget-title`/`.widget-subtitle`/`.widget-icon`
  are still live, used by 4 other real dashboard widgets).
