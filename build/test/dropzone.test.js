import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  // jsdom historically lacks DataTransfer; stub a minimal, spec-shaped one so the
  // component's per-zone DataTransfer + input.files sync are exercisable.
  const win = dom.window;
  if (typeof win.DataTransfer === 'undefined') {
    class FileListLike extends Array { item(i) { return this[i]; } }
    win.DataTransfer = class {
      constructor() {
        const store = [];
        this.items = {
          add: (f) => { store.push(f); },
        };
        Object.defineProperty(this, 'files', {
          get() { const fl = new FileListLike(); store.forEach(f => fl.push(f)); return fl; }
        });
      }
    };
  }
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

function mkFile(win, name, sizeBytes, type) {
  const f = new win.File(['x'], name, { type: type || '' });
  Object.defineProperty(f, 'size', { value: sizeBytes, configurable: true });
  return f;
}

function fileListOf(win, files) {
  const dt = new win.DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt.files;
}

test('dropzone: browse valid files render chips + sync native input', () => {
  const dom = load('<div data-wui-dropzone data-wui-dz-input="#f" data-wui-dz-types="pdf,doc"></div><input id="f" type="file" multiple>');
  const { WUI, document } = dom.window;
  const zone = document.querySelector('[data-wui-dropzone]');
  const input = document.getElementById('f');
  WUI.initDropzone(zone); // idempotent re-call after boot

  const files = fileListOf(dom.window, [
    mkFile(dom.window, 'a.pdf', 1000, 'application/pdf'),
    mkFile(dom.window, 'b.doc', 2000, '')
  ]);
  Object.defineProperty(input, 'files', { value: files, configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));

  assert.equal(zone.querySelectorAll('.wui-dz-chip').length, 2, 'two chips rendered');
  assert.equal(input.files.length, 2, 'native input synced');
});

test('dropzone: oversize / too-many / wrong-type rejected with feedback', () => {
  const dom = load('<div data-wui-dropzone data-wui-dz-input="#f" data-wui-dz-max-mb="1" data-wui-dz-max-files="1" data-wui-dz-types="pdf"></div><input id="f" type="file" multiple>');
  const { WUI, document } = dom.window;
  const zone = document.querySelector('[data-wui-dropzone]');
  const input = document.getElementById('f');
  WUI.initDropzone(zone);
  const feedback = zone.querySelector('.wui-dz-feedback');

  // wrong type
  Object.defineProperty(input, 'files', { value: fileListOf(dom.window, [mkFile(dom.window, 'bad.exe', 10, '')]), configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));
  assert.equal(zone.querySelectorAll('.wui-dz-chip').length, 0, 'wrong type rejected');
  assert.notEqual(feedback.style.display, 'none', 'feedback shown');
  assert.ok(/not an allowed type/.test(feedback.textContent));

  // oversize (2 MB > 1 MB)
  Object.defineProperty(input, 'files', { value: fileListOf(dom.window, [mkFile(dom.window, 'big.pdf', 2 * 1024 * 1024, 'application/pdf')]), configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));
  assert.equal(zone.querySelectorAll('.wui-dz-chip').length, 0, 'oversize rejected');
  assert.ok(/limit/.test(feedback.textContent));

  // one ok, then too many
  Object.defineProperty(input, 'files', { value: fileListOf(dom.window, [
    mkFile(dom.window, 'ok.pdf', 100, 'application/pdf'),
    mkFile(dom.window, 'extra.pdf', 100, 'application/pdf')
  ]), configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));
  assert.equal(zone.querySelectorAll('.wui-dz-chip').length, 1, 'only one accepted under max-files=1');
  assert.ok(/up to 1/.test(feedback.textContent));
});

test('dropzone: remove chip drops the file from the native input', () => {
  const dom = load('<div data-wui-dropzone data-wui-dz-input="#f" data-wui-dz-types="pdf"></div><input id="f" type="file" multiple>');
  const { WUI, document } = dom.window;
  const zone = document.querySelector('[data-wui-dropzone]');
  const input = document.getElementById('f');
  WUI.initDropzone(zone);

  Object.defineProperty(input, 'files', { value: fileListOf(dom.window, [
    mkFile(dom.window, 'a.pdf', 100, 'application/pdf'),
    mkFile(dom.window, 'b.pdf', 100, 'application/pdf')
  ]), configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));
  assert.equal(input.files.length, 2);

  zone.querySelector('.wui-dz-chip [data-wui-dz-remove]').click();
  assert.equal(zone.querySelectorAll('.wui-dz-chip').length, 1, 'one chip left');
  assert.equal(input.files.length, 1, 'native input re-synced after removal');
});

test('dropzone: init is idempotent per zone', () => {
  const dom = load('<div data-wui-dropzone data-wui-dz-input="#f"></div><input id="f" type="file" multiple>');
  const { WUI, document } = dom.window;
  const zone = document.querySelector('[data-wui-dropzone]');
  WUI.initDropzone(zone);
  WUI.initDropzone(zone);
  assert.equal(zone.querySelectorAll('.wui-dz-prompt').length, 1, 'prompt built once');
  assert.equal(zone.querySelectorAll('.wui-dz-list').length, 1, 'list built once');
});

test('dropzone: localized prompt + error text after register + setLang(ar)', () => {
  const dom = load('<div data-wui-dropzone data-wui-dz-input="#f" data-wui-dz-types="pdf"></div><input id="f" type="file" multiple>');
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'ar', id: 'DropzonePrompt', value: 'اسحب الملفات هنا' },
    { lang: 'ar', id: 'DropzoneErrType', value: '"{name}" نوع غير مسموح ({types}).' },
    { lang: 'ar', id: 'DropzoneRemove', value: 'إزالة الملف' }
  ]);
  const zone = document.querySelector('[data-wui-dropzone]');
  const input = document.getElementById('f');
  WUI.initDropzone(zone);

  WUI.i18n.setLang('ar');           // triggers i18n.apply + langchange
  assert.equal(zone.querySelector('.wui-dz-prompt').textContent, 'اسحب الملفات هنا');

  Object.defineProperty(input, 'files', { value: fileListOf(dom.window, [mkFile(dom.window, 'x.exe', 10, '')]), configurable: true, writable: true });
  input.dispatchEvent(new dom.window.Event('change'));
  const feedback = zone.querySelector('.wui-dz-feedback');
  assert.ok(/نوع غير مسموح/.test(feedback.textContent), 'arabic error text');
});

test('dz-engine: webeoc mode createFileRecord runs AddRecord+REST per file and writes idField', async () => {
  const dom = load(
    '<div id="zone" data-wui-dropzone data-wui-dz-manual="true" data-wui-dz-input="#f"></div>' +
    '<input id="f" type="file" multiple>' +
    '<input type="text" name="attachmentsIDs">'
  );
  const window = dom.window;
  const document = window.document;
  const { WUI } = window;

  // stub BoardScript + fetch the way a WebEOC page provides them
  const addRecordCalls = [];
  window.BoardScript = {
    AddRecord: (a, fileView, record, cb) => {
      addRecordCalls.push({ fileView, record });
      cb('att-' + addRecordCalls.length);
    }
  };
  const uploadCalls = [];
  window.fetch = (url, opts) => {
    uploadCalls.push(url);
    return Promise.resolve({ ok: true });
  };
  // minimal $ shim: the module calls $('[name=...]').val(...)
  window.$ = function (sel) {
    const el = document.querySelector(sel);
    return { val: (v) => { if (el) el.value = v; } };
  };

  const zone = document.querySelector('#zone');
  const input = document.getElementById('f');
  const dz = WUI.dropzone.create(zone, {
    webeoc: true,
    fileView: 'BoardScript - File Upload',
    table: 'Attachments',
    idField: 'attachmentsIDs',
    input: '#f'
  });

  Object.defineProperty(input, 'files', {
    value: fileListOf(window, [mkFile(window, 'a.pdf', 100, 'application/pdf')]),
    configurable: true, writable: true
  });
  input.dispatchEvent(new window.Event('change'));

  const ids = await dz.createFileRecord();
  // ids is built inside the jsdom-eval'd realm — Array.from() normalizes it to
  // this realm's Array before comparing, avoiding a cross-realm prototype
  // mismatch in deepEqual (node:assert/strict aliases deepEqual to deepStrictEqual).
  assert.deepEqual(Array.from(ids), ['att-1']);
  assert.equal(addRecordCalls.length, 1);
  assert.equal(addRecordCalls[0].fileView, 'BoardScript - File Upload');
  assert.equal(addRecordCalls[0].record.file_name, 'a.pdf');
  assert.equal(uploadCalls.length, 1);
  assert.ok(uploadCalls[0].indexOf('BoardScript - File Upload') !== -1);
  assert.equal(document.querySelector('[name=attachmentsIDs]').value, JSON.stringify(['att-1']));
});

test('dz-engine: generic mode createFileRecord calls onUpload per file, no BoardScript/fetch touched', async () => {
  const dom = load('<div id="zone" data-wui-dropzone data-wui-dz-manual="true" data-wui-dz-input="#f"></div><input id="f" type="file" multiple>');
  const window = dom.window;
  const document = window.document;
  const { WUI } = window;

  const uploaded = [];
  const zone = document.querySelector('#zone');
  const input = document.getElementById('f');
  const dz = WUI.dropzone.create(zone, {
    webeoc: false,
    onUpload: (file) => { uploaded.push(file.name); return Promise.resolve('ok'); },
    input: '#f'
  });

  Object.defineProperty(input, 'files', {
    value: fileListOf(window, [
      mkFile(window, 'a.pdf', 100, 'application/pdf'),
      mkFile(window, 'b.pdf', 100, 'application/pdf')
    ]),
    configurable: true, writable: true
  });
  input.dispatchEvent(new window.Event('change'));

  const results = await dz.createFileRecord();
  assert.deepEqual(uploaded.sort(), ['a.pdf', 'b.pdf']);
  assert.deepEqual(Array.from(results), ['ok', 'ok']);
});

test('dz-engine: createFileRecord rejects when webeoc:true without fileView', async () => {
  const dom = load('<div id="zone" data-wui-dropzone data-wui-dz-manual="true"></div>');
  const { WUI } = dom.window;
  const zone = dom.window.document.querySelector('#zone');

  const dz1 = WUI.dropzone.create(zone, { webeoc: true });
  await assert.rejects(() => dz1.createFileRecord(), /fileView is required/);
});

test('dz-engine: create() is idempotent — same element returns the same instance', () => {
  const dom = load('<div id="zone" data-wui-dropzone></div>');
  const { WUI } = dom.window;
  const zone = dom.window.document.querySelector('#zone');
  const a = WUI.dropzone.create(zone, { webeoc: false });
  const b = WUI.dropzone.create(zone, { webeoc: true, fileView: 'x' }); // different opts, ignored — same instance
  assert.equal(a, b);
  assert.equal(zone.querySelectorAll('.wui-dz-prompt').length, 1);
});

test('dz-engine: declarative data-wui-dz-webeoc/-file-view/-table/-id-field attrs drive the same createFileRecord path', async () => {
  const dom = load(
    '<div id="zone" data-wui-dropzone data-wui-dz-input="#f" ' +
    'data-wui-dz-webeoc="true" data-wui-dz-file-view="BoardScript - File Upload" ' +
    'data-wui-dz-table="Attachments" data-wui-dz-id-field="attachmentsIDs"></div>' +
    '<input id="f" type="file" multiple><input type="text" name="attachmentsIDs">'
  );
  const window = dom.window;
  const document = window.document;
  const { WUI } = window;

  window.BoardScript = { AddRecord: (a, v, rec, cb) => cb('att-9') };
  window.fetch = () => Promise.resolve({ ok: true });
  window.$ = function (sel) {
    const el = document.querySelector(sel);
    return { val: (v) => { if (el) el.value = v; } };
  };

  const zone = document.querySelector('#zone');
  const input = document.getElementById('f');
  const dz = WUI.initDropzone(zone); // declarative path, not explicit create()

  Object.defineProperty(input, 'files', {
    value: fileListOf(window, [mkFile(window, 'a.pdf', 100, 'application/pdf')]),
    configurable: true, writable: true
  });
  input.dispatchEvent(new window.Event('change'));

  const ids = await dz.createFileRecord();
  assert.deepEqual(Array.from(ids), ['att-9']);
});
