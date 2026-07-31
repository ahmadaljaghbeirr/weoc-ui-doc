/* =============================================================================
   wui-kanban.js  —  weoc-ui kanban board component v1

   Board-agnostic drag-and-drop kanban board. Native HTML5 DnD, no library
   dependency. The drag mechanics mirror the proven, real-world implementation
   in eoc-makeover's TaskManagement board (Display - Kanban Tasks view:
   dragstart/dragend/dragover/dragleave/drop on jQuery-delegated handlers,
   dataTransfer.setData('text/plain', cardId), "move the DOM node first, then
   decide" sequencing) — adapted here to vanilla JS event delegation bound
   once per board container (not document-wide), and to a configurable column
   set instead of that board's hardcoded 4 TaskStatus values.

   Board code never owns a confirmation-modal UX to use this component: this
   library only provides the drag mechanics and an opts.onBeforeMove(card,
   fromColumnKey, toColumnKey) hook fired on drop, BEFORE the move commits.
   Returning (or resolving to) false snaps the card back to its origin column;
   anything else (including the hook being entirely omitted) commits the move
   immediately. What a consuming board does inside that hook — show its own
   modal, call a REST endpoint, just return true — is entirely up to it.

   ── Principles ───────────────────────────────────────────────────────────────
   • WUI-shaped API: WUI.kanban(el, opts) → { update, addCard, removeCard,
     destroy }, matching the wui-charts.js factory convention.
   • console.warn + return null on bad config — never throw (matches the
     chart family's established no-crash convention).
   • IE11-adjacent syntax: var, function declarations, no arrow functions, no
     template literals, no destructuring (WebEOC's embedded browser requires
     it) — same constraint wui-charts.js documents. Native Promise USAGE is
     still fine (a runtime feature, not syntax) since opts.onBeforeMove is
     explicitly allowed to return a Promise per the design spec.
   • Delegated DnD listeners are bound ONCE per board container (not
     document-wide) — every render() call only replaces the container's
     innerHTML, so add/remove/update never needs to re-bind anything.

   ── API index ────────────────────────────────────────────────────────────────
   WUI.kanban(el, opts)          Create a kanban board inside a container.
     opts.columns                 [{ key, label }] — required, non-empty.
     opts.cards                   [{ id, columnKey, title, meta, accent }] where
                                   meta may carry { assignee, priority, dueDate }.
                                   accent (optional) is the same color vocabulary
                                   .wui-badge accepts ('primary'|'secondary'|
                                   'success'|'warning'|'danger'|'info'|'tier-1'|
                                   'tier-2'|'tier-3'|'tier-4') — renders as a
                                   left-edge stripe; omitted = no stripe.
     opts.onBeforeMove(card, fromColumnKey, toColumnKey)
                                   Optional. Return/resolve false to reject a
                                   drop (snap back, no commit). Omitted =
                                   always-true (unconditional commit).

   handle.update(newCards)       Replace the full card set. Re-renders.
   handle.addCard(card)          Append one card. Bad columnKey → warn, skip.
   handle.removeCard(id)         Remove one card by id. Re-renders.
   handle.destroy()              Remove listeners + DOM, unregister.

   ── Error handling (per design spec) ────────────────────────────────────────
   • opts.columns missing/empty            → console.warn, factory returns null.
   • card.columnKey not in opts.columns    → card silently omitted from render,
                                              console.warn naming the bad card id.
   • opts.onBeforeMove omitted             → always-true (unconditional commit).

   ============================================================================= */

(function (root) {
  'use strict';

  /* ── Ensure WUI namespace ─────────────────────────────────────────────────── */
  if (!root.WUI) { root.WUI = {}; }

  /* ── Private state ───────────────────────────────────────────────────────── */

  var _registry   = {};
  var _idCounter  = 0;
  var _ATTR       = 'data-wui-kanban-id';

  /* Priority → wui-badge severity, mirrors TaskManagement's statusBadgeClass()/
   * priority mapping (Critical=danger, High=warning, Medium=primary,
   * Low=success), matched case-insensitively since board-supplied data isn't
   * guaranteed to match the reference board's exact casing. */
  var _PRIORITY_BADGE = {
    critical: 'danger',
    high:     'warning',
    medium:   'primary',
    low:      'success'
  };

  /*
   * _ACCENT_VALUES
   * The exact vocabulary opts.cards[].accent accepts — mirrors what
   * .wui-badge already accepts (weoc-labels.css's 6 severity variants +
   * weoc-tier-colors.css's 4 tier variants), so a board author reaching for
   * a card accent never has to learn a second color vocabulary. Not a new
   * palette — same names, same underlying var(--color-*)/var(--tier-*-color)
   * tokens (see weoc-kanban.css's .wui-kanban-card.accent-* rules).
   */
  var _ACCENT_VALUES = {
    primary: 1, secondary: 1, success: 1, warning: 1, danger: 1, info: 1,
    'tier-1': 1, 'tier-2': 1, 'tier-3': 1, 'tier-4': 1
  };

  /* ── Helpers ──────────────────────────────────────────────────────────────── */

  function _resolveEl(el) {
    return typeof el === 'string' ? document.querySelector(el) : (el || null);
  }

  function _register(id, entry) { _registry[id] = entry; }
  function _unregister(id)      { delete _registry[id]; }
  function _getEntry(id)        { return _registry[id] || null; }

  /*
   * _escHtml(s)
   * Minimal HTML-escape for text nodes built via innerHTML string
   * concatenation (title/assignee/dueDate/labels are board-supplied data,
   * not trusted markup).
   */
  function _escHtml(s) {
    if (s === null || s === undefined) { return ''; }
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /*
   * _escAttr(s)
   * Same as _escHtml — used for values placed inside HTML attributes
   * (data-card-id, data-column-key). Kept as a separate name for call-site
   * clarity even though the escaping rules are identical here.
   */
  function _escAttr(s) { return _escHtml(s); }

  /*
   * _priorityBadgeHtml(priority)
   * Returns a .wui-badge span for a card's priority, or '' if no priority
   * was supplied. Reuses the existing badge component/severity convention
   * (weoc-labels.css) rather than inventing new visual language — per the
   * design spec's explicit instruction.
   */
  function _priorityBadgeHtml(priority) {
    if (!priority) { return ''; }
    var key   = String(priority).toLowerCase();
    var sev   = _PRIORITY_BADGE[key] || 'secondary';
    return '<span class="wui-badge ' + sev + '">' + _escHtml(priority) + '</span>';
  }

  /*
   * _cardHtml(card)
   * Builds one .wui-kanban-card element's markup, per the design spec's
   * documented rendered-output shape:
   *   <div class="wui-kanban-card" draggable="true" data-card-id="101">
   *     <div class="wui-kanban-card-title">…</div>
   *     <div class="wui-kanban-card-meta">
   *       <span class="wui-kanban-card-assignee">…</span>
   *       <span class="wui-badge warning">high</span>
   *     </div>
   *   </div>
   * A card-due row is appended when meta.dueDate is supplied — additive to
   * the spec's shape (not a change to it), reusing the same meta-row idea
   * the reference board uses for its own DueDate field.
   *
   * card.accent (optional) renders as a colored left-edge stripe — the same
   * visual recipe .wui-card.has-accent.<color> already uses (weoc-containers.
   * css: a 4px inline-start bar, rounded on the inline-start corners), reused
   * here rather than invented fresh. Omitted/unrecognized accent → no stripe,
   * the card renders exactly as it did before this option existed.
   */
  function _cardHtml(card) {
    var meta      = card.meta || {};
    var assignee  = meta.assignee;
    var priority  = meta.priority;
    var dueDate   = meta.dueDate;

    var metaHtml = '';
    if (assignee) {
      metaHtml += '<span class="wui-kanban-card-assignee">' +
        '<span class="material-symbols-outlined">person</span>' +
        _escHtml(assignee) + '</span>';
    }
    metaHtml += _priorityBadgeHtml(priority);

    var dueHtml = '';
    if (dueDate) {
      dueHtml = '<div class="wui-kanban-card-due">' +
        '<span class="material-symbols-outlined">schedule</span>' +
        _escHtml(dueDate) + '</div>';
    }

    var accentKey = card.accent ? String(card.accent).toLowerCase() : '';
    var accentCls = _ACCENT_VALUES[accentKey] ? (' has-accent accent-' + accentKey) : '';

    return '<div class="wui-kanban-card' + accentCls + '" draggable="true" data-card-id="' + _escAttr(card.id) + '">' +
      '<div class="wui-kanban-card-title">' + _escHtml(card.title) + '</div>' +
      (metaHtml ? '<div class="wui-kanban-card-meta">' + metaHtml + '</div>' : '') +
      dueHtml +
      '</div>';
  }

  /*
   * _validCards(cards, columns)
   * Filters out any card whose columnKey doesn't match a defined column,
   * warning once per bad card (per the design spec's error-handling rule —
   * silently omitted from render, not a crash).
   */
  function _validCards(cards, columnKeys) {
    var out = [];
    cards = cards || [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (!card || !columnKeys[card.columnKey]) {
        if (root.console && root.console.warn) {
          console.warn(
            '[wui-kanban] card "' + (card && card.id) + '" has an unknown columnKey "' +
            (card && card.columnKey) + '" — omitted from render.'
          );
        }
        continue;
      }
      out.push(card);
    }
    return out;
  }

  /*
   * _render(entry)
   * Full rebuild of the container's innerHTML from entry.columns/entry.cards.
   * Safe to call repeatedly — the delegated DnD listeners are bound on the
   * container itself (see _bindDnD), never on individual card/column nodes,
   * so a full re-render never loses drag wiring.
   */
  function _render(entry) {
    var columns = entry.columns;
    var cards   = entry.cards;

    var byCol = {};
    var i;
    for (i = 0; i < columns.length; i++) { byCol[columns[i].key] = []; }
    for (i = 0; i < cards.length; i++) { byCol[cards[i].columnKey].push(cards[i]); }

    var html = '';
    for (i = 0; i < columns.length; i++) {
      var col = columns[i];
      var colCards = byCol[col.key] || [];
      var cardsHtml = '';
      for (var j = 0; j < colCards.length; j++) { cardsHtml += _cardHtml(colCards[j]); }

      html += '<div class="wui-kanban-col" data-column-key="' + _escAttr(col.key) + '">' +
        '<div class="wui-kanban-col-hdr">' +
          '<span class="wui-kanban-col-title">' + _escHtml(col.label) + '</span>' +
          '<span class="wui-kanban-col-count">' + colCards.length + '</span>' +
        '</div>' +
        '<div class="wui-kanban-col-body">' + cardsHtml + '</div>' +
      '</div>';
    }

    entry.el.innerHTML = '<div class="wui-kanban">' + html + '</div>';
  }

  /*
   * _updateCounts(entry)
   * Cheap in-place count refresh (no full re-render) — used right after a
   * drop commits, since the card DOM node has already been moved into place
   * by the drop handler and a full _render() would just redo that same work.
   */
  function _updateCounts(entry) {
    var cols = entry.el.querySelectorAll('.wui-kanban-col');
    for (var i = 0; i < cols.length; i++) {
      var body  = cols[i].querySelector('.wui-kanban-col-body');
      var count = body ? body.querySelectorAll('.wui-kanban-card').length : 0;
      var countEl = cols[i].querySelector('.wui-kanban-col-count');
      if (countEl) { countEl.textContent = String(count); }
    }
  }

  /*
   * _findCard(entry, id)
   * Looks up a card's DATA object (not DOM node) by id, from entry.cards —
   * this is what gets passed to opts.onBeforeMove.
   */
  function _findCard(entry, id) {
    for (var i = 0; i < entry.cards.length; i++) {
      if (String(entry.cards[i].id) === String(id)) { return entry.cards[i]; }
    }
    return null;
  }

  /*
   * _cardEl(entry, id)
   * Looks up a card's DOM node by data-card-id. querySelector's attribute
   * selector needs the value escaped for embedding in a CSS selector string
   * (ids may legitimately contain characters like quotes) — walk the
   * container's cards instead of building a selector string, avoiding any
   * CSS.escape() polyfill requirement.
   */
  function _cardEl(entry, id) {
    var cards = entry.el.querySelectorAll('.wui-kanban-card');
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute('data-card-id') === String(id)) { return cards[i]; }
    }
    return null;
  }

  /*
   * _bindDnD(entry)
   * Binds the five DnD listeners ONCE on the container element (event
   * delegation via closest()), mirroring the reference board's
   * dragstart/dragend/dragover/dragleave/drop sequence and dataTransfer
   * usage, adapted to be column-set-agnostic (no hardcoded colStatusMap).
   * Returns an unbind() function for destroy().
   */
  function _bindDnD(entry) {
    var container   = entry.el;
    var draggedId       = null;
    var draggedCard     = null; /* the DOM node, so drop doesn't need a lookup */
    var draggingClassTO = null; /* pending setTimeout id from onDragStart, see onDragEnd */

    function onDragStart(e) {
      var cardEl = e.target && e.target.closest ? e.target.closest('.wui-kanban-card') : null;
      if (!cardEl || !container.contains(cardEl)) { return; }
      draggedCard = cardEl;
      draggedId   = cardEl.getAttribute('data-card-id');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(draggedId));
      }
      /* Deferred so the browser's native drag-image snapshot is taken BEFORE
       * the dragging class visually alters the card (matches the reference
       * board's setTimeout(fn, 0) sequencing). Tracked so onDragEnd can
       * cancel it — on an abnormally fast drag (e.g. synthetically dispatched
       * events, or a drop resolved by the time this macrotask runs) this
       * would otherwise add the class back AFTER onDragEnd already tried to
       * remove it, leaving the card visibly stuck in its "dragging" look. */
      draggingClassTO = setTimeout(function () {
        draggingClassTO = null;
        if (cardEl) { cardEl.classList.add('wui-kanban-card-dragging'); }
      }, 0);
    }

    function onDragEnd() {
      if (draggingClassTO !== null) { clearTimeout(draggingClassTO); draggingClassTO = null; }
      if (draggedCard) { draggedCard.classList.remove('wui-kanban-card-dragging'); }
      var overs = container.querySelectorAll('.wui-kanban-col-body.is-drag-over');
      for (var i = 0; i < overs.length; i++) { overs[i].classList.remove('is-drag-over'); }
      draggedId   = null;
      draggedCard = null;
    }

    function onDragOver(e) {
      var body = e.target && e.target.closest ? e.target.closest('.wui-kanban-col-body') : null;
      if (!body || !container.contains(body)) { return; }
      e.preventDefault();
      if (e.dataTransfer) { e.dataTransfer.dropEffect = 'move'; }
      body.classList.add('is-drag-over');
    }

    function onDragLeave(e) {
      var body = e.target && e.target.closest ? e.target.closest('.wui-kanban-col-body') : null;
      if (!body || !container.contains(body)) { return; }
      var related = e.relatedTarget;
      if (!related || !body.contains(related)) {
        body.classList.remove('is-drag-over');
      }
    }

    function onDrop(e) {
      var body = e.target && e.target.closest ? e.target.closest('.wui-kanban-col-body') : null;
      if (!body || !container.contains(body)) { return; }
      e.preventDefault();
      body.classList.remove('is-drag-over');
      if (!draggedCard || !draggedId) { return; }

      /* Capture into LOCAL variables before doing anything async. The HTML5
       * DnD spec fires 'dragend' on the source element right after 'drop' —
       * onDragEnd (below) nulls out the shared draggedCard/draggedId as soon
       * as that fires, which happens synchronously in the same task, BEFORE
       * the Promise.resolve(...).then(...) microtask below ever runs. Using
       * the outer draggedCard/draggedId directly inside that microtask would
       * therefore see null and either no-op or throw on every single move —
       * not a corner case, the normal case (caught via synthetic-drag-event
       * testing during development, where the effect is exaggerated but the
       * underlying race is real in native drags too). */
      var movingCard = draggedCard;
      var movingId   = draggedId;

      var fromCol = movingCard.closest('.wui-kanban-col');
      var toCol   = body.closest('.wui-kanban-col');
      if (!fromCol || !toCol) { return; }

      var fromKey = fromCol.getAttribute('data-column-key');
      var toKey   = toCol.getAttribute('data-column-key');
      if (fromKey === toKey) { return; }

      var cardData = _findCard(entry, movingId);
      if (!cardData) { return; }

      /* Move the DOM node into the target column FIRST — mirrors the
       * reference board's own comment: "Move card visually first — cancel
       * will revert if needed". Remember exactly where it came from so a
       * rejected move can put it back in the same position, not just the
       * same column. */
      var originalParent = movingCard.parentNode;
      var originalNext   = movingCard.nextSibling;
      body.appendChild(movingCard);
      _updateCounts(entry);

      var cb     = entry.opts.onBeforeMove;
      var result = cb ? cb(cardData, fromKey, toKey) : true;

      Promise.resolve(result).then(function (ok) {
        if (ok === false) {
          /* Snap back — visibly move the card node back to its original
           * column/position, and flash a rejection cue so the user sees it
           * was declined (not just silently unmoved). */
          if (originalNext && originalNext.parentNode === originalParent) {
            originalParent.insertBefore(movingCard, originalNext);
          } else {
            originalParent.appendChild(movingCard);
          }
          _updateCounts(entry);
          movingCard.classList.add('wui-kanban-card-rejected');
          setTimeout(function () {
            movingCard.classList.remove('wui-kanban-card-rejected');
          }, 500);
        } else {
          cardData.columnKey = toKey;
        }
      });
    }

    container.addEventListener('dragstart', onDragStart);
    container.addEventListener('dragend',   onDragEnd);
    container.addEventListener('dragover',  onDragOver);
    container.addEventListener('dragleave', onDragLeave);
    container.addEventListener('drop',      onDrop);

    return function unbind() {
      container.removeEventListener('dragstart', onDragStart);
      container.removeEventListener('dragend',   onDragEnd);
      container.removeEventListener('dragover',  onDragOver);
      container.removeEventListener('dragleave', onDragLeave);
      container.removeEventListener('drop',      onDrop);
    };
  }

  /* ── Public API ───────────────────────────────────────────────────────────── */

  /*
   * WUI.kanban(el, opts)
   * ────────────────────
   * Create a drag-and-drop kanban board inside a container. Returns
   * { update, addCard, removeCard, destroy }, or null if opts.columns is
   * missing/empty or el cannot be resolved.
   */
  function kanban(el, opts) {
    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-kanban] WUI.kanban(): could not resolve element:', el);
      }
      return null;
    }

    opts = opts || {};

    if (!opts.columns || !opts.columns.length) {
      if (root.console && root.console.warn) {
        console.warn('[wui-kanban] WUI.kanban(): opts.columns is required and must be non-empty.');
      }
      return null;
    }

    /* Tear down any existing instance already mounted on this container. */
    var existingId = container.getAttribute(_ATTR);
    if (existingId) {
      var existing = _getEntry(existingId);
      if (existing && existing.unbindDnD) { existing.unbindDnD(); }
      _unregister(existingId);
    }

    _idCounter++;
    var id = String(_idCounter);
    container.setAttribute(_ATTR, id);

    var columnKeys = {};
    for (var i = 0; i < opts.columns.length; i++) { columnKeys[opts.columns[i].key] = true; }

    var entry = {
      el:      container,
      columns: opts.columns,
      cards:   _validCards(opts.cards, columnKeys),
      opts:    opts
    };

    _render(entry);
    entry.unbindDnD = _bindDnD(entry);
    _register(id, entry);

    var handle = {
      /*
       * update(newCards)
       * Replace the full card set and re-render. Cards with an unknown
       * columnKey are warned about and omitted, same as construction.
       */
      update: function (newCards) {
        var e = _getEntry(id);
        if (!e) { return; }
        var keys = {};
        for (var k = 0; k < e.columns.length; k++) { keys[e.columns[k].key] = true; }
        e.cards = _validCards(newCards, keys);
        _render(e);
      },

      /*
       * addCard(card)
       * Append a single card. Warns + no-ops if its columnKey is unknown.
       */
      addCard: function (card) {
        var e = _getEntry(id);
        if (!e || !card) { return; }
        var keys = {};
        for (var k = 0; k < e.columns.length; k++) { keys[e.columns[k].key] = true; }
        if (!keys[card.columnKey]) {
          if (root.console && root.console.warn) {
            console.warn(
              '[wui-kanban] addCard(): card "' + card.id + '" has an unknown columnKey "' +
              card.columnKey + '" — not added.'
            );
          }
          return;
        }
        e.cards.push(card);
        _render(e);
      },

      /*
       * removeCard(id)
       * Remove a card by id (string/number compared loosely via String()).
       */
      removeCard: function (cardId) {
        var e = _getEntry(id);
        if (!e) { return; }
        var next = [];
        for (var k = 0; k < e.cards.length; k++) {
          if (String(e.cards[k].id) !== String(cardId)) { next.push(e.cards[k]); }
        }
        e.cards = next;
        _render(e);
      },

      /*
       * destroy()
       * Unbind DnD listeners, clear the container, unregister.
       */
      destroy: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        if (e.unbindDnD) { e.unbindDnD(); }
        e.el.innerHTML = '';
        e.el.removeAttribute(_ATTR);
        _unregister(id);
      }
    };

    return handle;
  }

  /* Expose a card-DOM lookup for advanced/debugging use, without polluting
   * the public factory return shape documented above (mirrors how
   * WUI.chart.readTokens() rides on the factory function itself). */
  kanban._cardEl = function (el) {
    var container = _resolveEl(el);
    var id = container && container.getAttribute(_ATTR);
    var entry = id && _getEntry(id);
    return entry;
  };

  /* ── Attach to WUI namespace ──────────────────────────────────────────────── */
  root.WUI.kanban = kanban;

}(window));
