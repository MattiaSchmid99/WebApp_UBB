'use strict';
/* =====================================================================
   CSV: eine Zeile pro Begehung, eine Spalte pro Feld. Wird nur noch als
   Sammel-CSV aus Begehungsdateien erzeugt (archive.js: buildSammelCsv).
   Format: UTF-8 mit BOM, Semikolon, alle Werte in Anführungszeichen (Excel CH).
   ===================================================================== */

const CSV_ID = 'Protokoll-ID';
const CSV_SKIP_TYPES = ['sub', 'photos', 'gis', 'signature', 'mlist', 'pkontrolle'];

function auflagenText(list) {
  return (list || []).filter(a => String(a.text || '').trim()).map((a, i) =>
    `A${i + 1} [${a.status || 'nicht geprüft'}] ${a.text} (${a.herkunft || '-'})${a.bemerkung ? ' – ' + a.bemerkung : ''}`).join(' | ');
}

// Spalten und Werte der aktuellen Begehung
function csvRecord() {
  const rec = [[CSV_ID, state.id], ['Exportiert am', new Date().toLocaleString('de-CH')], ['App-Version', APP_VERSION]];
  for (const s of SCHEMA) {
    if (s.id === 'maengel' || s.id === 'gis' || s.id === 'pkontrolle') continue;
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
  const pk = state.pkontrolle || [];
  rec.push(['Pendenzen-Kontrolle: Anzahl', String(pk.length)]);
  rec.push(['Pendenzen-Kontrolle: erledigt', String(pk.filter(p => p.status === 'erledigt').length)]);
  rec.push(['Pendenzen-Kontrolle: nicht erledigt', String(pk.filter(p => p.status === 'nicht erledigt').length)]);
  rec.push(['Pendenzen-Kontrolle', pk.map(p => [`${p.orig.nr} vom ${fmtDate(p.orig.datum)}: ${p.orig.text}`, p.status || 'nicht kontrolliert', p.kommentar].filter(Boolean).join('; ')).join(' | ')]);
  rec.push(['Pendenzen: Anzahl', String(ord.length)]);
  rec.push(['Pendenzen', ord.map((m, i) => [
    `PD${i + 1} [${secT(m.section)} – ${FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || '')}]`,
    'Pendenz: ' + m.text, m.massnahme && 'Massnahme: ' + m.massnahme, m.verantwortlich && 'Verantwortlich: ' + m.verantwortlich,
    m.frist && 'Frist: ' + fmtDate(m.frist)].filter(Boolean).join('; ')).join(' | ')]);
  const nPhotos = Object.values(state.photos).reduce((n, l) => n + (l || []).length, 0) + state.maengel.reduce((n, m) => n + (m.photos || []).length, 0)
    + (state.values.proben_liste || []).reduce((n, p) => n + (p.photos || []).length, 0)
    + (state.values.org_bestaende || []).reduce((n, b) => n + (b.photos || []).length, 0)
    + (state.pkontrolle || []).reduce((n, p) => n + (p.photos || []).length, 0);
  rec.push(['Fotos: Anzahl', String(nPhotos)]);
  const maps = Object.values(state.gis || {}).flat();
  rec.push(['GIS-Karten', maps.map((m, i) => {
    const hits = GIS.hitsText(m);
    return `K${i + 1} ${m.layerLabel}, 1:${Math.round(m.scale)}, E ${Math.round(m.E)} / N ${Math.round(m.N)}${hits.length ? ', Am Standort: ' + hits.join('; ') : ''}${m.remark ? ', Bemerkung: ' + m.remark : ''}`;
  }).join(' | ')]);
  rec.push(['Kenntnisnahme: Unterschrift vorhanden', state.values.kenntnis_sign ? 'ja' : '']);
  return rec;
}

/* ---------- CSV schreiben ---------- */
const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""').replace(/\r\n?/g, '\n') + '"';
const toCsv = (rows, sep) => '﻿' + rows.map(r => r.map(csvCell).join(sep)).join('\r\n') + '\r\n';
