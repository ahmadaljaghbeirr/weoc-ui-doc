/**
 * eoc-lists.js — EOC portable list registry
 *
 * Defines all dropdown list data in JS so boards survive environment
 * migrations without touching WebEOC admin.
 *
 * Format:
 *   flat  → [{ value, text }, ...]
 *   tree  → { items: [...], children: { parentValue: [...], ... } }
 *
 * API (window.EOCLists):
 *   .get(name)                         → flat items array
 *   .getChildren(name, parentValue)    → child items for a parent value
 *   .hasChildren(name)                 → boolean
 *   .list()                            → array of all registered list names
 *   .populate(select, name, opts?)     → fill a <select>; returns item count
 *   .register(name, definition)        → add or replace a list at runtime
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
