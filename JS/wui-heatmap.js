/* =============================================================================
   wui-heatmap.js  —  weoc-ui risk-grid heatmap

   Configurable rows x cols grid rendered as real DOM (CSS grid — not canvas):
   discrete, individually addressable cells that need real hover/focus state
   and accessible text content, unlike the chart family's continuous/animated
   canvas drawing. Board code calls WUI.heatmap() only.

   ── Principles (mirrors wui-charts.js) ──────────────────────────────────────
   • Token-driven: cell colors are interpolated across the library's existing
     semantic severity tokens (--color-success / --color-warning /
     --color-danger), read live via getComputedStyle(document.documentElement)
     at every render — never cached, never hardcoded. Automatically consistent
     across every theme (including future ones) with zero new tokens.
   • Theme-aware: subscribes to wui:themechange once at module level and
     re-renders every registered heatmap inside one requestAnimationFrame,
     same as wui-charts.js's chart/pie/donut/gauge registry.
   • WUI-shaped API: { update, resize, destroy } handle, console.warn + null
     on bad config, never throws.
   • IE11-adjacent compatibility: var, function declarations, no arrow
     functions, no template literals, no destructuring — matches
     wui-charts.js's existing style (WebEOC's embedded browser requires it).

   ── API ──────────────────────────────────────────────────────────────────
   WUI.heatmap(el, opts)
     opts.type        'matrix' (default, only mode implemented in v1) |
                       'calendar' | 'table' (reserved for future variants —
                       validated option values that console.warn + return
                       null rather than crash or silently no-op)
     opts.rows        number — grid row count (configurable, not fixed)
     opts.cols        number — grid column count
     opts.rowLabels   Array<string> (optional) — one label per row
     opts.colLabels   Array<string> (optional) — one label per column
     opts.cells       Array<{ row, col, value, label, tooltip }>
                       One entry per populated cell, addressed by its own
                       row/col (not required to be exhaustive or ordered —
                       any (row, col) missing from this array renders as an
                       empty cell, so partial/malformed data never crashes).
                       value: 0-1 float, interpolated success -> warning ->
                       danger. label: short cell text. tooltip: hover/focus
                       popup text (omit to render a cell with no tooltip).

   Instance handle:
     handle.update(newCells)   Feed a new cells array; re-renders in place.
     handle.resize()           Re-render from current opts/tokens. The grid
                                itself is fluid CSS (percentage columns via
                                --wui-heatmap-cols), so nothing pixel-based
                                needs recalculating — this exists for API
                                parity with the rest of the WUI-shaped handle
                                contract and as a hook for callers that just
                                changed the container's layout.
     handle.destroy()          Remove the rendered grid and unregister.

   ── Error handling ───────────────────────────────────────────────────────
   • opts.type outside 'matrix' / 'calendar' / 'table': console.warn, returns
     null (matches WUI.chart()'s "no crash, returns null, logs a warning"
     convention for its own window.uPlot missing-dependency case).
   • opts.type set to the reserved-but-unimplemented 'calendar' / 'table':
     same console.warn + null return, not a silent no-op and not a crash.
   • Missing/malformed cells data: renders an empty grid with row/col labels
     only (every cell slot empty), no crash.
   ============================================================================= */

(function (root) {
  'use strict';

  /* ── Ensure WUI namespace ─────────────────────────────────────────────────── */
  if (!root.WUI) { root.WUI = {}; }

  /* ── Private state ───────────────────────────────────────────────────────── */

  var _registry   = {};
  var _idCounter  = 0;
  var _ATTR       = 'data-wui-heatmap-id';

  /* 'matrix' is the only implemented mode. 'calendar'/'table' are reserved,
   * validated values (documented in the spec) so the public API doesn't need
   * a breaking change when those variants ship later. */
  var _IMPLEMENTED_TYPES = { matrix: 1 };
  var _RESERVED_TYPES    = { matrix: 1, calendar: 1, table: 1 };

  /* ── Token reader ─────────────────────────────────────────────────────────── */

  /*
   * _tokenMap()
   * Reads resolved values of the CSS custom properties the color scale needs.
   * Called at every render (create/update/resize/re-theme) — never cached —
   * so a theme switch always recomputes from the CURRENT theme's tokens.
   */
  function _tokenMap() {
    var cs = getComputedStyle(document.documentElement);
    function get(prop) { return cs.getPropertyValue(prop).trim(); }
    return {
      success: get('--color-success'),
      warning: get('--color-warning'),
      danger:  get('--color-danger')
    };
  }

  /* ── Color helpers ────────────────────────────────────────────────────────── */

  /*
   * _toRgbChannels(colorStr)
   * Best-effort parse to [r,g,b]. Handles #rrggbb, #rgb, rgb(), rgba() — the
   * same set of formats a resolved CSS custom property can come back as.
   * A private equivalent of wui-charts.js's own helper of the same name:
   * that one lives inside wui-charts.js's closure (not exposed on WUI), so
   * this file carries its own copy rather than reaching into that closure.
   */
  function _toRgbChannels(colorStr) {
    if (!colorStr) { return [0, 0, 0]; }
    if (colorStr.charAt(0) === '#' && colorStr.length === 7) {
      return [
        parseInt(colorStr.slice(1, 3), 16),
        parseInt(colorStr.slice(3, 5), 16),
        parseInt(colorStr.slice(5, 7), 16)
      ];
    }
    if (colorStr.charAt(0) === '#' && colorStr.length === 4) {
      return [
        parseInt(colorStr[1] + colorStr[1], 16),
        parseInt(colorStr[2] + colorStr[2], 16),
        parseInt(colorStr[3] + colorStr[3], 16)
      ];
    }
    var m = colorStr.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
    if (m) { return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]; }
    return [0, 0, 0];
  }

  /*
   * _mixColor(colorA, colorB, ratio)
   * Linear-interpolates between two resolved token colors by `ratio` (0 =
   * colorA, 1 = colorB). Both inputs are live getComputedStyle() results
   * (never literals), so the returned rgb() string always reflects the
   * CURRENT theme — this is what makes the heatmap re-color correctly on
   * every wui:themechange without any hardcoded hex/rgb anywhere in this
   * file.
   */
  function _mixColor(colorA, colorB, ratio) {
    var a = _toRgbChannels(colorA);
    var b = _toRgbChannels(colorB);
    var r = Math.round(a[0] + (b[0] - a[0]) * ratio);
    var g = Math.round(a[1] + (b[1] - a[1]) * ratio);
    var bch = Math.round(a[2] + (b[2] - a[2]) * ratio);
    return 'rgb(' + r + ',' + g + ',' + bch + ')';
  }

  /*
   * _colorForValue(value, tokens)
   * Interpolates a cell's 0-1 value across success -> warning -> danger:
   * the lower half (0 - 0.5) mixes success toward warning, the upper half
   * (0.5 - 1) mixes warning toward danger — a smooth three-stop ramp, not a
   * literal 3-color lookup table, so intermediate values get intermediate
   * colors (per the spec's decision, matching the neon-glow work's existing
   * mix-between-two-tokens technique in wui-charts.js's _lightenColor).
   */
  function _colorForValue(value, tokens) {
    var v = value;
    if (typeof v !== 'number' || isNaN(v)) { v = 0; }
    if (v < 0) { v = 0; }
    if (v > 1) { v = 1; }
    if (v <= 0.5) { return _mixColor(tokens.success, tokens.warning, v / 0.5); }
    return _mixColor(tokens.warning, tokens.danger, (v - 0.5) / 0.5);
  }

  /* ── DOM helpers ──────────────────────────────────────────────────────────── */

  function _resolveEl(el) {
    return typeof el === 'string' ? document.querySelector(el) : (el || null);
  }

  /* Board-authored strings (labels/tooltips) are trusted content, same
   * convention already used by WUI.pie/WUI.donut/WUI.barRow's label/value
   * text in wui-charts.js (inserted via innerHTML with no escaping there
   * either) — this file matches that existing precedent for consistency. */

  /*
   * _fillArray(n, val)
   * ES5-safe equivalent of Array(n).fill(val) — this codebase targets
   * WebEOC's embedded (IE11-adjacent) browser, no Array.prototype.fill.
   */
  function _fillArray(n, val) {
    var arr = [];
    for (var i = 0; i < n; i++) { arr.push(val); }
    return arr;
  }

  /*
   * _cellsToGrid(cells, rows, cols)
   * Builds a rows x cols matrix of cell refs (or null for anything missing)
   * from a flat cells array, reading each cell's own row/col — callers don't
   * need to pre-sort or provide an exhaustive/row-major array. Any entry
   * whose row/col falls outside the configured grid, or is malformed, is
   * silently skipped (never crashes).
   */
  function _cellsToGrid(cells, rows, cols) {
    var grid = [];
    var r;
    for (r = 0; r < rows; r++) { grid.push(_fillArray(cols, null)); }
    if (cells) {
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (!cell) { continue; }
        var cr = cell.row;
        var cc = cell.col;
        if (typeof cr === 'number' && typeof cc === 'number' &&
            cr >= 0 && cr < rows && cc >= 0 && cc < cols) {
          grid[cr][cc] = cell;
        }
      }
    }
    return grid;
  }

  /*
   * _renderGrid(container, opts, tokens)
   * Renders the full grid (corner + col labels + row labels + cells) into
   * `container`, which itself becomes the `.wui-heatmap` grid root — same
   * "container IS the rendered target" pattern WUI.barRow() uses in
   * wui-charts.js (_drawBarRows sets container.innerHTML directly), not a
   * wrapped child element like the canvas-based chart types.
   */
  function _renderGrid(container, opts, tokens) {
    var rows       = opts.rows || 0;
    var cols       = opts.cols || 0;
    var rowLabels  = opts.rowLabels || [];
    var colLabels  = opts.colLabels || [];
    var hasRowLabels = rowLabels.length > 0;
    var hasColLabels = colLabels.length > 0;
    var grid = _cellsToGrid(opts.cells, rows, cols);

    container.classList.add('wui-heatmap');
    if (hasRowLabels) { container.classList.add('has-row-labels'); }
    else { container.classList.remove('has-row-labels'); }
    container.style.setProperty('--wui-heatmap-cols', cols);

    var html = '';
    var r, c;

    if (hasColLabels) {
      if (hasRowLabels) { html += '<div class="wui-heatmap-corner"></div>'; }
      for (c = 0; c < cols; c++) {
        html += '<div class="wui-heatmap-col-label">' + (colLabels[c] != null ? colLabels[c] : '') + '</div>';
      }
    }

    for (r = 0; r < rows; r++) {
      if (hasRowLabels) {
        html += '<div class="wui-heatmap-row-label">' + (rowLabels[r] != null ? rowLabels[r] : '') + '</div>';
      }
      for (c = 0; c < cols; c++) {
        var cell = grid[r][c];
        if (!cell) {
          html += '<div class="wui-heatmap-cell is-empty"></div>';
          continue;
        }
        var color = _colorForValue(cell.value, tokens);
        var attrs = ' tabindex="0" style="--wui-heatmap-cell-color:' + color + '"';
        if (cell.tooltip) {
          attrs += ' data-tooltip="' + String(cell.tooltip).replace(/"/g, '&quot;') + '"';
        }
        html += '<div class="wui-heatmap-cell"' + attrs + '>' +
          (cell.label != null ? cell.label : '') + '</div>';
      }
    }

    container.innerHTML = html;
  }

  /* ── Registry helpers ─────────────────────────────────────────────────────── */

  function _register(id, entry) { _registry[id] = entry; }
  function _unregister(id)      { delete _registry[id]; }
  function _getEntry(id)        { return _registry[id] || null; }

  /* ── Theme change handler (module-level, registered once) ─────────────────── */

  var _themeHandlerBound = false;

  function _onThemeChange() {
    requestAnimationFrame(function () {
      var tokens = _tokenMap();
      var id;
      for (id in _registry) {
        if (!Object.prototype.hasOwnProperty.call(_registry, id)) { continue; }
        var entry = _registry[id];
        _renderGrid(entry.el, entry.opts, tokens);
      }
    });
  }

  function _ensureThemeListener() {
    if (_themeHandlerBound) { return; }
    document.documentElement.addEventListener('wui:themechange', _onThemeChange);
    _themeHandlerBound = true;
  }

  /* ── Public API ───────────────────────────────────────────────────────────── */

  /*
   * WUI.heatmap(el, opts)
   * ─────────────────────
   * Create a risk-grid heatmap inside `el` (el itself becomes the grid root).
   * Returns { update, resize, destroy }, or null if opts.type isn't
   * implemented or el cannot be resolved.
   */
  function heatmap(el, opts) {
    opts = opts || {};
    var type = opts.type || 'matrix';

    if (!_IMPLEMENTED_TYPES[type]) {
      if (root.console && root.console.warn) {
        if (_RESERVED_TYPES[type]) {
          console.warn(
            '[wui-heatmap] WUI.heatmap(): type "' + type + '" is reserved for a ' +
            'future release and not implemented in this version. No heatmap was ' +
            'created. Use type: "matrix" (the default) for now.'
          );
        } else {
          console.warn(
            '[wui-heatmap] WUI.heatmap(): unknown opts.type "' + type + '". ' +
            'Expected "matrix" (default) — "calendar"/"table" are reserved for ' +
            'future variants.'
          );
        }
      }
      return null;
    }

    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-heatmap] WUI.heatmap(): could not resolve element:', el);
      }
      return null;
    }

    var id = container.getAttribute(_ATTR);
    if (!id) {
      _idCounter++;
      id = String(_idCounter);
      container.setAttribute(_ATTR, id);
    }

    _renderGrid(container, opts, _tokenMap());
    _register(id, { el: container, opts: opts });
    _ensureThemeListener();

    var handle = {
      /*
       * update(newCells)
       * Feed a new cells array without recreating the grid. rows/cols/labels
       * stay whatever they were set to at creation.
       */
      update: function (newCells) {
        var e = _getEntry(id);
        if (!e) { return; }
        e.opts.cells = newCells;
        _renderGrid(e.el, e.opts, _tokenMap());
      },

      /*
       * resize()
       * Re-renders from the current opts and freshly-read tokens. The grid
       * is fluid CSS (percentage/1fr columns), so there is no pixel-based
       * canvas to resize — this exists for handle-shape parity and as a
       * hook after external layout changes.
       */
      resize: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        _renderGrid(e.el, e.opts, _tokenMap());
      },

      /*
       * destroy()
       * Removes the rendered grid and unregisters from the theme listener.
       * The module-level wui:themechange listener stays alive (other
       * heatmaps may still be registered) — same convention as
       * wui-charts.js's handle.destroy().
       */
      destroy: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        e.el.innerHTML = '';
        e.el.classList.remove('wui-heatmap', 'has-row-labels');
        e.el.style.removeProperty('--wui-heatmap-cols');
        e.el.removeAttribute(_ATTR);
        _unregister(id);
      }
    };

    return handle;
  }

  /* ── Attach to WUI namespace ──────────────────────────────────────────────── */
  root.WUI.heatmap = heatmap;

}(window));
