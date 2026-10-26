'use strict';
/* =====================================================================
   Archiv und Begehungsdatei
   - Archiv: alle Begehungen bleiben auf dem Gerät (IndexedDB), bis sie gelöscht werden.
   - Begehungsdatei (*.ubb.json bzw. *.ubb.txt): vollständige Daten inkl. Fotos, Karten,
     Unterschrift; kann in der App wieder geöffnet werden. PDF und CSV sind Ausgaben daraus.
   - Android (Chrome) lässt im Teilen-Menü keine .json zu → gleiche Datei als .ubb.txt.
   ===================================================================== */

const IDX_KEY = 'index', CUR_KEY = 'current', BKEY = id => 'beg:' + id;
const BEG_FORMAT = 'ubb-begehung';
let archive = []; // [{ id, projekt, datum, art, ubb, updated, rev, savedRev, savedAt }]

const unsaved = st => (st.rev || 0) > (st.savedRev || 0);

// Fehlende Teile ergänzen und ältere Strukturen übernehmen
function prepState(st) {
  st.values ||= {}; st.photos ||= {}; st.gis ||= {}; st.maengel ||= []; st.nrel ||= {};
  st.id ||= uid();
  st.rev ||= 0; st.savedRev ||= 0;
  migrateState(st);
  return st;
}

function metaOf(st) {
  const v = st.values;
  return {
    id: st.id, projekt: v.projekt || '', datum: v.datum || '',
    art: [v.artBegehung, v.artBegehung_andere].filter(Boolean).join(', '),
    ubb: [v.ubbName, v.ubbKuerzel && `(${v.ubbKuerzel})`].filter(Boolean).join(' '),
    updated: new Date().toISOString(), rev: st.rev || 0, savedRev: st.savedRev || 0, savedAt: st.savedAt || null,
  };
}

// Aktuelle Begehung ins Archiv schreiben (vom automatischen Speichern aufgerufen)
async function saveCurrent() {
  await DB.set(BKEY(state.id), state);
  const m = metaOf(state), i = archive.findIndex(a => a.id === state.id);
  if (i >= 0) archive[i] = m; else archive.push(m);
  await DB.set(IDX_KEY, archive);
  await DB.set(CUR_KEY, state.id);
  updateSaveIndicator();
}

function updateSaveIndicator() {
  const b = $('btnSave');
  if (b) b.classList.toggle('dirty', unsaved(state));
}

// Beim Start: zuletzt geöffnete Begehung laden; einmalig den Entwurf früherer Versionen übernehmen
async function openInitial() {
  archive = (await DB.get(IDX_KEY)) || [];
  if (!archive.length) {
    const d = await DB.get('draft');
    if (d && d.values) {
      prepState(d); d.rev = Math.max(d.rev, 1); // nie als Datei gespeichert
      state = d; await saveCurrent(); await DB.del('draft');
    }
  }
  const cur = await DB.get(CUR_KEY);
  let st = cur ? await DB.get(BKEY(cur)) : null;
  if (!st && archive.length) {
    const last = [...archive].sort((a, b) => b.updated.localeCompare(a.updated))[0];
    st = await DB.get(BKEY(last.id));
  }
  state = st ? prepState(st) : freshState(false);
  if (!st) await saveCurrent();
}

// Leere Begehung (nichts erfasst ausser Datum, Wetter, Name/Kürzel) beim Wechsel nicht im Archiv behalten
const AUTO_FIELDS = ['datum', 'wetter', 'ubbName', 'ubbKuerzel'];
function isEmptyBeg(st) {
  const filled = v => Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== '';
  return !Object.entries(st.values).some(([k, v]) => !AUTO_FIELDS.includes(k) && filled(v)) && !st.maengel.length
    && !Object.values(st.photos).some(l => l && l.length) && !Object.values(st.gis || {}).some(l => l && l.length);
}
async function dropIfEmpty(st) {
  if (!st || st.id === state.id || !((st.rev || 0) === 0 || isEmptyBeg(st))) return; // leer oder seit dem Anlegen unbearbeitet
  await DB.del(BKEY(st.id));
  archive = archive.filter(a => a.id !== st.id);
  await DB.set(IDX_KEY, archive);
}

/* ---------- Archiv-Dialog ---------- */
function renderArchive() {
  const box = $('archList');
  box.innerHTML = '';
  const list = [...archive].sort((a, b) => (b.datum || '').localeCompare(a.datum || '') || b.updated.localeCompare(a.updated));
  if (!list.length) box.append(el('div', { class: 'empty' }, 'Keine Begehungen im Archiv.'));
  for (const a of list) {
    const cur = a.id === state.id;
    const meta = cur ? metaOf(state) : a;
    const status = unsaved(meta)
      ? el('span', { class: 'st warn' }, 'Nicht als Begehungsdatei gespeichert')
      : el('span', { class: 'st ok' }, meta.savedAt ? `Begehungsdatei gespeichert ${new Date(meta.savedAt).toLocaleDateString('de-CH')}` : 'leer');
    box.append(el('div', { class: 'pitem' + (cur ? ' cur' : '') },
      el('div', { class: 'pn' },
        el('b', {}, meta.projekt || '(ohne Projekt)'),
        el('span', {}, [meta.datum && fmtDate(meta.datum), meta.art, meta.ubb].filter(Boolean).join(' · ')), el('br'), status),
      cur ? el('span', { class: 'badge on' }, 'offen')
        : el('button', { type: 'button', class: 'btn sm', onclick: () => openBeg(a.id) }, 'Öffnen'),
      el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Begehung löschen', onclick: () => deleteBeg(a.id) }, '×')));
  }
}

async function openBeg(id) {
  flushSave();
  await saveCurrent();
  const st = await DB.get(BKEY(id));
  if (!st) { toast('Begehung nicht gefunden.'); return; }
  const prev = state;
  state = prepState(st);
  await dropIfEmpty(prev);
  await DB.set(CUR_KEY, id);
  $('dlgArchive').close();
  render(); window.scrollTo(0, 0); updateSaveIndicator();
  toast('Begehung geöffnet.');
}

async function deleteBeg(id) {
  const meta = id === state.id ? metaOf(state) : archive.find(a => a.id === id);
  if (!meta) return;
  const name = [meta.projekt || '(ohne Projekt)', meta.datum && fmtDate(meta.datum)].filter(Boolean).join(', ');
  const msg = unsaved(meta)
    ? `ACHTUNG: «${name}» ist nicht als Begehungsdatei gespeichert. Beim Löschen gehen alle Daten und Fotos dieser Begehung verloren.\n\nTrotzdem löschen?`
    : `«${name}» vom Gerät löschen? Die gespeicherte Begehungsdatei bleibt erhalten und kann wieder geöffnet werden.`;
  if (!confirm(msg)) return;
  await DB.del(BKEY(id));
  archive = archive.filter(a => a.id !== id);
  await DB.set(IDX_KEY, archive);
  if (id === state.id) {
    const last = [...archive].sort((a, b) => b.updated.localeCompare(a.updated))[0];
    state = last ? prepState(await DB.get(BKEY(last.id))) : freshState(false);
    await saveCurrent(); render(); window.scrollTo(0, 0);
  }
  renderArchive();
}

/* ---------- Begehungsdatei ---------- */
function begehungJson() {
  return JSON.stringify({
    format: BEG_FORMAT, version: 1, appVersion: APP_VERSION, exported: new Date().toISOString(),
    // lesbare Übersicht (gleiche Spalten wie CSV), z.B. für Excel Power Query
    uebersicht: Object.fromEntries(csvRecord()),
    begehung: state,
  });
}
function begehungFile(base) {
  const json = begehungJson();
  const asJson = new File([json], base + '.ubb.json', { type: 'application/json' });
  if (!navigator.canShare || navigator.canShare({ files: [asJson] })) return asJson;
  return new File([json], base + '.ubb.txt', { type: 'text/plain' }); // Android: .json nicht teilbar
}

async function readBegFile(file) {
  const obj = JSON.parse(await file.text());
  if (!obj || obj.format !== BEG_FORMAT || !obj.begehung || !obj.begehung.values) throw new Error('Keine Begehungsdatei der UBB-App.');
  const st = prepState(obj.begehung);
  st.savedRev = st.rev; st.savedAt ||= obj.exported; // entspricht genau der Datei
  return { st, exported: obj.exported };
}

async function importBegFile(file) {
  let r;
  try { r = await readBegFile(file); } catch (e) { toast(e.message || 'Datei konnte nicht gelesen werden.'); return; }
  const ex = archive.find(a => a.id === r.st.id) || (state.id === r.st.id ? metaOf(state) : null);
  if (ex) {
    const exUnsaved = ex.id === state.id ? unsaved(state) : unsaved(ex);
    if (!confirm(`Diese Begehung ist bereits auf dem Gerät${exUnsaved ? ' und hat ungespeicherte Änderungen' : ''}.\n\nMit dem Stand aus der Datei (${new Date(r.exported).toLocaleString('de-CH')}) ersetzen?`)) return;
  }
  flushSave();
  if (state.id !== r.st.id) await saveCurrent();
  const prev = state;
  state = r.st;
  await saveCurrent();
  await dropIfEmpty(prev);
  $('dlgArchive').close();
  render(); window.scrollTo(0, 0); updateSaveIndicator();
  toast('Begehungsdatei geöffnet.');
}

/* ---------- Dateien teilen / herunterladen ---------- */
async function shareFiles(files) {
  try { await navigator.share({ files, title: files.length === 1 ? files[0].name : 'UBB-Begehung' }); return true; }
  catch (e) { if (e.name !== 'AbortError') toast('Teilen nicht möglich – bitte «Herunterladen» verwenden.'); return false; }
}
const canShareFiles = files => !!(navigator.canShare && navigator.canShare({ files }));

function dataUrlToFile(dataUrl, name) {
  const [head, b64] = dataUrl.split(',');
  const mime = (/data:([^;]+)/.exec(head) || [])[1] || 'image/jpeg';
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new File([u], name, { type: mime });
}
const slug = s => clean(s || '').trim().replace(/[\\/:*?"<>|.,;()\[\]]+/g, ' ').replace(/\s+/g, '-').slice(0, 40);

// Alle Bilder der Begehung als einzelne Dateien mit sprechenden Namen
function photoFiles() {
  const pre = slug(state.values.datum || today()) + '_';
  const out = [];
  const add = (data, name) => { if (data) out.push(dataUrlToFile(data, pre + name)); };
  for (const s of SCHEMA) for (const f of s.fields) if (f.type === 'photos')
    (state.photos[f.id] || []).forEach((p, i) => add(p.data, `${slug(s.title)}_${i + 1}${p.caption ? '_' + slug(p.caption) : ''}.jpg`));
  orderedMaengel().forEach((m, i) => (m.photos || []).forEach((p, k) => add(p.data, `M${i + 1}_${slug(m.text)}_${k + 1}.jpg`)));
  (state.values.proben_liste || []).forEach((p, i) => (p.photos || []).forEach((x, k) => add(x.data, `P${i + 1}_${slug(p.bez || p.typ)}_${k + 1}.jpg`)));
  (state.values.org_bestaende || []).forEach((b, i) => (b.photos || []).forEach((x, k) => add(x.data, `N${i + 1}_${slug(neoName(b))}_${k + 1}.jpg`)));
  Object.values(state.gis || {}).flat().forEach((m, i) => add(m.data, `K${i + 1}_${slug(m.layerLabel)}.jpg`));
  if (state.neoMap) add(state.neoMap.data, 'Uebersichtskarte-Neophyten.jpg');
  if (state.values.kenntnis_sign) add(state.values.kenntnis_sign, 'Unterschrift.png');
  return out;
}

/* ---------- Dialog mit Dateien ---------- */
// entries: [{ file, label, primary?, onSaved?, preview? }]
function showFiles(title, info, entries, extra) {
  $('fTitle').textContent = title;
  $('fInfo').textContent = info || '';
  const box = $('fList'); box.innerHTML = '';
  const all = entries.map(e => e.file);
  if (entries.length > 1 && canShareFiles(all)) {
    box.append(el('button', { type: 'button', class: 'btn primary', style: 'width:100%;max-width:none', onclick: async () => {
      if (await shareFiles(all)) entries.forEach(e => e.onSaved && e.onSaved());
    } }, `Alle ${entries.length} Dateien in OneDrive speichern`));
  }
  for (const e of entries) {
    const share = canShareFiles([e.file]);
    box.append(el('div', { class: 'fitem' },
      el('div', { class: 'fl' }, el('b', {}, e.label), el('span', { class: 'fname' }, e.file.name),
        e.statusEl || null),
      el('div', { class: 'fb' },
        share ? el('button', { type: 'button', class: 'btn sm' + (e.primary && entries.length === 1 ? ' primary' : ''), onclick: async () => { if (await shareFiles([e.file])) e.onSaved && e.onSaved(); } }, 'Teilen') : null,
        el('button', { type: 'button', class: 'btn sm', onclick: () => { downloadBlob(e.file, e.file.name); e.onSaved && e.onSaved(); } }, 'Herunterladen'),
        e.preview ? el('button', { type: 'button', class: 'btn sm', onclick: () => { const u = URL.createObjectURL(e.file); window.open(u, '_blank'); setTimeout(() => URL.revokeObjectURL(u), 120000); } }, 'Vorschau') : null)));
  }
  $('fExtra').innerHTML = '';
  if (extra) $('fExtra').append(...extra);
  if (!$('dlgFiles').open) $('dlgFiles').showModal();
}

/* ---------- Speichern: Begehungsdatei + PDF + CSV ---------- */
async function onSave() { checkRequired(buildSaveFiles); }
async function buildSaveFiles() {
  const btn = $('btnSave');
  btn.disabled = true; btn.textContent = 'Erstelle …';
  try {
    if (neoPoints().length) { try { await ensureNeoMap(); } catch { state.neoMap = null; } }
    await new Promise(r => setTimeout(r, 30));
    const base = fileName().replace(/\.pdf$/, '');
    const pdfBlob = buildPdf();
    const rec = csvRecord();
    const entries = [];
    const begStatus = el('span', { class: 'st' });
    const setBegStatus = () => { begStatus.className = 'st ' + (unsaved(state) ? 'warn' : 'ok'); begStatus.textContent = unsaved(state) ? 'noch nicht gespeichert' : '✓ gespeichert'; };
    setBegStatus();
    entries.push({ file: begehungFile(base), label: 'Begehungsdatei – alle Daten inkl. Fotos, kann wieder geöffnet werden', primary: true, statusEl: begStatus,
      onSaved: () => { state.savedRev = state.rev; state.savedAt = new Date().toISOString(); saveCurrent(); setBegStatus(); } });
    if (pdfBlob) entries.push({ file: new File([pdfBlob], base + '.pdf', { type: 'application/pdf' }), label: 'PDF-Protokoll', preview: true });
    entries.push({ file: new File([toCsv([rec.map(r => r[0]), rec.map(r => r[1])], ';')], base + '.csv', { type: 'text/csv' }), label: 'CSV – diese Begehung als eine Zeile' });
    const photos = photoFiles();
    const extra = [];
    if (photos.length) extra.push(el('button', { type: 'button', class: 'btn', style: 'width:100%', onclick: async () => {
      if (canShareFiles(photos)) await shareFiles(photos);
      else { photos.forEach((f, i) => setTimeout(() => downloadBlob(f, f.name), i * 400)); }
    } }, `Fotos und Karten als Bilder speichern (${photos.length})`));
    const app = el('input', { type: 'file', accept: '.csv,text/csv,text/plain,application/vnd.ms-excel', onchange: async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      const r = await csvAppend(f); if (!r) return;
      entries.push({ file: new File([r.text], r.name, { type: 'text/csv' }), label: 'Sammel-CSV (ergänzt) – ' + r.info });
      showFiles($('fTitle').textContent, $('fInfo').textContent, entries, extra);
    } });
    extra.push(el('label', { class: 'btn filebtn', style: 'width:100%' }, 'Bestehende Sammel-CSV ergänzen', app));
    showFiles('Begehung speichern',
      'In OneDrive im Projektordner speichern. Die Begehungsdatei ist das Original: Sie enthält alle Daten und kann jederzeit wieder geöffnet, angepasst und neu ausgegeben werden.',
      entries, extra);
  } catch (e) {
    console.error(e); toast('Fehler beim Erstellen der Dateien.');
  } finally {
    btn.disabled = false; btn.textContent = 'Speichern';
  }
}

/* ---------- Sammel-CSV aus mehreren Begehungsdateien ---------- */
// Für jede Datei die CSV-Zeile erzeugen (dazu kurz die Begehung als «state» setzen)
function withState(st, fn) { const keep = state; state = st; try { return fn(); } finally { state = keep; } }

function massnahmenRows() {
  const v = state.values, rows = [], secT = id => (SCHEMA.find(x => x.id === id) || {}).title || '';
  const base = { id: state.id, datum: v.datum ? fmtDate(v.datum) : '', projekt: v.projekt || '' };
  const pos = o => o && o.E ? [String(Math.round(o.E)), String(Math.round(o.N)), o.acc ? String(Math.round(o.acc)) : ''] : ['', '', ''];
  orderedMaengel().forEach((m, i) => rows.push([base.id, base.datum, base.projekt, 'Mangel', `M${i + 1}`, secT(m.section),
    FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || ''), m.text, m.massnahme || '', m.verantwortlich || '', m.frist ? fmtDate(m.frist) : '', 'offen', '', '', '', '', String((m.photos || []).length)]));
  for (const s of SCHEMA) for (const f of s.fields) if (f.type === 'auflagen' && !state.nrel[s.id])
    (v[f.id] || []).filter(a => String(a.text || '').trim()).forEach((a, i) => rows.push([base.id, base.datum, base.projekt, 'Auflage', `A${i + 1}`, s.title,
      a.herkunft || '', a.text, '', '', '', a.status || 'nicht geprüft', a.bemerkung || '', '', '', '', '0']));
  if (!state.nrel.proben) (v.proben_liste || []).forEach((p, i) => rows.push([base.id, base.datum, base.projekt, 'Probe', `P${i + 1}`, 'Materialbeprobungen',
    p.typ || '', [p.bez, p.datum && fmtDate(p.datum), p.person].filter(Boolean).join(', '), '', '', '', '', p.bem || '', ...pos(p), String((p.photos || []).length)]));
  if (v.org_neophyten === 'Ja' && !state.nrel.org) (v.org_bestaende || []).filter(b => b.art).forEach(b => rows.push([base.id, base.datum, base.projekt, 'Neophyt',
    `N${v.org_bestaende.indexOf(b) + 1}`, 'Umweltgefährdende Organismen', neoName(b) + (neoAnh(b) ? ` (FrSV Anh. ${neoAnh(b)})` : ''), '',
    b.bekaempfen === 'Ja' ? 'Bestand bekämpfen' : b.bekaempfen === 'Nein' ? 'keine Bekämpfung' : '', b.verantwortlich || '', b.frist ? fmtDate(b.frist) : '',
    b.bekaempfen === 'Ja' ? 'offen' : '', b.bem || '', ...pos(b), String((b.photos || []).length)]));
  return rows;
}
const MASS_HEAD = ['Protokoll-ID', 'Datum Begehung', 'Projekt', 'Typ', 'Nr.', 'Bereich', 'Punkt / Art / Herkunft', 'Beschreibung', 'Massnahme', 'Verantwortlich', 'Frist', 'Status', 'Bemerkung', 'E (LV95)', 'N (LV95)', 'Genauigkeit (m)', 'Anzahl Fotos'];

async function buildSammelCsv(fileList) {
  const items = [], errs = [];
  for (const f of fileList) {
    try { items.push(await readBegFile(f)); } catch { errs.push(f.name); }
  }
  if (!items.length) { toast('Keine gültigen Begehungsdateien gewählt.'); return; }
  // gleiche Begehung mehrfach gewählt → neuester Stand
  const byId = new Map();
  for (const it of items) { const ex = byId.get(it.st.id); if (!ex || (it.exported || '') > (ex.exported || '')) byId.set(it.st.id, it); }
  const list = [...byId.values()].sort((a, b) => (a.st.values.datum || '').localeCompare(b.st.values.datum || ''));
  const head = [], rows = [], mass = [];
  for (const it of list) {
    const rec = withState(it.st, csvRecord);
    for (const [h] of rec) if (!head.includes(h)) head.push(h);
    rows.push(new Map(rec));
    mass.push(...withState(it.st, massnahmenRows));
  }
  const projs = [...new Set(list.map(it => it.st.values.projekt).filter(Boolean))];
  const name = projs.length === 1 ? slug(projs[0]) : 'mehrere-Projekte';
  const entries = [
    { file: new File([toCsv([head, ...rows.map(r => head.map(h => r.get(h) ?? ''))], ';')], `UBB-Begehungen_${name}.csv`, { type: 'text/csv' }),
      label: `Sammel-CSV – ${list.length} Begehung${list.length === 1 ? '' : 'en'}, eine Zeile pro Begehung` },
    { file: new File([toCsv([MASS_HEAD, ...mass], ';')], `UBB-Massnahmen-Proben-Neophyten_${name}.csv`, { type: 'text/csv' }),
      label: `Liste – ${mass.length} Einträge, eine Zeile pro Mangel, Auflage, Probe und Neophyten-Bestand` },
  ];
  $('dlgArchive').close();
  showFiles('Sammel-CSV', `Neu erstellt aus ${list.length} Begehungsdatei${list.length === 1 ? '' : 'en'}${errs.length ? ` (nicht lesbar: ${errs.join(', ')})` : ''}${items.length > list.length ? '; doppelte Begehungen nur mit dem neuesten Stand' : ''}.`, entries, []);
}

/* ---------- Start ---------- */
function initArchive() {
  $('btnArchive').onclick = () => { flushSave(); renderArchive(); $('dlgArchive').showModal(); };
  $('archClose').onclick = () => $('dlgArchive').close();
  $('archNew').onclick = () => { $('dlgArchive').close(); openNewDialog(); };
  $('archOpen').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBegFile(f); };
  $('archCsv').onchange = e => { const fl = [...e.target.files]; e.target.value = ''; if (fl.length) buildSammelCsv(fl); };
  $('btnSave').onclick = onSave;
  $('fClose').onclick = () => $('dlgFiles').close();
  updateSaveIndicator();
}
