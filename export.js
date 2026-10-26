'use strict';
/* =====================================================================
   CSV-Export: eine Zeile pro Begehung, eine Spalte pro Feld.
   «Neue CSV» oder «bestehende CSV ergänzen» (Zeile anhängen bzw. ersetzen,
   wenn die Begehung über die Protokoll-ID schon enthalten ist).
   Format: UTF-8 mit BOM, Semikolon, alle Werte in Anführungszeichen (Excel CH).
   ===================================================================== */

const CSV_ID = 'Protokoll-ID';
const CSV_SKIP_TYPES = ['sub', 'photos', 'gis', 'signature', 'mlist'];

function auflagenText(list) {
  return (list || []).filter(a => String(a.text || '').trim()).map((a, i) =>
    `A${i + 1} [${a.status || 'nicht geprüft'}] ${a.text} (${a.herkunft || '-'})${a.bemerkung ? ' – ' + a.bemerkung : ''}`).join(' | ');
}

// Spalten und Werte der aktuellen Begehung
function csvRecord() {
  const rec = [[CSV_ID, state.id], ['Exportiert am', new Date().toLocaleString('de-CH')], ['App-Version', APP_VERSION]];
  for (const s of SCHEMA) {
    if (s.id === 'maengel' || s.id === 'gis') continue;
    // Spaltenname «Teilbereich: Frage»; Teilbereiche tragen den früheren Abschnittsnamen,
    // damit Sammel-CSV aus älteren Versionen die gleichen Spalten behalten
    let area = '';
    for (const f of s.fields) {
      if (f.type === 'sub') { if (f.area) area = f.area; continue; }
      if (CSV_SKIP_TYPES.includes(f.type)) continue;
      // Auflagen gelten für den ganzen Bereich; verschobene Fragen behalten ihre bisherige Spalte (csvArea)
      const pre = f.csvArea || (f.type === 'auflagen' ? s.title : (area || s.title));
      const ok = !state.nrel[s.id] && isVisible(f) && isFilled(f);
      if (f.type === 'neophyten') {
        const bl = ok ? state.values[f.id].filter(b => b.art) : [];
        rec.push([`${pre}: Neophyten-Bestände`, bl.map(b => [`N${state.values[f.id].indexOf(b) + 1} ${neoName(b)}${neoAnh(b) ? ' [FrSV Anh. ' + neoAnh(b) + ']' : ''}`,
          b.E && `E ${Math.round(b.E)} / N ${Math.round(b.N)}`, `bekämpfen: ${b.bekaempfen || '-'}`, b.verantwortlich, b.frist && 'Frist ' + fmtDate(b.frist), b.bem].filter(Boolean).join(', ')).join(' | ')]);
        rec.push([`${pre}: Neophyten zu bekämpfen`, String(bl.filter(b => b.bekaempfen === 'Ja').length)]);
        continue;
      }
      if (f.type === 'proben') {
        const pl = ok ? state.values[f.id] : [];
        rec.push([`${pre}: Anzahl Proben`, String(pl.length)]);
        rec.push([`${pre}: Proben`, pl.map((p, i) => [`${p.bez || 'P' + (i + 1)} [${p.typ || '-'}]`, p.datum && fmtDate(p.datum), p.person,
          p.E && `E ${Math.round(p.E)} / N ${Math.round(p.N)}${p.acc ? ' (±' + Math.round(p.acc) + ' m)' : ''}`, p.bem].filter(Boolean).join(', ')).join(' | ')]);
        continue;
      }
      rec.push([`${pre}: ${f.type === 'auflagen' ? 'Auflagen' : f.label}`, ok ? (f.type === 'auflagen' ? auflagenText(state.values[f.id]) : valueText(f)) : '']);
    }
  }
  const ord = orderedMaengel();
  const secT = id => (SCHEMA.find(x => x.id === id) || {}).title || '';
  rec.push(['Nicht relevante Bereiche', SCHEMA.filter(x => state.nrel[x.id]).map(x => x.title).join('; ')]);
  rec.push(['Mängel: Anzahl', String(ord.length)]);
  rec.push(['Mängel', ord.map((m, i) => [
    `M${i + 1} [${secT(m.section)} – ${FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || '')}]`,
    'Mangel: ' + m.text, m.massnahme && 'Massnahme: ' + m.massnahme, m.verantwortlich && 'Verantwortlich: ' + m.verantwortlich,
    m.frist && 'Frist: ' + fmtDate(m.frist)].filter(Boolean).join('; ')).join(' | ')]);
  const nPhotos = Object.values(state.photos).reduce((n, l) => n + (l || []).length, 0) + state.maengel.reduce((n, m) => n + (m.photos || []).length, 0)
    + (state.values.proben_liste || []).reduce((n, p) => n + (p.photos || []).length, 0)
    + (state.values.org_bestaende || []).reduce((n, b) => n + (b.photos || []).length, 0);
  rec.push(['Fotos: Anzahl', String(nPhotos)]);
  const maps = Object.values(state.gis || {}).flat();
  rec.push(['GIS-Karten', maps.map((m, i) => {
    const hits = GIS.hitsText(m);
    return `K${i + 1} ${m.layerLabel}, 1:${Math.round(m.scale)}, E ${Math.round(m.E)} / N ${Math.round(m.N)}${hits.length ? ', Am Standort: ' + hits.join('; ') : ''}${m.remark ? ', Bemerkung: ' + m.remark : ''}`;
  }).join(' | ')]);
  rec.push(['Kenntnisnahme: Unterschrift vorhanden', state.values.kenntnis_sign ? 'ja' : '']);
  return rec;
}

/* ---------- CSV lesen / schreiben ---------- */
function decodeCsv(buf) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf).replace(/^﻿/, ''); }
  catch { return new TextDecoder('windows-1252').decode(buf); } // z.B. von Excel als «CSV (Trennzeichen-getrennt)» gespeichert
}
function detectSep(text) {
  const first = text.split(/\r?\n/, 1)[0] || '';
  let q = false; const n = { ';': 0, ',': 0, '\t': 0 };
  for (const ch of first) { if (ch === '"') q = !q; else if (!q && ch in n) n[ch]++; }
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][1] ? Object.entries(n).sort((a, b) => b[1] - a[1])[0][0] : ';';
}
function parseCsvText(text, sep) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(c => c !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(c => c !== '')) rows.push(row);
  return rows;
}
const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""').replace(/\r\n?/g, '\n') + '"';
const toCsv = (rows, sep) => '﻿' + rows.map(r => r.map(csvCell).join(sep)).join('\r\n') + '\r\n';

// Bestehende Tabelle und neue Begehung zusammenführen (Spalten über den Namen)
function mergeCsv(oldRows, rec) {
  const head = oldRows.length ? [...oldRows[0]] : [];
  for (const [h] of rec) if (!head.includes(h)) head.push(h); // neue Felder als zusätzliche Spalten
  const recMap = new Map(rec);
  const newRow = head.map(h => recMap.get(h) ?? '');
  const idCol = head.indexOf(CSV_ID);
  let replaced = false;
  const body = oldRows.slice(1).map(r => {
    const full = head.map((_, i) => r[i] ?? '');
    if (idCol >= 0 && full[idCol] === state.id) { replaced = true; return newRow; }
    return full;
  });
  if (!replaced) body.push(newRow);
  return { rows: [head, ...body], replaced, count: body.length };
}

/* ---------- Ablauf ---------- */
let lastCsv = null;
function csvFileName() {
  const part = s => clean(s || '').trim().replace(/[\\/:*?"<>|.,;]+/g, ' ').replace(/\s+/g, '-').slice(0, 40);
  return `UBB-Begehungen_${part(state.values.projekt) || 'Projekt'}.csv`;
}
function showCsvResult(text, name, info) {
  const file = new File([text], name, { type: 'text/csv' });
  lastCsv = { file, name };
  $('csvName').textContent = name;
  $('csvInfo').textContent = info;
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  $('csvShare').style.display = canShare ? '' : 'none';
  $('dlgCsv').close();
  $('dlgCsvDone').showModal();
}
function csvNew() {
  const rec = csvRecord();
  showCsvResult(toCsv([rec.map(r => r[0]), rec.map(r => r[1])], ';'), csvFileName(),
    'Neue Sammeltabelle mit dieser Begehung. In OneDrive im Projektordner speichern; bei den nächsten Begehungen «Bestehende CSV-Datei ergänzen» wählen.');
}
async function csvAppend(file) {
  let text;
  try { text = decodeCsv(await file.arrayBuffer()); } catch { toast('Datei konnte nicht gelesen werden.'); return; }
  const sep = detectSep(text);
  const oldRows = parseCsvText(text, sep);
  if (oldRows.length && !oldRows[0].includes(CSV_ID) &&
      !confirm('Diese Datei stammt nicht aus der UBB-App (Spalte «Protokoll-ID» fehlt). Trotzdem ergänzen?')) return;
  const { rows, replaced, count } = mergeCsv(oldRows, csvRecord());
  showCsvResult(toCsv(rows, sep), file.name,
    `${count} Begehung${count === 1 ? '' : 'en'} in der Datei – diese Begehung wurde ${replaced ? 'aktualisiert (war schon enthalten)' : 'als neue Zeile angehängt'}. Unter dem gleichen Namen in OneDrive speichern und die alte Datei ersetzen.`);
}

function initCsv() {
  $('btnCsv').onclick = () => checkRequired(() => $('dlgCsv').showModal());
  $('csvNew').onclick = csvNew;
  $('csvAppend').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) csvAppend(f); };
  $('csvCancel').onclick = () => $('dlgCsv').close();
  $('csvClose').onclick = () => $('dlgCsvDone').close();
  $('csvDownload').onclick = () => lastCsv && downloadBlob(lastCsv.file, lastCsv.name);
  $('csvShare').onclick = async () => {
    if (!lastCsv) return;
    try { await navigator.share({ files: [lastCsv.file], title: lastCsv.name }); }
    catch (e) { if (e.name !== 'AbortError') { toast('Teilen nicht möglich – bitte «Herunterladen» verwenden.'); } }
  };
}
