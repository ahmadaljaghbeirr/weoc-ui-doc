import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     11) DROPZONE  (data-wui-dropzone — file attach behavior + dz-engine)
     A delegated, localization-native replacement for the standalone jQuery
     uploader (JS/DragAndDropFiles.js). It does NOT replace the WebEOC upload
     path: when webeoc:true it feeds the exact same BoardScript.AddRecord +
     REST POST flow DragAndDropFiles.js used, generalized to per-instance
     config instead of hardcoded module vars. Non-WebEOC callers get the same
     zone UI/validation with a plain onUpload(file) callback instead.

     Declarative markup (auto-boots, zero JS):
       <div data-wui-dropzone
            data-wui-dz-max-mb="30"
            data-wui-dz-max-files="5"
            data-wui-dz-types="pdf,doc,docx,json"
            data-wui-dz-input="#dropFile"
            data-wui-dz-webeoc="true"
            data-wui-dz-file-view="BoardScript - File Upload"
            data-wui-dz-table="Attachments"
            data-wui-dz-attachment-field="file_attachment"
            data-wui-dz-id-field="attachmentsIDs"></div>

     Explicit factory (same shape as WeocMap.create) — use when config is
     dynamic or you need the returned instance's methods. Mark the zone
     data-wui-dz-manual="true" so auto-boot skips it (same convention as
     data-map-manual on WeocMap) — otherwise auto-boot races ahead on script
     load and locks in default (non-webeoc) options before your own init code
     runs, and create() then just hands back that wrong-config instance:
       <div data-wui-dropzone data-wui-dz-manual="true"></div>
       const dz = WUI.dropzone.create('#zone', {
         webeoc: true,
         fileView: 'BoardScript - File Upload',
         table: 'Attachments',
         attachmentField: 'file_attachment',
         idField: 'attachmentsIDs',
         maxMb: 30, maxFiles: 5, types: ['pdf','doc','docx','json'],
         input: '#dropFile'
       });
       dz.getFiles() / dz.addFiles(fileList) / dz.removeAt(i) / dz.clear()
       await dz.createFileRecord();  // webeoc: AddRecord+REST per file, writes idField
                                      // generic (webeoc:false): runs options.onUpload(file) per file

     - data-wui-dz-input / options.input points at the native file input to
       feed. Default: a hidden multiple <input type="file"> the component
       injects inside the zone.
     - Owns ONE DataTransfer per zone. drag-over / drop / click-to-browse.
     - Each dropped/browsed file is validated: size <= max-mb, count <= max-files,
       extension in types. Rejected -> inline wui- feedback (wui-empty-state, NOT
       a raw Bootstrap .text-danger). Accepted -> a wui-chip list; each chip's
       remove button drops the file from the DataTransfer and re-syncs the input.
     - Sync: input.files = dataTransfer.files, so WebEOC submit picks them up.
     - Graceful: if DataTransfer is unsupported, leave the native input's own
       file selection intact (no managed list); createFileRecord() falls back
       to reading input.files directly.
     - All user-facing text localized via WUI.i18n. RTL-safe.

     API: WUI.dropzone.create(elOrSelector, options) — explicit, returns an
     instance. WUI.initDropzone(el) — declarative back-compat, reads
     data-wui-dz-* attrs into an options object and delegates to create().
     Both idempotent per zone (el.__wuiDropzone holds the instance once built).
     Delegated boot: scan [data-wui-dropzone]; immediate + WUI.ready.
     ═══════════════════════════════════════════════════════════════════════ */

  // en defaults — boards may override via WUI.i18n.register([...]) with ar too.
  // {name} {max} {types} placeholders are filled at render time.
  if (WUI.i18n && WUI.i18n.register) {
    WUI.i18n.register([
      { lang: 'en', id: 'DropzonePrompt', value: 'Drag & drop files here, or click to browse' },
      { lang: 'en', id: 'DropzoneTitle', value: 'Upload Files' },
      { lang: 'en', id: 'DropzoneDesc', value: 'Drag & drop {types}files here. Max size {max} MB.' },
      { lang: 'en', id: 'DropzoneBrowse', value: 'Select files' },
      { lang: 'en', id: 'DropzoneErrTooBig', value: '"{name}" exceeds the {max} MB limit.' },
      { lang: 'en', id: 'DropzoneErrTooMany', value: 'You can upload up to {max} files.' },
      { lang: 'en', id: 'DropzoneErrType', value: '"{name}" is not an allowed type ({types}).' },
      { lang: 'en', id: 'DropzoneRemove', value: 'Remove file' }
    ]);
  }

  function wuiDzT(id, fallback) {
    return (WUI.i18n && WUI.i18n.t) ? WUI.i18n.t(id, fallback) : fallback;
  }

  // fill {key} placeholders in an i18n template string
  function wuiDzFmt(str, map) {
    if (str == null) return '';
    return String(str).replace(/\{(\w+)\}/g, function (m, k) {
      return (map && map[k] != null) ? map[k] : m;
    });
  }

  function wuiDzBytes(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (!bytes) return '0 Bytes';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i < 0) i = 0; if (i >= sizes.length) i = sizes.length - 1;
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  function wuiDzExt(name) {
    var parts = String(name || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function wuiDzSupportsDT() {
    try { return !!(new DataTransfer()); } catch (e) { return false; }
  }

  // --- WebEOC save-path helpers (absorbed from JS/DragAndDropFiles.js) -----
  // Board/view/table context lives in the view's leading HTML comment
  // (WebEOC's own convention). Cached once per page load.
  var wuiDzDetailsCache = null;
  function wuiDzCurrentDetails() {
    if (wuiDzDetailsCache) return wuiDzDetailsCache;
    var commentText = (document.documentElement.firstChild && document.documentElement.firstChild.textContent) || '';
    var lines = commentText.trim().split('\n');
    var board = ((lines[0] || '').trim().split(': ').slice(1).join('')) || '';
    var view  = ((lines[1] || '').trim().split(': ').slice(1).join('')) || '';
    var table = ((lines[2] || '').trim().split(': ').slice(1).join('')) || '';
    wuiDzDetailsCache = { board: board, view: view, table: table };
    return wuiDzDetailsCache;
  }

  var wuiDzRestEndpoint = '../api/rest.svc';

  function wuiDzAddRecord(fileView, record) {
    return new Promise(function (resolve) {
      BoardScript.AddRecord('', fileView, record, function (dataid) { resolve(dataid); });
    });
  }

  function wuiDzUploadFile(board, fileView, attachmentField, attachmentId, file) {
    var formData = new FormData();
    formData.append('attachmentFileData', file, file.name);
    return fetch(
      wuiDzRestEndpoint + '/board/' + board + '/input/' + fileView + '/' + attachmentId + '/attachments/' + attachmentField,
      { method: 'POST', body: formData }
    );
  }

  // --- build one zone instance ---------------------------------------------
  function wuiDzBuild(el, opts) {
    el.classList.add('wui-dropzone');   // component hook for weoc-forms.css styling

    var maxMb = parseFloat(opts.maxMb);
    if (isNaN(maxMb) || maxMb <= 0) maxMb = 30;
    var maxBytes = maxMb * 1024 * 1024;

    var maxFiles = parseInt(opts.maxFiles, 10);
    if (isNaN(maxFiles) || maxFiles < 0) maxFiles = 0; // 0 = unlimited

    var typesRaw = opts.types;
    if (typeof typesRaw === 'string') typesRaw = typesRaw.split(',');
    if (!Array.isArray(typesRaw)) typesRaw = [];
    var types = [], k;
    for (k = 0; k < typesRaw.length; k++) {
      var t = String(typesRaw[k]).replace(/^\s+|\s+$/g, '').toLowerCase();
      if (t) types.push(t);
    }
    var allowAll = types.length === 0;

    // --- resolve / create the native input we feed --------------------------
    var inputSel = opts.input;
    var input = inputSel ? document.querySelector(inputSel) : el.querySelector('input[type="file"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      // visually hidden but focusable/clickable; component drives it
      input.className = 'wui-dz-input';
      input.setAttribute('data-wui-dz-native', '');
      input.style.position = 'absolute';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      el.appendChild(input);
    }

    var supported = wuiDzSupportsDT();
    var dt = supported ? new DataTransfer() : null;

    // --- build the internal UI (idempotent) --------------------------------
    var prompt = el.querySelector('.wui-dz-prompt');
    if (!prompt) {
      // icon + title + description, mirroring the legacy DragAndDrop uploader.
      prompt = document.createElement('div');
      prompt.className = 'wui-dz-prompt';

      var dzIcon = document.createElement('span');
      dzIcon.className = 'material-symbols-outlined wui-dz-icon';
      dzIcon.setAttribute('aria-hidden', 'true');
      dzIcon.textContent = 'cloud_upload';
      prompt.appendChild(dzIcon);

      var dzTitle = document.createElement('div');
      dzTitle.className = 'wui-dz-title';
      dzTitle.setAttribute('data-wui-i18n', 'DropzoneTitle');
      dzTitle.textContent = wuiDzT('DropzoneTitle', 'Upload Files');
      prompt.appendChild(dzTitle);

      var dzDesc = document.createElement('div');
      dzDesc.className = 'wui-dz-desc';
      var typesTxt = allowAll ? '' : (types.join(', ').toUpperCase() + ' ');
      dzDesc.textContent = wuiDzFmt(
        wuiDzT('DropzoneDesc', 'Drag & drop {types}files here. Max size {max} MB.'),
        { types: typesTxt, max: maxMb });
      prompt.appendChild(dzDesc);

      el.appendChild(prompt);

      // "Select files" button (also opens the native picker). stopPropagation so
      // it doesn't double-fire with the whole-zone click-to-browse handler.
      var dzBrowse = document.createElement('button');
      dzBrowse.type = 'button';
      dzBrowse.className = 'wui-btn primary wui-dz-browse';
      dzBrowse.setAttribute('data-wui-i18n', 'DropzoneBrowse');
      dzBrowse.textContent = wuiDzT('DropzoneBrowse', 'Select files');
      dzBrowse.addEventListener('click', function (e) { e.stopPropagation(); input.click(); });
      el.appendChild(dzBrowse);
    }

    var list = el.querySelector('.wui-dz-list');
    if (!list) {
      list = document.createElement('ul');
      list.className = 'wui-dz-list';
      el.appendChild(list);
    }

    var feedback = el.querySelector('.wui-dz-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      // wui- styled feedback (empty-state family), NOT Bootstrap .text-danger
      feedback.className = 'wui-dz-feedback wui-empty-state is-error';
      feedback.setAttribute('role', 'alert');
      feedback.setAttribute('aria-live', 'polite');
      feedback.style.display = 'none';
      el.appendChild(feedback);
    }

    var feedbackTimer = null;
    function showFeedback(msg) {
      feedback.textContent = msg;
      feedback.style.display = '';
      if (feedbackTimer) { clearTimeout(feedbackTimer); }
      feedbackTimer = setTimeout(function () { feedback.style.display = 'none'; }, 5000);
    }

    // --- sync accepted files into the native input -------------------------
    function syncInput() {
      if (!supported) return;
      try { input.files = dt.files; } catch (e) {
        // Some engines expose input.files read-only; define an own property so
        // WebEOC (and tests) still observe the managed FileList.
        try { Object.defineProperty(input, 'files', { value: dt.files, configurable: true, writable: true }); } catch (e2) {}
      }
    }

    // --- render the chip list from the DataTransfer ------------------------
    function renderChips() {
      if (!supported) return;
      while (list.firstChild) list.removeChild(list.firstChild);
      var files = dt.files, i;
      for (i = 0; i < files.length; i++) {
        var file = files[i];
        var li = document.createElement('li');
        li.className = 'wui-dz-chip';
        li.setAttribute('data-wui-dz-index', String(i));

        var label = document.createElement('span');
        label.className = 'wui-dz-chip-name';
        label.textContent = file.name + ' (' + wuiDzBytes(file.size) + ')';
        li.appendChild(label);

        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'wui-btn icon-only ghost danger wui-dz-chip-remove';
        rm.setAttribute('data-wui-dz-remove', String(i));
        // localized aria-label, kept live across langchange via i18n.apply
        rm.setAttribute('data-wui-i18n-attr', 'aria-label:DropzoneRemove');
        rm.setAttribute('aria-label', wuiDzT('DropzoneRemove', 'Remove file'));
        rm.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';
        li.appendChild(rm);

        list.appendChild(li);
      }
    }

    function removeAt(idx) {
      if (!supported) return;
      var next = new DataTransfer();
      var files = dt.files, i;
      for (i = 0; i < files.length; i++) {
        if (i !== idx) next.items.add(files[i]);
      }
      dt = next;
      syncInput();
      renderChips();
    }

    // --- validate + add a set of files -------------------------------------
    function addFiles(fileList) {
      if (!supported || !fileList) return;
      var i;
      for (i = 0; i < fileList.length; i++) {
        var file = fileList[i];

        if (maxFiles > 0 && dt.files.length >= maxFiles) {
          showFeedback(wuiDzFmt(wuiDzT('DropzoneErrTooMany', 'You can upload up to {max} files.'), { max: maxFiles }));
          break;
        }
        if (!allowAll && types.indexOf(wuiDzExt(file.name)) === -1) {
          showFeedback(wuiDzFmt(wuiDzT('DropzoneErrType', '"{name}" is not an allowed type ({types}).'),
            { name: file.name, types: types.join(', ') }));
          continue;
        }
        if (file.size > maxBytes) {
          showFeedback(wuiDzFmt(wuiDzT('DropzoneErrTooBig', '"{name}" exceeds the {max} MB limit.'),
            { name: file.name, max: maxMb }));
          continue;
        }
        dt.items.add(file);
      }
      syncInput();
      renderChips();
    }

    // --- wiring ------------------------------------------------------------
    el.addEventListener('dragover', function (e) {
      e.preventDefault();
      el.classList.add('is-dragover');
    });
    el.addEventListener('dragleave', function (e) {
      e.preventDefault();
      el.classList.remove('is-dragover');
    });
    el.addEventListener('drop', function (e) {
      e.preventDefault();
      el.classList.remove('is-dragover');
      if (supported && e.dataTransfer) addFiles(e.dataTransfer.files);
    });

    // click-to-browse: anywhere in the zone that is not a chip / remove button
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest && (t.closest('[data-wui-dz-remove]') || t.closest('.wui-dz-list'))) return;
      if (t === input) return;
      input.click();
    });

    // chip removal (delegated so re-rendered chips keep working)
    list.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-wui-dz-remove]') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      removeAt(parseInt(btn.getAttribute('data-wui-dz-remove'), 10));
    });

    // browse / native change -> managed list (when supported)
    input.addEventListener('change', function () {
      if (supported) addFiles(input.files);
      // when unsupported we intentionally leave the native selection intact
    });

    // keep localized text fresh on language switch
    document.documentElement.addEventListener('wui:langchange', function () {
      prompt.textContent = wuiDzT('DropzonePrompt', prompt.textContent);
    });

    // --- dz-engine: instance API --------------------------------------------
    var instance = {
      el: el,
      getFiles: function () {
        return supported ? dt.files : (input.files || []);
      },
      addFiles: function (fileList) { addFiles(fileList); },
      removeAt: function (idx) { removeAt(idx); },
      clear: function () {
        if (supported) dt = new DataTransfer();
        syncInput();
        renderChips();
      },
      createFileRecord: function () {
        var files = supported ? dt.files : (input.files || []);

        if (opts.webeoc) {
          if (!opts.fileView) {
            return Promise.reject(new Error('WUI.dropzone: options.fileView is required when webeoc:true'));
          }
          var board = opts.board || wuiDzCurrentDetails().board;
          var attachmentField = opts.attachmentField || 'file_attachment';
          var idField = opts.idField || 'attachmentsIDs';
          var fileView = opts.fileView;
          var attachmentsIDs = [];
          var chain = Promise.resolve();

          Array.prototype.forEach.call(files, function (file) {
            chain = chain.then(function () {
              var fileNameSplit = file.name.split('.');
              var fileType = fileNameSplit[fileNameSplit.length - 1];
              var record = {
                file_name: file.name,
                file_type: fileType.toLowerCase(),
                file_size: wuiDzBytes(file.size)
              };
              return wuiDzAddRecord(fileView, record).then(function (attachmentId) {
                return wuiDzUploadFile(board, fileView, attachmentField, attachmentId, file).then(function () {
                  attachmentsIDs.push(attachmentId);
                });
              });
            });
          });

          return chain.then(function () {
            $('[name=' + idField + ']').val(JSON.stringify(attachmentsIDs));
            return attachmentsIDs;
          });
        }

        if (typeof opts.onUpload !== 'function') {
          return Promise.reject(new Error('WUI.dropzone: options.onUpload is required when webeoc is not true'));
        }
        var uploads = [];
        Array.prototype.forEach.call(files, function (file) { uploads.push(opts.onUpload(file)); });
        return Promise.all(uploads);
      }
    };

    el.__wuiDropzone = instance;
    return instance;
  }

  // --- public API ------------------------------------------------------------
  WUI.dropzone = {
    create: function (elOrSelector, options) {
      var el = (typeof elOrSelector === 'string') ? document.querySelector(elOrSelector) : elOrSelector;
      if (!el) return null;
      if (el.__wuiDropzone) return el.__wuiDropzone;
      return wuiDzBuild(el, options || {});
    }
  };

  // Declarative back-compat: data-wui-dz-* attrs -> options -> create().
  WUI.initDropzone = function (el) {
    if (!el) return null;
    if (el.__wuiDropzone) return el.__wuiDropzone;
    var opts = {
      maxMb: parseFloat(el.getAttribute('data-wui-dz-max-mb')),
      maxFiles: parseInt(el.getAttribute('data-wui-dz-max-files'), 10),
      types: el.getAttribute('data-wui-dz-types') || '',
      input: el.getAttribute('data-wui-dz-input'),
      webeoc: el.getAttribute('data-wui-dz-webeoc') === 'true',
      fileView: el.getAttribute('data-wui-dz-file-view') || undefined,
      table: el.getAttribute('data-wui-dz-table') || undefined,
      attachmentField: el.getAttribute('data-wui-dz-attachment-field') || undefined,
      idField: el.getAttribute('data-wui-dz-id-field') || undefined
    };
    return WUI.dropzone.create(el, opts);
  };

  function wuiBootDropzone() {
    var zones = document.querySelectorAll('[data-wui-dropzone]');
    for (var i = 0; i < zones.length; i++) {
      // data-wui-dz-manual="true" opts a zone OUT of auto-boot (same convention
      // as data-map-manual on WeocMap) — boards that call WUI.dropzone.create()
      // explicitly with webeoc/fileView/etc config own their own init timing,
      // so auto-boot must not race ahead and lock in default (non-webeoc) opts.
      if (zones[i].getAttribute('data-wui-dz-manual') === 'true') continue;
      WUI.initDropzone(zones[i]);
    }
  }
  // Immediate for scripts that run after the markup exists, plus WUI.ready as a
  // fallback for head-placed/deferred tags. initDropzone() is idempotent.
  wuiBootDropzone();
  WUI.ready(wuiBootDropzone);
