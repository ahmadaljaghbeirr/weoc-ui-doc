/* =============================================================================
   wui-charts.js  —  weoc-ui chart adapter v2

   Adapter layer between board code and uPlot (canvas-based time-series engine,
   ~50 kb) plus raw-canvas pie/donut charts. Board code never imports or
   references uPlot directly — it calls WUI.chart(), WUI.pie(), or WUI.donut()
   only. If the uPlot engine changes in the future, only this file changes;
   every board view stays the same.

   ── Engine ───────────────────────────────────────────────────────────────────
   uPlot 1.6.x   https://github.com/leeoniya/uPlot
   Must be loaded BEFORE this file (for WUI.chart only):
     <script src="https://cdn.jsdelivr.net/npm/uplot@1.6.31/dist/uPlot.iife.min.js"></script>
     <link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.31/dist/uPlot.min.css">
   WUI.pie() and WUI.donut() are dependency-free — raw Canvas 2D only.

   ── Principles ───────────────────────────────────────────────────────────────
   • Token-driven: all colors/fonts are read from CSS custom properties via
     getComputedStyle(document.documentElement). Never hardcode hex values.
   • Theme-aware: subscribes to wui:themechange once at module level and
     re-renders every registered chart inside one requestAnimationFrame.
   • WUI-shaped API: opts mirror WUI idioms, not engine internals.
   • Minimal footprint: WUI.pie / WUI.donut have no library dependency.
   • IE11-adjacent compatibility: var, function declarations, no arrow functions,
     no template literals, no destructuring. WebEOC's embedded browser requires it.

   ── API index ────────────────────────────────────────────────────────────────
   WUI.chart(el, opts)           Create a uPlot time-series chart.
     opts.type                   'line' | 'area' | 'bar' | 'stepped'  (default: 'line')
     opts.series                 Array of { label, color }
     opts.data                   Columnar [[timestamps],[s1],[s2],…]
     opts.height                 px (default: 200)
     opts.cursor                 boolean (default: true)
     opts.legend                 boolean (default: false)
   WUI.chart.readTokens()        Returns resolved CSS token map.

   WUI.pie(el, opts)             Create a raw-canvas pie chart.
   WUI.donut(el, opts)           Create a raw-canvas donut chart.
     opts.data                   Array of { label, value, color }
     opts.height                 px (default: 240)
     opts.legend                 boolean (default: true)
   WUI.donut opts.center         { label, sub } — text overlaid in the hole
   WUI.donut opts.cutout         0..1 inner radius ratio (default: 0.62)

   ── Instance handles ─────────────────────────────────────────────────────────
   All handles expose:
   handle.update(data)           Feed new data; preserves config.
   handle.destroy()              Tear down and unregister.
   WUI.chart handle also exposes:
   handle.resize(w, h)           Resize the canvas.

   ── Semantic color names ─────────────────────────────────────────────────────
   'primary'   → --color-10        'danger'    → --color-danger
   'warning'   → --color-warning   'success'   → --color-success
   'secondary' → --color-secondary

   ── Notes on bar charts ──────────────────────────────────────────────────────
   Uses uPlot.paths.bars() which is bundled in the uPlot IIFE build. Multi-series
   bars render as overlapping semi-transparent fills (same x-position). If you
   need side-by-side grouped bars, set different align values on each series
   manually after creation — that is a board-level concern beyond the adapter's
   scope. For most EOC use cases (comparing magnitudes across a time window),
   overlapping semi-transparent bars read clearly.

   ── Notes on stepped charts ──────────────────────────────────────────────────
   Uses uPlot.paths.stepped({ align: 1 }) — the current value holds from its
   timestamp until the next data point. Ideal for discrete state changes:
   activation levels, resource tiers, status transitions.

   ============================================================================= */

(function (root) {
  'use strict';

  /* ── Ensure WUI namespace ─────────────────────────────────────────────────── */
  if (!root.WUI) { root.WUI = {}; }

  /* ── Private state ───────────────────────────────────────────────────────── */

  /* Unified registry for all chart types.
   * Entry shape:
   *   uPlot:        { type:'uplot',  instance, opts, data, el }
   *   pie / donut:  { type:'pie'|'donut', canvas, legendEl, opts, data, el }
   */
  var _chartRegistry = {};
  var _idCounter     = 0;
  var _ATTR          = 'data-wui-chart-id';

  /* Default palette: cycles through semantic names then tier colors. */
  var _DEFAULT_PALETTE = [
    'primary',
    'warning',
    'success',
    'danger',
    'secondary',
    '--tier-1-color',
    '--tier-2-color',
    '--tier-3-color',
    '--tier-4-color'
  ];

  /* ── Token reader ─────────────────────────────────────────────────────────── */

  /*
   * _tokenMap()
   * Reads resolved values of all CSS custom properties used by charts.
   * Called at chart-create time and at every re-theme.
   */
  function _tokenMap() {
    var cs = getComputedStyle(document.documentElement);
    function get(prop) { return cs.getPropertyValue(prop).trim(); }
    return {
      primary:    get('--color-10'),
      danger:     get('--color-danger'),
      warning:    get('--color-warning'),
      success:    get('--color-success'),
      secondary:  get('--color-secondary'),
      tier1:      get('--tier-1-color'),
      tier2:      get('--tier-2-color'),
      tier3:      get('--tier-3-color'),
      tier4:      get('--tier-4-color'),
      border:     get('--color-border'),
      textSec:    get('--color-text-secondary'),
      bg:         get('--color-bg'),
      text:       get('--color-90'),
      fontFamily: get('--font-body') || 'system-ui, sans-serif',
      textSm:     get('--text-sm')   || '0.875rem'
    };
  }

  /* ── Color helpers ────────────────────────────────────────────────────────── */

  function _resolveColor(colorSpec, tokens) {
    if (!colorSpec) { return tokens.primary; }
    var map = {
      'primary':   tokens.primary,
      'danger':    tokens.danger,
      'warning':   tokens.warning,
      'success':   tokens.success,
      'secondary': tokens.secondary
    };
    if (map[colorSpec] !== undefined) { return map[colorSpec]; }
    if (colorSpec === '--tier-1-color') { return tokens.tier1; }
    if (colorSpec === '--tier-2-color') { return tokens.tier2; }
    if (colorSpec === '--tier-3-color') { return tokens.tier3; }
    if (colorSpec === '--tier-4-color') { return tokens.tier4; }
    return colorSpec;
  }

  function _paletteColor(index, tokens) {
    return _resolveColor(_DEFAULT_PALETTE[index % _DEFAULT_PALETTE.length], tokens);
  }

  /*
   * _alphaColor(colorStr, alpha)
   * Best-effort conversion to rgba for fills.
   * Handles #rrggbb, #rgb, rgb(), rgba().
   */
  function _alphaColor(colorStr, alpha) {
    if (!colorStr) { return 'rgba(0,0,0,' + alpha + ')'; }
    if (colorStr.indexOf('rgba') === 0) {
      return colorStr.replace(/[\d.]+\)$/, alpha + ')');
    }
    if (colorStr.indexOf('rgb') === 0) {
      return colorStr.replace('rgb(', 'rgba(').replace(')', ',' + alpha + ')');
    }
    if (colorStr.charAt(0) === '#' && colorStr.length === 7) {
      var r = parseInt(colorStr.slice(1, 3), 16);
      var g = parseInt(colorStr.slice(3, 5), 16);
      var b = parseInt(colorStr.slice(5, 7), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }
    if (colorStr.charAt(0) === '#' && colorStr.length === 4) {
      var r2 = parseInt(colorStr[1] + colorStr[1], 16);
      var g2 = parseInt(colorStr[2] + colorStr[2], 16);
      var b2 = parseInt(colorStr[3] + colorStr[3], 16);
      return 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',' + alpha + ')';
    }
    return colorStr;
  }

  /* ── uPlot config builder ─────────────────────────────────────────────────── */

  /*
   * _buildConfig(opts, tokens, width)
   * Produces a complete uPlot options object. This is the only function that
   * knows uPlot's config shape — keeps the adapter boundary clean.
   */
  function _buildConfig(opts, tokens, width) {
    var type       = opts.type   || 'line';
    var height     = opts.height || 200;
    var series     = opts.series || [];
    var showCursor = (opts.cursor !== false);
    var showLegend = (opts.legend === true);

    /* Build path renderers once — shared across all series of the same type.
     * Both bars() and stepped() are in the uPlot IIFE bundle (no extra file). */
    var barPathFn     = null;
    var steppedPathFn = null;

    if (type === 'bar' && root.uPlot && root.uPlot.paths && root.uPlot.paths.bars) {
      barPathFn = root.uPlot.paths.bars({ size: [0.6, 64], gap: 1, align: 0 });
    }
    if (type === 'stepped' && root.uPlot && root.uPlot.paths && root.uPlot.paths.stepped) {
      steppedPathFn = root.uPlot.paths.stepped({ align: 1 });
    }

    /* Index 0 is always the x-axis (timestamps) — uPlot convention. */
    var uSeries = [{}];

    for (var i = 0; i < series.length; i++) {
      var spec  = series[i];
      var color = spec.color
        ? _resolveColor(spec.color, tokens)
        : _paletteColor(i, tokens);

      var entry = {
        label:  spec.label || ('Series ' + (i + 1)),
        stroke: color,
        width:  2
      };

      if (type === 'area') {
        entry.fill = _alphaColor(color, 0.15);
      }

      if (type === 'bar') {
        if (barPathFn) {
          /* Semi-transparent fill when multiple series overlap */
          entry.paths  = barPathFn;
          entry.fill   = _alphaColor(color, series.length > 1 ? 0.72 : 0.88);
          entry.points = { show: false };
        }
        /* No paths available → falls through as a line silently */
      }

      if (type === 'stepped' && steppedPathFn) {
        entry.paths  = steppedPathFn;
        entry.points = { show: false };
      }

      uSeries.push(entry);
    }

    var uFont = '400 12px ' + tokens.fontFamily;

    return {
      width:      width,
      height:     height,
      cursor:     { show: showCursor },
      legend:     { show: showLegend },
      series:     uSeries,
      axes: [
        {
          stroke:    tokens.textSec,
          grid:      { stroke: tokens.border, width: 1 },
          ticks:     { stroke: tokens.border, width: 1 },
          font:      uFont,
          labelFont: uFont
        },
        {
          stroke:    tokens.textSec,
          grid:      { stroke: tokens.border, width: 1 },
          ticks:     { stroke: tokens.border, width: 1 },
          font:      uFont,
          labelFont: uFont
        }
      ],
      background: 'transparent',
      padding:    [8, 12, 4, 8]
    };
  }

  /* ── Pie / Donut canvas drawing ───────────────────────────────────────────── */

  /*
   * _drawPieCanvas(canvas, data, opts, tokens)
   * Renders a pie or donut chart onto `canvas`.
   * Pie:   opts.cutout === 0 (or absent)
   * Donut: opts.cutout 0..1 (inner radius ratio)
   */
  function _drawPieCanvas(canvas, data, opts, tokens) {
    var ctx = canvas.getContext('2d');
    var W   = canvas.width;
    var H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!data || !data.length) { return; }

    var total = 0;
    for (var j = 0; j < data.length; j++) { total += (data[j].value || 0); }
    if (total === 0) { return; }

    var cutout = opts.cutout !== undefined ? opts.cutout : 0;
    var margin = 14;
    var cx     = W / 2;
    var cy     = H / 2;
    var r      = Math.min(cx, cy) - margin;
    if (r < 8) { return; }
    var innerR = r * cutout;

    var startAngle = -Math.PI / 2; /* 12 o'clock */

    for (var i = 0; i < data.length; i++) {
      var slice = data[i];
      var sweep = (slice.value / total) * Math.PI * 2;
      var color = _resolveColor(
        slice.color || _DEFAULT_PALETTE[i % _DEFAULT_PALETTE.length],
        tokens
      );

      ctx.beginPath();
      if (cutout > 0) {
        ctx.arc(cx, cy, r,      startAngle,         startAngle + sweep);
        ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle,         true);
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      /* Thin slice separator using surface background — no visible border line */
      ctx.strokeStyle = tokens.bg || '#ffffff';
      ctx.lineWidth   = 2;
      ctx.stroke();

      startAngle += sweep;
    }

    /* Center text overlay (donut only) */
    if (cutout > 0 && opts.center) {
      var cLabel = opts.center.label || '';
      var cSub   = opts.center.sub   || '';
      var ff     = tokens.fontFamily || 'system-ui,sans-serif';
      var hasBoth = cLabel && cSub;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      if (cLabel) {
        var labelSize = Math.round(r * 0.30);
        ctx.font      = '700 ' + labelSize + 'px ' + ff;
        ctx.fillStyle = tokens.text || tokens.textSec || '#1a1a1a';
        ctx.fillText(cLabel, cx, cy - (hasBoth ? Math.round(labelSize * 0.55) : 0));
      }
      if (cSub) {
        var subSize   = Math.round(r * 0.17);
        ctx.font      = '400 ' + subSize + 'px ' + ff;
        ctx.fillStyle = tokens.textSec || '#64748b';
        ctx.fillText(cSub, cx, cy + Math.round(r * 0.22));
      }
    }
  }

  /*
   * _renderPieLegend(legendEl, data, tokens)
   * Builds inline HTML for the slice legend below the canvas.
   */
  function _renderPieLegend(legendEl, data, tokens) {
    var total = 0;
    for (var j = 0; j < data.length; j++) { total += (data[j].value || 0); }

    var mainColor = tokens.text || tokens.textSec || '#1a1a1a';
    var secColor  = tokens.textSec || '#64748b';

    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px;font-size:12px;line-height:1.6;">';
    for (var i = 0; i < data.length; i++) {
      var slice = data[i];
      var pct   = total > 0 ? Math.round((slice.value / total) * 100) : 0;
      var color = _resolveColor(
        slice.color || _DEFAULT_PALETTE[i % _DEFAULT_PALETTE.length],
        tokens
      );
      html +=
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="width:10px;height:10px;border-radius:50%;background:' + color +
                ';flex-shrink:0;display:inline-block;"></span>' +
          '<span style="color:' + secColor + ';">' + (slice.label || '') + '</span>' +
          '<span style="color:' + mainColor + ';font-weight:600;">' + pct + '%</span>' +
        '</div>';
    }
    html += '</div>';
    legendEl.innerHTML = html;
  }

  /* ── Registry helpers ─────────────────────────────────────────────────────── */

  function _register(id, entry) { _chartRegistry[id] = entry; }
  function _unregister(id)      { delete _chartRegistry[id]; }
  function _getEntry(id)        { return _chartRegistry[id] || null; }

  function _resolveEl(el) {
    return typeof el === 'string' ? document.querySelector(el) : (el || null);
  }

  /* ── Theme change handler (module-level, registered once) ─────────────────── */

  var _themeHandlerBound = false;

  function _onThemeChange() {
    requestAnimationFrame(function () {
      var tokens = _tokenMap();
      var id;
      for (id in _chartRegistry) {
        if (!Object.prototype.hasOwnProperty.call(_chartRegistry, id)) { continue; }
        _rethemeChart(id, tokens);
      }
    });
  }

  /*
   * _rethemeChart(id, tokens)
   * Branches on entry.type:
   *   pie/donut → redraw canvas in place (no instance teardown)
   *   uplot     → destroy + recreate with new tokens
   */
  function _rethemeChart(id, tokens) {
    var entry = _getEntry(id);
    if (!entry) { return; }

    if (entry.type === 'pie' || entry.type === 'donut') {
      _drawPieCanvas(entry.canvas, entry.data, entry.opts, tokens);
      if (entry.legendEl) { _renderPieLegend(entry.legendEl, entry.data, tokens); }
      return;
    }

    /* uPlot: destroy + recreate — it does not support live config changes */
    if (!entry.instance) { return; }
    var oldInstance = entry.instance;
    var width       = oldInstance.width;
    oldInstance.destroy();
    var config     = _buildConfig(entry.opts, tokens, width);
    entry.instance = new root.uPlot(config, entry.data, entry.el);
  }

  function _ensureThemeListener() {
    if (_themeHandlerBound) { return; }
    document.documentElement.addEventListener('wui:themechange', _onThemeChange);
    _themeHandlerBound = true;
  }

  /* ── Public API ───────────────────────────────────────────────────────────── */

  /*
   * WUI.chart(el, opts)
   * ─────────────────
   * Create a uPlot time-series chart. Returns { update, resize, destroy }.
   * Returns null if uPlot is unavailable or el cannot be resolved.
   */
  function chart(el, opts) {
    if (typeof root.uPlot === 'undefined') {
      if (root.console && root.console.warn) {
        console.warn(
          '[wui-charts] WUI.chart() called but window.uPlot is not defined. ' +
          'Load uPlot before wui-charts.js:\n' +
          '  <script src="https://cdn.jsdelivr.net/npm/uplot@1.6.31/dist/uPlot.iife.min.js"><\/script>'
        );
      }
      return null;
    }

    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-charts] WUI.chart(): could not resolve element:', el);
      }
      return null;
    }

    opts = opts || {};

    var id = container.getAttribute(_ATTR);
    if (!id) {
      _idCounter++;
      id = String(_idCounter);
      container.setAttribute(_ATTR, id);
    }

    var existing = _getEntry(id);
    if (existing && existing.instance) {
      existing.instance.destroy();
      _unregister(id);
    }

    var width  = opts.width ? parseInt(opts.width, 10) : (container.offsetWidth || 400);
    var tokens = _tokenMap();
    var data   = opts.data || [[], []];
    var config = _buildConfig(opts, tokens, width);

    var instance = new root.uPlot(config, data, container);

    _register(id, {
      type:     'uplot',
      instance: instance,
      opts:     opts,
      data:     data,
      el:       container
    });
    _ensureThemeListener();

    var handle = {
      /*
       * update(data)
       * Feed new columnar data without recreating the chart.
       */
      update: function (newData) {
        var e = _getEntry(id);
        if (!e || !e.instance) { return; }
        e.data = newData;
        e.instance.setData(newData);
      },

      /*
       * resize(w, h)
       * Resize the canvas. Use after layout changes (split panel open/close).
       */
      resize: function (w, h) {
        var e = _getEntry(id);
        if (!e || !e.instance) { return; }
        e.instance.setSize({ width: w, height: h });
      },

      /*
       * destroy()
       * Full teardown. Module-level theme listener stays alive (other charts
       * may still be registered); it short-circuits when the registry is empty.
       */
      destroy: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        if (e.instance) { e.instance.destroy(); }
        container.removeAttribute(_ATTR);
        _unregister(id);
      }
    };

    return handle;
  }

  /* WUI.chart.readTokens() — exposes token map for debugging / custom legends. */
  chart.readTokens = function () { return _tokenMap(); };

  /* ── Shared pie / donut factory ───────────────────────────────────────────── */

  function _createPieOrDonut(type, el, opts) {
    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-charts] WUI.' + type + '(): could not resolve element:', el);
      }
      return null;
    }

    opts = opts || {};

    /* Default cutout for donut */
    if (type === 'donut' && opts.cutout === undefined) { opts.cutout = 0.62; }

    var data       = opts.data   || [];
    var height     = opts.height || 240;
    var showLegend = (opts.legend !== false);

    var id = container.getAttribute(_ATTR);
    if (!id) {
      _idCounter++;
      id = String(_idCounter);
      container.setAttribute(_ATTR, id);
    }

    /* Tear down any existing instance in this container */
    var existing = _getEntry(id);
    if (existing) {
      if (existing.canvas && existing.canvas.parentNode) {
        existing.canvas.parentNode.removeChild(existing.canvas);
      }
      if (existing.legendEl && existing.legendEl.parentNode) {
        existing.legendEl.parentNode.removeChild(existing.legendEl);
      }
      _unregister(id);
    }

    /* Canvas — pixel-exact size; offsetWidth fallback for hidden containers */
    var canvas    = document.createElement('canvas');
    canvas.width  = container.offsetWidth || 320;
    canvas.height = height;
    canvas.style.display = 'block';
    canvas.style.width   = '100%';
    container.appendChild(canvas);

    /* HTML legend below canvas */
    var legendEl = null;
    if (showLegend) {
      legendEl = document.createElement('div');
      container.appendChild(legendEl);
    }

    var tokens = _tokenMap();
    _drawPieCanvas(canvas, data, opts, tokens);
    if (legendEl) { _renderPieLegend(legendEl, data, tokens); }

    _register(id, {
      type:     type,
      canvas:   canvas,
      legendEl: legendEl,
      opts:     opts,
      data:     data,
      el:       container
    });
    _ensureThemeListener();

    return {
      update: function (newData) {
        var e = _getEntry(id);
        if (!e) { return; }
        e.data = newData;
        var t = _tokenMap();
        _drawPieCanvas(e.canvas, newData, e.opts, t);
        if (e.legendEl) { _renderPieLegend(e.legendEl, newData, t); }
      },
      destroy: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        if (e.canvas && e.canvas.parentNode) { e.canvas.parentNode.removeChild(e.canvas); }
        if (e.legendEl && e.legendEl.parentNode) { e.legendEl.parentNode.removeChild(e.legendEl); }
        container.removeAttribute(_ATTR);
        _unregister(id);
      }
    };
  }

  /*
   * WUI.pie(el, opts)
   * ─────────────────
   * Raw-canvas pie chart. No uPlot dependency.
   * opts.data  = [{ label, value, color }, ...]
   */
  function pie(el, opts) {
    return _createPieOrDonut('pie', el, opts);
  }

  /*
   * WUI.donut(el, opts)
   * ───────────────────
   * Raw-canvas donut chart. Calls pie() internally with a cutout ratio.
   * opts.cutout  = 0..1 inner radius fraction (default 0.62)
   * opts.center  = { label, sub } — text overlaid in the hole
   */
  function donut(el, opts) {
    return _createPieOrDonut('donut', el, opts);
  }

  /* ── Attach to WUI namespace ──────────────────────────────────────────────── */
  root.WUI.chart = chart;
  root.WUI.pie   = pie;
  root.WUI.donut = donut;

}(window));
