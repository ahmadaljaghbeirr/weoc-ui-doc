# Changelog — docs-llm

Dated log of changes to this folder itself (the raw-Markdown mirror of the
`/docs/docs/*.html` site, plus the compact reference pages). This is a
changelog of the **mirror**, not of `weoc-ui`'s CSS/JS — for that, see
[reference-changelog.md](reference-changelog.md).

Entries below are derived from `git log` on this repository; dates are the
commit dates of the underlying `docs/docs/*.html` reorg, not invented.

## 2026-08-01

- **Consolidated `docs-md/` and `llm-docs/` into this single `docs-llm/`
  folder.** `docs-md/` was a stale 1:1 per-page Markdown mirror (last
  regenerated before this week's page reorg — see below); it has been
  regenerated page-for-page against the current `docs/docs/*.html` set and
  folded in here. `llm-docs/` was a separate, smaller "compact cheat-sheet"
  wiki (`source-layout.md`, `css-classes.md`, `conventions.md`, `js-api.md`,
  `CHANGELOG.md`) with no per-page coverage; its four reference pages were
  renamed `reference-*.md` to avoid colliding with the per-page mirror's own
  `conventions.md` / `js-api.md`, and its changelog became
  `reference-changelog.md`. `docs-md/` and `llm-docs/` are deleted as part of
  this change.
- Added pages that did not exist in `docs-md/`: `avatars.md`, `browse.md`,
  `container.md`, `flex.md`, `icons.md`, `loader.md` (all split out of
  larger pages this week — see the entries below) plus `heatmap.md` and
  `kanban.md` (pages that existed in `docs/docs/` but had never been mirrored
  to Markdown at all).
- Regenerated `forms.md`, `charts.md`, `tokens.md`, `layout.md`,
  `navigation.md`, `grid.md`, `feedback.md`, `indicators.md` against their
  current HTML to reflect this week's merges/splits (see per-page notes
  below); regenerated the remaining pages too so the whole set is verified
  against the live HTML rather than trusted piecemeal.
- Added this `CHANGELOG.md` and a NAV-grouped `README.md` (grouping matches
  `docs/docs-shell.js`'s `NAV` array exactly).

## 2026-08-01 — `docs/docs/*.html` reorg (source of the regeneration above)

- `forms.html` absorbed `dates.html` and `combobox.html` as new sections
  (Date & Time / Flatpickr, Select / Combobox / TomSelect); both standalone
  pages were deleted. → `forms.md` gained those sections; `dates.md` and
  `combobox.md` are gone.
- Per-page table of contents (`docs-toc-panel` / `[data-toc-link]`) rolled
  out to all pages.
- Browse Components showcase (`browse.html`) redesigned as a `wui-bento`
  gallery per client feedback — it is a visual index page, not a component
  reference, and is not part of the sidebar `NAV` array.

## 2026-07-31 — `docs/docs/*.html` reorg

- `kpi-recipes.html` merged into `charts.html` as a new "Dashboard Overview"
  section (Tile Shell → KPI Number → Gauge → Donut/Pie → Bar-Row → Sparkline
  → Progress Ring → **Quick Action Grid**, the last of which is new content
  added during the merge, not present in the old standalone page); the
  standalone page was deleted. → `charts.md` gained that section;
  `kpi-recipes.md` is gone.
- `feedback.html`'s Loader section split out into its own `loader.html` page.
  → new `loader.md`; `feedback.md` lost that section.
- `views.html` (Board Views) merged into `layout.html` as new sections
  (Board Views / Display Views / Input Views / Details Views / Remove
  Views), with additional "Abstract skeleton" / "Zone reference" content
  added during the merge; the standalone page was deleted. → `layout.md`
  gained those sections; `views.md` is gone.
- `tier-colors.html` folded into `tokens.html` as a new "Tier Color
  Variants" section. → `tokens.md` gained that section.
- `grid.html` split into three pages: `grid.html` (row/col + `wui-grid` +
  `wui-bento` only), `flex.html` (new), and `container.html` (new,
  distinct from the pre-existing `containers.html` "Cards & Containers"
  page). → `grid.md` trimmed; new `flex.md` and `container.md`.
- `indicators.html` split: `wui-icon-bubble` moved to new `icons.html`,
  `wui-avatar` moved to new `avatars.html`; `indicators.html` kept
  `wui-status-dot` / `wui-lvl` / `wui-elapsed`. → `indicators.md` trimmed;
  new `icons.md` and `avatars.md`.
- `navigation.html` split: `wui-hdr-tabs` moved to new `tabs.html`;
  `navigation.html` kept `wui-hdr-wrap` / `wui-link` / `wui-band-wrap`.
  → `navigation.md` trimmed; new `tabs.md`.
- Browse Components showcase page (`browse.html`) added.
- EOC Lists page documented `EOCListsAPI`'s REST-live client.

## Earlier

Pre-2026-07-31 history for `docs/docs/*.html` predates this changelog and is
not reconstructed here — see `git log -- docs/docs` for the full record.
