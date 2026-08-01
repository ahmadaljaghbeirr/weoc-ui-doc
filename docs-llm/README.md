# weoc-ui Docs — LLM-Friendly Mirror

Plain-Markdown mirror of the [`/docs/`](../docs/index.html) site: one `.md`
file per page under `docs/docs/*.html`, same content and completeness (every
variant/color/size demoed on the HTML page is transcribed here too, as
prose + fenced code blocks instead of prose + live-interactive-demo), grouped
and ordered the same way as the live site's sidebar (`docs/docs-shell.js`'s
`NAV` array).

This folder also carries five **compact reference pages** (prefixed
`reference-*` except `source-layout.md` and `css-classes.md`, which don't
collide with any per-page name): fast-to-grep cheat-sheets — API signatures,
CSS class gotchas, standing conventions, a dated changelog — rather than full
page-by-page content. Use the per-page mirror below when you need the
complete picture of a component; use the reference pages when you just need
a fact checked fast.

**Hosted at:** this repo deploys as a Cloudflare Worker with
`assets.directory: "."` (see `wrangler.jsonc`) — the whole repo is served as
static files, so every page in this folder is reachable at
`https://<worker-domain>/docs-llm/<page>.md` once deployed, the same way
`/docs/` is. A `_headers` file in this folder forces `Content-Type:
text/plain; charset=utf-8` on every `.md` here so it renders inline in a
browser / is fetchable as raw text instead of triggering a download prompt.

This folder replaces two prior, separate things: `docs-md/` (a per-page
mirror that had gone stale relative to this week's page reorg) and
`llm-docs/` (the compact-reference wiki). Both are gone; see
[CHANGELOG.md](CHANGELOG.md) for what moved where.

## Get Started

- Introduction *(landing page — no markdown mirror, it's install/overview only; see [`/docs/index.html`](../docs/index.html))*
- [Animation](motion.md) — GSAP-driven entrance/transition helpers, `weoc-anim.js` ring/counter/bar animations
- [JS API](js-api.md) — the `window.WUI` object: theme, overlays, declarative attributes, custom events
- [EOC Lists](lists.md) — cascading/tree/flat select lists, `EOCListsAPI` REST-live client
- [Localization](localization.md) — `WUI.i18n`, EN/AR, RTL, legacy resource-key shims

## Theming

- [Design Tokens](tokens.md) — every CSS custom property, including the Tier Color Variants section (activation-tier badges/chips/callouts/etc.)

## Layout

- [Layout & Shell](layout.md) — app shell, split panes, scroll areas, tab shell, toolbar, dashboard grid, and the Board/Display/Input/Details/Remove Views patterns
- [Grid](grid.md) — `wui-row`/`wui-col`, `wui-grid`, `wui-bento`
- [Flex](flex.md) — Tailwind-style flexbox utilities, `wui-gap-*`
- [Containers](container.md) — `wui-container` / `wui-container-fluid` centered content column (distinct from [Cards & Containers](containers.md) below)

## Inputs

- [Text Inputs & Fields](forms.md) — `form-control`, `wui-number`, `wui-fieldset`, field grid, plus the merged Date & Time (Flatpickr) and Select / Combobox (TomSelect) sections
- [Controls](cards.md) — checkbox, radio, switch, slider, segmented control, card-option

## Buttons

- [Buttons](buttons.md) — `wui-btn`, `wui-fab`, `wui-action-btn`

## Navigation

- [Navigation](navigation.md) — `wui-hdr-wrap`, `wui-link`, `wui-band-wrap`
- [Tabs](tabs.md) — `wui-hdr-tabs`

## Feedback

- [Feedback](feedback.md) — `wui-callout`, `wui-banner`, `wui-toast`, `wui-snackbar`, `wui-alarm`, `wui-skeleton`, `wui-empty-state`
- [Loader](loader.md) — `WUI.busy()`, `WUI.buttonBusy()`, `data-wui-loading`
- [Progress](progress.md) — progress bar, ring, semicircle, segmented

## Overlays

- [Overlays](overlays.md) — modal, dialog, drawer, popover, dropdown menu, tooltip

## Data Display

- [Cards & Containers](containers.md) — `wui-card`, `wui-plane`, `wui-panel`, `wui-embed`, collapsible/accordion
- [Badges & Chips](interactive.md) — badge, chip, pill, label, tag
- [Indicators](indicators.md) — `wui-status-dot`, `wui-lvl`, `wui-elapsed`
- [Icon Bubbles](icons.md) — `wui-icon-bubble`
- [Avatars](avatars.md) — `wui-avatar`
- [Tables](tables.md) — standard/card/log table variants
- [Heatmap](heatmap.md) — risk-matrix grid, severity cells

## Charts

- [Charts](charts.md) — `WUI.chart`/`pie`/`donut`/`gauge`/`barRow` (uPlot adapter), plus the Dashboard Overview KPI/tile recipe gallery

## Schedule

- [Calendar](calendar.md) — month/week/day/agenda views

## Typography

- [Typography](typography.md) — text scale, weight, truncation
- [Rich Text](tinymce.md) — TinyMCE integration

## Patterns

- [Maps](maps.md) — Esri ArcGIS `WeocMap` factory
- [Kanban](kanban.md) — drag/drop board

## Conventions

- [Conventions & Rules](conventions.md) — the human-facing rules page (no inline styles, `{viewType}.css` order, device tiers, component promotion, declarative-first)

## Other pages

- [Browse Components](browse.md) — a visual `wui-bento` showcase gallery linking out to other pages; not part of the sidebar `NAV`, so it has no component markup of its own to mirror

## Reference (compact cheat-sheets, not per-page mirrors)

| Page | What's in it |
|---|---|
| [`source-layout.md`](source-layout.md) | Where the JS/CSS actually lives, the build pipeline, the test framework — read this first if you're about to touch source. |
| [`reference-js-api.md`](reference-js-api.md) | `WUI.*` function reference keyed to source files: signatures, gotchas, what's auto-resize-aware. Different from [`js-api.md`](js-api.md) above, which mirrors the public-facing `/docs/docs/js-api.html` demo page. |
| [`css-classes.md`](css-classes.md) | CSS class-family reference: what each component does, its variants, its gotchas. |
| [`reference-conventions.md`](reference-conventions.md) | The standing rules in dense numbered form, cross-linked to source files. Different from [`conventions.md`](conventions.md) above, which mirrors the public-facing `/docs/docs/conventions.html` page. |
| [`reference-changelog.md`](reference-changelog.md) | Dated, append-only log of every meaningful weoc-ui CSS/JS edit (not this mirror's own history — see [`CHANGELOG.md`](CHANGELOG.md) for that). |

### Sync-discipline rule (standing, for every session touching weoc-ui CSS/JS)

Any meaningful CSS/JS edit to weoc-ui appends one dated line to
[`reference-changelog.md`](reference-changelog.md), in the same session as
the edit — mirrors the existing `CSS/weoc-ui/TO-BE-REMOVED.md` discipline
already used in this repo. Nothing here automates drift detection, so this
has to be an actual session habit, not a "remember to." **Check this wiki at
session start, update it before session end.**

If you change a component's public behavior, also update the relevant row in
[`reference-js-api.md`](reference-js-api.md) or [`css-classes.md`](css-classes.md)
— the changelog records *that* something changed; the reference pages need
to stay correct in the present tense.
