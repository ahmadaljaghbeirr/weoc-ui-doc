import { WUI } from '../core/wui.js';


  /* ═══════════════════════════════════════════════════════════════════════
     12) TIMELINE ENGINE  (WUI.timeline.create — node + connector + content feed)
     One abstract feed shape for every vertical "history"/"timeline"/"event log"
     list in the system — history tabs, event-timeline tabs, response-config
     preview cards, whatever comes next. No named variants (no "is-history" /
     "is-cards" skins): the shape is always icon-bubble node + connector line +
     a content column; each board's own header()/body()/footer() callbacks
     decide what actually renders there, out of existing wui-components
     (wui-badge, wui-plane, wui-flex utilities, form-control, ...) or raw
     HTML/DOM the board owns.

     Explicit factory (same shape as WeocMap.create / WUI.dropzone.create):
       const feed = WUI.timeline.create('#history-list', {
         node:   function (entry, i, all) { return { icon: 'edit_note', variant: i === 0 ? 'success' : 'secondary' }; },
         header: function (entry, i, all) { return '&lt;span class="wui-badge primary"&gt;' + entry.Action + '&lt;/span&gt;'; },
         body:   function (entry, i, all) { var el = document.createElement('div'); el.className = 'wui-plane color-60'; el.textContent = entry.Text; return el; },
         footer: function (entry, i, all) { return entry.Detail || null; },   // falsy -> footer omitted for this item
         isLast: function (entry, i, all) { return i === all.length - 1; },   // default shown
         emptyTemplate: '#tpl-history-empty'                                  // <template> id, cloned when render([]) / render(null)
       });
       feed.render(entries);   // full (re)render from an array, in the order given
       feed.renderEmpty();     // force the empty state
       feed.prepend(entry);    // build+insert one item at the top (e.g. an inline "add new" row)
       feed.append(entry);     // build+insert one item at the bottom
       feed.clear();           // empty the container, no empty-state shown

     node(entry, i, all) return value:
       - {icon, variant}         -> standard `wui-icon-bubble solid {variant}` + material icon
       - {icon, variant, solid:false} -> tinted bubble instead of solid (see weoc-indicators.css)
       - a string                -> raw HTML, replaces the node's inner content wholesale
                                     (e.g. a numbered circle instead of an icon — the
                                     response-config preview shape needs this)
       - a Node                  -> appended directly
     header()/body()/footer() return value: string (innerHTML) | Node | Node[] | falsy
       (falsy = that sub-section is omitted entirely for this item, no empty wrapper left behind).
     connector(entry, i, all) (optional): return either
       - a string                -> extra class(es) appended to .wui-timeline-connector
       - {class, style}          -> same, plus inline CSS custom properties/props
                                     (e.g. {class: 'tier-accent dotted', style: {'--tier-color': entry.color}}
                                     for a runtime-colored dotted rail — see weoc-tier-colors.css
                                     §9 / weoc-timeline.css .tier-accent/.dotted for what's defined).

     RTL: identical DOM either direction — .wui-timeline-item is a plain flex row,
     the browser mirrors node/content order under dir="rtl" with no overrides here.

     Declarative note: unlike dropzone/map, there is no auto-boot from a
     data-wui-* attribute — a timeline feed always needs at least header/body
     callbacks supplied by the board, so it is create()-only.
     ═══════════════════════════════════════════════════════════════════════ */

  function wuiTlAppend(target, value) {
    if (value === null || value === undefined || value === false || value === '') return false;
    if (typeof value === 'string') {
      target.innerHTML = value;
    } else if (Array.isArray(value)) {
      value.forEach(function (v) { if (v) target.appendChild(v); });
    } else if (value.nodeType) {
      target.appendChild(value);
    } else {
      return false;
    }
    return true;
  }

  function wuiTlBuildNode(el, nodeResult) {
    if (typeof nodeResult === 'string') {
      el.innerHTML = nodeResult;
      return;
    }
    if (nodeResult && nodeResult.nodeType) {
      el.appendChild(nodeResult);
      return;
    }
    var opts = nodeResult || {};
    var bubble = document.createElement('div');
    bubble.className = 'wui-icon-bubble' + (opts.solid === false ? '' : ' solid') + (opts.variant ? ' ' + opts.variant : '');
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = opts.icon || '';
    bubble.appendChild(icon);
    el.appendChild(bubble);
  }

  function wuiTlBuildItem(feedOpts, entry, index, all) {
    var item = document.createElement('div');
    item.className = 'wui-timeline-item';

    var nodeWrap = document.createElement('div');
    nodeWrap.className = 'wui-timeline-node-wrap';
    if (typeof feedOpts.node === 'function') {
      wuiTlBuildNode(nodeWrap, feedOpts.node(entry, index, all));
    }
    var connector = document.createElement('div');
    connector.className = 'wui-timeline-connector';
    if (typeof feedOpts.connector === 'function') {
      var connResult = feedOpts.connector(entry, index, all);
      if (typeof connResult === 'string') {
        if (connResult) connector.className += ' ' + connResult;
      } else if (connResult && typeof connResult === 'object') {
        if (connResult.class) connector.className += ' ' + connResult.class;
        if (connResult.style) {
          Object.keys(connResult.style).forEach(function (k) {
            connector.style.setProperty(k, connResult.style[k]);
          });
        }
      }
    }
    nodeWrap.appendChild(connector);
    item.appendChild(nodeWrap);

    var content = document.createElement('div');
    content.className = 'wui-timeline-content';

    var hdr = document.createElement('div');
    hdr.className = 'wui-timeline-hdr';
    if (typeof feedOpts.header === 'function' && wuiTlAppend(hdr, feedOpts.header(entry, index, all))) {
      content.appendChild(hdr);
    }

    var body = document.createElement('div');
    body.className = 'wui-timeline-body';
    if (typeof feedOpts.body === 'function' && wuiTlAppend(body, feedOpts.body(entry, index, all))) {
      content.appendChild(body);
    }

    var footer = document.createElement('div');
    footer.className = 'wui-timeline-footer';
    if (typeof feedOpts.footer === 'function' && wuiTlAppend(footer, feedOpts.footer(entry, index, all))) {
      content.appendChild(footer);
    }

    item.appendChild(content);

    var isLast = typeof feedOpts.isLast === 'function' ? feedOpts.isLast(entry, index, all) : (index === all.length - 1);
    if (isLast) item.classList.add('is-last');

    return item;
  }

  function wuiTlBuild(el, opts) {
    function renderEmpty() {
      while (el.firstChild) el.removeChild(el.firstChild);
      if (opts.emptyTemplate) {
        var tpl = (typeof opts.emptyTemplate === 'string') ? document.querySelector(opts.emptyTemplate) : opts.emptyTemplate;
        if (tpl && tpl.content) {
          el.appendChild(tpl.content.cloneNode(true));
          if (window.WUI && WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(el);
          return;
        }
      }
      if (opts.emptyHtml) el.innerHTML = opts.emptyHtml;
    }

    function render(entries) {
      while (el.firstChild) el.removeChild(el.firstChild);
      if (!Array.isArray(entries) || entries.length === 0) {
        renderEmpty();
        return;
      }
      entries.forEach(function (entry, index) {
        var item = wuiTlBuildItem(opts, entry, index, entries);
        item.__wuiTlEntry = entry;
        el.appendChild(item);
      });
      if (window.WUI && WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(el);
    }

    function insertOne(entry, atStart) {
      var existing = el.querySelectorAll('.wui-timeline-item');
      var all = [];
      for (var i = 0; i < existing.length; i++) all.push(existing[i].__wuiTlEntry || {});
      if (atStart) all.unshift(entry); else all.push(entry);

      var item = wuiTlBuildItem(opts, entry, atStart ? 0 : all.length - 1, all);
      item.__wuiTlEntry = entry;

      // First real item after an empty-state render — clear it before inserting.
      if (existing.length === 0) { while (el.firstChild) el.removeChild(el.firstChild); }

      if (atStart) {
        el.insertBefore(item, el.firstChild);
        // re-evaluate is-last on what used to be the last item: unaffected by a
        // prepend, only append() shifts who's last (kept simple: boards that
        // care about a live is-last after prepend should re-render()).
      } else {
        el.appendChild(item);
      }
      if (window.WUI && WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(item);
      return item;
    }

    return {
      el: el,
      render: render,
      renderEmpty: renderEmpty,
      prepend: function (entry) { return insertOne(entry, true); },
      append: function (entry) { return insertOne(entry, false); },
      clear: function () { while (el.firstChild) el.removeChild(el.firstChild); }
    };
  }

  WUI.timeline = {
    create: function (elOrSelector, options) {
      var el = (typeof elOrSelector === 'string') ? document.querySelector(elOrSelector) : elOrSelector;
      if (!el) return null;
      if (el.__wuiTimeline) return el.__wuiTimeline;
      var instance = wuiTlBuild(el, options || {});
      el.__wuiTimeline = instance;
      return instance;
    }
  };
