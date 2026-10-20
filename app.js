'use strict';

/* ---------- Speicher (IndexedDB, Fallback: nur im Arbeitsspeicher) ---------- */
const DB = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      try {
        const r = indexedDB.open('ubb-begehung', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('kv', mode);
      const req = fn(t.objectStore('kv'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    get: k => tx('readonly', s => s.get(k)),
    set: (k, v) => tx('readwrite', s => s.put(v, k)),
  };
})();

const PROFILE_KEY = 'ubb-profile';
function loadProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; } }
function saveProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {} }

/* ---------- Zustand ---------- */
let state = { values: {}, photos: {} };
const FIELDS = {};
SCHEMA.forEach(s => s.fields.forEach(f => { FIELDS[f.id] = f; f.section = s.id; }));

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function freshState(keep) {
  const prof = loadProfile();
  const values = { datum: today() };
  for (const f of Object.values(FIELDS)) {
    if (f.profile && prof[f.id]) values[f.id] = prof[f.id];
    if (keep && f.keep && state.values[f.id] != null) {
      values[f.id] = state.values[f.id];
      if (state.values[f.id + '_andere'] != null) values[f.id + '_andere'] = state.values[f.id + '_andere'];
    }
  }
  return { values, photos: {} };
}

let saveTimer = null;
function scheduleSave() {
  setSaveState('…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try { await DB.set('draft', state); setSaveState('Gespeichert ✓'); }
    catch (e) { setSaveState('Nicht gespeichert!'); console.error(e); }
  }, 400);
}
// Beim Wechsel in den Hintergrund / Schliessen sofort speichern
function flushSave() {
  if (!saveTimer) return;
  clearTimeout(saveTimer); saveTimer = null;
  DB.set('draft', state).then(() => setSaveState('Gespeichert ✓')).catch(console.error);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
window.addEventListener('pagehide', flushSave);

function setSaveState(t) { document.getElementById('saveState').textContent = t; }

/* ---------- Hilfsfunktionen ---------- */
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c);
  return e;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2600);
}

function isVisible(f) {
  if (!f.showIf) return true;
  const parent = FIELDS[f.showIf.f];
  return isVisible(parent) && state.values[f.showIf.f] === f.showIf.v;
}

function isFilled(f) {
  const v = state.values[f.id];
  switch (f.type) {
    case 'sub': return false;
    case 'photos': return (state.photos[f.id] || []).length > 0;
    case 'multi': return (Array.isArray(v) && v.length > 0) || !!(state.values[f.id + '_andere'] || '').trim();
    case 'radio': return (v != null && v !== '') || !!(f.other && (state.values[f.id + '_andere'] || '').trim());
    default: return v != null && String(v).trim() !== '';
  }
}

function setValue(id, v) {
  if (v === '' || v == null || (Array.isArray(v) && !v.length)) delete state.values[id];
  else state.values[id] = v;
  const f = FIELDS[id];
  if (f && f.profile) { const p = loadProfile(); p[id] = v || ''; saveProfile(p); }
  // Grundwasserschutzgebiet aus Kopfdaten in Gewässerschutz übernehmen, falls dort leer
  if (id === 'gwSchutz' && v && !state.values.gew_zone) {
    state.values.gew_zone = v === 'Keines' ? 'Kein Schutzgebiet' : v;
    refreshChips('gew_zone');
  }
  afterChange();
}

function afterChange() {
  for (const f of Object.values(FIELDS)) {
    const w = document.getElementById('f_' + f.id);
    if (w) w.classList.toggle('hidden', !isVisible(f));
  }
  for (const s of SCHEMA) {
    const n = s.fields.filter(f => isVisible(f) && isFilled(f)).length;
    const b = document.getElementById('b_' + s.id);
    b.textContent = n ? `${n} ausgefüllt` : 'leer';
    b.classList.toggle('on', n > 0);
  }
  const v = state.values;
  document.getElementById('subTitle').textContent =
    [v.projekt, v.datum && fmtDate(v.datum)].filter(Boolean).join(' · ') || 'Neues Protokoll';
  scheduleSave();
}

function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/* ---------- Formular aufbauen ---------- */
function render() {
  const root = document.getElementById('form');
  root.innerHTML = '';
  SCHEMA.forEach((s, i) => {
    const body = el('div', { class: 'secbody' });
    if (s.aids) body.append(el('div', { class: 'aids' }, 'Hilfsmittel: ' + s.aids));
    s.fields.forEach(f => body.append(renderField(f)));
    const det = el('details', { class: 'sec', id: 's_' + s.id },
      el('summary', {}, el('span', { class: 't' }, s.title), el('span', { class: 'badge', id: 'b_' + s.id }, 'leer')),
      body);
    if (i === 0) det.open = true;
    root.append(det);
  });
  afterChange();
}

function labelEl(f, forId) {
  return el(forId ? 'label' : 'div', { class: forId ? null : 'lbl', for: forId },
    f.label, f.hint ? el('span', { class: 'hint' }, f.hint) : null);
}

function renderField(f) {
  if (f.type === 'sub') return el('div', { class: 'sub', id: 'f_' + f.id }, f.label);
  const w = el('div', { class: ['f', f.width, f.showIf ? 'cond' : ''].filter(Boolean).join(' '), id: 'f_' + f.id });
  const v = state.values[f.id];
  const inpId = 'i_' + f.id;

  if (['text', 'number', 'date'].includes(f.type)) {
    const inp = el('input', {
      id: inpId, type: f.type === 'number' ? 'text' : f.type,
      inputmode: f.type === 'number' ? 'decimal' : null, autocomplete: 'off',
      value: v ?? '',
      oninput: e => {
        setValue(f.id, e.target.value);
        if (f.ph) checkPh(e.target);
      },
    });
    if (f.ph) checkPh(inp);
    w.append(labelEl(f, inpId), inp);
  } else if (f.type === 'textarea') {
    const ta = el('textarea', { id: inpId, rows: 3, oninput: e => { setValue(f.id, e.target.value); autosize(e.target); } });
    ta.value = v ?? '';
    w.append(labelEl(f, inpId), ta);
    requestAnimationFrame(() => autosize(ta));
  } else if (f.type === 'radio' || f.type === 'multi') {
    const chips = el('div', { class: 'chips', id: 'c_' + f.id, role: f.type === 'radio' ? 'radiogroup' : 'group' });
    f.options.forEach(o => chips.append(el('button', {
      type: 'button', class: 'chip', 'data-v': o,
      onclick: () => toggleChip(f, o),
    }, o)));
    w.append(labelEl(f), chips);
    if (f.other) {
      const oi = el('input', {
        type: 'text', class: 'other', placeholder: 'Andere:', autocomplete: 'off',
        value: state.values[f.id + '_andere'] ?? '',
        oninput: e => setValue(f.id + '_andere', e.target.value),
      });
      w.append(oi);
    }
    queueMicrotask(() => refreshChips(f.id));
  } else if (f.type === 'photos') {
    w.append(labelEl(f), el('div', { class: 'photos', id: 'p_' + f.id }));
    queueMicrotask(() => renderPhotos(f.id));
  }
  return w;
}

function checkPh(inp) {
  const n = parseFloat(String(inp.value).replace(',', '.'));
  inp.classList.toggle('bad', !isNaN(n) && (n < 6.5 || n > 9));
}

function autosize(ta) { ta.style.height = 'auto'; ta.style.height = Math.max(76, ta.scrollHeight + 2) + 'px'; }

function toggleChip(f, o) {
  if (f.type === 'radio') {
    setValue(f.id, state.values[f.id] === o ? null : o); // erneutes Tippen hebt die Auswahl auf
  } else {
    let arr = Array.isArray(state.values[f.id]) ? [...state.values[f.id]] : [];
    if (arr.includes(o)) arr = arr.filter(x => x !== o);
    else if (o === 'Keine') arr = ['Keine'];
    else { arr = arr.filter(x => x !== 'Keine'); arr.push(o); }
    arr.sort((a, b) => f.options.indexOf(a) - f.options.indexOf(b));
    setValue(f.id, arr);
  }
  refreshChips(f.id);
}

function refreshChips(id) {
  const box = document.getElementById('c_' + id);
  if (!box) return;
  const v = state.values[id];
  box.querySelectorAll('.chip').forEach(c => {
    const on = Array.isArray(v) ? v.includes(c.dataset.v) : v === c.dataset.v;
    c.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

/* ---------- Fotos ---------- */
function renderPhotos(fid) {
  const box = document.getElementById('p_' + fid);
  box.innerHTML = '';
  for (const p of state.photos[fid] || []) {
    box.append(el('div', { class: 'ph' },
      el('img', { src: p.data, alt: p.caption || 'Foto' }),
      el('button', {
        type: 'button', class: 'del', 'aria-label': 'Foto löschen',
        onclick: () => {
          if (!confirm('Foto löschen?')) return;
          state.photos[fid] = state.photos[fid].filter(x => x.id !== p.id);
          renderPhotos(fid); afterChange();
        },
      }, '×'),
      el('input', {
        type: 'text', placeholder: 'Beschriftung', value: p.caption || '',
        oninput: e => { p.caption = e.target.value; scheduleSave(); },
      })));
  }
  const inp = el('input', {
    type: 'file', accept: 'image/*', multiple: true,
    onchange: async e => {
      const files = [...e.target.files];
      e.target.value = '';
      for (const file of files) {
        try {
          const ph = await compressImage(file);
          (state.photos[fid] ||= []).push(ph);
        } catch (err) { console.error(err); toast('Foto konnte nicht geladen werden.'); }
      }
      renderPhotos(fid); afterChange();
    },
  });
  box.append(el('label', { class: 'addph' }, '+ Foto', inp));
}

function compressImage(file, max = 1600, q = 0.72) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      const s = Math.min(1, max / Math.max(w, h));
      w = Math.round(w * s); h = Math.round(h * s);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res({ id: uid(), data: c.toDataURL('image/jpeg', q), w, h, caption: '' });
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild nicht lesbar')); };
    img.src = url;
  });
}

/* ---------- PDF ---------- */
// Standard-PDF-Schriften kennen nur Latin-1: Sonderzeichen ersetzen
function clean(s) {
  return String(s ?? '')
    .replace(/[–—]/g, '-').replace(/…/g, '...')
    .replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"')
    .replace(/ /g, ' ').replace(/\r/g, '')
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, '');
}

function valueText(f) {
  const v = state.values[f.id];
  const other = (state.values[f.id + '_andere'] || '').trim();
  if (f.type === 'multi') return [...(Array.isArray(v) ? v : []), ...(other ? ['Andere: ' + other] : [])].join(', ');
  if (f.type === 'radio') return [v, other ? (v ? 'Andere: ' : '') + other : null].filter(Boolean).join(', ');
  if (f.type === 'date') return fmtDate(v);
  if (f.ph) {
    const n = parseFloat(String(v).replace(',', '.'));
    return String(v) + (!isNaN(n) && (n < 6.5 || n > 9) ? '  (ausserhalb Soll 6.5 - 9.0)' : '');
  }
  return String(v);
}

function buildPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const PW = 210, PH = 297, M = 15, W = PW - 2 * M, LW = 68, VW = W - LW;
  const TOP = 15, BOTTOM = PH - 16, LH = 4.3, FS = 9.5;
  const C = { ink: [29, 36, 32], muted: [102, 112, 106], line: [205, 205, 196], head: [227, 236, 229], label: [246, 246, 241], warn: [165, 64, 45] };
  const v = state.values;
  let y = TOP;

  const newPage = () => { doc.addPage(); y = TOP; };
  const need = h => { if (y + h > BOTTOM) newPage(); };

  // Titel
  doc.setTextColor(...C.ink);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Umweltbaubegleitung - Begehungsprotokoll', M, y + 6);
  y += 11;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...C.muted);
  const subline = [v.projekt, v.datum && fmtDate(v.datum), valueText(FIELDS.artBegehung) || null]
    .filter(x => x && String(x).trim()).map(clean).join('   |   ');
  if (subline) { doc.text(doc.splitTextToSize(subline, W), M, y + 1); y += 6; }
  doc.setDrawColor(47, 93, 70); doc.setLineWidth(0.6);
  doc.line(M, y, M + W, y); y += 6;
  doc.setLineWidth(0.2);

  function sectionHead(title) {
    need(18);
    doc.setFillColor(...C.head); doc.setDrawColor(...C.line);
    doc.rect(M, y, W, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...C.ink);
    doc.text(clean(title), M + 3, y + 5.5);
    y += 8;
  }

  function subHead(title) {
    need(14);
    y += 1.5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text(clean(title).toUpperCase(), M + 2, y + 4);
    y += 6;
  }

  function row(label, value, warn) {
    doc.setFontSize(FS);
    doc.setFont('helvetica', 'bold');
    const ll = doc.splitTextToSize(clean(label), LW - 5);
    doc.setFont('helvetica', 'normal');
    let vl = doc.splitTextToSize(clean(value), VW - 5);
    let first = true;
    for (;;) {
      let avail = Math.floor((BOTTOM - y - 3) / LH);
      // Mindestens Label (bzw. eine Zeile) auf der aktuellen Seite, sonst neue Seite
      const required = first ? Math.max(ll.length, Math.min(vl.length, 2), 1) : 1;
      if (avail < required && y > TOP) { newPage(); avail = Math.floor((BOTTOM - y - 3) / LH); }
      const n = Math.min(vl.length, avail);
      const chunk = vl.slice(0, n); vl = vl.slice(n);
      const lines = Math.max(chunk.length, first ? ll.length : 0, 1);
      const h = lines * LH + 3;
      doc.setFillColor(...C.label); doc.setDrawColor(...C.line);
      doc.rect(M, y, LW, h, 'FD');
      doc.rect(M + LW, y, VW, h, 'S');
      if (first) {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.ink);
        doc.text(ll, M + 2.5, y + 4.6, { lineHeightFactor: LH / (FS * 0.3528) });
      }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...(warn ? C.warn : C.ink));
      if (chunk.length) doc.text(chunk, M + LW + 2.5, y + 4.6, { lineHeightFactor: LH / (FS * 0.3528) });
      y += h;
      first = false;
      if (!vl.length) break;
    }
  }

  function photos(list) {
    const GAP = 6, CW = (W - GAP) / 2, MAXH = 72;
    for (let i = 0; i < list.length; i += 2) {
      const pair = list.slice(i, i + 2).map(p => {
        let w = CW, h = CW * p.h / p.w;
        if (h > MAXH) { h = MAXH; w = MAXH * p.w / p.h; }
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5);
        const cap = p.caption ? doc.splitTextToSize(clean(p.caption), CW) : [];
        return { p, w, h, cap };
      });
      const rowH = Math.max(...pair.map(o => o.h + (o.cap.length ? o.cap.length * 3.6 + 2 : 0))) + 4;
      need(rowH);
      y += 3;
      pair.forEach((o, k) => {
        const x = M + k * (CW + GAP);
        doc.addImage(o.p.data, 'JPEG', x, y, o.w, o.h, o.p.id, 'FAST');
        if (o.cap.length) {
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
          doc.text(o.cap, x, y + o.h + 4);
        }
      });
      y += rowH - 3;
    }
    y += 3;
  }

  let any = false;
  for (const s of SCHEMA) {
    // Nur sichtbare + ausgefüllte Felder; Zwischentitel nur, wenn darunter etwas ausgefüllt ist
    const items = [];
    let pendingSub = null;
    for (const f of s.fields) {
      if (f.type === 'sub') { pendingSub = f; continue; }
      if (!isVisible(f) || !isFilled(f)) continue;
      if (pendingSub) { items.push(pendingSub); pendingSub = null; }
      items.push(f);
    }
    if (!items.length) continue;
    any = true;
    y += 4;
    sectionHead(s.title);
    for (const f of items) {
      if (f.type === 'sub') subHead(f.label);
      else if (f.type === 'photos') photos(state.photos[f.id]);
      else {
        const txt = valueText(f);
        row(f.label, txt, f.ph && /ausserhalb/.test(txt));
      }
    }
  }
  if (!any) return null;

  // Fusszeile
  const n = doc.getNumberOfPages();
  const foot = clean(['UBB Begehungsprotokoll', v.projekt, v.datum && fmtDate(v.datum)].filter(Boolean).join('  |  '));
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text(foot, M, PH - 8);
    doc.text(`Seite ${i} / ${n}`, PW - M, PH - 8, { align: 'right' });
  }
  return doc.output('blob');
}

function fileName() {
  const v = state.values;
  const part = s => clean(s || '').trim().replace(/[\\/:*?"<>|.,;]+/g, ' ').replace(/\s+/g, '-').slice(0, 40);
  const parts = [v.datum || today(), part(v.projekt), part(valueText(FIELDS.artBegehung)), part(v.ubbKuerzel)].filter(Boolean);
  return parts.join('_') + '.pdf';
}

let lastPdf = null;
function onPdf() {
  const btn = document.getElementById('btnPdf');
  btn.disabled = true; btn.textContent = 'Erstelle PDF …';
  setTimeout(() => {
    try {
      const blob = buildPdf();
      if (!blob) { toast('Noch keine Angaben erfasst.'); return; }
      const name = fileName();
      lastPdf = { blob, name, file: new File([blob], name, { type: 'application/pdf' }) };
      document.getElementById('pdfName').textContent = name;
      const canShare = !!(navigator.canShare && navigator.canShare({ files: [lastPdf.file] }));
      document.getElementById('btnShare').style.display = canShare ? '' : 'none';
      document.getElementById('pdfHint').innerHTML = canShare
        ? 'Im Teilen-Menü <b>OneDrive</b> wählen und den Zielordner bestimmen. Auf dem iPhone geht auch «In Dateien sichern» → OneDrive.'
        : 'Dieser Browser unterstützt das Teilen-Menü nicht. PDF herunterladen und in OneDrive hochladen.';
      document.getElementById('dlgPdf').showModal();
    } catch (e) {
      console.error(e); toast('Fehler beim Erstellen des PDF.');
    } finally {
      btn.disabled = false; btn.textContent = 'PDF erstellen';
    }
  }, 30);
}

async function onShare() {
  if (!lastPdf) return;
  try {
    await navigator.share({ files: [lastPdf.file], title: lastPdf.name });
  } catch (e) {
    if (e.name !== 'AbortError') { console.error(e); toast('Teilen nicht möglich – bitte «Herunterladen» verwenden.'); }
  }
}

function onDownload() {
  if (!lastPdf) return;
  const url = URL.createObjectURL(lastPdf.blob);
  const a = el('a', { href: url, download: lastPdf.name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function onPreview() {
  if (!lastPdf) return;
  const url = URL.createObjectURL(lastPdf.blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
}

/* ---------- Start ---------- */
async function init() {
  try { const d = await DB.get('draft'); state = d && d.values ? d : freshState(false); }
  catch { state = freshState(false); toast('Lokaler Speicher nicht verfügbar – Entwürfe werden nicht gesichert.'); }
  state.photos ||= {};
  render();
  setSaveState('');

  document.getElementById('btnPdf').onclick = onPdf;
  document.getElementById('btnShare').onclick = onShare;
  document.getElementById('btnDownload').onclick = onDownload;
  document.getElementById('btnPreview').onclick = onPreview;
  document.getElementById('btnClosePdf').onclick = () => document.getElementById('dlgPdf').close();
  document.getElementById('btnNew').onclick = () => document.getElementById('dlgNew').showModal();
  document.getElementById('btnNewCancel').onclick = () => document.getElementById('dlgNew').close();
  document.getElementById('btnNewOk').onclick = () => {
    state = freshState(document.getElementById('keepProject').checked);
    document.getElementById('dlgNew').close();
    render(); flushSave(); window.scrollTo(0, 0);
    toast('Neues Protokoll gestartet.');
  };

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
init();
