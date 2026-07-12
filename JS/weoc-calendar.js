/* =============================================================================
   weoc-calendar.js  —  weoc-ui calendar component

   The JS engine behind weoc-calendar.css. Renders an interactive calendar into
   a host element: month / week / day / agenda views, prev-today-next nav, a
   view-mode switcher, and an accented clickable event card that opens a detail
   popup (built into a .wui-modal) with configurable actions.

   ── Dependencies ────────────────────────────────────────────────────────────
   • Vanilla JS. No framework. Coexists with jQuery.
   • weoc-calendar.css (+ agency-theme tokens) for styling.
   • OPTIONAL: window.WUI (weoc-ui.js) for the popup modal lifecycle (backdrop,
     Esc, focus-trap, scroll-lock). Falls back to a minimal open/close if absent.
   • Material Symbols Outlined font for icons (already loaded by boards/docs).

   ── Quick start ─────────────────────────────────────────────────────────────
     <div id="cal" data-wui-calendar></div>

     var cal = WUICalendar.create(document.getElementById('cal'), {
       view: 'month',
       events: [
         { id: 1, title: 'EOC Activation Brief', start: '2026-06-24T09:00',
           end: '2026-06-24T10:00', variant: 'danger', location: 'Command Room',
           status: 'Confirmed',
           attendees: ['A. Rahman', 'S. Khan'],
           description: 'Tier-3 activation standup.' }
       ]
     });

   Or auto-init every [data-wui-calendar] with inline JSON in data-events:
     WUICalendar.init();

   ── Instance API ────────────────────────────────────────────────────────────
     cal.setView('month'|'week'|'day'|'agenda')   cal.getView()
     cal.next() / cal.prev() / cal.today()
     cal.setDate(dateOrISO)                        cal.getDate()
     cal.setEvents(array)  cal.addEvent(obj)  cal.updateEvent(id, patch)
     cal.removeEvent(id)   cal.getEvents()
     cal.openEvent(id)     cal.refresh()           cal.destroy()
     cal.on(type, handler) / cal.off(type, handler)   (sugar over the root el)

   ── Events emitted (on the host element, bubbling) ───────────────────────────
     wui:cal:viewchange  detail { view }
     wui:cal:navigate    detail { date, view, rangeStart, rangeEnd }
     wui:cal:eventclick  detail { event, el }
     wui:cal:slotclick   detail { date, allDay }      (empty slot / day cell)
     wui:cal:action      detail { action, event }     (popup footer button)
   Equivalent option callbacks: onViewChange, onNavigate, onEventClick,
   onSlotClick, onAction.

   ── Event model ──────────────────────────────────────────────────────────────
     { id, title, start, end, allDay,
       variant: primary|success|warning|danger|info|secondary|tier-1..tier-4,
       location, description, status, icon,
       attendees: [ 'Name' | {name, role} ],
       meta: [ {label, value, icon} ],   // extra popup rows
       actions: [ {key,label,icon,variant,keepOpen} ],  // per-event override
       done, cancelled }                 // status flags (strike / dim)
   ============================================================================= */
(function (window, document) {
  'use strict';

  var WUI = window.WUI || null;

  /* ═══════════════════════════════════════════════════════════════════════
     DATE HELPERS  (native Date; no library)
     ═══════════════════════════════════════════════════════════════════════ */

  var MS_DAY = 86400000;

  function toDate(v) {
    if (v instanceof Date) return new Date(v.getTime());
    if (v == null) return null;
    if (typeof v === 'number') return new Date(v);
    // accept 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm' (treated as local time)
    var s = String(v);
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    if (m) {
      return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0, 0, 0);
    }
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  function startOfDay(d) { var x = new Date(d.getTime()); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function addMonths(d, n) { var x = new Date(d.getTime()); x.setMonth(x.getMonth() + n); return x; }
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

  function startOfWeek(d, weekStartsOn) {
    var x = startOfDay(d);
    var diff = (x.getDay() - (weekStartsOn || 0) + 7) % 7;
    return addDays(x, -diff);
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  function isToday(d) { return sameDay(d, new Date()); }
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function minutesOf(d) { return d.getHours() * 60 + d.getMinutes(); }

  /* Intl formatters, cached per locale */
  var fmtCache = {};
  function fmt(locale, opts) {
    var key = (locale || '') + JSON.stringify(opts);
    if (!fmtCache[key]) {
      try { fmtCache[key] = new Intl.DateTimeFormat(locale || undefined, opts); }
      catch (e) { fmtCache[key] = null; }
    }
    return fmtCache[key];
  }

  function fmtTime(d, locale, hour12) {
    var f = fmt(locale, { hour: 'numeric', minute: '2-digit', hour12: hour12 !== false });
    if (f) return f.format(d).replace(/\s?([AP])M/i, ' $1M');
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM'; var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     SMALL DOM HELPERS
     ═══════════════════════════════════════════════════════════════════════ */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function icon(name) { return '<span class="material-symbols-outlined">' + esc(name) + '</span>'; }

  // Directional glyph (chevrons / carets that point left|right). Opts into the
  // weoc-i18n.css `[dir="rtl"] .wui-dir-icon { transform: scaleX(-1) }` flip so
  // prev/next and disclosure chevrons mirror under RTL. Non-directional icons
  // must keep using icon() so they are NOT flipped.
  function dirIcon(name) { return '<span class="material-symbols-outlined wui-dir-icon">' + esc(name) + '</span>'; }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    if (!parts[0]) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  var VARIANTS = {
    primary: 1, success: 1, warning: 1, danger: 1, info: 1, secondary: 1,
    'tier-1': 1, 'tier-2': 1, 'tier-3': 1, 'tier-4': 1
  };
  function accentClass(variant) {
    var v = VARIANTS[variant] ? variant : 'primary';
    return 'wui-cal-accent-' + v;
  }

  var DEFAULT_ACTIONS = [
    { key: 'edit',   label: 'Edit',   icon: 'edit',   variant: 'primary' },
    { key: 'delete', label: 'Delete', icon: 'delete', variant: 'danger' }
  ];

  /* ═══════════════════════════════════════════════════════════════════════
     SHARED POPUP MODAL  (one per page, reused by every calendar)
     ═══════════════════════════════════════════════════════════════════════ */

  var popupModal = null;
  var popupCtx = null;   // { instance, event }

  function ensurePopup() {
    if (popupModal) return popupModal;
    var m = el('div', 'wui-modal');
    m.id = 'wui-cal-popup-modal';
    m.setAttribute('data-wui-backdrop', 'true');
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML =
      '<div class="wui-modal-dialog">' +
        '<div class="wui-modal-header">' +
          '<span class="wui-modal-title">' + icon('event') + '<span class="wui-cal-popup-modal-title">Event</span></span>' +
          '<button class="wui-modal-close" type="button" data-wui-dismiss="true" data-cal-close="1">' + icon('close') + '</button>' +
        '</div>' +
        '<div class="wui-modal-body"><div class="wui-cal-popup"></div></div>' +
        '<div class="wui-modal-footer"></div>' +
      '</div>';
    document.body.appendChild(m);

    // footer action delegation
    m.querySelector('.wui-modal-footer').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cal-action]');
      if (!btn || !popupCtx) return;
      var key = btn.getAttribute('data-cal-action');
      var keepOpen = btn.getAttribute('data-cal-keepopen') === '1';
      popupCtx.instance._fire('action', { action: key, event: popupCtx.event });
      if (!keepOpen) closePopup();
    });

    // minimal fallback close if WUI absent
    if (!WUI) {
      m.addEventListener('click', function (e) {
        if (e.target === m || e.target.closest('[data-wui-dismiss]')) closePopup();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && m.classList.contains('is-open')) closePopup();
      });
    }
    popupModal = m;
    return m;
  }

  function openPopup(instance, ev) {
    var m = ensurePopup();
    popupCtx = { instance: instance, event: ev };
    var o = instance.opts;

    // title in header
    m.querySelector('.wui-cal-popup-modal-title').textContent = ev.title || 'Event';

    // body
    var body = m.querySelector('.wui-cal-popup');
    body.className = 'wui-cal-popup ' + accentClass(ev.variant);

    var whenText = formatRangeText(ev, o);
    var html = '';
    html += '<div class="wui-cal-popup-band">';
    html +=   '<span class="wui-cal-popup-icon">' + icon(ev.icon || (ev.allDay ? 'event' : 'schedule')) + '</span>';
    html +=   '<div class="wui-cal-popup-headings">';
    html +=     '<div class="wui-cal-popup-title">' + esc(ev.title || 'Untitled') + '</div>';
    html +=     '<div class="wui-cal-popup-when">' + esc(whenText) + '</div>';
    html +=   '</div>';
    html += '</div>';

    html += '<div class="wui-cal-popup-rows">';
    if (ev.status) {
      html += popupRow('verified', 'Status',
        '<span class="wui-badge wui-badge-sm ' + accentBadge(ev.variant) + '">' + esc(ev.status) + '</span>');
    }
    if (ev.location) html += popupRow('location_on', 'Location', esc(ev.location));

    // custom meta rows
    if (ev.meta && ev.meta.length) {
      for (var i = 0; i < ev.meta.length; i++) {
        var mr = ev.meta[i];
        html += popupRow(mr.icon || 'label', mr.label || '', esc(mr.value));
      }
    }

    if (ev.attendees && ev.attendees.length) {
      var people = '<div class="wui-cal-popup-people">';
      for (var j = 0; j < ev.attendees.length; j++) {
        var p = ev.attendees[j];
        var name = typeof p === 'string' ? p : (p.name || '');
        people += '<span class="wui-cal-popup-person">' +
                    '<span class="wui-cal-popup-person-avatar">' + esc(initials(name)) + '</span>' +
                    esc(name) + '</span>';
      }
      people += '</div>';
      html += popupRow('group', 'Attendees', people);
    }
    html += '</div>';

    if (ev.description) {
      html += '<div class="wui-cal-popup-desc">' + esc(ev.description) + '</div>';
    }
    body.innerHTML = html;

    // footer actions
    var actions = ev.actions || o.actions || DEFAULT_ACTIONS;
    var footer = m.querySelector('.wui-modal-footer');
    var fh = '';
    for (var k = 0; k < actions.length; k++) {
      var a = actions[k];
      var variant = a.variant || 'secondary';
      var cls = a.key === 'delete' ? 'wui-btn ghost danger' : 'wui-btn ' + (variant === 'secondary' ? 'ghost secondary' : variant);
      fh += '<button type="button" class="' + cls + '" data-cal-action="' + esc(a.key) + '"' +
            (a.keepOpen ? ' data-cal-keepopen="1"' : '') + '>' +
            (a.icon ? icon(a.icon) + ' ' : '') + esc(a.label || a.key) + '</button>';
    }
    footer.innerHTML = fh;
    footer.style.display = actions.length ? '' : 'none';

    if (WUI) WUI.open(m); else { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); }
  }

  function closePopup() {
    if (!popupModal) return;
    if (WUI) WUI.close(popupModal);
    else { popupModal.classList.remove('is-open'); popupModal.setAttribute('aria-hidden', 'true'); }
    popupCtx = null;
  }

  function popupRow(ic, label, valueHtml) {
    return '<div class="wui-cal-popup-row">' +
             icon(ic) +
             '<span class="wui-cal-popup-row-label">' + esc(label) + '</span>' +
             '<span class="wui-cal-popup-row-value">' + valueHtml + '</span>' +
           '</div>';
  }

  function accentBadge(variant) {
    var v = VARIANTS[variant] ? variant : 'primary';
    // tier-* badges exist in weoc-tier-colors.css; semantic ones in weoc-labels.css
    return v;
  }

  function formatRangeText(ev, o) {
    var s = ev._start, e = ev._end;
    var loc = o.locale;
    var dayFmt = fmt(loc, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    var dayStr = dayFmt ? dayFmt.format(s) : s.toDateString();
    if (ev.allDay) {
      if (e && !sameDay(s, e) && (e.getTime() - s.getTime()) > MS_DAY) {
        var e2 = addDays(e, ev._endExclusive ? -1 : 0);
        var endStr = dayFmt ? dayFmt.format(e2) : e2.toDateString();
        return 'All day · ' + dayStr + ' – ' + endStr;
      }
      return 'All day · ' + dayStr;
    }
    var t1 = fmtTime(s, loc, o.hour12);
    if (e && e.getTime() > s.getTime()) {
      if (sameDay(s, e)) return dayStr + ' · ' + t1 + ' – ' + fmtTime(e, loc, o.hour12);
      var endDay = dayFmt ? dayFmt.format(e) : e.toDateString();
      return dayStr + ' ' + t1 + ' – ' + endDay + ' ' + fmtTime(e, loc, o.hour12);
    }
    return dayStr + ' · ' + t1;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CALENDAR INSTANCE
     ═══════════════════════════════════════════════════════════════════════ */

  function Calendar(root, options) {
    this.root = root;
    this.opts = mergeOpts(options);
    this.view = this.opts.view;
    this.date = startOfDay(this.opts.date ? toDate(this.opts.date) : new Date());
    this.events = [];
    this._nowTimer = null;
    this.setEvents(this.opts.events || []);
    this._bind();
    this.refresh();
  }

  function mergeOpts(o) {
    o = o || {};
    return {
      view: o.view || 'month',
      date: o.date || null,
      events: o.events || [],
      views: o.views || ['month', 'week', 'day', 'agenda'],
      weekStartsOn: o.weekStartsOn || 0,
      hourStart: o.hourStart == null ? 0 : o.hourStart,
      hourEnd: o.hourEnd == null ? 24 : o.hourEnd,
      slotHeight: o.slotHeight || 48,
      maxPerDay: o.maxPerDay == null ? 3 : o.maxPerDay,
      locale: o.locale || undefined,
      hour12: o.hour12,
      popup: o.popup !== false,
      actions: o.actions || null,
      defaultVariant: o.defaultVariant || 'primary',
      nowIndicator: o.nowIndicator !== false,
      onEventClick: o.onEventClick, onSlotClick: o.onSlotClick,
      onAction: o.onAction, onNavigate: o.onNavigate, onViewChange: o.onViewChange
    };
  }

  var VIEW_LABELS = {
    month: ['Month', 'calendar_view_month'],
    week:  ['Week',  'calendar_view_week'],
    day:   ['Day',   'calendar_view_day'],
    agenda:['Agenda','view_agenda']
  };

  Calendar.prototype.normalize = function (raw) {
    var s = toDate(raw.start);
    var e = raw.end != null ? toDate(raw.end) : null;
    var ev = {
      id: raw.id != null ? raw.id : ('ev-' + Math.floor(Math.random() * 1e9)),
      title: raw.title || 'Untitled',
      variant: VARIANTS[raw.variant] ? raw.variant : this.opts.defaultVariant,
      allDay: !!raw.allDay,
      location: raw.location || '',
      description: raw.description || '',
      status: raw.status || '',
      icon: raw.icon || '',
      attendees: raw.attendees || null,
      meta: raw.meta || null,
      actions: raw.actions || null,
      done: !!raw.done,
      cancelled: !!raw.cancelled,
      _start: s || startOfDay(new Date()),
      _end: e,
      _endExclusive: false,
      _raw: raw
    };
    // a date-only start with no time → treat as all-day
    if (!raw.allDay && typeof raw.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.start)) {
      ev.allDay = true;
    }
    // resolve _end. All-day events use an EXCLUSIVE next-midnight end so that a
    // single-day all-day event still intersects its day (and multi-day spans
    // include their final day). Timed events default to +1h.
    if (ev.allDay) {
      ev._start = startOfDay(ev._start);
      var endBase = (ev._end && ev._end.getTime() > ev._start.getTime()) ? ev._end : ev._start;
      ev._end = addDays(startOfDay(endBase), 1);
      ev._endExclusive = true;
    } else if (!ev._end || ev._end.getTime() <= ev._start.getTime()) {
      ev._end = new Date(ev._start.getTime() + 3600000);
    }
    return ev;
  };

  Calendar.prototype.setEvents = function (arr) {
    var self = this;
    this.events = (arr || []).map(function (r) { return self.normalize(r); });
    if (this.root) this.refresh();
    return this;
  };
  Calendar.prototype.getEvents = function () { return this.events.map(function (e) { return e._raw; }); };
  Calendar.prototype.addEvent = function (raw) { this.events.push(this.normalize(raw)); this.refresh(); return this; };
  Calendar.prototype.updateEvent = function (id, patch) {
    for (var i = 0; i < this.events.length; i++) {
      if (String(this.events[i].id) === String(id)) {
        var merged = {}; var r = this.events[i]._raw, k;
        for (k in r) merged[k] = r[k];
        for (k in patch) merged[k] = patch[k];
        this.events[i] = this.normalize(merged);
        break;
      }
    }
    this.refresh(); return this;
  };
  Calendar.prototype.removeEvent = function (id) {
    this.events = this.events.filter(function (e) { return String(e.id) !== String(id); });
    this.refresh(); return this;
  };
  Calendar.prototype.getById = function (id) {
    for (var i = 0; i < this.events.length; i++) if (String(this.events[i].id) === String(id)) return this.events[i];
    return null;
  };

  /* ── navigation / view ── */
  Calendar.prototype.getView = function () { return this.view; };
  Calendar.prototype.getDate = function () { return new Date(this.date.getTime()); };

  Calendar.prototype.setView = function (v) {
    if (!VIEW_LABELS[v]) return this;            // ignore unknown views
    if (v === this.view) { this.refresh(); return this; }
    this.view = v;
    this._fire('viewchange', { view: v });
    this.refresh();
    return this;
  };
  Calendar.prototype.setDate = function (d) { this.date = startOfDay(toDate(d) || new Date()); this.refresh(); return this; };
  Calendar.prototype.today = function () { this.date = startOfDay(new Date()); this._afterNav(); return this; };
  Calendar.prototype.next = function () { this._step(1); return this; };
  Calendar.prototype.prev = function () { this._step(-1); return this; };

  Calendar.prototype._step = function (dir) {
    if (this.view === 'week') this.date = addDays(this.date, 7 * dir);
    else if (this.view === 'day') this.date = addDays(this.date, dir);
    else this.date = addMonths(this.date, dir); // month + agenda
    this._afterNav();
  };

  Calendar.prototype._afterNav = function () {
    var r = this.getRange();
    this._fire('navigate', { date: this.getDate(), view: this.view, rangeStart: r.start, rangeEnd: r.end });
    this.refresh();
  };

  /* visible range for the current view */
  Calendar.prototype.getRange = function () {
    var o = this.opts;
    if (this.view === 'month') {
      var gs = startOfWeek(startOfMonth(this.date), o.weekStartsOn);
      var weeks = Math.ceil((dayDiff(gs, endOfMonth(this.date)) + 1) / 7);
      return { start: gs, end: addDays(gs, weeks * 7) };
    }
    if (this.view === 'week') { var ws = startOfWeek(this.date, o.weekStartsOn); return { start: ws, end: addDays(ws, 7) }; }
    if (this.view === 'day') { var ds = startOfDay(this.date); return { start: ds, end: addDays(ds, 1) }; }
    // agenda → whole month
    return { start: startOfMonth(this.date), end: addDays(endOfMonth(this.date), 1) };
  };

  function dayDiff(a, b) { return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY); }

  /* events that intersect [start,end) */
  Calendar.prototype.eventsInRange = function (start, end) {
    return this.events.filter(function (e) {
      return e._start.getTime() < end.getTime() && e._end.getTime() > start.getTime();
    });
  };

  /* ── event firing (CustomEvent + option callback) ── */
  Calendar.prototype._fire = function (type, detail) {
    // explicit name map (camelCase option callbacks)
    var map = {
      viewchange: this.opts.onViewChange, navigate: this.opts.onNavigate,
      eventclick: this.opts.onEventClick, slotclick: this.opts.onSlotClick,
      action: this.opts.onAction
    };
    if (map[type]) { try { map[type](detail); } catch (e) {} }
    this.root.dispatchEvent(new CustomEvent('wui:cal:' + type, { bubbles: true, detail: detail }));
  };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */

  Calendar.prototype.refresh = function () {
    if (!this.root) return;
    if (!this.root.classList.contains('wui-calendar')) this.root.classList.add('wui-calendar');
    this.root.style.setProperty('--wui-cal-slot-h', this.opts.slotHeight + 'px');

    this._stopNowTimer();
    this.root.innerHTML = '';
    this.root.appendChild(this._toolbar());

    var body = el('div', 'wui-cal-body');
    if (this.view === 'month') body.appendChild(this._month());
    else if (this.view === 'week') body.appendChild(this._timeGrid(7));
    else if (this.view === 'day') body.appendChild(this._timeGrid(1));
    else body.appendChild(this._agenda());
    this.root.appendChild(body);

    if ((this.view === 'week' || this.view === 'day') && this.opts.nowIndicator) {
      this._placeNow();
      this._startNowTimer();
      this._scrollToHour(8);
    }
    return this;
  };

  Calendar.prototype._titleText = function () {
    var loc = this.opts.locale, o = this.opts;
    if (this.view === 'day') {
      var f = fmt(loc, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return f ? f.format(this.date) : this.date.toDateString();
    }
    if (this.view === 'week') {
      var ws = startOfWeek(this.date, o.weekStartsOn), we = addDays(ws, 6);
      var mf = fmt(loc, { month: 'short', day: 'numeric' });
      var yf = fmt(loc, { year: 'numeric' });
      var left = mf ? mf.format(ws) : ws.toDateString();
      var right = (ws.getMonth() === we.getMonth())
        ? (we.getDate() + '')
        : (mf ? mf.format(we) : we.toDateString());
      return left + ' – ' + right + '<span class="wui-cal-title-sub">' + (yf ? yf.format(we) : '') + '</span>';
    }
    var f2 = fmt(loc, { month: 'long', year: 'numeric' });
    return f2 ? f2.format(this.date) : (this.date.getMonth() + 1) + '/' + this.date.getFullYear();
  };

  Calendar.prototype._toolbar = function () {
    var bar = el('div', 'wui-cal-toolbar');

    var nav = el('div', 'wui-cal-nav');
    nav.appendChild(navBtn('chevron_left', 'prev', 'Previous'));
    var todayBtn = el('button', 'wui-cal-today-btn', 'Today');
    todayBtn.type = 'button';
    todayBtn.setAttribute('data-cal-nav', 'today');
    nav.appendChild(todayBtn);
    nav.appendChild(navBtn('chevron_right', 'next', 'Next'));
    bar.appendChild(nav);

    var title = el('div', 'wui-cal-title', this._titleText());
    bar.appendChild(title);

    bar.appendChild(el('div', 'wui-cal-spacer'));

    var seg = el('div', 'wui-cal-seg');
    seg.setAttribute('role', 'tablist');
    for (var i = 0; i < this.opts.views.length; i++) {
      var v = this.opts.views[i];
      var meta = VIEW_LABELS[v]; if (!meta) continue;
      var b = el('button', 'wui-cal-seg-btn' + (v === this.view ? ' active' : ''),
                 icon(meta[1]) + '<span>' + meta[0] + '</span>');
      b.type = 'button';
      b.setAttribute('data-cal-view', v);
      b.setAttribute('aria-selected', v === this.view ? 'true' : 'false');
      seg.appendChild(b);
    }
    bar.appendChild(seg);
    return bar;
  };

  function navBtn(ic, action, label) {
    // prev/next chevrons are directional → dirIcon so they flip under RTL.
    var b = el('button', 'wui-cal-nav-btn', dirIcon(ic));
    b.type = 'button';
    b.setAttribute('data-cal-nav', action);
    b.setAttribute('aria-label', label);
    b.title = label;
    return b;
  }

  /* ── compact event card (month / all-day / agenda chip) ── */
  Calendar.prototype._eventCard = function (ev, showTime) {
    var cls = 'wui-cal-event ' + accentClass(ev.variant);
    if (ev.allDay) cls += ' is-solid';
    if (ev.done) cls += ' is-done';
    if (ev.cancelled) cls += ' is-cancelled';
    var b = el('button', cls);
    b.type = 'button';
    b.setAttribute('data-cal-event-id', ev.id);
    var inner = '';
    if (showTime && !ev.allDay) inner += '<span class="wui-cal-event-time">' + esc(fmtTime(ev._start, this.opts.locale, this.opts.hour12)) + '</span>';
    else inner += '<span class="wui-cal-event-dot"></span>';
    inner += '<span class="wui-cal-event-title">' + esc(ev.title) + '</span>';
    b.innerHTML = inner;
    b.title = ev.title;
    return b;
  };

  /* ════════════════ MONTH ════════════════ */
  Calendar.prototype._month = function () {
    var o = this.opts;
    var wrap = el('div', 'wui-cal-month');

    // weekday headers
    var head = el('div', 'wui-cal-weekdays');
    var wf = fmt(o.locale, { weekday: 'short' });
    for (var i = 0; i < 7; i++) {
      var d = addDays(startOfWeek(new Date(), o.weekStartsOn), i);
      var isWk = (d.getDay() === 0 || d.getDay() === 6);
      var w = el('div', 'wui-cal-weekday' + (isWk ? ' is-weekend' : ''), wf ? wf.format(d) : '');
      head.appendChild(w);
    }
    wrap.appendChild(head);

    var range = this.getRange();
    var grid = el('div', 'wui-cal-grid');
    var totalDays = dayDiff(range.start, range.end);
    var today = new Date();
    var mf = fmt(o.locale, { month: 'short' });

    for (var k = 0; k < totalDays; k++) {
      var day = addDays(range.start, k);
      var other = day.getMonth() !== this.date.getMonth();
      var weekend = (day.getDay() === 0 || day.getDay() === 6);
      var cellCls = 'wui-cal-day';
      if (other) cellCls += ' is-other-month';
      if (weekend) cellCls += ' is-weekend';
      if (sameDay(day, today)) cellCls += ' is-today';
      var cell = el('div', cellCls);
      cell.setAttribute('data-cal-date', dayKey(day));

      var dhead = el('div', 'wui-cal-day-head');
      var firstOfMonth = day.getDate() === 1;
      var numLabel = firstOfMonth && mf ? mf.format(day) + ' ' + day.getDate() : day.getDate() + '';
      dhead.appendChild(el('span', 'wui-cal-daynum', numLabel));
      cell.appendChild(dhead);

      var dayEvents = this._dayEvents(day);
      var holder = el('div', 'wui-cal-events');
      var max = o.maxPerDay;
      var shown = dayEvents.length > max ? max - 1 : dayEvents.length;
      for (var e = 0; e < shown; e++) holder.appendChild(this._eventCard(dayEvents[e], true));
      if (dayEvents.length > max) {
        var more = el('button', 'wui-cal-more', '+' + (dayEvents.length - shown) + ' more');
        more.type = 'button';
        more.setAttribute('data-cal-more', dayKey(day));
        holder.appendChild(more);
      }
      cell.appendChild(holder);
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    return wrap;
  };

  /* events overlapping a single day, sorted: all-day first, then by start */
  Calendar.prototype._dayEvents = function (day) {
    var s = startOfDay(day), e = addDays(s, 1);
    var list = this.eventsInRange(s, e);
    list.sort(function (a, b) {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a._start.getTime() - b._start.getTime();
    });
    return list;
  };

  /* ════════════════ WEEK / DAY (timegrid) ════════════════ */
  Calendar.prototype._timeGrid = function (cols) {
    var o = this.opts;
    var start = cols === 7 ? startOfWeek(this.date, o.weekStartsOn) : startOfDay(this.date);
    var days = [];
    for (var i = 0; i < cols; i++) days.push(addDays(start, i));

    var wrap = el('div', 'wui-cal-time');
    wrap.style.setProperty('--wui-cal-cols', cols);

    var today = new Date();
    var dnf = fmt(o.locale, { weekday: 'short' });

    // header
    var th = el('div', 'wui-cal-time-head');
    th.appendChild(el('div', 'wui-cal-time-corner'));
    var dchead = el('div', 'wui-cal-daycols-head');
    dchead.style.setProperty('--wui-cal-cols', cols);
    for (var h = 0; h < days.length; h++) {
      var dh = el('div', 'wui-cal-dayhead' + (sameDay(days[h], today) ? ' is-today' : ''));
      dh.setAttribute('data-cal-date', dayKey(days[h]));
      dh.innerHTML = '<span class="wui-cal-dayhead-name">' + (dnf ? esc(dnf.format(days[h])) : '') + '</span>' +
                     '<span class="wui-cal-dayhead-num">' + days[h].getDate() + '</span>';
      dchead.appendChild(dh);
    }
    th.appendChild(dchead);
    wrap.appendChild(th);

    // all-day strip
    var allday = el('div', 'wui-cal-allday');
    allday.appendChild(el('div', 'wui-cal-allday-label', 'All day'));
    var adcols = el('div', 'wui-cal-allday-cols');
    adcols.style.setProperty('--wui-cal-cols', cols);
    var hasAllDay = false;
    for (var ad = 0; ad < days.length; ad++) {
      var adcell = el('div', 'wui-cal-allday-cell');
      adcell.setAttribute('data-cal-date', dayKey(days[ad]));
      adcell.setAttribute('data-cal-allday', '1');
      var adEvents = this._dayEvents(days[ad]).filter(function (x) { return x.allDay; });
      for (var z = 0; z < adEvents.length; z++) { adcell.appendChild(this._eventCard(adEvents[z], false)); hasAllDay = true; }
      adcols.appendChild(adcell);
    }
    allday.appendChild(adcols);
    if (hasAllDay) wrap.appendChild(allday);

    // scrollable timegrid
    var grid = el('div', 'wui-cal-timegrid');
    var gutter = el('div', 'wui-cal-gutter');
    var hf = fmt(o.locale, { hour: 'numeric', hour12: o.hour12 !== false });
    for (var hr = o.hourStart; hr < o.hourEnd; hr++) {
      var hb = el('div', 'wui-cal-gutter-hour');
      var hd = new Date(2000, 0, 1, hr, 0);
      hb.innerHTML = '<span>' + (hf ? esc(hf.format(hd).replace(/\s?([AP])M/i, ' $1M')) : hr) + '</span>';
      gutter.appendChild(hb);
    }
    grid.appendChild(gutter);

    var colsWrap = el('div', 'wui-cal-cols');
    colsWrap.style.setProperty('--wui-cal-cols', cols);
    this._colsWrap = colsWrap;
    this._gridDays = days;

    for (var c = 0; c < days.length; c++) {
      var colDay = days[c];
      var weekend = (colDay.getDay() === 0 || colDay.getDay() === 6);
      var col = el('div', 'wui-cal-col' + (sameDay(colDay, today) ? ' is-today' : '') + (weekend ? ' is-weekend' : ''));
      // hour cells (for click-to-create + lines)
      for (var hh = o.hourStart; hh < o.hourEnd; hh++) {
        var slot = el('div', 'wui-cal-hour');
        slot.setAttribute('data-cal-date', dayKey(colDay));
        slot.setAttribute('data-cal-hour', hh);
        col.appendChild(slot);
      }
      // timed events
      this._placeTimed(col, colDay);
      colsWrap.appendChild(col);
    }
    grid.appendChild(colsWrap);
    wrap.appendChild(grid);
    return wrap;
  };

  /* lay out timed events inside a single day column with overlap lanes */
  Calendar.prototype._placeTimed = function (col, day) {
    var o = this.opts;
    var dayStart = startOfDay(day), dayEnd = addDays(dayStart, 1);
    var timed = this.eventsInRange(dayStart, dayEnd).filter(function (x) { return !x.allDay; });
    if (!timed.length) return;
    timed.sort(function (a, b) {
      return a._start.getTime() - b._start.getTime() || b._end.getTime() - a._end.getTime();
    });

    // cluster overlapping events, assign columns greedily
    var clusters = [], cur = [], curEnd = -1;
    for (var i = 0; i < timed.length; i++) {
      var ev = timed[i];
      var st = clampMin(ev._start, dayStart), en = clampMax(ev._end, dayEnd);
      ev._t = Math.max(0, (minutesView(st, dayStart)));
      ev._b = Math.min((o.hourEnd - o.hourStart) * 60, minutesView(en, dayStart));
      if (cur.length && ev._start.getTime() >= curEnd) { clusters.push(cur); cur = []; curEnd = -1; }
      cur.push(ev); curEnd = Math.max(curEnd, ev._end.getTime());
    }
    if (cur.length) clusters.push(cur);

    var slotH = o.slotHeight, startMin = o.hourStart * 60;
    for (var ci = 0; ci < clusters.length; ci++) {
      var group = clusters[ci];
      var colEnds = [];
      for (var g = 0; g < group.length; g++) {
        var gev = group[g], placed = false;
        for (var ck = 0; ck < colEnds.length; ck++) {
          if (gev._start.getTime() >= colEnds[ck]) { gev._col = ck; colEnds[ck] = gev._end.getTime(); placed = true; break; }
        }
        if (!placed) { gev._col = colEnds.length; colEnds.push(gev._end.getTime()); }
      }
      var totalCols = colEnds.length;
      for (var gg = 0; gg < group.length; gg++) {
        var e2 = group[gg];
        var topMin = e2._t, botMin = e2._b;
        var top = (topMin / 60) * slotH;
        var height = Math.max(16, ((botMin - topMin) / 60) * slotH - 2);
        var widthPct = 100 / totalCols;
        var card = this._timedCard(e2, height);
        card.style.top = top + 'px';
        card.style.height = height + 'px';
        // Logical inline-start so overlap lanes fill from the reading edge:
        // LTR → from the left, RTL → from the right. (Was physical `left`.)
        card.style.setProperty('inset-inline-start', 'calc(' + (e2._col * widthPct) + '% + 2px)');
        card.style.width = 'calc(' + widthPct + '% - 4px)';
        col.appendChild(card);
      }
    }
  };

  function clampMin(d, min) { return d.getTime() < min.getTime() ? min : d; }
  function clampMax(d, max) { return d.getTime() > max.getTime() ? max : d; }
  function minutesView(d, dayStart) { return Math.round((d.getTime() - dayStart.getTime()) / 60000); }

  Calendar.prototype._timedCard = function (ev, height) {
    var cls = 'wui-cal-event is-timed is-solid ' + accentClass(ev.variant);
    if (height < 34) cls += ' is-compact';
    if (ev.done) cls += ' is-done';
    if (ev.cancelled) cls += ' is-cancelled';
    var b = el('button', cls);
    b.type = 'button';
    b.setAttribute('data-cal-event-id', ev.id);
    var time = fmtTime(ev._start, this.opts.locale, this.opts.hour12);
    var h = '<span class="wui-cal-event-title">' + esc(ev.title) + '</span>';
    if (height >= 34) {
      h += '<span class="wui-cal-event-time">' + esc(time) + '</span>';
      if (ev.location && height >= 58) h += '<span class="wui-cal-event-loc">' + esc(ev.location) + '</span>';
    }
    b.innerHTML = h;
    b.title = ev.title + ' · ' + time;
    return b;
  };

  /* current-time line */
  Calendar.prototype._placeNow = function () {
    if (!this._colsWrap || !this._gridDays) return;
    var o = this.opts, now = new Date();
    var mins = minutesOf(now) - o.hourStart * 60;
    if (mins < 0 || mins > (o.hourEnd - o.hourStart) * 60) return;
    for (var i = 0; i < this._gridDays.length; i++) {
      if (sameDay(this._gridDays[i], now)) {
        var col = this._colsWrap.children[i];
        if (!col) return;
        var old = col.querySelector('.wui-cal-now'); if (old) old.remove();
        var line = el('div', 'wui-cal-now');
        line.style.top = ((mins / 60) * o.slotHeight) + 'px';
        col.appendChild(line);
        return;
      }
    }
  };

  Calendar.prototype._startNowTimer = function () {
    var self = this;
    this._nowTimer = window.setInterval(function () { self._placeNow(); }, 60000);
  };
  Calendar.prototype._stopNowTimer = function () { if (this._nowTimer) { clearInterval(this._nowTimer); this._nowTimer = null; } };

  Calendar.prototype._scrollToHour = function (hour) {
    var self = this;
    window.requestAnimationFrame(function () {
      var grid = self.root.querySelector('.wui-cal-timegrid');
      if (!grid) return;
      var rows = Math.max(0, hour - self.opts.hourStart);
      grid.scrollTop = rows * self.opts.slotHeight;
    });
  };

  /* ════════════════ AGENDA ════════════════ */
  Calendar.prototype._agenda = function () {
    var o = this.opts, range = this.getRange();
    var list = this.eventsInRange(range.start, range.end).slice();
    var wrap = el('div', 'wui-cal-agenda');

    if (!list.length) {
      wrap.appendChild(this._empty('No events this month', 'event_busy'));
      return wrap;
    }

    // group by day
    list.sort(function (a, b) { return a._start.getTime() - b._start.getTime(); });
    var groups = {}, order = [];
    for (var i = 0; i < list.length; i++) {
      var ev = list[i];
      var clampedStart = ev._start.getTime() < range.start.getTime() ? range.start : ev._start;
      var key = dayKey(startOfDay(clampedStart));
      if (!groups[key]) { groups[key] = { date: startOfDay(clampedStart), items: [] }; order.push(key); }
      groups[key].items.push(ev);
    }

    var dowF = fmt(o.locale, { weekday: 'long' });
    var monF = fmt(o.locale, { month: 'long' });
    var today = new Date();

    for (var g = 0; g < order.length; g++) {
      var grp = groups[order[g]];
      var section = el('div', 'wui-cal-agenda-group');
      var isT = sameDay(grp.date, today);
      var dateHead = el('div', 'wui-cal-agenda-date' + (isT ? ' is-today' : ''));
      dateHead.innerHTML =
        '<span class="wui-cal-agenda-dow">' + (isT ? 'Today · ' : '') + (dowF ? esc(dowF.format(grp.date)) : '') + '</span>' +
        '<span class="wui-cal-agenda-dnum">' + grp.date.getDate() + '</span>' +
        '<span class="wui-cal-agenda-month">' + (monF ? esc(monF.format(grp.date)) : '') + '</span>';
      section.appendChild(dateHead);

      var rows = el('div', 'wui-cal-agenda-rows');
      for (var r = 0; r < grp.items.length; r++) rows.appendChild(this._agendaRow(grp.items[r]));
      section.appendChild(rows);
      wrap.appendChild(section);
    }
    return wrap;
  };

  Calendar.prototype._agendaRow = function (ev) {
    var cls = 'wui-cal-agenda-row ' + accentClass(ev.variant);
    if (ev.done) cls += ' is-done';
    var b = el('button', cls);
    b.type = 'button';
    b.setAttribute('data-cal-event-id', ev.id);
    var when = ev.allDay ? 'All day' :
      fmtTime(ev._start, this.opts.locale, this.opts.hour12) +
      (ev._end && ev._end.getTime() > ev._start.getTime() ? ' – ' + fmtTime(ev._end, this.opts.locale, this.opts.hour12) : '');
    var meta = '';
    if (ev.location) meta += icon('location_on') + esc(ev.location);
    if (ev.status) meta += '<span class="wui-badge wui-badge-sm ' + accentBadge(ev.variant) + '">' + esc(ev.status) + '</span>';
    b.innerHTML =
      '<span class="wui-cal-agenda-when">' + esc(when) + '</span>' +
      '<span class="wui-cal-agenda-body">' +
        '<span class="wui-cal-agenda-title">' + esc(ev.title) + '</span>' +
        (meta ? '<span class="wui-cal-agenda-meta">' + meta + '</span>' : '') +
      '</span>' +
      dirIcon('chevron_right');   // disclosure chevron → mirrors under RTL
    return b;
  };

  Calendar.prototype._empty = function (text, ic) {
    var e = el('div', 'wui-cal-empty');
    e.innerHTML = icon(ic || 'event_busy') + '<div class="wui-cal-empty-title">' + esc(text) + '</div>';
    return e;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     EVENT DELEGATION  (bound once; survives re-renders)
     ═══════════════════════════════════════════════════════════════════════ */

  Calendar.prototype._bind = function () {
    var self = this;
    this._onClick = function (e) {
      // nav
      var nav = e.target.closest('[data-cal-nav]');
      if (nav && self.root.contains(nav)) {
        var act = nav.getAttribute('data-cal-nav');
        if (act === 'today') self.today();
        else if (act === 'next') self.next();
        else self.prev();
        return;
      }
      // view switch
      var vb = e.target.closest('[data-cal-view]');
      if (vb && self.root.contains(vb)) { self.setView(vb.getAttribute('data-cal-view')); return; }
      // "+N more" → jump to day view
      var more = e.target.closest('[data-cal-more]');
      if (more && self.root.contains(more)) {
        self.date = parseDayKey(more.getAttribute('data-cal-more'));
        self.setView('day');
        return;
      }
      // event card → popup
      var card = e.target.closest('[data-cal-event-id]');
      if (card && self.root.contains(card)) {
        var ev = self.getById(card.getAttribute('data-cal-event-id'));
        if (ev) {
          self._fire('eventclick', { event: ev._raw, el: card });
          if (self.opts.popup) openPopup(self, ev);
        }
        return;
      }
      // empty slot / day cell
      var slot = e.target.closest('[data-cal-date]');
      if (slot && self.root.contains(slot)) {
        var d = parseDayKey(slot.getAttribute('data-cal-date'));
        var hr = slot.getAttribute('data-cal-hour');
        if (hr != null) d.setHours(parseInt(hr, 10), 0, 0, 0);
        self._fire('slotclick', { date: d, allDay: slot.getAttribute('data-cal-allday') === '1' || hr == null });
      }
    };
    this.root.addEventListener('click', this._onClick);
  };

  function parseDayKey(k) {
    var p = String(k).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  Calendar.prototype.openEvent = function (id) { var ev = this.getById(id); if (ev) openPopup(this, ev); return this; };
  Calendar.prototype.on = function (type, fn) {
    this.root.addEventListener(type.indexOf('wui:cal:') === 0 ? type : 'wui:cal:' + type, fn);
    return this;
  };
  Calendar.prototype.off = function (type, fn) {
    this.root.removeEventListener(type.indexOf('wui:cal:') === 0 ? type : 'wui:cal:' + type, fn);
    return this;
  };
  Calendar.prototype.destroy = function () {
    this._stopNowTimer();
    if (this._onClick) this.root.removeEventListener('click', this._onClick);
    this.root.innerHTML = '';
    var idx = registry.indexOf(this); if (idx > -1) registry.splice(idx, 1);
    delete this.root._wuiCalendar;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     FACTORY  (window.WUICalendar)
     ═══════════════════════════════════════════════════════════════════════ */

  var registry = [];

  function create(elOrSel, options) {
    var node = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
    if (!node) return null;
    if (node._wuiCalendar) { if (options) node._wuiCalendar.setEvents(options.events || node._wuiCalendar.getEvents()); return node._wuiCalendar; }
    var cal = new Calendar(node, options);
    node._wuiCalendar = cal;
    registry.push(cal);
    return cal;
  }

  function get(elOrSel) {
    var node = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
    return node && node._wuiCalendar ? node._wuiCalendar : null;
  }

  /* Auto-init: every [data-wui-calendar] not yet instantiated. Reads inline
     options from data-events (JSON array) / data-view if present. */
  function init(rootEl) {
    var scope = rootEl || document;
    var nodes = scope.querySelectorAll('[data-wui-calendar]');
    var made = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n._wuiCalendar) { made.push(n._wuiCalendar); continue; }
      var opts = {};
      var ev = n.getAttribute('data-events');
      if (ev) { try { opts.events = JSON.parse(ev); } catch (e) {} }
      var v = n.getAttribute('data-view'); if (v) opts.view = v;
      var ws = n.getAttribute('data-week-starts-on'); if (ws != null) opts.weekStartsOn = parseInt(ws, 10);
      made.push(create(n, opts));
    }
    return made;
  }

  window.WUICalendar = {
    create: create,
    get: get,
    init: init,
    closePopup: closePopup,
    _instances: registry
  };

  if (WUI && WUI.ready) WUI.ready(function () { init(); });
  else if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', function () { init(); });

})(window, document);
