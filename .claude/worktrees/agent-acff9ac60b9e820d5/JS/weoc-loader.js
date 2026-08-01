/* =============================================
   weoc-loader.js — Busy-overlay animation companion for weoc-ui
   Version: 0.2.0

   Drives the branded energy→TAQA MorphSVG loader inside a .wui-busy-overlay
   created by weoc-ui.js (WUI.busy). This file is NOT part of the weoc-ui bundle
   — it is a separate companion script, exactly like weoc-anim.js, and it loads
   gsap.min.js + MorphSVGPlugin.min.js itself from its own directory.

   Deploy to the server:

     Shared/JS/gsap.min.js              ← from gsap.com
     Shared/JS/MorphSVGPlugin.min.js    ← from gsap.com (Club plugin)
     Shared/JS/weoc-loader.js           ← this file
     Shared/Assets/loader/agency-loader.html   ← source-of-truth artwork (viewBox 0 0 760 400)

   Board <head> only needs (in addition to weoc-ui.js) — no board markup change
   required to update the artwork, ever:

     <script src="Shared/JS/weoc-ui.js"></script>
     <script src="Shared/JS/weoc-loader.js" defer></script>

   Namespace: window.WUILoader
     WUILoader.mount(overlayEl)    — inject the branded SVG into the overlay and,
                                     if GSAP+MorphSVG are ready, start the morph
                                     timeline. Idempotent per overlay.
     WUILoader.unmount(overlayEl)  — stop the timeline and remove the injected SVG.

   Graceful degradation (mirrors weoc-anim.js):
     • No companion at all       → weoc-ui.js shows a pure-CSS fallback spinner.
     • CDN artwork unreachable   → falls back to the STATIC_SVG baked in below.
     • Companion but no GSAP     → mount() injects the STATIC branded SVG (energy
                                   glyphs, peach/orange gradients); no morph.
     • GSAP + MorphSVG ready     → mount() morphs bolt/flame/drop/turbine into the
                                   TAQA letters and back, forever, yoyo.
     • prefers-reduced-motion    → static SVG, no timeline.

   Artwork source: fetched at runtime from Shared/Assets/loader/agency-loader.html (a
   sibling directory of this script, resolved off document.currentScript.src —
   no board or CDN-base-path hardcoding). Fetched once per page, cached module-
   wide, and shared by every overlay mounted afterward. The overlay always shows
   the CSS spinner first and swaps in the animated SVG once the fetch resolves,
   so a slow/blocked fetch never delays the busy state itself. If the fetch
   fails (network, 404, CORS) STATIC_SVG below is used instead — keep it in sync
   with Assets/loader/agency-loader.html by hand as a last-resort fallback only.
   ============================================= */

(function (global) {
  'use strict';

  // Capture synchronously — document.currentScript is only valid during IIFE
  // evaluation. Used to derive sibling paths so boards need a single <script>
  // tag (this one). gsap.min.js + MorphSVGPlugin.min.js must live in the same
  // directory as this file; Assets/loader/agency-loader.html one directory up.
  var _selfSrc = document.currentScript && document.currentScript.src;
  function sibling(name) {
    return _selfSrc ? _selfSrc.replace(/\/[^/?#]+$/, '/' + name) : name;
  }
  function siblingDir(dir, name) {
    // Shared/JS/weoc-loader.js -> Shared/<dir>/<name>
    return _selfSrc ? _selfSrc.replace(/\/[^/]+\/[^/?#]+$/, '/' + dir + '/' + name) : (dir + '/' + name);
  }
  var LOADER_ARTWORK_URL = _selfSrc ? siblingDir('Assets/loader', 'agency-loader.html') : null;
  // gsap.min.js + MorphSVGPlugin.min.js are owned + loaded by weoc-anim.js.

  // ── Fallback loader SVG (last resort if the CDN fetch fails) ────────────────
  // Mirrors Assets/loader/agency-loader.html by hand. Four energy glyphs
  // (#bolt #flame #drop #turbine) gradient-filled via the --wui-loader-peach /
  // --wui-loader-orange CSS vars, plus a hidden #letters group (#t #a #q #a2 =
  // "TAQA") used only as MorphSVG morph targets.
  var STATIC_SVG =
    '<svg class="wui-busy-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 400" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="wui-loader-grad-1" x1="100" y1="260" x2="165" y2="140" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" style="stop-color: var(--wui-loader-peach)"></stop>' +
          '<stop offset="0.5" style="stop-color: var(--wui-loader-orange)"></stop>' +
        '</linearGradient>' +
        '<linearGradient id="wui-loader-grad-2" x1="265" y1="145" x2="340" y2="260" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.1" style="stop-color: var(--wui-loader-peach)"></stop>' +
          '<stop offset="0.5" style="stop-color: var(--wui-loader-orange)"></stop>' +
        '</linearGradient>' +
        '<linearGradient id="wui-loader-grad-3" x1="440" y1="145" x2="520" y2="265" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.1" style="stop-color: var(--wui-loader-peach)"></stop>' +
          '<stop offset="0.5" style="stop-color: var(--wui-loader-orange)"></stop>' +
        '</linearGradient>' +
        '<radialGradient id="wui-loader-grad-4" cx="650" cy="200" r="48" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.1" style="stop-color: var(--wui-loader-peach)"></stop>' +
          '<stop offset="0.5" style="stop-color: var(--wui-loader-orange)"></stop>' +
        '</radialGradient>' +
        '<g class="wui-loader-letters">' +
          '<path class="wui-loader-t" d="M90 130H190V154H152V270H128V154H90Z"></path>' +
          '<path class="wui-loader-a" fill-rule="evenodd" d="M310 130L360 270H260Z M310 172L328 228H292Z"></path>' +
          '<path class="wui-loader-q" fill-rule="evenodd" d="M432 200A48 48 0 1 0 528 200A48 48 0 1 0 432 200Z M453 200A27 27 0 1 0 507 200A27 27 0 1 0 453 200Z M506 226L530 250L520 260L494 234Z"></path>' +
          '<path class="wui-loader-a2" fill-rule="evenodd" d="M650 130L700 270H600Z M650 172L668 228H632Z"></path>' +
        '</g>' +
      '</defs>' +
      '<polygon class="wui-loader-bolt" fill="url(#wui-loader-grad-1)" points="155,140 120,205 142,205 125,260 165,195 143,195"></polygon>' +
      '<path class="wui-loader-flame" fill="url(#wui-loader-grad-2)" d="M310,145 C330,175 335,195 320,215 C336,205 340,225 320,245 C300,260 275,245 280,215 C265,225 270,190 290,175 C295,190 300,175 310,145 Z"></path>' +
      '<path class="wui-loader-drop" fill="url(#wui-loader-grad-3)" d="M480,145 C505,180 520,205 520,225 A40,40 0 1 1 440,225 C440,205 455,180 480,145 Z"></path>' +
      '<path class="wui-loader-turbine" fill="url(#wui-loader-grad-4)" d="M650,200 C666,185 666,165 650,154 C634,165 634,185 650,200 Z M650,200 C655,221.4 672.3,231.4 689.8,223 C688.3,203.6 671,193.6 650,200 Z M650,200 C629,193.6 611.7,203.6 610.2,223 C627.7,231.4 645,221.4 650,200 Z M636,200A14,14 0 1,0 664,200A14,14 0 1,0 636,200Z"></path>' +
    '</svg>';

  var GLYPHS = ['bolt', 'flame', 'drop', 'turbine'];
  var LETTERS = { bolt: 't', flame: 'a', drop: 'q', turbine: 'a2' };
  var GRADS = ['grad-1', 'grad-2', 'grad-3', 'grad-4'];

  var mounted = [];                 // overlays currently showing the SVG

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function figureOf(overlay) {
    if (!overlay) return null;
    return overlay.querySelector('.wui-busy-figure') || overlay;
  }

  // ── CDN artwork fetch (Shared/Assets/loader/agency-loader.html) ────────────────────
  // agency-loader.html is a full standalone demo document (own <head> with a
  // CSS/JS <link>/<script>) — only its <svg> is wanted here. Ids in that file
  // are plain (#bolt, #grad-1, ...) because it only ever shows one instance;
  // rewritten to wui-loader-* classes here so N overlays can mount at once
  // without colliding (matches the class-based scoping startMorph() expects).
  // Gradient elements keep an id (SVG needs one for fill="url(#...)"), just
  // renamed/prefixed and re-pointed from the matching fill attribute.
  var _svgHTML = null;     // cached, extracted <svg>.outerHTML — resolved once
  var _svgPromise = null;  // in-flight fetch, shared by concurrent mount() calls

  function toClass(svg, id, cls) {
    var el = svg.querySelector('#' + id);
    if (!el) return;
    el.classList.add(cls);
    el.removeAttribute('id');
  }

  function renameGradId(svg, oldId) {
    var el = svg.querySelector('#' + oldId);
    if (!el) return;
    var newId = 'wui-loader-' + oldId;
    var ref = svg.querySelector('[fill="url(#' + oldId + ')"]');
    el.id = newId;
    if (ref) ref.setAttribute('fill', 'url(#' + newId + ')');
  }

  function extractSVG(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var svg = doc.querySelector('svg');
    if (!svg) return null;
    svg.classList.add('wui-busy-svg');
    GLYPHS.forEach(function (g) { toClass(svg, g, 'wui-loader-' + g); });
    toClass(svg, 'letters', 'wui-loader-letters');
    Object.keys(LETTERS).forEach(function (g) { toClass(svg, LETTERS[g], 'wui-loader-' + LETTERS[g]); });
    GRADS.forEach(function (id) { renameGradId(svg, id); });
    return svg.outerHTML;
  }

  function fetchLoaderSVG() {
    if (_svgHTML) return Promise.resolve(_svgHTML);
    if (_svgPromise) return _svgPromise;
    if (!LOADER_ARTWORK_URL || typeof fetch !== 'function') return Promise.resolve(null);
    _svgPromise = fetch(LOADER_ARTWORK_URL, { credentials: 'omit' })
      .then(function (res) { return res.ok ? res.text() : null; })
      .then(function (html) {
        var svg = html && extractSVG(html);
        _svgHTML = svg || null;
        return _svgHTML;
      })
      ['catch'](function () { return null; });
    return _svgPromise;
  }

  // Inject markup into the overlay's figure (replacing the fallback spinner).
  // Idempotent — a second call is a no-op if the SVG is already there.
  function injectSVG(overlay, markup) {
    var fig = figureOf(overlay);
    if (!fig || fig.querySelector('.wui-busy-svg')) return fig;
    fig.innerHTML = markup;
    overlay.classList.add('wui-busy-has-svg');
    return fig;
  }

  function removeSVG(overlay) {
    var fig = figureOf(overlay);
    if (!fig) return;
    var svg = fig.querySelector('.wui-busy-svg');
    if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
    overlay.classList.remove('wui-busy-has-svg');
  }

  // Build the energy→TAQA morph timeline scoped to THIS overlay's SVG, so
  // multiple overlays don't collide on shared element ids.
  function startMorph(overlay) {
    if (overlay.__wuiMorphTl || reducedMotion()) return;
    var anim = global.WUIAnim;
    if (!anim || !anim.morphLoop) return;      // no anim infra → static SVG stays
    var fig = figureOf(overlay);
    var svg = fig && fig.querySelector('.wui-busy-svg');
    if (!svg) return;

    function q(cls) { return svg.querySelector('.wui-loader-' + cls); }

    var pairs = [];
    for (var i = 0; i < GLYPHS.length; i++) {
      var from = q(GLYPHS[i]), to = q(LETTERS[GLYPHS[i]]);
      if (from && to) pairs.push({ from: from, to: to });
    }
    // weoc-anim owns GSAP + MorphSVG (lazy, AMD-guarded); it builds the timeline
    // and hands it back via onCreate. brief hold at "TAQA" before yoyo reverses.
    anim.morphLoop(pairs, {
      duration: 0.9, ease: 'power1.inOut', repeatDelay: 0.5, hold: 0.4,
      onCreate: function (tl) { overlay.__wuiMorphTl = tl; }
    });
  }

  function stopMorph(overlay) {
    if (overlay && overlay.__wuiMorphTl) {
      try { overlay.__wuiMorphTl.kill(); } catch (e) {}
      overlay.__wuiMorphTl = null;
    }
  }

  function readyThenMorph(overlay) {
    if (mounted.indexOf(overlay) === -1) return;    // unmounted before we got here
    if (global.WUIAnim && global.WUIAnim.ready) global.WUIAnim.ready(function () { startMorph(overlay); });
    else startMorph(overlay);
  }

  // ── Public API ──────────────────────────────────────────────────────────
  // CSS fallback spinner (already in the overlay, built by weoc-ui.js) shows
  // immediately; this only ever upgrades it, async, once artwork is in hand.
  function mount(overlay) {
    if (!overlay) return;
    if (mounted.indexOf(overlay) === -1) mounted.push(overlay);
    fetchLoaderSVG().then(function (fetched) {
      if (mounted.indexOf(overlay) === -1) return;  // unmounted while fetch was in flight
      injectSVG(overlay, fetched || STATIC_SVG);
      readyThenMorph(overlay);
    });
  }

  function unmount(overlay) {
    if (!overlay) return;
    stopMorph(overlay);
    removeSVG(overlay);
    var idx = mounted.indexOf(overlay);
    if (idx > -1) mounted.splice(idx, 1);
  }

  global.WUILoader = { mount: mount, unmount: unmount };

  // ── Delegate GSAP + MorphSVG to weoc-anim.js ──────────────────────────────
  // weoc-anim.js is the single animation infra (loads GSAP + MorphSVG lazily,
  // AMD-guarded so it can't break the ArcGIS Dojo loader). If the board didn't
  // load it, inject the sibling weoc-anim.js. Until it is ready, mount() shows
  // the static branded SVG; startMorph (WUIAnim.ready + morphLoop) upgrades it.
  if (typeof global.WUIAnim === 'undefined' && _selfSrc) {
    var _a = document.createElement('script');
    _a.src = sibling('weoc-anim.js');
    document.head.appendChild(_a);
  }

})(window);
