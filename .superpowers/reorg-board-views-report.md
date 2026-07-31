# Reorg: Board Views -> Layout & Shell

## Status
Done.

## Where the content was found
No `board-views.html` existed. "Board Views" was its own full standalone page at
`docs/docs/views.html` (title "weoc-ui — Board Views", NAV entry `key: 'views'`,
`label: 'Board Views'`, group `'Patterns'`), just named `views.html` instead of
`board-views.html`. It documented the four WebEOC board view types: Display,
Input, Details, Remove (~1140 lines, 4 `docs-section` blocks + zone-diagram
CSS/demos).

## What moved
- Merged all 4 sections (Display/Input/Details/Remove Views) plus a new
  intro section (`id="board-views"`, icon "Board Views" title, reused desc)
  into `docs/docs/layout.html`, appended after the existing "Dashboard grid"
  section. Zone-diagram `.vz-*` CSS merged into layout.html's existing
  in-page `<style>` (still scoped inside `#docs-main`/`.docs-page`, per the
  hard SPA convention).
- Deleted `docs/docs/views.html`.
- `docs-shell.js`: removed the standalone `views` NAV entry (Patterns group
  now just has Maps); added board-view keywords to the `layout` NAV entry's
  `kw` for search; removed the no-op `views` PAGE_INIT function. Kept `views`
  in `I18N_PAGES` (docs_views_* ids are still used, now from layout.html).
- i18n: kept `docs_views_*` ids in `docs/i18n/views.js` (relabeled the file's
  header comment to explain it now feeds layout.html) rather than
  renumbering — this repo already has precedent (docs-i18n.js) for one file
  holding multiple distinct `docs_<page>_*` prefixes. Added one new id
  `docs_layout_70` (EN+AR) for the new intro section title icon+text. Removed
  the now-dead `docs_nav_views` sidebar-label id from `docs-i18n.js`.
- `docs/index.html`: homepage "Board Views" Patterns card now links to
  `./docs/layout.html#board-views` instead of the deleted `./docs/views.html`.
- `docs/docs-style.css`: updated a stray code comment referencing
  `views.html` to point at layout.html instead.

## Verification
- `node --check` clean on all 4 edited JS files.
- Python: div open/close counts balanced (466/466) in layout.html; no live
  DOM id collisions (all duplicate ids found are inert, inside
  `<template class="wui-demo-markup">` code samples, matching the pattern
  used throughout the rest of this docs site).
- All 126 `data-wui-i18n`/`-html` ids used on the merged layout.html page
  resolve to a registered i18n key; every EN key has a matching AR key (128/128).
- Live-served via local http.server + claude-in-chrome: navigated directly to
  `layout.html#board-views`, confirmed via DOM inspection (not screenshots —
  see concern below) that the intro + all 4 view-type sections render with
  correct text, `WUI.i18n.setLang('ar')` correctly flips the section (title
  + nested "Type A/B/C" content) to Arabic with `dir="rtl"`, then reverted to
  English cleanly. Zero console errors (one unrelated pre-existing Alpine
  double-init warning). Homepage card `href` confirmed to point at
  `./docs/layout.html#board-views`; `curl` confirms the served HTML contains
  `id="board-views"`.

## Commit
c4beb85 "Move Board Views docs into Layout & Shell page"

## Concerns
- Could not get a clean visual screenshot: this Chrome session is shared
  with several other concurrently-running agents whose tabs kept stealing
  focus (`document.hidden`/`hasFocus()` on my tab flipped to `true`/`false`
  mid-task), so `computer screenshot` repeatedly returned a blank frame.
  Confirmed via DOM (`getBoundingClientRect`, `innerText`) that content is
  present, positioned, and correctly localized — this is a browser-session
  contention artifact, not a rendering bug.
- SPA click-through: dispatching a click on the homepage's Board Views card
  (both synthetic `dispatchEvent` and `computer left_click`) did not trigger
  the Alpine/fetch router's `navigate()` in this session. I reproduced the
  exact same non-navigation on the untouched, pre-existing "Maps" card link
  too, so this is a pre-existing quirk of scripted/background-tab clicks in
  this shared session, not something introduced by this change. Direct URL
  navigation to `layout.html#board-views` (both fresh load and via the
  router's `swapContent(html, ns, hash)` code path, which explicitly does
  `main.querySelector(hash)` + `scrollIntoView()`) works correctly.
