# Per-page TOC — pilot report

**Date:** 2026-07-31
**Spec:** `docs/superpowers/specs/2026-07-31-per-page-toc-design.md`

## Pattern chosen

A floating `wui-fab` trigger (bottom-right, `wui-fab-fixed-br`) opening a `wui-dropdown`
panel (`data-wui-anchor="top-end"`) listing every `.docs-section-title` on the page as a
`.docs-nav-item`-styled link. Open/close is **fully declarative** — `weoc-ui.js`'s
existing `data-wui-toggle`/`data-wui-open-class`/`data-wui-dismiss` overlay system, no
new JS for that part. Clicking an entry reuses `docs-shell.js`'s existing scroll+flash
mechanism (the same one deep-search hits already use) via one new small centralized
delegate, `bindTocLinks()`. Each entry's label reuses that section's own i18n key
verbatim (icon included) — no new per-entry translation strings, only one new
"On this page" key per page for the panel heading/aria-labels.

Full rationale, alternatives considered, and the exact markup/CSS/JS shape to copy are
in the spec doc above.

## Pages piloted

- `docs/docs/containers.html` — 12 sections (medium; the task's own suggested example)
- `docs/docs/charts.html` — 21 sections (longest page in the site; stress-tests the
  panel's scrollable list)
- `docs/docs/views.html` — 4 sections (shortest already-bilingual page)

## How it fans out

Per the spec's "Fan-out recipe": for each remaining page, grep its `.docs-section-title`
divs for id/i18n-key/icon/title, find the page's next free i18n id, insert one fixed
markup block as the first child of `.docs-page`, append one i18n line. **Zero** new CSS
or JS per page — both already live in shared files (`docs-style.css`, `docs-shell.js`)
and cover every page's shape already (including the 21-item scroll case). Recommend
scripting steps 1-2 if fanning out to many pages in one batch; done by hand for this
3-page pilot.

## Verification performed

Live in-browser (`claude-in-chrome`) against a local static server over the worktree,
all 3 pages: hard load, in-app SPA navigation to the page (htmx swap, not just hard
reload — the exact bug class flagged in the task brief), click-to-scroll at start/
middle/end of each list (incl. `charts.html`'s last of 21 entries after scrolling the
panel), EN⇄AR toggle (labels, icons, aria-labels, RTL panel re-anchoring all verified),
and `read_console_messages` after each interaction — zero errors on all 3 pages across
every check (one unrelated Chrome-extension log line, not from the page, present
regardless).

## Files changed

- `docs/docs-shell.js` — new `bindTocLinks()` (~15 lines) + one call site in
  `DocShell.init()`. This is the one shared-file touch; justified in the spec's
  "Why `docs-shell.js` gets touched (and NAV does not)" section — the `NAV` array
  itself is untouched, sidebar/chrome rendering is untouched.
- `docs/docs-style.css` — new `.docs-toc-panel`/`.docs-toc-panel-hd`/`.docs-toc-list`
  rules + one scoped `.docs-toc-list .docs-nav-item` layout override. Shared, not
  per-page.
- `docs/docs/containers.html`, `docs/docs/charts.html`, `docs/docs/views.html` — TOC
  markup block inserted as the first child of `.docs-page`.
- `docs/i18n/containers.js`, `docs/i18n/charts.js`, `docs/i18n/views.js` — one new
  `{en, ar}` pair each (`docs_containers_64`, `docs_charts_84`, `docs_views_59`).
- `docs/superpowers/specs/2026-07-31-per-page-toc-design.md` — the design/fan-out spec.

`docs/search-index.json` and every other `docs/docs/*.html` page are untouched by this
pilot's own edits. (Note: this repo's pre-commit hook regenerates `search-index.json`
and auto-patches any page with a still-missing section id whenever a commit touches
`docs/docs-shell.js`/`docs/i18n/*.js`/`docs/docs/*.html` — this is pre-existing,
intentional hook behavior, not something this pilot's changes caused, but it means the
actual commit may include a handful of unrelated pages picking up long-overdue section
ids as a side effect of the hook doing its documented job.)

## Concerns

- No scrollspy (active-entry highlighting on scroll) — deliberately out of scope for
  the pilot, documented as a future enhancement in the spec.
- Pages outside `docs-shell.js`'s `I18N_PAGES` array (e.g. `typography.html` at pilot
  time) aren't bilingual yet at all, independent of this feature — flagged in the spec
  so a fan-out pass doesn't assume every page is i18n-ready.
- The pre-commit hook's auto-patch side effect (above) means the eventual commit's diff
  may be slightly wider than these 3 pages' pilot edits; this is expected repo behavior,
  not a defect in the pilot.
