/**
 * eoc-lists.js — EOC list registry (static) + REST-live list API
 *
 * Two independent, side-by-side ways to work with lists — pick whichever
 * fits a given list, both can be used on the same board:
 *
 * window.EOCLists — the static registry. List data is baked into this file
 * at deploy time, so boards survive environment migrations without
 * re-entering lists in WebEOC admin. Read-only from a board's perspective
 * (register() only mutates the in-memory copy for the current session).
 *   .get(name)                         → flat items array
 *   .getChildren(name, parentValue)    → child items for a parent value
 *   .hasChildren(name)                 → boolean
 *   .list()                            → array of all registered list names
 *   .populate(select, name, opts?)     → fill a <select>; returns item count
 *   .register(name, definition)        → add or replace a list at runtime
 *
 * window.EOCListsAPI — talks to the live WebEOC Nexus REST API. Reads and
 * writes WebEOC's own list catalog at runtime instead of shipping data in
 * this file. See the JSDoc above that block for the full method list and
 * what's confirmed live vs. still unverified.
 */
(function (window) {
  'use strict';

  var _registry = {};

  function define(name, def) { _registry[name] = def; }

  // ── Flat lists ──────────────────────────────────────────────────────────────

  define('Incident Type', [
    { value: 'Fire',           text: 'Fire' },
    { value: 'Flood',          text: 'Flood' },
    { value: 'Hazmat',         text: 'Hazardous Materials' },
    { value: 'Medical',        text: 'Medical Mass Casualty' },
    { value: 'Infrastructure', text: 'Infrastructure Failure' },
    { value: 'Security',       text: 'Security Threat' },
    { value: 'Search Rescue',  text: 'Search and Rescue' },
    { value: 'Earthquake',     text: 'Earthquake' },
    { value: 'Other',          text: 'Other' }
  ]);

  define('Priority', [
    { value: 'Critical', text: 'Critical' },
    { value: 'High',     text: 'High' },
    { value: 'Medium',   text: 'Medium' },
    { value: 'Low',      text: 'Low' }
  ]);

  define('Task Status', [
    { value: 'Open',        text: 'Open' },
    { value: 'In Progress', text: 'In Progress' },
    { value: 'Completed',   text: 'Completed' },
    { value: 'Cancelled',   text: 'Cancelled' },
    { value: 'On Hold',     text: 'On Hold' }
  ]);

  define('Event Status', [
    { value: '0', text: 'Active' },
    { value: '1', text: 'Closed' }
  ]);

  define('Activation Tier', [
    { value: '1', text: 'Tier 1 — Monitoring' },
    { value: '2', text: 'Tier 2 — Partial Activation' },
    { value: '3', text: 'Tier 3 — Full Activation' },
    { value: '4', text: 'Tier 4 — Major Disaster' }
  ]);

  define('Resource Status', [
    { value: 'Available',   text: 'Available' },
    { value: 'Deployed',    text: 'Deployed' },
    { value: 'Unavailable', text: 'Unavailable' },
    { value: 'Maintenance', text: 'In Maintenance' }
  ]);

  define('Evacuation Status', [
    { value: 'Pending',    text: 'Pending' },
    { value: 'In Process', text: 'In Process' },
    { value: 'Completed',  text: 'Completed' },
    { value: 'Cancelled',  text: 'Cancelled' }
  ]);

  define('Shelter Status', [
    { value: 'Open',     text: 'Open' },
    { value: 'Full',     text: 'Full' },
    { value: 'Closed',   text: 'Closed' },
    { value: 'Standby',  text: 'Standby' }
  ]);

  define('Facility Type', [
    { value: 'EOC',              text: 'EOC' },
    { value: 'Shelter',          text: 'Shelter' },
    { value: 'Staging Area',     text: 'Staging Area' },
    { value: 'Medical Point',    text: 'Medical Point' },
    { value: 'Press Area',       text: 'Press Area' },
    { value: 'Reception Centre', text: 'Reception Centre' },
    { value: 'Other',            text: 'Other' }
  ]);

  // ── Tree lists (parent → children) ─────────────────────────────────────────

  define('Resource Category', {
    items: [
      { value: 'Personnel',  text: 'Personnel' },
      { value: 'Equipment',  text: 'Equipment' },
      { value: 'Vehicles',   text: 'Vehicles' },
      { value: 'Facilities', text: 'Facilities' }
    ],
    children: {
      Personnel: [
        { value: 'EOC Staff',    text: 'EOC Staff' },
        { value: 'Field Team',   text: 'Field Team' },
        { value: 'Volunteer',    text: 'Volunteer' },
        { value: 'Contractor',   text: 'Contractor' },
        { value: 'Liaison',      text: 'Liaison Officer' }
      ],
      Equipment: [
        { value: 'Generator',   text: 'Generator' },
        { value: 'Pump',        text: 'Pump' },
        { value: 'Radio',       text: 'Radio' },
        { value: 'Med Kit',     text: 'Medical Kit' },
        { value: 'Water Tank',  text: 'Water Tank' }
      ],
      Vehicles: [
        { value: 'Ambulance',     text: 'Ambulance' },
        { value: 'Fire Truck',    text: 'Fire Truck' },
        { value: 'Bus',           text: 'Bus' },
        { value: 'Utility Truck', text: 'Utility Truck' },
        { value: 'Command Van',   text: 'Command Van' }
      ],
      Facilities: [
        { value: 'Shelter',       text: 'Shelter' },
        { value: 'Staging Area',  text: 'Staging Area' },
        { value: 'Medical Point', text: 'Medical Point' },
        { value: 'Warehouse',     text: 'Warehouse' }
      ]
    }
  });

  // ── API ─────────────────────────────────────────────────────────────────────

  function getItems(name) {
    var entry = _registry[name];
    if (!entry) return [];
    return Array.isArray(entry) ? entry : (entry.items || []);
  }

  function getChildren(name, parentValue) {
    var entry = _registry[name];
    if (!entry || Array.isArray(entry) || !entry.children) return [];
    return entry.children[parentValue] || [];
  }

  function hasChildren(name) {
    var entry = _registry[name];
    return !!(entry && !Array.isArray(entry) && entry.children);
  }

  /**
   * Fill a <select> from the registry.
   * opts.parentValue — if set, fetches sub-list children instead of top-level items
   * opts.keepPlaceholder — if true, leaves the first option (blank placeholder) intact
   */
  function populate(select, name, opts) {
    opts = opts || {};
    var items = opts.parentValue !== undefined
      ? getChildren(name, opts.parentValue)
      : getItems(name);

    var keepCount = opts.keepPlaceholder ? 1 : 0;
    while (select.options.length > keepCount) select.remove(keepCount);

    items.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.value;
      opt.text  = item.text;
      select.appendChild(opt);
    });

    return items.length;
  }

  function register(name, definition) {
    _registry[name] = definition;
  }

  function list() {
    return Object.keys(_registry);
  }

  window.EOCLists = {
    get:         getItems,
    getChildren: getChildren,
    hasChildren: hasChildren,
    list:        list,
    populate:    populate,
    register:    register
  };

})(window);

/**
 * window.EOCListsAPI — REST-live list API
 *
 * Talks directly to the WebEOC Nexus REST API's /lists endpoints — live,
 * same-origin, cookie-authenticated (no separate login call needed from
 * inside an already-authenticated WebEOC session). Base URL is resolved
 * once from the current page's own URL: a board view's window.location.href
 * is "<scheme>://<host>/<instance>/boards/...", so cutting at "/boards"
 * gives the instance root, then "/api/rest.svc" is appended. Falls back to
 * location.origin only if "/boards" isn't found.
 *
 * CONFIRMED live against a real WebEOC Nexus instance (2026-07-29 — full
 * investigation in _specs/2026-07-29-list-management-board-design.md):
 *   getLists, getList, createList, addItem
 *
 * NOT VERIFIED — editItem, deleteList, deleteItem. WebEOC Nexus's REST API
 * only exposes GET / POST / DELETE (confirmed in the official "REST API Key
 * Concepts" doc — no PUT/PATCH), so editItem is modeled as a POST to the
 * item's own path and delete as the DELETE method on the resource path, by
 * convention — neither request/response shape has been tested against a
 * live instance. Verify with throwaway data before relying on them,
 * especially deleteList/deleteItem (destructive).
 *
 * The single biggest gotcha, confirmed the hard way: POST /lists (bare, no
 * path segment) is ONLY safe to create a list that does not exist yet.
 * Calling it again on an existing list does not upsert — it blindly appends
 * subitems as new duplicate top-level items, and using it to add a single
 * top-level item to an existing list (the shape Juvare's own docs describe)
 * creates a spurious unrelated top-level list named after the item AND
 * corrupts the target list's own getList() afterward. addItem()'s
 * URL-path style is the only confirmed-safe way to add to an existing list,
 * at any depth. See the design doc's gotcha #4 for the full incident.
 *
 * API:
 *   .getLists()                              → GET  /lists
 *   .getList(listName)                       → GET  /lists/[listName]
 *   .createList(listName, subitems, color?)  → POST /lists  (new lists only)
 *   .addItem(segments, color?)               → POST /lists/[seg1]/.../[newName]
 *   .editItem(segments, changes)             → POST, NOT VERIFIED
 *   .deleteList(listName)                    → DELETE, NOT VERIFIED
 *   .deleteItem(segments)                    → DELETE, NOT VERIFIED
 *   .findNode(tree, segments)                → walk an already-fetched tree, no network
 *   .summarize(list)                         → { itemCount, isTree } from an already-fetched list
 *   .ensureList(listName, desiredNodes, onProgress?)   → create-or-diff-and-add a whole tree
 *   .ensureNodes(listName, parentPath, existingSiblings, desiredNodes, onProgress?)
 *
 * `segments` is always the full path from the list name down to the target
 * node, e.g. ['Make List', 'Toyota', 'Camry']. The node being added/edited/
 * deleted is always the LAST segment.
 *
 * `desiredNodes` / tree shape (same as what getList() returns):
 *   [{ name: 'Item A', subitems: [] },
 *    { name: 'Item B', subitems: [{ name: 'Sub B1', subitems: [] }] }]
 */
(function (window) {
  'use strict';

  function resolveBase() {
    var boardsIdx = window.location.href.indexOf('/boards');
    var instanceBase = boardsIdx > -1 ? window.location.href.slice(0, boardsIdx) : window.location.origin;
    return instanceBase + '/api/rest.svc';
  }

  var BASE = resolveBase();

  function pathFor(segments) {
    return '/lists/' + segments.map(encodeURIComponent).join('/');
  }

  function request(method, path, body) {
    var opts = { method: method };
    if (body !== undefined) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    return fetch(BASE + path, opts).then(function (res) {
      if (!res.ok) throw new Error(method + ' ' + path + ' failed: ' + res.status);
      return res.text();
    }).then(function (text) {
      return text ? JSON.parse(text) : null;
    });
  }

  // Runs iterator(item) once per item, strictly one at a time (each waits
  // for the previous to resolve) — used for the ordered, per-node add calls
  // ensureNodes needs (no bulk-add endpoint exists for an existing list).
  function serial(items, iterator) {
    return (items || []).reduce(function (chain, item) {
      return chain.then(function () { return iterator(item); });
    }, Promise.resolve());
  }

  // GET /lists — every list name in the catalog. Confirmed.
  function getLists() {
    return request('GET', '/lists');
  }

  // GET /lists/[listName] — full recursive tree: { color, name, subitems }.
  // subitems nests all the way down — no separate "get sub items" call
  // needed, walk the tree yourself with findNode(). Confirmed.
  function getList(listName) {
    return request('GET', pathFor([listName]));
  }

  // POST /lists — create a BRAND-NEW list with its full initial tree in one
  // call. Safe ONLY when listName doesn't exist yet — see the module-level
  // gotcha above. Confirmed.
  function createList(listName, subitems, color) {
    return request('POST', '/lists', {
      name: listName,
      subitems: subitems || [],
      color: color || '',
      listItemNames: []
    });
  }

  // POST /lists/[seg1]/.../[newName] — add ONE item to an EXISTING list, at
  // any depth. segments[0] is the list name; the new item's name is always
  // the last segment, never in the body. One call per node — there is no
  // bulk-add endpoint for an existing list. Confirmed, the only safe way to
  // add to an existing list at any nesting depth.
  function addItem(segments, color) {
    return request('POST', pathFor(segments), color ? { color: color } : undefined);
  }

  // POST to the item's own path with a replacement body. NOT VERIFIED — see
  // the module-level caveat. `changes` should carry whatever the real API
  // expects (likely { name, color }); confirm live before using.
  function editItem(segments, changes) {
    return request('POST', pathFor(segments), changes);
  }

  // DELETE /lists/[listName]. NOT VERIFIED and destructive — test with
  // throwaway data first.
  function deleteList(listName) {
    return request('DELETE', pathFor([listName]));
  }

  // DELETE /lists/[seg1]/.../[itemName] — remove one item/sub-item at any
  // depth. NOT VERIFIED, same caveat as deleteList.
  function deleteItem(segments) {
    return request('DELETE', pathFor(segments));
  }

  // Walks an already-fetched tree (from getList()) down to a nested node,
  // e.g. findNode(tree, ['Toyota', 'Camry']). Client-side substitute for
  // the separate "Get Sub Items" / "Get Sub Sub Items" endpoints in
  // Juvare's docs — getList() already returns the whole tree in one call,
  // no extra round-trip needed to read a deeper level.
  function findNode(tree, segments) {
    var node = tree;
    for (var i = 0; i < segments.length; i++) {
      var items = (node && node.subitems) || [];
      var next = null;
      for (var j = 0; j < items.length; j++) {
        if (items[j].name === segments[i]) { next = items[j]; break; }
      }
      node = next;
      if (!node) return null;
    }
    return node;
  }

  // Classifies an already-fetched list: top-level item count, and whether
  // any top-level item has children of its own (tree vs flat). Shared by
  // any board rendering a list summary row.
  function summarize(list) {
    var items = (list && list.subitems) || [];
    var isTree = items.some(function (item) { return item.subitems && item.subitems.length > 0; });
    return { itemCount: items.length, isTree: isTree };
  }

  // Recursively diffs desiredNodes against existingSiblings and adds ONLY
  // what's missing, at any depth, one targeted call per missing node —
  // never re-sends anything already there. Ported from the proven
  // fill-webeoc-lists.reference.js console script; onProgress (optional)
  // gets { type: 'exists'|'add', depth, listName, name } per node instead
  // of the script's console.log calls.
  function ensureNodes(listName, parentPath, existingSiblings, desiredNodes, onProgress) {
    var depth = parentPath.length;
    return serial(desiredNodes, function (node) {
      if (!node || !node.name) return Promise.resolve(); // skip blank placeholder entries

      var existingNode = (existingSiblings || []).filter(function (i) { return i.name === node.name; })[0];
      var ensureSelf;

      if (existingNode) {
        if (onProgress) onProgress({ type: 'exists', depth: depth, listName: listName, name: node.name });
        ensureSelf = Promise.resolve();
      } else {
        if (onProgress) onProgress({ type: 'add', depth: depth, listName: listName, name: node.name });
        ensureSelf = addItem([listName].concat(parentPath, [node.name]), node.color);
      }

      return ensureSelf.then(function () {
        if (!node.subitems || !node.subitems.length) return;
        var nextExisting = existingNode ? (existingNode.subitems || []) : [];
        return ensureNodes(listName, parentPath.concat([node.name]), nextExisting, node.subitems, onProgress);
      });
    });
  }

  // Top-level entry point: create the list if it doesn't exist yet (one
  // call, full tree), or diff-and-fill-gaps if it does. Any getList()
  // failure is treated as "doesn't exist" — WebEOC's GetList throws the
  // same generic error for a missing list as for a genuinely broken one,
  // there's no clean 404 to distinguish them (confirmed live).
  function ensureList(listName, desiredNodes, onProgress) {
    return getList(listName).catch(function () { return null; }).then(function (existing) {
      if (!existing) {
        var validNodes = (desiredNodes || []).filter(function (n) { return n && n.name; });
        if (onProgress) onProgress({ type: 'create', listName: listName, count: validNodes.length });
        return createList(listName, validNodes);
      }
      if (onProgress) onProgress({ type: 'exists', depth: 0, listName: listName, name: listName });
      return ensureNodes(listName, [], existing.subitems, desiredNodes, onProgress);
    });
  }

  window.EOCListsAPI = {
    getLists:    getLists,
    getList:     getList,
    createList:  createList,
    addItem:     addItem,
    editItem:    editItem,
    deleteList:  deleteList,
    deleteItem:  deleteItem,
    findNode:    findNode,
    summarize:   summarize,
    ensureList:  ensureList,
    ensureNodes: ensureNodes
  };

})(window);
