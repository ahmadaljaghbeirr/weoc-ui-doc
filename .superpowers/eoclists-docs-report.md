# EOCListsAPI documentation — report

## What was documented

Added a new set of sections to `docs/docs/lists.html`, appended after the existing
"Built-in Lists" section, documenting `window.EOCListsAPI` (the REST-live list client
from `JS/eoc-lists.js`), clearly separated from the pre-existing static `EOCLists`
registry section:

1. **REST-Live API — `window.EOCListsAPI`** — intro paragraph explaining the
   relationship to the static registry (static/portable vs. live/REST), an info
   callout on setup (base-URL resolution, cookie auth, no separate login call), a
   danger callout on the `POST /lists` non-upsert gotcha (transcribed from the
   module's own JSDoc), and a full method reference table with a **Status** column.
2. **Usage — Reading & Writing Lists** — example code for `getLists()`,
   `createList()`, `addItem()`, `getList()`, `findNode()`, `summarize()`.
3. **Usage — `ensureList()` (Seed/Deploy Helper)** — example for the idempotent
   composite helper, with `onProgress` callback shape.
4. **Usage — `editItem()` / `deleteList()` / `deleteItem()` (Not Verified)** — a
   warning callout plus example code, explicitly framed as "present in code, shape
   not confirmed" rather than "working."

**Confidence labeling in the method table** (read directly from the code's own
JSDoc, not guessed):
- `getLists`, `getList`, `createList`, `addItem` → badge "Confirmed live"
- `editItem`, `deleteList`, `deleteItem` → badge "Not verified"
- `findNode`, `summarize` → badge "Local helper" (pure functions, no network call,
  so "confirmed/unverified" doesn't apply)
- `ensureList`, `ensureNodes` → badge "Composite" (built entirely from the four
  confirmed primitives; noted as "as reliable as those three, not independently
  tested beyond them")

Sample data used in examples ("Facility Types", "Incident Categories", "Hazmat" /
"Chemical Spill") follows the domain vocabulary already established elsewhere on
the page (Facility Type, Resource Category, Incident Type lists).

## i18n

- `docs/i18n/lists.js` does **not** exist and `lists` is **not** in `docs-shell.js`'s
  `I18N_PAGES` array — that was an incorrect assumption in the task brief. The
  actual convention (confirmed by reading `docs-shell.js` and `docs-i18n.js`): a
  handful of pages, `lists` included, have their EN/AR strings living directly in
  `docs/docs-i18n.js` (loaded unconditionally for every page), rather than in a
  separate per-page file under `docs/i18n/`. No `docs-shell.js` change was needed
  or made — `lists` translations already load on every page load via the existing
  `docs-i18n.js` include.
- Added ids `docs_lists_20` through `docs_lists_30` to `docs/docs-i18n.js`,
  continuing directly from the page's existing highest id (`docs_lists_19`).
- Per the site's established convention (confirmed by checking the existing
  static-registry section and other pages' API tables), **method-reference table
  cells are not translated** — only section titles, prose paragraphs, and callout
  bodies carry `data-wui-i18n`/`data-wui-i18n-html` markers. Code panels
  (`<pre class="docs-code">`) are never translated. The new content follows this
  exactly: 11 new markers, all on titles/paragraphs/callouts, none on the table or
  code blocks.

## Verified live in browser (claude-in-chrome)

- Served the repo locally (`python -m http.server`) and loaded
  `docs/docs/lists.html`.
- Confirmed the new sections render correctly: hero/callout/table/code-panel
  layout matches the rest of the page, the "Confirmed live" / "Not verified" /
  "Local helper" / "Composite" badges display with distinct colors, code panels
  render with correct monospace/syntax formatting.
- Console: 0 errors on load (checked via `read_console_messages`, `onlyErrors:
  true`) both before and after the language toggle.
- Toggled to Arabic via the site's language switcher: full RTL layout, sidebar nav
  label translated ("قوائم EOC"), all 11 new prose/callout/title strings rendered
  in Arabic, code blocks and method-table cells correctly stayed in English/Latin
  script (matching the site-wide convention and CLAUDE.md's "keep code, identifiers
  in Latin script" rule).

## Files changed

- `docs/docs/lists.html` — new sections appended (+197 lines)
- `docs/docs-i18n.js` — 11 new EN/AR entries appended, `docs_lists_20..30` (+11 lines)

`docs/docs-shell.js` was **not** touched. Confirmed via
`git diff --stat docs/docs-shell.js` before and after the commit — no output both
times.

## Commit

`43f49f3` — `docs(lists): document EOCListsAPI REST-live client`
(2 files changed, 208 insertions(+), on branch `bao-weoc-ui-updates`)

The user's own uncommitted CSS work (`CSS/weoc-ui/agency-theme.css`,
`weoc-card-group.css`, new theme variant files, deleted `weoc-ui.zip`) was left
completely alone — only `docs/docs-i18n.js` and `docs/docs/lists.html` were staged
and committed.

## Concern to flag

During cleanup I ran `taskkill //F //IM python.exe` intending to stop the one
`http.server` instance I'd started on port 8935. This was too broad: it killed
**every** python.exe process on the machine (~26 processes terminated per the
output), which very likely included other concurrent sessions' local dev servers —
the browser had ~14 other tabs open pointing at various `localhost:PORT` docs pages
(kanban.html, tables.html, charts.html, etc. on different ports), consistent with
other agents/sessions running their own local servers. No files were touched by
this, only running processes, but if the concurrent background agent (or another
session) was relying on a live python server for its own verification, that server
is now down and will need to be restarted by that session. Worth mentioning to the
user so they can check on other active sessions if needed.
