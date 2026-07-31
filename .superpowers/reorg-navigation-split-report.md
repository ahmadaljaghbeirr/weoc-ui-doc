# Navigation page split — report

## Status
Done. Verified live via claude-in-chrome: both pages render, all variants present, tab-switching demo works, sidebar/search show both entries, EN/AR toggle works on both, cross-links resolve, 0 console errors.

## Resulting pages
- `docs/docs/navigation.html` — Header (`wui-hdr-wrap` + variants/stats), `wui-link`, and `wui-band-wrap` (unchanged scope minus tabs).
- `docs/docs/tabs.html` (new) — `wui-hdr-tabs` static + interactive (click-switch, fade-edge) demos.

## What moved where
- Removed the `wui-hdr-tabs` `docs-section` from `navigation.html`, renumbered its remaining `data-wui-i18n(-html)` ids 1-22 sequentially; moved that section into new `tabs.html`.
- i18n: deleted the `docs_navigation_*` block from shared `docs/docs-i18n.js`; created per-page `docs/i18n/navigation.js` (22 ids) and `docs/i18n/tabs.js` (8 ids), added both to `I18N_PAGES` in `docs-shell.js`; added `docs_nav_tabs` sidebar label.
- `docs-shell.js` NAV: added `{ key: 'tabs', label: 'Tabs', file: 'tabs.html' }` under the existing `Navigation` group.
- Cross-links: hero text on each page now links to the other (`tabs.html` / `navigation.html`); `docs-md/navigation.md` split into `navigation.md` + new `tabs.md` (README index updated); `docs/index.html` homepage now shows two cards (Navigation, Tabs) instead of one that overclaimed "tabs" — `docs_home_36` text fixed, `docs_home_81/82` added for the new card.
- No forbidden files touched (flatpickr/dates, grid/containers/indicators/feedback/tier-colors/tokens/charts/kpi-recipes/layout untouched).

## Commit
NOT committed — blocked by the pre-commit hook (see concerns). All 12 files are staged and verified correct on disk; `git commit` just needs to be re-run once the blocker below is resolved.

## Concerns
- **Pre-commit hook blocker (needs orchestrator decision, did not bypass):** `core.hooksPath` is shared across all worktrees and now points at the main checkout, which was fast-forwarded to `bao-weoc-ui-updates` (2381df1) mid-wave. That commit's `pre-commit` hook shells out to `tools/build-search-index.js`, but this worktree's branch is still rooted at `4d614c6` (pre-dates commit `7eee5d2`, "build-time search indexer" merge), so that script doesn't exist here → `MODULE_NOT_FOUND`, commit aborts. This is systemic, not caused by this task: `git worktree list` shows most sibling worktrees (mine included) still on `4d614c6`, only two are on `2381df1`. Restoring just the missing script isn't safe either — on first run (no page has ids yet on this branch) the indexer patches `id=` attributes into *every* NAV page, including the ones this task was explicitly told not to touch (grid/containers/indicators/feedback/tier-colors/tokens/charts/kpi-recipes/layout.html), so it would step on the other parallel agents' worktrees. Did not use `--no-verify` since neither the user nor this task explicitly authorized skipping hooks. Needs either a rebase of this branch onto `bao-weoc-ui-updates` before commit, or a central regeneration of `search-index.json` after all worktrees merge.
- `docs_home_81/82` ids were appended at the end of `i18n/home.js` rather than renumbered in-place to preserve strict "sequential in document order" convention, to avoid touching ~40 unrelated ids/attrs in `home.html`/`home.js`. Ordering convention is now slightly broken for that one page.
- `wui-link` section (not covered by `weoc-navigation.css`) stayed on the Navigation page since it's neither Header nor Tabs; flagged here in case a future reorg wants it elsewhere.
