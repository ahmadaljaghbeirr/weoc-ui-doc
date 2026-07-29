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
     opts.neon                   false (default) | true | severity name — opt-in glow,
                                  see "Neon glow" below
   WUI.chart.readTokens()        Returns resolved CSS token map.

   WUI.pie(el, opts)             Create a raw-canvas pie chart.
   WUI.donut(el, opts)           Create a raw-canvas donut chart.
     opts.data                   Array of { label, value, color }
     opts.height                 px (default: 240)
     opts.legend                 boolean (default: true)
     opts.neon                   false (default) | true — opt-in glow, per-slice, each in
                                  that slice's own color, see "Neon glow" below
   WUI.donut opts.center         { label, sub } — text overlaid in the hole
   WUI.donut opts.cutout         0..1 inner radius ratio (default: 0.62)

   WUI.gauge(el, opts)           Create a semi-circle threshold gauge.
     opts.value                   0..100 (clamped)
     opts.zones                   [{ to, color }] threshold bands
                                   (default: <40 danger, <70 warning, else success)
     opts.status                  pre-localized status string (board owns i18n, same as
                                   donut's opts.center — the engine never calls WUI.i18n itself)
     opts.height                  px (default: 140)
     opts.neon                    false (default) | true — opt-in glow, per-zone-band, each in
                                   that zone's own color, see "Neon glow" below

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

   ── Neon glow (opts.neon) ────────────────────────────────────────────────────
   Opt-in only — omitted/false opts.neon changes nothing about a chart's default
   appearance. Two different flavors depending on the component:

   WUI.pie() / WUI.donut() / WUI.gauge() / WUI.barRow() — opts.neon is a
   plain boolean. Each slice / zone-band / segment glows in ITS OWN
   already-assigned color (not one blanket color for the whole chart), and
   the glow stays INSIDE that slice's / band's / segment's own silhouette —
   no outer halo bleeding onto the page/card behind it, same "refracted from
   behind" intent as .wui-plane.neon (weoc-containers.css). Pie/donut and
   gauge's zone bands achieve the inward-only look via a Canvas 2D
   clip-then-stroke trick (clip to the shape's own path/annulus-segment,
   then stroke that same path with a wider, blurred line — only the portion
   of the blur that falls inside the clip survives). barRow achieves it with
   a real `box-shadow: inset ...` per segment, since it's plain DOM, not
   canvas. All four use a lightened (toward-white) tint for the actual glow
   color, not the exact base color — a same-hue shadow against an
   already-that-color, mostly-opaque fill/stroke is nearly invisible
   (verified by direct pixel sampling during this work).
     opts.neon === false | undefined (default)   No glow.
     opts.neon === true (or any truthy value)     Glow, per-slice/-band/-segment color.

   WUI.chart() — opts.neon still mirrors the `.neon-outline` convention on
   buttons/fabs (weoc-interactive.css): ONE glow color for the whole chart,
   keyed to a severity, using that severity's `--color-{name}-glow` token
   from agency-theme.css. (The odd one out — uPlot renders its own canvas
   internally, so the adapter can't reach individual series' stroke calls to
   glow each one in its own color the way the other four components do.)
     opts.neon === false | undefined   No glow (default).
     opts.neon === true                Glow using 'primary' (--color-10-glow).
     opts.neon === 'primary'|'secondary'|'success'|'warning'|'danger'|'info'
                                        Glow using that severity's glow token.
   The glow is a CSS class toggled on the host container
   (`wui-chart-neon-{severity}`, see weoc-charts.css) that applies
   `filter: drop-shadow(...)` to the canvas uPlot renders inside it.

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

  /* Default gauge zones: red/orange/green thresholds, matches the previous
   * bespoke event-gauge.css bands (<40 danger, <70 warning, else success). */
  var _DEFAULT_GAUGE_ZONES = [
    { to: 40, color: 'danger' },
    { to: 70, color: 'warning' },
    { to: 100, color: 'success' }
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
      info:       get('--color-info'),
      /* Neon glow tokens — already rgba() with alpha baked in (agency-theme.css),
       * used verbatim as ctx.shadowColor / var() inside filter: drop-shadow(). */
      glowPrimary:   get('--color-10-glow'),
      glowDanger:    get('--color-danger-glow'),
      glowWarning:   get('--color-warning-glow'),
      glowSuccess:   get('--color-success-glow'),
      glowSecondary: get('--color-secondary-glow'),
      glowInfo:      get('--color-info-glow'),
      tier1:      get('--tier-1-color'),
      tier2:      get('--tier-2-color'),
      tier3:      get('--tier-3-color'),
      tier4:      get('--tier-4-color'),
      border:     get('--color-border'),
      textSec:    get('--color-text-secondary'),
      bg:         get('--color-bg'),
      text:       get('--color-text-primary'),
      fontFamily: get('--font-body') || 'system-ui, sans-serif',
      textSm:     get('--text-sm')   || '0.875rem'
    };
  }

  /*
   * _fitCanvasToBox(canvas, cssW, cssH)
   * Sizes a canvas's backing store for devicePixelRatio correctness and syncs
   * its CSS box to match. Setting canvas.width/height resets the 2D context's
   * transform to identity (per spec), so re-applying ctx.setTransform here on
   * every call is safe — it never compounds across repeated resizes/redraws.
   */
  function _fitCanvasToBox(canvas, cssW, cssH) {
    var dpr = root.devicePixelRatio || 1;
    canvas.width  = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    if (ctx && ctx.setTransform) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  }

  /* ── Color helpers ────────────────────────────────────────────────────────── */

  function _resolveColor(colorSpec, tokens) {
    if (!colorSpec) { return tokens.primary; }
    var map = {
      'primary':   tokens.primary,
      'danger':    tokens.danger,
      'warning':   tokens.warning,
      'success':   tokens.success,
      'secondary': tokens.secondary,
      'info':      tokens.info
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
   * _resolveGlowColor(neonSpec, tokens)
   * opts.neon accepts true (→ 'primary') or one of the six severity names.
   * Returns the resolved --color-{name}-glow token (already rgba(), see
   * _tokenMap). Unknown/missing severities fall back to primary, same as
   * _resolveColor's fallback behavior.
   */
  function _resolveGlowColor(neonSpec, tokens) {
    var key = (typeof neonSpec === 'string') ? neonSpec : 'primary';
    var map = {
      primary:   tokens.glowPrimary,
      secondary: tokens.glowSecondary,
      success:   tokens.glowSuccess,
      warning:   tokens.glowWarning,
      danger:    tokens.glowDanger,
      info:      tokens.glowInfo
    };
    return map[key] || tokens.glowPrimary;
  }

  /*
   * _neonClassFor(neonSpec, prefix)
   * Returns `prefix + severity` (weoc-charts.css) for a given opts.neon value,
   * or null when neon is falsy (opt-in — no class means no visual change).
   * Shared by WUI.chart() ('wui-chart-neon-') and WUI.barRow()
   * ('wui-barrow-neon-') — both toggle a class on a plain host container
   * rather than drawing to Canvas 2D, so the class-name prefix is the only
   * thing that differs between them.
   */
  function _neonClassFor(neonSpec, prefix) {
    if (!neonSpec) { return null; }
    var key = (typeof neonSpec === 'string') ? neonSpec : 'primary';
    var valid = { primary:1, secondary:1, success:1, warning:1, danger:1, info:1 };
    if (!valid[key]) { key = 'primary'; }
    return prefix + key;
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

  /*
   * _toRgbChannels(colorStr)
   * Best-effort parse to [r,g,b], reused by _lightenColor. Handles the same
   * set of formats _alphaColor does (#rrggbb, #rgb, rgb(), rgba()).
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
   * _lightenColor(colorStr, ratio)
   * Mixes colorStr toward white by `ratio` (0 = unchanged, 1 = pure white).
   * Used for the neon "inward glow" on pie/donut slices and gauge zones: a
   * same-color shadow on an already fully-opaque same-color fill is nearly
   * invisible (nothing to contrast against), so the glow stroke uses this
   * lightened tint instead — reads as a soft rim-light bleeding in from the
   * slice's own edge, closer to "light source behind it, refracting through"
   * than a flat re-statement of the exact same color would.
   */
  function _lightenColor(colorStr, ratio) {
    var c = _toRgbChannels(colorStr);
    var r = Math.round(c[0] + (255 - c[0]) * ratio);
    var g = Math.round(c[1] + (255 - c[1]) * ratio);
    var b = Math.round(c[2] + (255 - c[2]) * ratio);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
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
    /* canvas.width/height are the DEVICE-pixel backing store (cssW*dpr, set by
     * _fitCanvasToBox). ctx already carries a setTransform(dpr,...) from that
     * same call, so every coordinate handed to ctx from here on is expected in
     * CSS-pixel space — the transform re-scales it to the backing store. Using
     * the raw device-pixel canvas.width/height as W/H here double-applies dpr:
     * on any DPR!=1 display the circle's center/radius land outside the CSS
     * box and get clipped by the canvas's own buffer edge. Divide back to
     * CSS-pixel space first. */
    var dpr = root.devicePixelRatio || 1;
    var W   = canvas.width  / dpr;
    var H   = canvas.height / dpr;
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

    /* Gap between slices is a small transparent notch cut from each slice's
     * own sweep, NOT a solid stroke — a stroke needs a color to blend into,
     * but the canvas sits on whatever card/page background the board uses
     * (which can differ from the --color-bg token, e.g. dark theme's card
     * is --color-30 #282828 while --color-bg is --color-60 #161616 —
     * stroking with --color-bg drew a visibly darker/near-black seam on
     * top of the lighter card). A gap has nothing to stroke, so it's
     * correct against any surface automatically. */
    var gap = data.length > 1 ? 0.02 : 0;

    /* opts.neon (opt-in, default falsy — no glow, no appearance change unless
     * a caller explicitly asks for it). See "Neon glow" header comment.
     * Each slice glows in ITS OWN color (not one blanket severity color for
     * the whole chart) — resolved per-iteration below from that slice's own
     * `color`, same value already used for its fill. The glow also stays
     * INSIDE the slice, never bleeding onto the page/card behind it: after
     * filling normally, the same path is clipped (ctx.clip() operates on
     * whatever path is currently set) and a second, wider glow-stroke is
     * drawn along that same path — since it's clipped to the slice's own
     * silhouette, only the inward-facing half of that stroke (and its blur)
     * survives, reading as an inner glow along the slice's edges instead of
     * an outer halo. Mirrors the refracted-glow technique used for
     * .wui-plane.neon (weoc-containers.css), adapted to Canvas 2D. */
    var neonOn = !!opts.neon;

    for (var i = 0; i < data.length; i++) {
      var slice = data[i];
      var sweep = (slice.value / total) * Math.PI * 2;
      var endAngle = startAngle + sweep - (sweep > gap * 2 ? gap : 0);
      var color = _resolveColor(
        slice.color || _DEFAULT_PALETTE[i % _DEFAULT_PALETTE.length],
        tokens
      );

      ctx.beginPath();
      if (cutout > 0) {
        ctx.arc(cx, cy, r,      startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle,   startAngle, true);
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
      }
      ctx.closePath();
      /* Neon step 1: translucent low-opacity fill — same alpha as the real
       * --color-{name}-light tokens (agency-theme.css, ~0.08-0.12), applied
       * via _alphaColor rather than a token lookup since slice colors are
       * often literal hex, not severity names. Regular (non-neon) slices
       * stay fully vivid/opaque, unchanged. */
      ctx.fillStyle = neonOn ? _alphaColor(color, 0.12) : color;
      ctx.fill();

      /* Neon step 2: a soft glow INSIDE the section, on top of the
       * translucent fill above. Clip to the slice's own path (still current
       * from the fill/closePath above) then stroke that same path with
       * shadowBlur — clipping confines the blur to this slice's own
       * silhouette, so it never bleeds onto neighboring slices or the page
       * behind the donut. */
      if (neonOn) {
        ctx.save();
        ctx.clip();
        ctx.lineWidth   = Math.max(2, r * 0.05);
        ctx.strokeStyle = color;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.restore();
      }

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
   * _drawGaugeCanvas(canvas, opts, tokens)
   * Renders a semi-circle threshold gauge (background track + colored zone
   * bands + needle + center value text) onto `canvas`. Returns the resolved
   * color of the zone the current value falls in (the "active" color),
   * which the caller uses to color the status chip below the canvas.
   */
  function _drawGaugeCanvas(canvas, opts, tokens) {
    var ctx = canvas.getContext('2d');
    /* Same DPR double-scale issue as _drawPieCanvas — see comment there. */
    var dpr = root.devicePixelRatio || 1;
    var W   = canvas.width  / dpr;
    var H   = canvas.height / dpr;
    ctx.clearRect(0, 0, W, H);

    var value = Math.max(0, Math.min(opts.value || 0, 100));
    var zones = opts.zones || _DEFAULT_GAUGE_ZONES;

    var margin = 10;
    var cx = W / 2;
    var cy = H - margin;
    var r  = Math.min(W / 2, H) - margin - 8;
    if (r < 20) { return tokens.primary; }
    var trackWidth = Math.max(6, r * 0.22);

    /* The arc's peak sits at (cx, cy - r); its stroke extends trackWidth/2
     * beyond that path in every direction. If cy - r is smaller than that
     * half-width, the stroke's outer edge pokes above y=0 and gets clipped
     * by the tile — happened in practice once `height` was tuned down.
     * One corrective pass keeps this safe at any height/width combination. */
    var topOverflow = (trackWidth / 2) - (cy - r);
    if (topOverflow > 0) {
      r -= topOverflow;
      trackWidth = Math.max(6, r * 0.22);
    }

    /* Background track — full semicircle, left (180deg) to right (360deg) */
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
    ctx.strokeStyle = tokens.border;
    ctx.lineWidth   = trackWidth;
    ctx.lineCap     = 'butt';
    ctx.stroke();

    /* opts.neon (opt-in, default falsy — no glow, no appearance change unless
     * a caller explicitly asks for it): plain boolean, same shape as
     * pie/donut/barRow (NOT the severity-keyed shape WUI.chart() still uses —
     * a gauge's zones/needle already each have their own meaningful color,
     * same as a pie's slices, so there's no need for a single blanket
     * override color here either). Each zone band glows in ITS OWN color,
     * clipped to stay entirely inside that band's own annulus-segment area
     * (built from inner/outer radius arcs) so nothing bleeds onto the grey
     * background track or past the gauge's outer edge — same clip-then-
     * stroke technique _drawPieCanvas uses, adapted for a stroked ring
     * segment instead of a filled wedge. Uses the lightened (toward-white)
     * tint for the actual glow color, same reason as pie/donut/barRow: a
     * same-hue shadow against an already-that-color band is nearly
     * invisible. The grey background track itself is left alone — nothing
     * meaningful to tint. */
    var neonOn = !!opts.neon;

    /* Zone bands */
    var prevTo = 0;
    var i;
    for (i = 0; i < zones.length; i++) {
      var zone       = zones[i];
      var zoneColor  = _resolveColor(zone.color, tokens);
      var startAngle = Math.PI + (prevTo / 100) * Math.PI;
      var endAngle   = Math.PI + (zone.to  / 100) * Math.PI;

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      /* Neon step 1: translucent low-opacity body — same alpha as the real
       * --color-{name}-light tokens (~0.12), same recipe as
       * _drawPieCanvas's slices. Regular (non-neon) bands stay fully vivid,
       * unchanged. */
      ctx.strokeStyle = neonOn ? _alphaColor(zoneColor, 0.12) : zoneColor;
      ctx.lineWidth   = trackWidth;
      ctx.lineCap     = 'butt';
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;

      /* Neon step 2: a thin glow tracing the band's FULL perimeter (outer
       * arc, inner arc, and the two straight radial end-caps where it
       * meets neighboring bands) — same technique as the pie/donut slices:
       * clip to the section's own closed shape, then stroke that SAME
       * current path (not a separate offset arc), so the accent surrounds
       * the whole section instead of hugging just one edge. */
      if (neonOn) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r + trackWidth / 2, startAngle, endAngle);
        ctx.arc(cx, cy, r - trackWidth / 2, endAngle, startAngle, true);
        ctx.closePath();
        ctx.clip();
        ctx.strokeStyle = zoneColor;
        ctx.lineWidth   = Math.max(2, trackWidth * 0.15);
        ctx.shadowBlur  = 8;
        ctx.shadowColor = zoneColor;
        ctx.stroke();
        ctx.restore();
      }

      prevTo = zone.to;
    }

    /* Active zone = first zone whose "to" threshold the value doesn't exceed */
    var activeColor = tokens.primary;
    for (i = 0; i < zones.length; i++) {
      activeColor = _resolveColor(zones[i].color, tokens);
      if (value <= zones[i].to) { break; }
    }

    /* Needle */
    var needleAngle = Math.PI + (value / 100) * Math.PI;
    var needleLen   = r - trackWidth * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    if (neonOn) { ctx.shadowBlur = 8; ctx.shadowColor = _lightenColor(activeColor, 0.55); }
    ctx.stroke();
    if (neonOn) { ctx.shadowBlur = 0; }

    /* Hub — flat filled dot, no outline stroke. A stroke needs a color to
     * blend into the surrounding card, but the canvas doesn't know the
     * card's actual background (only the page-level --color-bg token,
     * which reads visibly darker than the card in dark theme) — same
     * reasoning as the donut's slice gaps above. */
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();

    /* Center value text */
    var ff        = tokens.fontFamily || 'system-ui,sans-serif';
    var valueSize = Math.round(r * 0.34);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font      = '800 ' + valueSize + 'px ' + ff;
    ctx.fillStyle = tokens.text || '#1a1a1a';
    ctx.fillText(value + '%', cx, cy - r * 0.16);

    return activeColor;
  }

  /*
   * _renderGaugeStatus(statusEl, opts, activeColor)
   * Writes the status chip below the gauge canvas. Uses the existing
   * .wui-chip component (already part of the shared CSS fleet) with its
   * documented inline-custom-property override API, matching how
   * _renderPieLegend already writes self-contained inline-styled markup
   * rather than depending on a chart-specific CSS file.
   */
  function _renderGaugeStatus(statusEl, opts, activeColor) {
    if (!statusEl) { return; }
    var bg     = _alphaColor(activeColor, 0.14);
    var border = _alphaColor(activeColor, 0.3);
    statusEl.innerHTML =
      '<span class="wui-chip wui-chip-sm" style="margin-top:8px;--wui-chip-bg:' + bg +
      ';--wui-chip-border:' + border + ';--wui-chip-text:' + activeColor + ';">' +
      (opts.status || '') +
      '</span>';
  }

  /*
   * _drawBarRows(container, rows, tokens, neon)
   * Renders `.wui-bar-row` markup. Each segment is its own absolutely-
   * positioned child span inside `.fill` (left/width % matching its slot in
   * the row), not a single shared gradient background — this is what lets
   * `neon` give EACH segment its own glow, in that segment's own color,
   * rather than one blanket color for the whole bar (there is no way to
   * attach a per-stop shadow to a single-element CSS gradient).
   *
   * neon (opt-in, default falsy — no glow, no appearance change unless a
   * caller explicitly asks for it): each segment gets an inline
   * `box-shadow: inset ...` in ITS OWN resolved color. Inset keeps the glow
   * entirely inside the bar — no outer halo bleeding onto the row's own
   * background — same "refracted from behind" intent as .wui-plane.neon
   * (weoc-containers.css), just expressed as a real inset box-shadow instead
   * of a canvas clip trick, since this is plain DOM/CSS, not Canvas 2D.
   */
  function _drawBarRows(container, rows, tokens, neon) {
    var html = '';
    var i, s;
    for (i = 0; i < rows.length; i++) {
      var row      = rows[i];
      var segments = row.segments || [];
      var segHtml  = '';
      var cursor   = 0;

      for (s = 0; s < segments.length; s++) {
        var seg   = segments[s];
        var pct   = Math.max(0, Math.min(seg.pct, 100));
        if (pct <= 0) { continue; }
        var color = _resolveColor(seg.color, tokens);
        /* Neon step 1: translucent low-opacity body — same alpha as the
         * real --color-{name}-light tokens (~0.12), same recipe as
         * _drawPieCanvas's slices / _drawGaugeCanvas's zone bands. Regular
         * (non-neon) segments keep the original 0.5-alpha fill, unchanged.
         * Neon step 2: a thin inset glow in the ORIGINAL vivid color. */
        var fill = neon ? _alphaColor(color, 0.12) : _alphaColor(color, 0.5);
        var glowStyle = neon
          ? ';box-shadow:inset 0 0 0.35rem 0 ' + color
          : '';
        segHtml +=
          '<span class="seg" style="left:' + cursor + '%;width:' + pct + '%;background:' + fill + glowStyle + '"></span>';
        cursor += pct;
      }

      html +=
        '<div class="wui-bar-row"><span class="fill">' + segHtml + '</span>' +
        '<span class="name">' + (row.label != null ? row.label : '') + '</span>' +
        '<span class="val">'  + (row.value != null ? row.value : '') + '</span></div>';
    }
    container.innerHTML = html;
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

    if (entry.type === 'gauge') {
      var activeColor = _drawGaugeCanvas(entry.canvas, entry.opts, tokens);
      _renderGaugeStatus(entry.statusEl, entry.opts, activeColor);
      return;
    }

    if (entry.type === 'barrow') {
      _drawBarRows(entry.el, entry.rows, tokens, entry.opts && entry.opts.neon);
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

  /*
   * _NEON_CLASSES
   * All possible wui-chart-neon-* class names, so any previous one can be
   * stripped cleanly before applying (or omitting) the current opts.neon.
   */
  var _NEON_CLASSES = [
    'wui-chart-neon-primary', 'wui-chart-neon-secondary', 'wui-chart-neon-success',
    'wui-chart-neon-warning', 'wui-chart-neon-danger', 'wui-chart-neon-info'
  ];

  /*
   * _applyNeonClass(container, neonSpec)
   * WUI.chart() needs this — uPlot renders its own internal canvas, so
   * the glow is a CSS filter: drop-shadow(...) toggled via class on the host
   * container the caller passed in (see weoc-charts.css). WUI.pie/donut draw
   * straight to Canvas 2D and glow per-slice via ctx.shadowBlur/shadowColor
   * instead (see _drawPieCanvas). WUI.gauge also draws to Canvas 2D (see
   * _drawGaugeCanvas). WUI.barRow() renders plain DOM but glows per-segment
   * via an inline inset box-shadow set directly in _drawBarRows — not a
   * container-level class like this one, since each segment needs its own
   * color (a single class can only carry one).
   */
  function _applyNeonClass(container, neonSpec) {
    for (var i = 0; i < _NEON_CLASSES.length; i++) { container.classList.remove(_NEON_CLASSES[i]); }
    var cls = _neonClassFor(neonSpec, 'wui-chart-neon-');
    if (cls) { container.classList.add(cls); }
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

    _applyNeonClass(container, opts.neon);

    var instance = new root.uPlot(config, data, container);

    _register(id, {
      type:     'uplot',
      instance: instance,
      opts:     opts,
      data:     data,
      el:       container
    });
    _ensureThemeListener();

    var _responsiveHandle = null;
    if (root.WUI.responsive) {
      _responsiveHandle = root.WUI.responsive.observe(container, function (info) {
        if (info.tooSmall) { return; }
        var e = _getEntry(id);
        if (!e || !e.instance) { return; }
        e.instance.setSize({ width: info.width, height: e.instance.height });
      }, { minWidth: opts.minWidth || 60, minHeight: opts.minHeight || 60 });
    }

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
        if (_responsiveHandle) { _responsiveHandle.disconnect(); }
        var e = _getEntry(id);
        if (!e) { return; }
        if (e.instance) { e.instance.destroy(); }
        _applyNeonClass(container, false);
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
    var canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    container.appendChild(canvas);
    var initialWidth = container.offsetWidth || 320;
    /* opts.height is the SEED aspect ratio, not a permanent fixed value — the
     * responsive callback below scales it with the container's width so the
     * whole ring (not just its width) grows/shrinks as the tile resizes. */
    var aspect = height / initialWidth;
    _fitCanvasToBox(canvas, initialWidth, height);

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

    var _responsiveHandle = null;
    if (root.WUI.responsive) {
      _responsiveHandle = root.WUI.responsive.observe(container, function (info) {
        if (info.tooSmall) { return; }
        var e = _getEntry(id);
        if (!e) { return; }
        var t = _tokenMap();
        var scaledHeight = Math.max(60, Math.round(info.width * aspect));
        _fitCanvasToBox(e.canvas, info.width, scaledHeight);
        _drawPieCanvas(e.canvas, e.data, e.opts, t);
        if (e.legendEl) { _renderPieLegend(e.legendEl, e.data, t); }
      }, { minWidth: opts.minWidth || 40, minHeight: opts.minHeight || 40 });
    }

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
        if (_responsiveHandle) { _responsiveHandle.disconnect(); }
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

  /*
   * _createGauge(el, opts)
   * Canvas semi-circle threshold gauge + a DOM status chip below it.
   * Same registry/re-theme pattern as pie/donut (redraw in place, no
   * teardown, on wui:themechange).
   */
  function _createGauge(el, opts) {
    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-charts] WUI.gauge(): could not resolve element:', el);
      }
      return null;
    }

    opts = opts || {};
    if (!opts.zones) { opts.zones = _DEFAULT_GAUGE_ZONES; }

    var height = opts.height || 140;

    var id = container.getAttribute(_ATTR);
    if (!id) {
      _idCounter++;
      id = String(_idCounter);
      container.setAttribute(_ATTR, id);
    }

    var existing = _getEntry(id);
    if (existing) {
      if (existing.canvas && existing.canvas.parentNode) {
        existing.canvas.parentNode.removeChild(existing.canvas);
      }
      if (existing.statusEl && existing.statusEl.parentNode) {
        existing.statusEl.parentNode.removeChild(existing.statusEl);
      }
      _unregister(id);
    }

    var canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    container.appendChild(canvas);
    _fitCanvasToBox(canvas, container.offsetWidth || 220, height);

    var statusEl = document.createElement('div');
    statusEl.style.textAlign = 'center';
    container.appendChild(statusEl);

    var tokens      = _tokenMap();
    var activeColor = _drawGaugeCanvas(canvas, opts, tokens);
    _renderGaugeStatus(statusEl, opts, activeColor);

    _register(id, {
      type:     'gauge',
      canvas:   canvas,
      statusEl: statusEl,
      opts:     opts,
      el:       container
    });
    _ensureThemeListener();

    var _responsiveHandle = null;
    if (root.WUI.responsive) {
      _responsiveHandle = root.WUI.responsive.observe(container, function (info) {
        if (info.tooSmall) { return; }
        var e = _getEntry(id);
        if (!e) { return; }
        _fitCanvasToBox(e.canvas, info.width, height);
        var color = _drawGaugeCanvas(e.canvas, e.opts, _tokenMap());
        _renderGaugeStatus(e.statusEl, e.opts, color);
      }, { minWidth: opts.minWidth || 40, minHeight: opts.minHeight || 40 });
    }

    return {
      update: function (newOpts) {
        var e = _getEntry(id);
        if (!e) { return; }
        e.opts = newOpts || e.opts;
        if (!e.opts.zones) { e.opts.zones = _DEFAULT_GAUGE_ZONES; }
        var t     = _tokenMap();
        var color = _drawGaugeCanvas(e.canvas, e.opts, t);
        _renderGaugeStatus(e.statusEl, e.opts, color);
      },
      destroy: function () {
        if (_responsiveHandle) { _responsiveHandle.disconnect(); }
        var e = _getEntry(id);
        if (!e) { return; }
        if (e.canvas && e.canvas.parentNode)   { e.canvas.parentNode.removeChild(e.canvas); }
        if (e.statusEl && e.statusEl.parentNode) { e.statusEl.parentNode.removeChild(e.statusEl); }
        container.removeAttribute(_ATTR);
        _unregister(id);
      }
    };
  }

  /*
   * WUI.gauge(el, opts)
   * ───────────────────
   * Semi-circle threshold gauge. opts.value 0..100, opts.zones
   * [{to,color}], opts.status pre-localized string, opts.height px.
   */
  function gauge(el, opts) {
    return _createGauge(el, opts);
  }

  /*
   * WUI.barRow(el, opts)
   * ────────────────────
   * opts.rows = [{ label, value, segments: [{ pct, color }] }]
   * opts.neon (opt-in, default falsy — no glow, no appearance change unless
   * a caller explicitly asks for it): plain boolean, unlike WUI.chart()'s
   * severity-keyed opts.neon. Each segment glows in ITS OWN color, inset
   * (never bleeding outside the bar) — see _drawBarRows.
   * Renders one .wui-bar-row per item into `el`, replacing its contents.
   */
  function _createBarRow(el, opts) {
    var container = _resolveEl(el);
    if (!container) {
      if (root.console && root.console.warn) {
        console.warn('[wui-charts] WUI.barRow(): could not resolve element:', el);
      }
      return null;
    }

    opts = opts || {};
    var rows = opts.rows || [];

    var id = container.getAttribute(_ATTR);
    if (!id) {
      _idCounter++;
      id = String(_idCounter);
      container.setAttribute(_ATTR, id);
    }

    var tokens = _tokenMap();
    _drawBarRows(container, rows, tokens, opts.neon);

    _register(id, { type: 'barrow', el: container, rows: rows, opts: opts });
    _ensureThemeListener();

    return {
      update: function (newRows) {
        var e = _getEntry(id);
        if (!e) { return; }
        e.rows = newRows;
        var t = _tokenMap();
        _drawBarRows(e.el, newRows, t, e.opts && e.opts.neon);
      },
      destroy: function () {
        var e = _getEntry(id);
        if (!e) { return; }
        container.innerHTML = '';
        container.removeAttribute(_ATTR);
        _unregister(id);
      }
    };
  }

  function barRow(el, opts) {
    return _createBarRow(el, opts);
  }

  /* ── Attach to WUI namespace ──────────────────────────────────────────────── */
  root.WUI.chart  = chart;
  root.WUI.pie    = pie;
  root.WUI.donut  = donut;
  root.WUI.gauge  = gauge;
  root.WUI.barRow = barRow;

}(window));
