# EOC List Registry

[← Index](README.md)

Define all dropdown list data once in `eoc-lists.js` — a single JS file hosted on the CDN. Any board that loads it gets its lists on every environment, no WebEOC admin re-entry required.

> **The migration problem this solves:** WebEOC lists live in the environment database. Moving to a new environment means manually re-entering every list — and sub-lists cannot be exported recursively at all. `eoc-lists.js` moves that data out of the database and into a CDN-hosted JS file that travels with your board package.

> **XSLT display views still need a WebEOC list:** If a display view uses a server-side `<list name="...">` XSL construct to render label text, that list must still exist in WebEOC admin. The registry only replaces the **input side** — TomSelect dropdowns populated by JS. Boards following the weoc-ui pattern render values directly from `@FieldValue` attributes, so they have no XSL list dependency.

## Load Order

Include `eoc-lists.js` in the board's `<head>` before any script that references `EOCLists`. No dependencies — the file is standalone.

```html
<head>
  <script src="https://cdn.atlascrisis.com/Shared/JS/weoc-ui.js"></script>

  <!-- List registry — no dependencies -->
  <script src="https://cdn.atlascrisis.com/Shared/JS/eoc-lists.js"></script>

  <!-- TomSelect (library + factory) -->
  <script src="https://cdn.atlascrisis.com/Shared/JS/tom-select.complete.min.js"></script>
  <script src="https://cdn.atlascrisis.com/Shared/JS/tom-select-factory.js"></script>
</head>
```

## API — `window.EOCLists`

| Method | Returns | Description |
|---|---|---|
| `EOCLists.get(name)` | `Array` | Top-level items for a list. Returns `[{value, text}, …]`. Returns `[]` if the list is not registered. |
| `EOCLists.getChildren(name, parentValue)` | `Array` | Child items for a given parent value in a tree list. Returns `[]` for flat lists or unknown parents. |
| `EOCLists.hasChildren(name)` | `boolean` | Whether a list has a `children` map (i.e. is a tree list). |
| `EOCLists.list()` | `string[]` | All registered list names — useful for debugging or building an admin UI. |
| `EOCLists.populate(select, name, opts?)` | `number` | Fill a native `<select>` element with items from the registry. Returns the number of options added.<br>`opts.parentValue` — fetch sub-list children instead of top-level items.<br>`opts.keepPlaceholder` — keep the first option (blank) when clearing. |
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

```html
<div style="display:flex;gap:var(--space-4);align-items:center;flex-wrap:wrap;width:100%">
  <div style="flex:1;min-width:220px;max-width:320px">
    <select id="demo-list-flat" style="width:100%"></select>
  </div>
  <div style="display:flex;align-items:center;gap:var(--space-2)">
    <span style="font-size:var(--font-sm);color:var(--color-text-secondary)">Selected:</span>
    <span id="demo-list-flat-out" class="wui-badge bordered secondary">None</span>
  </div>
</div>
<div id="demo-list-flat-chips" style="display:flex;gap:var(--space-2);flex-wrap:wrap"></div>
```

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

```html
<div style="display:flex;gap:var(--space-3);flex-wrap:wrap;width:100%">
  <div style="flex:1;min-width:220px;max-width:300px">
    <label style="font-size:var(--font-sm);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1)">Category</label>
    <select id="demo-list-cat" style="width:100%"></select>
  </div>
  <div style="flex:1;min-width:220px;max-width:300px">
    <label style="font-size:var(--font-sm);color:var(--color-text-secondary);display:block;margin-bottom:var(--space-1)">Sub-Category</label>
    <select id="demo-list-sub" style="width:100%"></select>
  </div>
</div>
<div id="demo-list-cascade-out" style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;min-height:28px"></div>
```

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

```html
<!-- Input view: select backed by registry instead of a WebEOC list -->
<element name="select">
  <attribute name="name">Priority</attribute>
  <attribute name="class">tomselect</attribute>
  <attribute name="data-placeholder">&mdash; Select priority &mdash;</attribute>
  <attribute name="data-required">true</attribute>
</element>
<!-- EOCLists.populate() fills the options in initialize() before factory.init() -->
```

## Built-in Lists

All lists defined in `eoc-lists.js` as shipped. Add new lists to the file for any domain; use `EOCLists.register()` for board-specific overrides at runtime without touching the shared file.

```html
<!-- Rendered at runtime: one card per registered list, built by iterating EOCLists.list() -->
<div id="demo-list-registry-grid" style="display:flex;flex-wrap:wrap;gap:var(--space-3)"></div>
```
