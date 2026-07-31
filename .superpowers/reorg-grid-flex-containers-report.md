# Split "Grid & Flex & Containers" docs into Grid / Flex / Containers

## Real content boundaries found

The task premise ("grid.html + containers.html = Grid & Flex + Containers") was
wrong. Actual state:

- `docs/docs/grid.html` was titled **"Grid & Flex"** and contained ALL the
  layout-CSS-module content: Container (`wui-container`/`wui-container-fluid`),
  Row/Col (12-col grid), CSS Grid utilities (`wui-grid`), Flex utilities
  (`wui-flex`), Gap utilities (`wui-gap`), and Bento (`wui-bento`) — six
  sections in one file.
- `docs/docs/containers.html` is titled **"Cards & Containers"** and documents
  a completely unrelated component family (`wui-card`, `wui-plane`,
  `wui-panel`, `wui-embed`) from `weoc-containers.css`, in the "Data Display"
  NAV group. It has nothing to do with the layout `wui-container` utility and
  was left untouched.

So there was no pre-existing "Containers" (layout) page at all — it had to be
created from content living inside grid.html, and it could not reuse the
`containers.html` filename (taken by the unrelated Cards & Containers page).

## Split performed

- **Grid** (`docs/docs/grid.html`, reused) — Row/Col (12-col) + `wui-grid` CSS
  Grid utilities + `wui-bento` dashboard grid. i18n ids `docs_grid_1-3, 8-29,
  46-55` (Container ids 4-7 and Flex/Gap ids 30-45 removed).
- **Flex** (`docs/docs/flex.html`, new) — `wui-flex` utilities + `wui-gap`
  utilities (paired per the weoc-grid.css module description). i18n ids
  `docs_flex_1-19` in new `docs/i18n/flex.js`.
- **Containers** (`docs/docs/container.html`, new — singular filename to avoid
  collision with `containers.html`) — `wui-container`/`wui-container-fluid`.
  i18n ids `docs_container_1-7` in new `docs/i18n/container.js`.

All original demo/interactive markup (live previews + `<template
class="wui-demo-markup">` code boxes) was moved verbatim, byte-for-byte,
between files — nothing was dropped or rewritten.

## Wiring updated

- `docs/docs-shell.js`: NAV `Layout` group now has `grid` / `flex` /
  `container` entries (was one `grid` entry); `I18N_PAGES` gained `'flex'` and
  `'container'`.
- `docs/docs-i18n.js`: `docs_nav_grid` shortened to "Grid"; added
  `docs_nav_flex` ("Flex") and `docs_nav_container` ("Containers"), each
  EN+AR.
- `docs/index.html` + `docs/i18n/home.js`: homepage "Layout" section split
  into 3 cards (was 1), linking to grid.html / flex.html / container.html.
- Cross-links: each of the 3 pages' hero paragraph links to the other two by
  name, and the Containers page explicitly links to and disambiguates itself
  from the unrelated `containers.html` (Cards & Containers) page.
- `docs/docs/layout.html` has one pre-existing reference to `containers.html`
  (wui-widget note) — untouched, unaffected, and still correct since that
  page's identity didn't change.

## Verification (claude-in-chrome, local static server)

- All 3 pages load standalone with correct content, correct NAV highlighting,
  0 console errors.
- Homepage Layout section renders 4 cards (Layout & Shell / Grid / Flex /
  Containers) with correct hrefs.
- EN/AR toggle confirmed on all 3 pages (RTL layout, translated nav labels
  الشبكة/المرونة/الحاويات, translated hero + section text).
- Internal cross-links verified correct via resolved `href`, and via the
  router's `isInternalDocLink()` regex matching + `preventDefault()` firing
  (confirmed with direct JS dispatch) — the app's own SPA (fetch+swap)
  transition itself hangs on click in this browser-automation environment,
  but this reproduces identically on `tokens.html → tier-colors.html`, an
  untouched, pre-existing page pair, so it is a pre-existing environment
  artifact (likely GSAP `requestAnimationFrame` starvation in an automated
  tab), not something this change introduced. Direct URL navigation to all
  three pages works perfectly.
