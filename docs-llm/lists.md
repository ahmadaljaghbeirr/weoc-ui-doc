# EOC List Registry

[← Index](README.md)

Define all dropdown list data once in `eoc-lists.js` — a single JS file hosted on the CDN. Any board that loads it gets its lists on every environment, no WebEOC admin re-entry required.

> **The migration problem this solves:** WebEOC lists live in the environment database. Moving to a new environment means manually re-entering every list — and sub-lists cannot be exported recursively at all. `eoc-lists.js` moves that data out of the database and into a CDN-hosted JS file that travels with your board package.

> **XSLT display views still need a WebEOC list:** If a display view uses a server-side `&lt;list name="..."&gt;` XSL construct to render label text, that list must still exist in WebEOC admin. The registry only replaces the **input side** — TomSelect dropdowns populated by JS. Boards following the weoc-ui pattern render values directly from `@FieldValue` attributes, so they have no XSL list dependency.

## Load Order

Include `eoc-lists.js` in the board's `<head>` before any script that references `EOCLists`. No dependencies — the file is standalone.

```js
<head>
  <script src="https://cdn.atlascrisis.com/Shared/JS/weoc-ui.js"></script>

  <!-- List registry — no dependencies -->
  <script src="https://cdn.atlascrisis.com/Shared/JS/eoc-lists.js"></script>

  <!-- TomSelect (library + factory) -->
  <script src="https://cdn.atlascrisis.com/Shared/JS/tom-select.complete.min.js"></script>
  <script src="https://cdn.atlascrisis.com/Shared/JS/tom-select-factory.js"></script>
</head>
```

## API — window.EOCLists

| Method | Returns | Description |
|---|---|---|
| `EOCLists.get(name)` | `Array` | Top-level items for a list. Returns `[{value, text}, …]`. Returns `[]` if the list is not registered. |
| `EOCLists.getChildren(name, parentValue)` | `Array` | Child items for a given parent value in a tree list. Returns `[]` for flat lists or unknown parents. |
| `EOCLists.hasChildren(name)` | `boolean` | Whether a list has a `children` map (i.e. is a tree list). |
| `EOCLists.list()` | `string[]` | All registered list names — useful for debugging or building an admin UI. |
| `EOCLists.populate(select, name, opts?)` | `number` | Fill a native `<select>` element with items from the registry. Returns the number of options added. `opts.parentValue` — fetch sub-list children instead of top-level items. `opts.keepPlaceholder` — keep the first option (blank) when clearing. |
| `EOCLists.register(name, definition)` | `void` | Add or replace a list at runtime. Pass a flat array or a tree object. Useful for board-specific lists not shared across all boards. |

## Defining Lists

All lists live in `eoc-lists.js`. Two formats — flat and tree. Add new lists to the file; boards pick them up automatically on next deploy.

```js
// ── Flat list ─────────────────────────────────────────────────────────────────
// define(name, [{ value, text }, ...])
define('Priority', [
  { value: 'Critical', text: 'Critical' },
  { value: 'High',     text: 'High' },
  { value: 'Medium',   text: 'Medium' },
  { value: 'Low',      text: 'Low' }
]);

// ── Tree list (parent → children) ─────────────────────────────────────────────
// define(name, { items: [...], children: { parentValue: [...], ... } })
define('Resource Category', {
  items: [
    { value: 'Personnel',  text: 'Personnel' },
    { value: 'Equipment',  text: 'Equipment' },
    { value: 'Vehicles',   text: 'Vehicles' }
  ],
  children: {
    Personnel: [
      { value: 'EOC Staff',  text: 'EOC Staff' },
      { value: 'Field Team', text: 'Field Team' },
      { value: 'Volunteer',  text: 'Volunteer' }
    ],
    Equipment: [
      { value: 'Generator', text: 'Generator' },
      { value: 'Radio',     text: 'Radio' }
    ],
    Vehicles: [
      { value: 'Ambulance',  text: 'Ambulance' },
      { value: 'Fire Truck', text: 'Fire Truck' }
    ]
  }
});

// ── Register at runtime (board-specific list) ──────────────────────────────────
// Call this from your board's initialize() before TomSelectFactory.init()
EOCLists.register('My Board Status', [
  { value: 'Draft',    text: 'Draft' },
  { value: 'Approved', text: 'Approved' },
  { value: 'Archived', text: 'Archived' }
]);
```

## Demo — Flat List

`EOCLists.populate()` fills a native `<select>`. Pass it to TomSelect. The Priority list ships in `eoc-lists.js` — no WebEOC list needed.

```js
// Populate before TomSelect init
var prioritySel = document.querySelector('[name="Priority"]');
EOCLists.populate(prioritySel, 'Priority');

// Init TomSelect normally
var ts = new TomSelect(prioritySel, {
  plugins: ['clear_button'],
  placeholder: '— Select priority —',
  allowEmptyOption: true
});

// React to selection
ts.on('change', function (val) {
  var VARIANTS = { Critical: 'danger', High: 'warning', Medium: 'primary', Low: 'success' };
  badge.className = 'wui-badge ' + (VARIANTS[val] || 'bordered secondary');
  badge.textContent = val || 'None';
});
```

## Demo — Cascading (Sub-List)

Tree lists define parent items and a `children` map. When the parent changes, call `EOCLists.getChildren()` to reload the child TomSelect. No recursive export needed — the entire tree lives in the JS file.

```js
// Populate parent from registry
EOCLists.populate(catSel, 'Resource Category');
var catTs = new TomSelect(catSel, { plugins: ['clear_button'],
  placeholder: '— Select category —', allowEmptyOption: true });

// Child starts empty and disabled
var subTs = new TomSelect(subSel, { plugins: ['clear_button'],
  placeholder: '— Select category first —', allowEmptyOption: true });
subTs.disable();

// Reload child when parent changes
catTs.on('change', function (val) {
  subTs.clear(true);
  subTs.clearOptions();
  if (val) {
    EOCLists.getChildren('Resource Category', val).forEach(function (item) {
      subTs.addOption({ value: item.value, text: item.text });
    });
    subTs.enable();
    subTs.refreshOptions(false);
  } else {
    subTs.disable();
  }
});
```

## Board Integration Pattern

In a WebEOC board's `initialize()`, populate registry-backed selects **before** `TomSelectFactory.init()`. The factory then wraps them normally — all existing `data-*` attributes still apply.

```js
function initialize() {
  // 1. Populate from registry BEFORE factory init
  var prioritySel = document.querySelector('[name="Priority"]');
  if (prioritySel) EOCLists.populate(prioritySel, 'Priority');

  var catSel = document.querySelector('[name="MainCategory"]');
  if (catSel) EOCLists.populate(catSel, 'Resource Category');

  // 2. Factory inits TomSelect on all .tomselect elements
  TomSelectFactory.init();

  // 3. Wire cascading AFTER factory init (factory created the ts instance)
  var catTs = TomSelectFactory.get('MainCategory');
  var subTs = TomSelectFactory.get('SubCategory');
  if (catTs && subTs) {
    catTs.on('change', function (val) {
      subTs.clear(true);
      subTs.clearOptions();
      EOCLists.getChildren('Resource Category', val).forEach(function (item) {
        subTs.addOption({ value: item.value, text: item.text });
      });
      subTs.refreshOptions(false);
    });
  }
}
```

The WebEOC view defines the select with `<element name="select">` / `<attribute name="class">tomselect</attribute>` as normal — no `list` attribute, no `data-list` attribute. The registry handles the options; the factory handles the widget.

```js
<!-- Input view: select backed by registry instead of a WebEOC list -->
<element name="select">
  <attribute name="name">Priority</attribute>
  <attribute name="class">tomselect</attribute>
  <attribute name="data-placeholder">— Select priority —</attribute>
  <attribute name="data-required">true</attribute>
</element>
<!-- EOCLists.populate() fills the options in initialize() before factory.init() -->
```

## Built-in Lists

All lists defined in `eoc-lists.js` as shipped. Add new lists to the file for any domain; use `EOCLists.register()` for board-specific overrides at runtime without touching the shared file.

## REST-Live API — window.EOCListsAPI

`EOCLists` above is a static, portable registry — data baked into `eoc-lists.js` at deploy time, no network calls. `EOCListsAPI` is a different, independent object in the same file: it talks directly to the live WebEOC Nexus REST API's `/lists` endpoints, reading and writing the environment's own list catalog at runtime. Use the static registry to ship list data that travels with a board package; use `EOCListsAPI` when a board needs to read or seed lists that actually live in WebEOC admin. The two are unrelated — a name registered in one is not visible to the other.

> **Setup — no separate login call:** The base URL is resolved once from the current page's own `window.location.href`: a board view's URL is `&lt;scheme&gt;://&lt;host&gt;/&lt;instance&gt;/boards/...`, so `EOCListsAPI` cuts at `/boards` to get the instance root and appends `/api/rest.svc` (falls back to `location.origin` if `/boards` isn't found). Requests are same-origin and cookie-authenticated using the board's own already-logged-in WebEOC session — no separate REST login/token call is needed from inside a board view.

> **POST /lists is not an upsert — confirmed the hard way:** `createList()` (bare `POST /lists`) is safe **only** to create a list that does not exist yet. Calling it again on an existing list does not update it — it blindly appends the subitems as new duplicate top-level items, and using it to add a single item to an already-existing list (the shape WebEOC's own docs describe) creates a spurious unrelated top-level list named after the item *and* corrupts the target list's own `getList()` afterward. `addItem()`'s URL-path style is the only confirmed-safe way to add to an existing list, at any depth.

| Method | Returns | Status | Description |
|---|---|---|---|
| `EOCListsAPI.getLists()` | `Promise` | Confirmed live | `GET /lists` — every list name in the catalog. |
| `EOCListsAPI.getList(listName)` | `Promise` | Confirmed live | `GET /lists/[listName]` — the full recursive tree: `{ color, name, subitems }`. `subitems` nests all the way down; no separate "get sub items" call needed. |
| `EOCListsAPI.createList(listName, subitems, color?)` | `Promise` | Confirmed live | `POST /lists` — creates a brand-new list with its full initial tree in one call. Safe only when `listName` doesn't exist yet (see the gotcha above). |
| `EOCListsAPI.addItem(segments, color?)` | `Promise` | Confirmed live | `POST /lists/[seg1]/.../[newName]` — adds ONE item to an existing list at any depth. `segments[0]` is the list name; the new item's name is always the last segment. One call per node — no bulk-add endpoint exists for an existing list. |
| `EOCListsAPI.editItem(segments, changes)` | `Promise` | Not verified | POST to the item's own path with a replacement body. WebEOC Nexus's REST API only documents GET / POST / DELETE (no PUT/PATCH), so this is modeled as a POST by convention — the request/response shape has not been tested against a live instance. |
| `EOCListsAPI.deleteList(listName)` | `Promise` | Not verified | `DELETE /lists/[listName]`. Destructive and untested — confirm with throwaway data before relying on it. |
| `EOCListsAPI.deleteItem(segments)` | `Promise` | Not verified | `DELETE /lists/[seg1]/.../[itemName]` — remove one item/sub-item at any depth. Same caveat as `deleteList()`. |
| `EOCListsAPI.findNode(tree, segments)` | `Object\|null` | Local helper | Walks an already-fetched tree (from `getList()`) down to a nested node, e.g. `findNode(tree, ['Hazmat', 'Chemical Spill'])`. No network call — pure client-side lookup. |
| `EOCListsAPI.summarize(list)` | `Object` | Local helper | Classifies an already-fetched list: `{ itemCount, isTree }` — top-level item count, and whether any top-level item has children of its own. No network call. |
| `EOCListsAPI.ensureList(listName, desiredNodes, onProgress?)` | `Promise` | Composite | Create-or-diff-and-fill a whole tree in one call: creates the list if it doesn't exist yet, or recursively adds only the missing nodes if it does. Built entirely from `getList()`, `createList()` and `addItem()` — as reliable as those three, not independently tested beyond them. |
| `EOCListsAPI.ensureNodes(listName, parentPath, existingSiblings, desiredNodes, onProgress?)` | `Promise` | Composite | The recursive worker `ensureList()` calls internally; exposed for callers that already have both trees fetched and just want the diff-and-fill step. |

## Usage — Reading & Writing Lists

`getLists()`, `getList()`, `createList()` and `addItem()` are the four confirmed-working entry points — everything else in `EOCListsAPI` is built on top of them. All four return a `Promise`; there is no callback form.

```js
// Seed the "Facility Types" list once, if this environment doesn't have it yet
EOCListsAPI.getLists().then(function (lists) {
  if (lists.indexOf('Facility Types') === -1) {
    return EOCListsAPI.createList('Facility Types', [
      { name: 'EOC',           subitems: [] },
      { name: 'Shelter',       subitems: [] },
      { name: 'Staging Area',  subitems: [] }
    ]);
  }
});

// List already exists on this environment — add ONE new top-level item.
// Never call createList() again on an existing list (see the gotcha above).
EOCListsAPI.addItem(['Facility Types', 'Reception Centre']).then(function () {
  console.log('added');
});

// Add a child under an existing tree list, e.g. Incident Categories → Hazmat → Chemical Spill
EOCListsAPI.addItem(['Incident Categories', 'Hazmat', 'Chemical Spill']);

// Read a tree back and inspect it with the local (no-network) helpers
EOCListsAPI.getList('Incident Categories').then(function (tree) {
  var hazmat = EOCListsAPI.findNode(tree, ['Hazmat']);
  var stats  = EOCListsAPI.summarize(tree);
  console.log(hazmat, stats.itemCount, stats.isTree);
});
```

## Usage — ensureList() (Seed/Deploy Helper)

A single idempotent call for board-deploy scripts: creates the list if it's missing, or diffs against what's already there and adds only the missing nodes if it exists, at any depth, one targeted call per missing node. Any `getList()` failure is treated as "doesn't exist" — WebEOC's own API throws the same generic error for a missing list as for a genuinely broken one, so there's no clean 404 to distinguish them (confirmed live).

```js
EOCListsAPI.ensureList('Incident Categories', [
  { name: 'Fire',   subitems: [] },
  { name: 'Hazmat', subitems: [
    { name: 'Chemical Spill', subitems: [] },
    { name: 'Gas Leak',       subitems: [] }
  ] }
], function (progress) {
  // progress: { type: 'create'|'exists'|'add', depth, listName, name }
  console.log(progress.type, progress.name);
});
```

## Usage — editItem() / deleteList() / deleteItem() (Not Verified)

These three exist in `eoc-lists.js` and are wired up the way the REST API is documented to work, but unlike the four methods above, they were not exercised against a live WebEOC instance. Read them as "present in code, shape not confirmed" rather than "working."

> **Test with throwaway data first:** `deleteList()` and `deleteItem()` are destructive and unverified. Try them against a disposable test list on a non-production environment before using them in a real board workflow.

```js
// Modeled as POST to the item's own path — shape not confirmed live
EOCListsAPI.editItem(['Facility Types', 'Reception Centre'], { name: 'Reception Center', color: '' });

// Destructive, unverified — throwaway data only
EOCListsAPI.deleteItem(['Facility Types', 'Reception Centre']);
EOCListsAPI.deleteList('Facility Types Test');
```
