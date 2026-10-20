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
  return { values, photos: {}, gis: {} };
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
    case 'gis': return ((state.gis || {})[f.id] || []).length > 0;
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
    if (s.intro) body.append(el('div', { class: 'aids' }, s.intro));
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
  } else if (f.type === 'gis') {
    GIS.render(f, w);
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

// AFRY-Logo für PDF (schwarz), beim Start geladen, falls afry-logo.png vorhanden
let PDF_LOGO = null;
async function loadPdfLogo() {
  try {
    const r = await fetch('afry-logo.png', { cache: 'no-cache' });
    if (!r.ok) return;
    const blob = await r.blob();
    const data = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = data; });
    PDF_LOGO = { data, w: img.naturalWidth, h: img.naturalHeight };
  } catch { PDF_LOGO = null; }
}

function buildPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  // Schrift: Helvetica (PDF-Standardschrift, metrisch identisch mit Arial), Grundgrösse 10 pt
  const PW = 210, PH = 297, M = 15, W = PW - 2 * M, LW = 68, VW = W - LW;
  const TOP = 24, BOTTOM = PH - 16, FS = 10, LH = 4.5;
  const LHF = LH / (FS * 0.3528);
  const C = { ink: [0, 0, 0], muted: [92, 92, 92], line: [217, 217, 217], label: [242, 242, 242], warn: [161, 92, 0] };
  const v = state.values;
  let y = TOP;

  const newPage = () => { doc.addPage(); y = TOP; };
  const need = h => { if (y + h > BOTTOM) newPage(); };

  // Titel (erste Seite)
  doc.setTextColor(...C.ink);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Umweltbaubegleitung - Begehungsprotokoll', M, y + 4);
  y += 10;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(...C.muted);
  const subline = [v.projekt, v.datum && fmtDate(v.datum), valueText(FIELDS.artBegehung) || null]
    .filter(x => x && String(x).trim()).map(clean).join('   |   ');
  if (subline) { const sl = doc.splitTextToSize(subline, W); doc.text(sl, M, y); y += sl.length * LH + 1; }
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.6);
  doc.line(M, y, M + W, y); y += 4;
  doc.setLineWidth(0.2);

  function sectionHead(title) {
    need(20);
    y += 4;
    doc.setFillColor(0, 0, 0);
    doc.rect(M, y, W, 7.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(FS); doc.setTextColor(255, 255, 255);
    doc.text(clean(title).toUpperCase(), M + 3, y + 5.1, { charSpace: 0.25 });
    y += 7.5;
  }

  function subHead(title) {
    need(14);
    y += 1.5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
    doc.text(clean(title).toUpperCase(), M + 2.5, y + 4, { charSpace: 0.2 });
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
        doc.text(ll, M + 2.5, y + 4.8, { lineHeightFactor: LHF });
      }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...(warn ? C.warn : C.ink));
      if (chunk.length) doc.text(chunk, M + LW + 2.5, y + 4.8, { lineHeightFactor: LHF });
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
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
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
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
          doc.text(o.cap, x, y + o.h + 4);
        }
      });
      y += rowH - 3;
    }
    y += 3;
  }

  // GIS-Karten: Bild in voller Breite (Massstab stimmt bei Druck 100 %), darunter Angaben und Legende
  function gisMaps(list) {
    for (const m of list) {
      const mh = W * m.h / m.w;
      doc.setFontSize(FS);
      const info = [
        `${m.layerLabel}  |  Massstab 1:${Math.round(m.scale).toLocaleString('de-CH')} (A4, Druck 100 %)  |  Hintergrund: ${m.bgLabel}`,
        `Standort: E ${Math.round(m.E).toLocaleString('de-CH')} / N ${Math.round(m.N).toLocaleString('de-CH')} (LV95)  |  ` +
          (m.source === 'GPS' ? `GPS, Genauigkeit +/-${Math.round(m.acc)} m` : 'Koordinaten manuell') +
          `  |  ${new Date(m.time).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}`,
      ];
      const hits = GIS.hitsText(m);
      if (hits.length) info.push('Am Standort: ' + hits.join('; '));
      if (m.remark) info.push('Bemerkung: ' + m.remark);
      if (!m.layerOk) info.push('Hinweis: Themenebene konnte nicht geladen werden.');
      const lines = info.flatMap(t => doc.splitTextToSize(clean(t), W));
      // Legende in Originalgrösse (96 dpi), begrenzt
      let lw = 0, lh = 0;
      if (m.legend) {
        lw = Math.min(120, m.legend.w * 0.2646); lh = lw * m.legend.h / m.legend.w;
        if (lh > 90) { lh = 90; lw = lh * m.legend.w / m.legend.h; }
      }
      const blockH = mh + 4 + lines.length * LH + 4, legH = m.legend ? lh + 8 : 0;
      need(blockH + legH <= BOTTOM - TOP ? blockH + legH : blockH);
      y += 3;
      doc.addImage(m.data, 'JPEG', M, y, W, mh, m.id, 'FAST');
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.rect(M, y, W, mh, 'S'); doc.setLineWidth(0.2);
      y += mh + 4.5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(...C.ink);
      doc.text(lines, M, y, { lineHeightFactor: LHF });
      y += lines.length * LH + 1;
      if (m.legend) {
        need(legH);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
        doc.text('LEGENDE', M, y + 3, { charSpace: 0.2 });
        doc.addImage(m.legend.data, 'PNG', M, y + 5, lw, lh, m.id + '_leg', 'FAST');
        y += lh + 8;
      }
      y += 3;
    }
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
    sectionHead(s.title);
    for (const f of items) {
      if (f.type === 'sub') subHead(f.label);
      else if (f.type === 'photos') photos(state.photos[f.id]);
      else if (f.type === 'gis') gisMaps(state.gis[f.id]);
      else {
        const txt = valueText(f);
        row(f.label, txt, f.ph && /ausserhalb/.test(txt));
      }
    }
  }
  if (!any) return null;

  // Kopf (Logo) und Fusszeile auf jeder Seite
  const n = doc.getNumberOfPages();
  const foot = clean(['UBB Begehungsprotokoll', v.projekt, v.datum && fmtDate(v.datum)].filter(Boolean).join('  |  '));
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    if (PDF_LOGO) {
      const lh = 6, lw = lh * PDF_LOGO.w / PDF_LOGO.h;
      doc.addImage(PDF_LOGO.data, 'PNG', PW - M - lw, 9, lw, lh, 'afry_logo', 'FAST');
    } else {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(0, 0, 0);
      doc.text('AFRY', PW - M, 14, { align: 'right', charSpace: 0.6 });
    }
    if (i > 1) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
      doc.text(foot, M, 14);
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.line(M, 18, PW - M, 18); doc.setLineWidth(0.2);
    }
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
  if (lastPdf) downloadBlob(lastPdf.blob, lastPdf.name);
}

function onPreview() {
  if (!lastPdf) return;
  const url = URL.createObjectURL(lastPdf.blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
}

/* ---------- Presets ---------- */
// Preset = { id, name, values: { feldId: wert, feldId_andere: text }, updated }
let presets = [];
const $ = id => document.getElementById(id);

async function loadPresets() {
  try { presets = (await DB.get('presets')) || []; } catch { presets = []; }
}
async function storePresets() {
  presets.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  try { await DB.set('presets', presets); } catch (e) { console.error(e); toast('Presets konnten nicht gespeichert werden.'); }
}

// Felder, die in einem Preset vorkommen dürfen
const presetable = f => !['photos', 'sub', 'gis'].includes(f.type) && f.id !== 'datum';
// Werte eines Feldes inkl. «Andere»-Text
function fieldValues(src, id) {
  const out = {};
  if (src[id] != null) out[id] = src[id];
  if (src[id + '_andere'] != null) out[id + '_andere'] = src[id + '_andere'];
  return out;
}
const presetFieldIds = p => [...new Set(Object.keys(p.values).map(k => k.replace(/_andere$/, '')))].filter(id => FIELDS[id]);

function applyPreset(p) {
  for (const id of presetFieldIds(p)) {
    delete state.values[id]; delete state.values[id + '_andere'];
    Object.assign(state.values, fieldValues(p.values, id));
  }
}

function renderPresetList() {
  const box = $('presetList');
  box.innerHTML = '';
  if (!presets.length) { box.append(el('div', { class: 'empty' }, 'Noch keine Presets. Angaben erfassen und «Als Preset speichern» wählen oder eine Preset-Datei importieren.')); return; }
  for (const p of presets) {
    const n = presetFieldIds(p).length;
    box.append(el('div', { class: 'pitem' },
      el('div', { class: 'pn' }, el('b', {}, p.name), el('span', {}, `${n} Feld${n === 1 ? '' : 'er'}`)),
      el('button', {
        type: 'button', class: 'btn sm', onclick: () => {
          applyPreset(p); render(); flushSave(); $('dlgPresets').close();
          toast(`Preset «${p.name}» angewendet.`);
        },
      }, 'Anwenden'),
      el('button', {
        type: 'button', class: 'btn sm', 'aria-label': 'Preset löschen', onclick: async () => {
          if (!confirm(`Preset «${p.name}» löschen?`)) return;
          presets = presets.filter(x => x.id !== p.id);
          await storePresets(); renderPresetList();
        },
      }, '×')));
  }
}

function openPresetSave() {
  $('presetName').value = '';
  $('presetNames').innerHTML = '';
  presets.forEach(p => $('presetNames').append(el('option', { value: p.name })));
  renderPickList(null);
  $('dlgPresetSave').showModal();
}

// Liste der ausgefüllten Felder mit Checkbox; Vorauswahl aus bestehendem Preset oder «keep»-Feldern
function renderPickList(existing) {
  const box = $('pickList');
  box.innerHTML = '';
  const pre = existing ? new Set(presetFieldIds(existing)) : null;
  let count = 0;
  for (const s of SCHEMA) {
    const fs = s.fields.filter(f => presetable(f) && isVisible(f) && isFilled(f));
    if (!fs.length) continue;
    box.append(el('h3', {}, s.title));
    for (const f of fs) {
      count++;
      const checked = pre ? pre.has(f.id) : !!f.keep;
      box.append(el('label', {},
        el('input', { type: 'checkbox', 'data-id': f.id, checked }),
        el('span', {}, f.label, el('small', {}, valueText(f).replace(/\n/g, ' ')))));
    }
  }
  if (!count) box.append(el('div', { class: 'none' }, 'Noch keine Felder ausgefüllt.'));
}

async function savePreset() {
  const name = $('presetName').value.trim();
  if (!name) { toast('Bitte einen Namen eingeben.'); $('presetName').focus(); return; }
  const ids = [...$('pickList').querySelectorAll('input:checked')].map(c => c.dataset.id);
  if (!ids.length) { toast('Bitte mindestens ein Feld wählen.'); return; }
  const existing = presets.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing && !confirm(`Preset «${existing.name}» überschreiben?`)) return;
  const values = {};
  ids.forEach(id => Object.assign(values, fieldValues(state.values, id)));
  const p = { id: existing ? existing.id : uid(), name, values: JSON.parse(JSON.stringify(values)), updated: new Date().toISOString() };
  presets = presets.filter(x => x !== existing);
  presets.push(p);
  await storePresets();
  $('dlgPresetSave').close();
  renderPresetList();
  toast(`Preset «${name}» gespeichert (${ids.length} Felder).`);
}

async function exportPresets() {
  if (!presets.length) { toast('Keine Presets vorhanden.'); return; }
  const json = JSON.stringify({ format: 'ubb-presets', version: 1, exported: new Date().toISOString(), presets }, null, 2);
  const base = `UBB-Presets_${today()}`;
  // Nicht jeder Browser erlaubt .json im Teilen-Menü; dann als .txt (Import akzeptiert beides)
  const candidates = [new File([json], base + '.json', { type: 'application/json' }), new File([json], base + '.txt', { type: 'text/plain' })];
  const file = navigator.canShare && candidates.find(f => navigator.canShare({ files: [f] }));
  if (file) {
    try { await navigator.share({ files: [file], title: base }); }
    catch (e) { if (e.name !== 'AbortError') { console.error(e); downloadBlob(candidates[0], candidates[0].name); } }
  } else {
    downloadBlob(candidates[0], candidates[0].name);
  }
}

async function importPresets(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { toast('Datei ist keine gültige Preset-Datei.'); return; }
  const list = data && data.format === 'ubb-presets' && Array.isArray(data.presets) ? data.presets : null;
  if (!list) { toast('Datei ist keine gültige Preset-Datei.'); return; }
  let added = 0, updated = 0;
  for (const raw of list) {
    const name = String(raw && raw.name || '').trim().slice(0, 120);
    if (!name || !raw.values || typeof raw.values !== 'object') continue;
    // Nur bekannte Felder und gültige Werttypen übernehmen
    const values = {};
    for (const [k, v] of Object.entries(raw.values)) {
      const f = FIELDS[k.replace(/_andere$/, '')];
      if (!f || !presetable(f)) continue;
      if (f.type === 'multi' && !k.endsWith('_andere')) {
        if (Array.isArray(v)) values[k] = v.filter(x => f.options.includes(x));
      } else if (typeof v === 'string' || typeof v === 'number') values[k] = String(v);
    }
    if (!Object.keys(values).length) continue;
    const existing = presets.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) { existing.values = values; existing.updated = raw.updated || new Date().toISOString(); updated++; }
    else { presets.push({ id: uid(), name, values, updated: raw.updated || new Date().toISOString() }); added++; }
  }
  await storePresets();
  renderPresetList();
  toast(added + updated ? `${added} neu, ${updated} aktualisiert.` : 'Keine gültigen Presets in der Datei.');
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function openNewDialog() {
  const sel = $('newPreset');
  sel.innerHTML = '';
  sel.append(el('option', { value: '__keep' }, 'Projektdaten aus aktuellem Protokoll'));
  sel.append(el('option', { value: '__none' }, 'Leer (nur Name/Kürzel)'));
  presets.forEach(p => sel.append(el('option', { value: p.id }, 'Preset: ' + p.name)));
  $('dlgNew').showModal();
}

/* ---------- Start ---------- */
async function init() {
  try { const d = await DB.get('draft'); state = d && d.values ? d : freshState(false); }
  catch { state = freshState(false); toast('Lokaler Speicher nicht verfügbar – Entwürfe werden nicht gesichert.'); }
  state.photos ||= {};
  state.gis ||= {};
  await loadPresets();
  loadPdfLogo();
  render();
  setSaveState('');

  $('btnPresets').onclick = () => { renderPresetList(); $('dlgPresets').showModal(); };
  $('btnPresetsClose').onclick = () => $('dlgPresets').close();
  $('btnPresetSave').onclick = openPresetSave;
  $('btnPresetExport').onclick = exportPresets;
  $('presetImport').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) importPresets(f); };
  $('presetName').oninput = e => {
    const ex = presets.find(p => p.name.toLowerCase() === e.target.value.trim().toLowerCase());
    if (ex) renderPickList(ex);
  };
  $('pickAll').onclick = () => $('pickList').querySelectorAll('input').forEach(c => { c.checked = true; });
  $('pickNone').onclick = () => $('pickList').querySelectorAll('input').forEach(c => { c.checked = false; });
  $('btnPresetSaveOk').onclick = savePreset;
  $('btnPresetSaveCancel').onclick = () => $('dlgPresetSave').close();

  document.getElementById('btnPdf').onclick = onPdf;
  document.getElementById('btnShare').onclick = onShare;
  document.getElementById('btnDownload').onclick = onDownload;
  document.getElementById('btnPreview').onclick = onPreview;
  document.getElementById('btnClosePdf').onclick = () => document.getElementById('dlgPdf').close();
  $('btnNew').onclick = openNewDialog;
  $('btnNewCancel').onclick = () => $('dlgNew').close();
  $('btnNewOk').onclick = () => {
    const choice = $('newPreset').value;
    state = freshState(choice === '__keep');
    const p = presets.find(x => x.id === choice);
    if (p) applyPreset(p);
    $('dlgNew').close();
    render(); flushSave(); window.scrollTo(0, 0);
    toast(p ? `Neues Protokoll mit Preset «${p.name}».` : 'Neues Protokoll gestartet.');
  };

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
init();
