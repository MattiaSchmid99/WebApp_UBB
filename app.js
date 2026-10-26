'use strict';
const APP_VERSION = '10'; // bei jeder neuen Version zusammen mit sw.js und index.html (?v=) erhöhen

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
let state = { values: {}, photos: {}, gis: {}, maengel: [], nrel: {} };
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
      values[f.id] = f.type === 'auflagen' ? resetAuflagen(state.values[f.id]) : state.values[f.id];
      if (state.values[f.id + '_andere'] != null) values[f.id + '_andere'] = state.values[f.id + '_andere'];
    }
  }
  return { id: uid(), values, photos: {}, gis: {}, maengel: [], nrel: {} };
}
// Auflagen für ein neues Protokoll: Text und Herkunft übernehmen, Status/Bemerkung leeren
const resetAuflagen = arr => (Array.isArray(arr) ? arr : []).filter(a => a && String(a.text || '').trim())
  .map(a => ({ id: uid(), text: String(a.text).slice(0, 2000), herkunft: String(a.herkunft || 'Baubewilligung').slice(0, 40), status: '', bemerkung: '' }));

// Entwürfe/Presets aus Versionen vor der Zusammenlegung der Bereiche übernehmen:
// Auflagen der früheren Abschnitte in den neuen Bereich verschieben, Mängel umhängen
function migrateValues(values) {
  for (const [old, neu] of Object.entries(SECTION_MOVED)) {
    const k = old + '_auflagen', t = neu + '_auflagen';
    if (!Array.isArray(values[k])) continue;
    if (FIELDS[t]) values[t] = [...(Array.isArray(values[t]) ? values[t] : []), ...values[k]];
    delete values[k];
  }
  return values;
}
function migrateState(st) {
  migrateValues(st.values);
  st.maengel.forEach(m => { if (SECTION_MOVED[m.section]) m.section = SECTION_MOVED[m.section]; });
  for (const k of Object.keys(st.nrel)) if (!SCHEMA.some(s => s.id === k)) delete st.nrel[k];
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
    case 'auflagen': return Array.isArray(v) && v.some(a => String(a.text || '').trim());
    case 'mlist': return false;
    case 'proben': return Array.isArray(v) && v.length > 0;
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
    const mc = s.id === 'maengel' ? state.maengel.length : state.maengel.filter(m => m.section === s.id).length;
    const nr = !!state.nrel[s.id];
    const b = document.getElementById('b_' + s.id);
    const np = s.id === 'proben' ? (state.values.proben_liste || []).length : 0;
    b.textContent = s.id === 'maengel' ? (mc ? `${mc} ${mc === 1 ? 'Mangel' : 'Mängel'}` : 'keine')
      : np && !nr ? `${np} ${np === 1 ? 'Probe' : 'Proben'}` + (mc ? ` · ${mc} ${mc === 1 ? 'Mangel' : 'Mängel'}` : '')
      : nr ? 'n. rel.' : (n ? `${n} ausgefüllt` : 'leer') + (mc ? ` · ${mc} ${mc === 1 ? 'Mangel' : 'Mängel'}` : '');
    b.classList.toggle('on', n > 0 || nr);
    b.classList.toggle('warn', mc > 0 && !nr);
    const sf = document.getElementById('sf_' + s.id);
    if (sf) sf.classList.toggle('hidden', nr);
    const nb = document.getElementById('nr_' + s.id);
    if (nb) nb.setAttribute('aria-pressed', nr ? 'true' : 'false');
  }
  renderAllMaengelLists();
  const v = state.values;
  document.getElementById('subTitle').textContent =
    [v.projekt, v.datum && fmtDate(v.datum)].filter(Boolean).join(' · ') || 'Neues Protokoll';
  scheduleSave();
}

function fmtDateTime(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || '');
  return m ? `${m[3]}.${m[2]}.${m[1]}, ${m[4]}:${m[5]}` : (v || '');
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
    if (s.env) {
      body.append(el('div', { class: 'sectools' },
        el('button', { type: 'button', class: 'btn sm', id: 'nr_' + s.id, 'aria-pressed': 'false', onclick: () => toggleSectionNrel(s) }, 'Abschnitt nicht relevant'),
        el('button', { type: 'button', class: 'btn sm', onclick: () => fillOpenNrel(s) }, 'Offene Fragen: n. rel.')));
    }
    const sf = el('div', { class: 'secfields', id: 'sf_' + s.id });
    s.fields.forEach(f => sf.append(renderField(f)));
    body.append(sf);
    const det = el('details', { class: 'sec', id: 's_' + s.id },
      el('summary', {}, el('span', { class: 't' }, s.title), el('span', { class: 'badge', id: 'b_' + s.id }, 'leer')),
      body);
    if (s.id === 'allg') det.open = true;
    root.append(det);
  });
  afterChange();
}

function labelEl(f, forId) {
  return el(forId ? 'label' : 'div', { class: forId ? null : 'lbl', for: forId },
    f.label, f.req ? el('span', { class: 'req', title: 'Pflichtfeld' }, ' *') : null,
    f.hint ? el('span', { class: 'hint' }, f.hint) : null);
}
// Felder, bei denen ein Mangel erfasst werden kann
const canMangel = f => SCHEMA.find(s => s.id === f.section).env && ['radio', 'multi', 'text', 'number', 'textarea'].includes(f.type);

function renderField(f) {
  if (f.type === 'sub') return el('div', { class: f.area ? 'sub area' : 'sub', id: 'f_' + f.id }, f.label, f.hint ? el('span', { class: 'hint' }, f.hint) : null);
  const w = el('div', { class: ['f', f.width, f.showIf ? 'cond' : ''].filter(Boolean).join(' '), id: 'f_' + f.id });
  const v = state.values[f.id];
  const inpId = 'i_' + f.id;

  if (['text', 'number', 'date', 'datetime'].includes(f.type)) {
    const inp = el('input', {
      id: inpId, type: f.type === 'number' ? 'text' : f.type === 'datetime' ? 'datetime-local' : f.type,
      inputmode: f.type === 'number' ? 'decimal' : null, autocomplete: 'off',
      value: v ?? '',
      oninput: e => {
        setValue(f.id, e.target.value);
        if (f.ph) checkPh(e.target);
      },
    });
    if (f.ph) checkPh(inp);
    w.append(labelEl(f, inpId), inp);
    if (f.weather) w.append(weatherRow());
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
  } else if (f.type === 'signature') {
    w.append(labelEl(f), signaturePad(f));
  } else if (f.type === 'auflagen') {
    w.append(renderAuflagen(f));
  } else if (f.type === 'proben') {
    w.append(renderProben(f));
  } else if (f.type === 'mlist') {
    w.append(labelEl(f), el('div', { class: 'mlist', id: 'mlAll' }));
  }
  if (canMangel(f)) {
    w.append(el('div', { class: 'mrow' },
      el('div', { class: 'mlist', id: 'ml_' + f.id }),
      el('button', { type: 'button', class: 'mbtn', onclick: () => openMangel({ section: f.section, ref: f.id, refLabel: f.label }) }, '+ Mangel')));
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
  box.append(...photoAddTiles(async files => {
    for (const file of files) {
      try { (state.photos[fid] ||= []).push(await compressImage(file)); }
      catch (err) { console.error(err); toast('Foto konnte nicht geladen werden.'); }
    }
    renderPhotos(fid); afterChange();
  }));
}

// Zwei Kacheln: Kamera direkt öffnen (capture) oder Bilder aus der Galerie wählen
const ICON_CAM = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="4"/></svg>';
const ICON_IMG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-6-6-9 9"/></svg>';
function photoAddTiles(onFiles) {
  const mk = (label, icon, attrs, onTap) => {
    const inp = el('input', { type: 'file', accept: 'image/*', ...attrs, onchange: e => { const fl = [...e.target.files]; e.target.value = ''; if (fl.length) onFiles(fl); } });
    const lab = el('label', { class: 'addph' }, inp);
    lab.insertAdjacentHTML('afterbegin', icon);
    lab.append(el('span', {}, label));
    // Kamera in der App (Live-Bild); nur wenn nicht verfügbar: Kamera-App des Systems über capture
    if (onTap) lab.addEventListener('click', e => { if (e.target === inp) return; if (camAvailable()) { e.preventDefault(); onTap(inp); } });
    return lab;
  };
  return [
    mk('Kamera', ICON_CAM, { capture: 'environment' }, inp => openCamera(onFiles, () => inp.click())),
    mk('Aus Galerie', ICON_IMG, { multiple: true }),
  ];
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
  if (f.type === 'datetime') return fmtDateTime(v);
  if (f.type === 'auflagen') { const n = (v || []).length; return `${n} Auflage${n === 1 ? '' : 'n'}`; }
  if (f.type === 'proben') { const n = (v || []).length; return `${n} Probe${n === 1 ? '' : 'n'}`; }
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
  const TOP = 27, BOTTOM = PH - 18, FS = 10, LH = 4.5;
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
  y += 1;
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

  // Titel eines Teilbereichs (z.B. «Betonumschlag» im Bereich Abfälle)
  function areaHead(title) {
    need(18);
    y += 3;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(FS); doc.setTextColor(...C.ink);
    doc.text(clean(title), M, y + 4);
    y += 5.5;
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.line(M, y, M + W, y); doc.setLineWidth(0.2);
    y += 0.5;
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
  // GIS-Karten als Kartenblatt wie in der «GIS Umweltübersicht»:
  // Blattkopf (Nr. · Thema | Massstab · Koordinaten · Zeit), Karte 180 mm (Massstab stimmt bei Druck 100 %),
  // darunter Legende (links) und Standort/Quellen (rechts)
  let mapNo = 0;
  const LEG_W = 108, SIDE_X = M + LEG_W + 5, SIDE_W = W - LEG_W - 5;
  function gisLayout(m) {
    const mh = W * m.h / m.w;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const hits = GIS.hitsText(m);
    const side = [
      ['Standort', [`E ${Math.round(m.E).toLocaleString('de-CH')} / N ${Math.round(m.N).toLocaleString('de-CH')} (LV95)`,
        m.source === 'GPS' ? `GPS, Genauigkeit +/-${Math.round(m.acc)} m` : 'Koordinaten manuell eingegeben']],
      hits.length ? ['Am Standort', hits] : null,
      m.remark ? ['Bemerkung', [m.remark]] : null,
      !m.layerOk ? ['Hinweis', ['Themenebene konnte nicht geladen werden.']] : null,
      ['Quellen', [...(m.sources || [m.by || '']), `Daten: ${m.by || '-'}`, `Hintergrund: map.geo.admin.ch (© swisstopo), ${m.bgLabel}`]],
    ].filter(Boolean).map(([t, ls]) => [t, ls.flatMap(l => doc.splitTextToSize(clean(l), SIDE_W))]);
    const sideH = side.reduce((h, [, ls]) => h + 4 + ls.length * 3.6 + 1.5, 0) + 9;
    let lw = 0, lh = 0;
    if (m.legend) { lw = Math.min(LEG_W, m.legend.w * 0.2646); lh = lw * m.legend.h / m.legend.w; if (lh > 85) { lh = 85; lw = lh * m.legend.w / m.legend.h; } }
    const belowH = Math.max(sideH, m.legend ? lh + 6 : 8);
    return { mh, side, lw, lh, belowH, total: 12 + mh + 3 + belowH + 4 };
  }
  function gisMaps(list) {
    for (const m of list) {
      const L = gisLayout(m);
      need(Math.min(L.total, BOTTOM - TOP));
      mapNo++;
      y += 3;
      // Blattkopf
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...C.ink);
      const right = clean(`1:${Math.round(m.scale).toLocaleString('de-CH')} · ${new Date(m.time).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}`);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      const rw = doc.getTextWidth(right);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      const tl = doc.splitTextToSize(clean(`K${mapNo} · ${m.layerLabel}`), W - rw - 6)[0];
      doc.text(tl, M, y + 5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
      doc.text(right, M + W, y + 5, { align: 'right' });
      y += 7.5;
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.6); doc.line(M, y, M + W, y); doc.setLineWidth(0.2);
      y += 1.5;
      // Karte
      doc.addImage(m.data, 'JPEG', M, y, W, L.mh, m.id, 'FAST');
      doc.setDrawColor(153, 153, 153); doc.setLineWidth(0.3); doc.rect(M, y, W, L.mh, 'S'); doc.setLineWidth(0.2);
      y += L.mh + 3;
      if (y + L.belowH > BOTTOM) newPage();
      const y0 = y;
      // Legende links
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.ink);
      doc.text(clean(m.layerLabel).slice(0, 90), M, y0 + 3.5);
      if (m.legend) doc.addImage(m.legend.data, 'PNG', M, y0 + 6, L.lw, L.lh, m.id + '_leg', 'FAST');
      else { doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.muted); doc.text('Legende nicht verfügbar', M, y0 + 8); }
      // Standort und Quellen rechts, mit Trennlinie
      doc.setDrawColor(...C.line); doc.line(SIDE_X - 2.5, y0, SIDE_X - 2.5, y0 + L.belowH);
      let ys = y0;
      for (const [t, ls] of L.side) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...C.ink);
        doc.text(t, SIDE_X, ys + 3.2);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(t === 'Hinweis' ? C.warn[0] : 68, t === 'Hinweis' ? C.warn[1] : 68, t === 'Hinweis' ? C.warn[2] : 68);
        doc.text(ls, SIDE_X, ys + 7, { lineHeightFactor: 3.6 / (8.5 * 0.3528) });
        ys += 4 + ls.length * 3.6 + 1.5;
      }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.muted);
      doc.text(doc.splitTextToSize('Ohne Rechtsverbindlichkeit - massgebend sind die Originaldaten der Fachstellen.', SIDE_W), SIDE_X, ys + 3);
      y = y0 + L.belowH + 4;
    }
  }

  // Materialbeprobungen: Tabelle, danach Fotos der Proben
  function probenTable(list) {
    const fmtPos = p => p.E ? `E ${Math.round(p.E).toLocaleString('de-CH')}\nN ${Math.round(p.N).toLocaleString('de-CH')}` + (p.acc ? `\n+/-${Math.round(p.acc)} m` : '') : '-';
    table([{ t: 'Nr.', w: 9 }, { t: 'Bezeichnung', w: 29 }, { t: 'Materialtyp', w: 35 }, { t: 'Datum', w: 21 }, { t: 'Probenahme durch', w: 27 }, { t: 'Position (LV95)', w: 28 }, { t: 'Bemerkung', w: 31 }],
      list.map((p, i) => ({ cells: [`P${i + 1}`, p.bez || '-', p.typ || '-', p.datum ? fmtDate(p.datum) : '-', p.person || '-', fmtPos(p), p.bem || ''], warn: [] })));
    const ph = list.flatMap((p, i) => (p.photos || []).map((x, k) => ({ ...x, id: x.id || p.id + k, caption: `${p.bez || 'P' + (i + 1)}${p.typ ? ' (' + p.typ + ')' : ''}` })));
    if (ph.length) photos(ph);
  }

  // Tabelle mit Kopfzeile; Kopf wird bei Seitenumbruch wiederholt
  function table(cols, rows) {
    const FS2 = 9, LH2 = 4.1, PAD = 2;
    const LHF2 = LH2 / (FS2 * 0.3528);
    const head = () => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      const hl = cols.map(c => doc.splitTextToSize(clean(c.t), c.w - 2 * PAD));
      const hh = Math.max(...hl.map(l => l.length)) * 3.8 + 3;
      let x = M;
      // Füllfarbe vor jedem Rechteck setzen (Textfarbe überschreibt sie in jsPDF)
      cols.forEach((c, i) => { doc.setFillColor(...C.label); doc.setDrawColor(...C.line); doc.rect(x, y, c.w, hh, 'FD'); doc.setTextColor(...C.ink); doc.text(hl[i], x + PAD, y + 4.2); x += c.w; });
      y += hh;
    };
    need(20); head();
    for (const r of rows) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(FS2);
      const ls = r.cells.map((c, i) => doc.splitTextToSize(clean(c), cols[i].w - 2 * PAD).slice(0, 45));
      const h = Math.max(...ls.map(l => l.length), 1) * LH2 + 3;
      if (y + h > BOTTOM) { newPage(); head(); }
      let x = M;
      cols.forEach((c, i) => {
        doc.setDrawColor(...C.line); doc.rect(x, y, c.w, h, 'S');
        const warn = (r.warn || []).includes(i);
        doc.setFont('helvetica', i === 0 || warn ? 'bold' : 'normal'); doc.setFontSize(FS2);
        doc.setTextColor(...(warn ? C.warn : C.ink));
        doc.text(ls[i], x + PAD, y + 4.5, { lineHeightFactor: LHF2 });
        x += c.w;
      });
      y += h;
    }
    y += 2;
  }

  const ORD = orderedMaengel();
  const mNr = m => 'M' + (ORD.indexOf(m) + 1);
  const secTitle = id => (SCHEMA.find(x => x.id === id) || {}).title || '';
  const refText = m => FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || '');
  const mangelRows = list => list.map(m => ({
    cells: [mNr(m), refText(m), 'Mangel: ' + m.text + (m.massnahme ? '\nMassnahme: ' + m.massnahme : ''), m.verantwortlich || '-', m.frist ? fmtDate(m.frist) : '-'],
    warn: [],
  }));
  const MCOLS = [{ t: 'Nr.', w: 11 }, { t: 'Punkt', w: 48 }, { t: 'Mangel / Massnahme', w: 75 }, { t: 'Verantwortlich', w: 26 }, { t: 'Frist', w: 20 }];
  // Auflagen «nicht erfüllt» ohne eigenen Mangel erscheinen ebenfalls in der Massnahmenliste
  const openAuflagen = [];
  for (const s of SCHEMA) for (const f of s.fields) if (f.type === 'auflagen') (state.values[f.id] || []).forEach((a, i) => {
    if (a.status === 'nicht erfüllt' && !state.maengel.some(m => m.ref === a.id)) openAuflagen.push({ s, a, nr: `A${i + 1}` });
  });
  const SKIP_PDF = new Set(['kenntnis_name']);
  const sectionHasContent = s => !state.nrel[s.id] && (
    s.fields.some(f => isVisible(f) && isFilled(f) && f.type !== 'signature' && !SKIP_PDF.has(f.id)) ||
    state.maengel.some(m => m.section === s.id));

  /* ---- Zusammenfassung (Seite 1) ---- */
  const nrelList = SCHEMA.filter(x => state.nrel[x.id]).map(x => x.title);
  const anyContent = SCHEMA.some(sectionHasContent) || nrelList.length || ORD.length;
  if (!anyContent) return null;
  // Mängel und Massnahmen ganz oben
  sectionHead('Mängel und Massnahmen');
  if (ORD.length || openAuflagen.length) {
    table(MCOLS, [...mangelRows(ORD), ...openAuflagen.map(o => ({
      cells: [o.nr, `${o.s.title}: Auflage (${o.a.herkunft})`, 'Auflage nicht erfüllt: ' + o.a.text + (o.a.bemerkung ? '\nBemerkung: ' + o.a.bemerkung : ''), '-', '-'],
      warn: [],
    }))]);
  } else row('Mängel', 'Keine Mängel erfasst');

  sectionHead('Zusammenfassung');
  const gb = v.gesamt_beurteilung;
  row('Gesamtbeurteilung', gb || '-', gb && gb !== 'In Ordnung');
  if (v.gesamt_eindruck) row('Eindruck der Baustelle', v.gesamt_eindruck);
  if (v.bericht_vorfaelle === 'Ja') row('Umweltvorfall', 'Ja' + (v.vorfall_was ? ': ' + v.vorfall_was.split('\n')[0] : '') + ' (Details unter Berichterstattung)', true);
  if (nrelList.length) row('Nicht relevante Bereiche', nrelList.join('; '));
  if (v.gesamt_massnahmen) row('Weitere Massnahmen', v.gesamt_massnahmen);
  if (v.bericht_naechste) row('Nächste Begehung', fmtDate(v.bericht_naechste));
  if (v.gesamt_bem) row('Bemerkungen', v.gesamt_bem);

  for (const s of SCHEMA) {
    if (s.id === 'gesamt' || !sectionHasContent(s)) continue;
    // Nur sichtbare + ausgefüllte Felder; Zwischentitel nur, wenn darunter etwas ausgefüllt ist
    const items = [];
    // Zwischentitel nur ausgeben, wenn darunter etwas ausgefüllt ist; Teilbereichs-Titel bleiben vor Unter-Titeln
    let pending = [];
    for (const f of s.fields) {
      if (f.type === 'sub') { pending = f.area ? [f] : [...pending.filter(x => x.area), f]; continue; }
      if (!isVisible(f) || !isFilled(f) || f.type === 'signature' || f.type === 'auflagen' || SKIP_PDF.has(f.id)) continue;
      items.push(...pending); pending = [];
      items.push(f);
    }
    const aufl = s.fields.filter(f => f.type === 'auflagen' && isFilled(f)).flatMap(f => state.values[f.id].filter(a => String(a.text || '').trim()));
    const secM = ORD.filter(m => m.section === s.id);
    const f0 = items[0] || {};
    // Titel nicht allein am Seitenende: Platz für den ersten Inhalt mitrechnen (Karte bzw. Foto)
    if (f0.type === 'gis') need(Math.min(12 + gisLayout(state.gis[f0.id][0]).total, BOTTOM - TOP));
    else if (f0.type === 'photos') need(12 + 80);
    sectionHead(s.title);
    for (const f of items) {
      if (f.type === 'sub') (f.area ? areaHead : subHead)(f.label);
      else if (f.type === 'proben') probenTable(state.values[f.id]);
      else if (f.type === 'photos') photos(state.photos[f.id]);
      else if (f.type === 'gis') gisMaps(state.gis[f.id]);
      else {
        const txt = valueText(f);
        row(f.label, txt, f.ph && /ausserhalb/.test(txt));
      }
    }
    if (aufl.length) {
      subHead('Auflagen aus Baubewilligung / UVB');
      table([{ t: 'Nr.', w: 11 }, { t: 'Auflage', w: 82 }, { t: 'Herkunft', w: 28 }, { t: 'Status', w: 24 }, { t: 'Bemerkung', w: 35 }],
        aufl.map((a, i) => ({ cells: [`A${i + 1}`, a.text, a.herkunft || '-', a.status || 'nicht geprüft', a.bemerkung || ''], warn: a.status === 'nicht erfüllt' ? [3] : [] })));
    }
    if (secM.length) {
      subHead('Mängel');
      table(MCOLS, mangelRows(secM));
      const ph = secM.flatMap(m => (m.photos || []).map((p, k) => ({ ...p, id: p.id || m.id + k, caption: `${mNr(m)}: ${m.text}`.slice(0, 120) })));
      if (ph.length) photos(ph);
    }
  }

  /* ---- Kenntnisnahme / Unterschrift ---- */
  if (v.kenntnis_name || v.kenntnis_sign) {
    sectionHead('Kenntnisnahme Bauleitung');
    need(45);
    y += 4;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(FS); doc.setTextColor(...C.ink);
    doc.text(clean('Name, Funktion: ' + (v.kenntnis_name || '-')), M, y + 3);
    doc.text(clean('Datum: ' + (v.datum ? fmtDate(v.datum) : '-')), M, y + 3 + LH + 1);
    y += 2 * LH + 4;
    if (v.kenntnis_sign) doc.addImage(v.kenntnis_sign, 'PNG', M, y, 75, 25, 'sign', 'FAST');
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.line(M, y + 25, M + 75, y + 25); doc.setLineWidth(0.2);
    doc.setFontSize(8.5); doc.setTextColor(...C.muted); doc.text('Unterschrift', M, y + 29);
    y += 32;
  }

  // Kopfzeile (Datum, Bearbeitung, Logo) und Fusszeile (Projekt-Nr., Seite) auf jeder Seite
  const n = doc.getNumberOfPages();
  const who = [v.ubbName, v.ubbKuerzel && `(${v.ubbKuerzel})`].filter(Boolean).join(' ');
  const headL1 = 'Datum: ' + (v.datum ? fmtDate(v.datum) : '-');
  const headL2 = 'Bearbeitung: ' + (who || '-');
  const footL = clean('Projekt-Nr.: ' + (v.projekt || '-'));
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    // Kopfzeile
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...C.ink);
    doc.text(clean(headL1), M, 12);
    doc.text(clean(headL2), M, 16.5);
    if (PDF_LOGO) {
      const lh = 7, lw = lh * PDF_LOGO.w / PDF_LOGO.h;
      doc.addImage(PDF_LOGO.data, 'PNG', PW - M - lw, 9.5, lw, lh, 'afry_logo', 'FAST');
    } else {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text('AFRY', PW - M, 15, { align: 'right', charSpace: 0.6 });
    }
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.5); doc.line(M, 19.5, PW - M, 19.5);
    // Fusszeile
    doc.setLineWidth(0.2); doc.setDrawColor(...C.line); doc.line(M, PH - 13, PW - M, PH - 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
    doc.text(doc.splitTextToSize(footL, W - 40)[0], M, PH - 8.5);
    doc.text(`Seite ${i} / ${n}`, PW - M, PH - 8.5, { align: 'right' });
  }
  doc.setProperties({ title: 'Begehungsprotokoll ' + (v.projekt || ''), creator: 'UBB-Begehung App, Version ' + APP_VERSION });
  return doc.output('blob');
}

function fileName() {
  const v = state.values;
  const part = s => clean(s || '').trim().replace(/[\\/:*?"<>|.,;]+/g, ' ').replace(/\s+/g, '-').slice(0, 40);
  const parts = [v.datum || today(), part(v.projekt), part(valueText(FIELDS.artBegehung)), part(v.ubbKuerzel)].filter(Boolean);
  return parts.join('_') + '.pdf';
}

let lastPdf = null;
function onPdf() { checkRequired(makePdf); }
function makePdf() {
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
const presetable = f => !['photos', 'sub', 'gis', 'signature', 'mlist', 'proben'].includes(f.type) && f.id !== 'datum';
// Werte eines Feldes inkl. «Andere»-Text
function fieldValues(src, id) {
  const out = {};
  if (src[id] != null) out[id] = src[id];
  if (src[id + '_andere'] != null) out[id + '_andere'] = src[id + '_andere'];
  return out;
}
const presetFieldIds = p => [...new Set(Object.keys(p.values).map(k => k.replace(/_andere$/, '')))].filter(id => FIELDS[id]);

function applyPreset(p) {
  migrateValues(p.values);
  for (const id of presetFieldIds(p)) {
    delete state.values[id]; delete state.values[id + '_andere'];
    Object.assign(state.values, fieldValues(p.values, id));
    if (FIELDS[id].type === 'auflagen') state.values[id] = resetAuflagen(state.values[id]);
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
  ids.filter(id => FIELDS[id].type === 'auflagen').forEach(id => { values[id] = resetAuflagen(values[id]).map(({ text, herkunft }) => ({ text, herkunft })); });
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
    migrateValues(raw.values); // Presets aus früheren Versionen
    for (const [k, v] of Object.entries(raw.values)) {
      const f = FIELDS[k.replace(/_andere$/, '')];
      if (!f || !presetable(f)) continue;
      if (f.type === 'auflagen') {
        if (Array.isArray(v)) values[k] = resetAuflagen(v.filter(a => a && typeof a === 'object')).map(({ text, herkunft }) => ({ text, herkunft }));
      } else if (f.type === 'multi' && !k.endsWith('_andere')) {
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
  state.maengel ||= [];
  state.nrel ||= {};
  state.id ||= uid(); // Protokoll-ID für den CSV-Export
  migrateState(state);
  await loadPresets();
  loadPdfLogo();
  document.getElementById('appVersion').textContent = 'App-Version ' + APP_VERSION;
  render();
  setSaveState('');
  initCsv();
  $('mgSave').onclick = saveMangel;
  $('mgDelete').onclick = deleteMangel;
  $('mgCancel').onclick = () => $('dlgMangel').close();
  autoWeather();

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
    autoWeather();
    toast(p ? `Neues Protokoll mit Preset «${p.name}».` : 'Neues Protokoll gestartet.');
  };

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
init();
