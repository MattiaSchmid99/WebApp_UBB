'use strict';
/* =====================================================================
   Pendenzen aus früheren Begehungen (Abschnitt «pkontrolle»)
   - Offene Pendenzen und zu bekämpfende Neophyten-Bestände der letzten Begehung
     desselben Projekts werden übernommen (SharePoint, Gerät oder Begehungsdatei)
   - pro Pendenz: erledigt / nicht erledigt, Kommentar, Fotos
   - «nicht erledigt» und nicht kontrollierte Pendenzen gehen in die nächste Begehung weiter
   Daten: state.pkontrolle = [{ key, kind, orig, history, status, kommentar, photos }]
   ===================================================================== */

const PK_STATUS = ['erledigt', 'nicht erledigt'];
const normP = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const pkList = () => (state.pkontrolle ||= []);
const pkOpenCount = () => pkList().filter(p => p.status !== 'erledigt').length;
const pkUnchecked = () => pkList().filter(p => !p.status);
function pkBadge() {
  const l = pkList();
  if (!l.length) return 'keine';
  const e = l.filter(p => p.status === 'erledigt').length, u = pkUnchecked().length;
  return [`${l.length} ${l.length === 1 ? 'Pendenz' : 'Pendenzen'}`, e && `${e} erledigt`, u && `${u} offen zu prüfen`].filter(Boolean).join(' · ');
}
const pkLabel = p => `${p.orig.nr} vom ${fmtDate(p.orig.datum)}`;

// Offene Pendenzen einer Begehung (für die Übernahme in die nächste)
function pkFrom(st) {
  prepState(st);
  return withState(st, () => {
    const v = state.values, d = v.datum || '', out = [];
    const secT = id => (SCHEMA.find(x => x.id === id) || {}).title || '';
    const base = { begId: st.id, datum: d };
    orderedMaengel().forEach((m, i) => out.push({ key: `${st.id}|M:${m.id}`, kind: 'pendenz', history: [], orig: { ...base, nr: `PD${i + 1}`,
      bereich: secT(m.section), punkt: FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || ''), text: m.text || '', massnahme: m.massnahme || '',
      verantwortlich: m.verantwortlich || '', frist: m.frist || '', photos: (m.photos || []).slice(0, 2) } }));
    neoToFight().forEach(b => out.push({ key: `${st.id}|N:${b.id}`, kind: 'neophyt', history: [], orig: { ...base, nr: `N${v.org_bestaende.indexOf(b) + 1}`,
      bereich: 'Umweltgefährdende Organismen', punkt: 'Invasive Neophyten' + (neoAnh(b) ? ` (FrSV Anh. ${neoAnh(b)})` : ''),
      text: 'Bestand bekämpfen: ' + neoName(b), massnahme: b.bem || '', verantwortlich: b.verantwortlich || '', frist: b.frist || '',
      E: b.E || null, N: b.N || null, photos: (b.photos || []).slice(0, 2) } }));
    // bereits übernommene, noch nicht erledigte Pendenzen gehen weiter (mit Verlauf)
    pkList().filter(p => p.status !== 'erledigt').forEach(p => out.push({ key: p.key, kind: p.kind, orig: p.orig,
      history: [...(p.history || []), { datum: d, status: p.status || 'nicht kontrolliert', kommentar: p.kommentar || '', ubb: v.ubbKuerzel || v.ubbName || '' }] }));
    return out;
  });
}

// Pendenzen einer anderen Begehung übernehmen (bereits vorhandene werden nicht doppelt übernommen)
function pkImport(src, from, quiet) {
  if (!src || src.id === state.id) return 0;
  const items = pkFrom(src);
  let n = 0;
  for (const it of items) if (!pkList().some(p => p.key === it.key)) { pkList().push({ ...it, status: '', kommentar: '', photos: [] }); n++; }
  const sv = src.values || {};
  state.pkSource = { begId: src.id, datum: sv.datum || '', art: [sv.artBegehung, sv.artBegehung_andere].filter(Boolean).join(', '),
    ubb: sv.ubbKuerzel || sv.ubbName || '', from, open: items.length, at: new Date().toISOString() };
  drawPk();
  if (quiet) { rendering = true; try { afterChange(); } finally { rendering = false; } scheduleSave(true); }
  else afterChange();
  return n;
}

// Begehungen desselben Projekts (Gerät und SharePoint), neueste zuerst
async function pkCandidates(withSp) {
  const P = normP(state.values.projekt), D = state.values.datum || '9999-99-99';
  const own = state.id.slice(-6);
  const list = [];
  if (!P) return { list, err: '' };
  for (const a of archive) if (a.id !== state.id && normP(a.projekt) === P && (a.datum || '') <= D)
    list.push({ short: a.id.slice(-6), datum: a.datum, art: a.art, ubb: a.ubb, from: 'Gerät', local: a, load: async () => DB.get(BKEY(a.id)) });
  let err = '';
  if (withSp && SP.enabled() && SP.account && navigator.onLine) {
    try {
      const path = `${SP.root()}/${spProjectFolder(state.values.projekt)}`;
      for (const f of await SP.children(path)) {
        const m = f.folder && /^(\d{4}-\d{2}-\d{2})_(.*)_([0-9a-z]{6})$/i.exec(f.name);
        if (!m || m[3] === own || m[1] > D) continue;
        const sp = { short: m[3], datum: m[1], art: m[2].replace(/-/g, ' '), ubb: '', from: 'SharePoint',
          load: async () => { const file = await spBegFile(`${path}/${f.name}`); return file ? (await readBegFile(file)).st : null; } };
        // gleiche Begehung auf Gerät und in SharePoint: Gerät nur, wenn dort neuere, nicht hochgeladene Änderungen sind
        const i = list.findIndex(x => x.short === sp.short);
        if (i < 0) list.push(sp);
        else if (!(list[i].local.rev > (list[i].local.spUploadedRev || 0))) list[i] = { ...sp, art: list[i].art, ubb: list[i].ubb };
      }
    } catch (e) { err = spErr(e); }
  }
  list.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
  return { list, err };
}

async function pkTakeLatest(auto) {
  const btn = $('pkLatest');
  if (btn) { btn.disabled = true; btn.textContent = 'Wird gesucht …'; }
  try {
    if (!normP(state.values.projekt)) { if (!auto) toast('Zuerst «Projektnr. und Ort» ausfüllen.'); return; }
    const { list, err } = await pkCandidates(true);
    if (!list.length) { if (!auto) toast(err || 'Keine frühere Begehung dieses Projekts gefunden.'); return; }
    const c = list[0];
    const st = await c.load();
    if (!st) { if (!auto) toast('Begehung konnte nicht geladen werden.'); return; }
    const n = pkImport(st, c.from, auto && !state.rev);
    toast(n ? `${n} offene ${n === 1 ? 'Pendenz' : 'Pendenzen'} aus der Begehung vom ${fmtDate(c.datum)} übernommen.`
      : `Keine neuen offenen Pendenzen in der Begehung vom ${fmtDate(c.datum)}.`);
  } catch (e) { if (!auto) toast(spErr(e)); else console.warn(e); }
  finally { drawPk(); }
}

// Neue Begehung: automatisch die offenen Pendenzen der letzten Begehung übernehmen
function pkAutoOnNew() { if (normP(state.values.projekt)) pkTakeLatest(true); }

// Auswahl einer bestimmten Begehung
async function pkPick() {
  const box = $('pkPickList');
  box.innerHTML = ''; box.append(el('div', { class: 'hint' }, 'Wird geladen …'));
  $('dlgPk').showModal();
  const { list, err } = await pkCandidates(true);
  const others = archive.filter(a => a.id !== state.id && normP(a.projekt) !== normP(state.values.projekt))
    .sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))
    .map(a => ({ short: a.id.slice(-6), datum: a.datum, art: a.art, ubb: a.ubb, from: 'Gerät', other: a.projekt, load: async () => DB.get(BKEY(a.id)) }));
  box.innerHTML = '';
  if (err) box.append(el('div', { class: 'empty warn' }, 'SharePoint: ' + err));
  const item = c => el('div', { class: 'pitem' },
    el('div', { class: 'pn' }, el('b', {}, [fmtDate(c.datum), c.art].filter(Boolean).join(' · ') || 'Begehung'),
      el('span', {}, [c.other, c.ubb, c.from].filter(Boolean).join(' · '))),
    el('button', { type: 'button', class: 'btn sm', onclick: async () => {
      try {
        const st = await c.load();
        if (!st) { toast('Begehung konnte nicht geladen werden.'); return; }
        $('dlgPk').close();
        const n = pkImport(st, c.from);
        toast(`${n} ${n === 1 ? 'Pendenz' : 'Pendenzen'} übernommen.`);
      } catch (e) { toast(spErr(e)); }
    } }, 'Übernehmen'));
  if (list.length) { box.append(el('div', { class: 'plab' }, 'Dieses Projekt')); list.forEach(c => box.append(item(c))); }
  if (others.length) { box.append(el('div', { class: 'plab' }, 'Andere Projekte auf diesem Gerät')); others.forEach(c => box.append(item(c))); }
  if (!list.length && !others.length) box.append(el('div', { class: 'empty' }, 'Keine früheren Begehungen gefunden. Eine Begehungsdatei wählen.'));
}

/* ---------- Anzeige im Formular ---------- */
function renderPkontrolle() {
  const box = el('div', { class: 'proben', id: 'pkBox' });
  queueMicrotask(drawPk);
  return box;
}

function drawPk() {
  const box = $('pkBox');
  if (!box) return;
  box.innerHTML = '';
  const l = pkList(), src = state.pkSource;
  if (src) box.append(el('div', { class: 'hint' }, `Übernommen aus der Begehung vom ${fmtDate(src.datum)}${src.art ? ' (' + src.art + (src.ubb ? ', ' + src.ubb : '') + ')' : ''} – ${src.from}.`));
  box.append(el('div', { class: 'stack' },
    el('button', { type: 'button', class: 'btn' + (l.length ? '' : ' primary'), id: 'pkLatest', style: 'width:100%;max-width:none', onclick: () => pkTakeLatest(false) },
      l.length ? 'Erneut nach offenen Pendenzen suchen' : 'Offene Pendenzen der letzten Begehung übernehmen'),
    el('button', { type: 'button', class: 'btn sm', onclick: pkPick }, 'Andere Begehung wählen …')));
  if (!l.length) box.append(el('div', { class: 'hint' }, 'Noch keine Pendenzen übernommen. Gesucht wird die letzte Begehung mit gleicher «Projektnr. und Ort»' + (SP.enabled() ? ' in SharePoint und auf diesem Gerät.' : ' auf diesem Gerät.')));
  l.forEach(p => box.append(pkCard(p)));
}

function pkCard(p) {
  const o = p.orig, changed = () => afterChange();
  const card = el('div', { class: 'probe pk' + (p.status === 'erledigt' ? ' done' : '') });
  const overdue = () => o.frist && o.frist < (state.values.datum || today()) && p.status !== 'erledigt';
  const frText = () => [o.verantwortlich && 'Verantwortlich: ' + o.verantwortlich, o.frist && 'Frist: ' + fmtDate(o.frist) + (overdue() ? ' – überfällig' : '')].filter(Boolean).join(' · ');
  const chips = el('div', { class: 'chips' }, PK_STATUS.map(s => el('button', {
    type: 'button', class: 'chip', 'aria-pressed': p.status === s ? 'true' : 'false',
    onclick: () => {
      p.status = p.status === s ? '' : s;
      chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.textContent === p.status ? 'true' : 'false'));
      card.classList.toggle('done', p.status === 'erledigt'); fr.classList.toggle('warn', !!overdue()); fr.textContent = frText();
      changed();
    },
  }, s)));
  const kom = el('textarea', { rows: 2, placeholder: 'Kommentar zur Kontrolle', oninput: e => { p.kommentar = e.target.value; autosize(e.target); changed(); } });
  kom.value = p.kommentar || '';
  requestAnimationFrame(() => autosize(kom));
  const phBox = el('div', { class: 'photos' });
  const drawPh = () => {
    phBox.innerHTML = '';
    (p.photos ||= []).forEach(x => phBox.append(el('div', { class: 'ph' }, el('img', { src: x.data, alt: 'Foto Kontrolle' }),
      el('button', { type: 'button', class: 'del', 'aria-label': 'Foto löschen', onclick: () => { if (!confirm('Foto löschen?')) return; p.photos = p.photos.filter(y => y !== x); drawPh(); changed(); } }, '×'))));
    phBox.append(...photoAddTiles(async files => {
      for (const file of files) { try { p.photos.push(await compressImage(file)); } catch { toast('Foto konnte nicht geladen werden.'); } }
      drawPh(); changed();
    }));
  };
  drawPh();
  const fr = el('div', { class: 'pkmeta' + (overdue() ? ' warn' : '') }, frText());
  const lab = t => el('div', { class: 'plab' }, t);
  card.append(...[
    el('div', { class: 'aufl-head' }, el('b', {}, pkLabel(p)), el('span', { style: 'flex:1' }),
      el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Pendenz entfernen', onclick: () => {
        if (!confirm(`Pendenz ${pkLabel(p)} aus dieser Kontrolle entfernen? Sie wird dann nicht mehr weitergeführt.`)) return;
        state.pkontrolle = pkList().filter(x => x !== p); drawPk(); changed();
      } }, '×')),
    el('div', { class: 'pkmeta' }, [o.bereich, o.punkt].filter(Boolean).join(' – ')),
    el('div', { class: 'pktext' }, o.text || '(ohne Beschreibung)'),
    o.massnahme ? el('div', {}, (p.kind === 'neophyt' ? 'Bemerkung: ' : 'Massnahme: ') + o.massnahme) : null,
    o.E ? el('div', { class: 'pkmeta' }, `Standort: E ${Math.round(o.E).toLocaleString('de-CH')} / N ${Math.round(o.N).toLocaleString('de-CH')} (LV95)`) : null,
    fr.textContent ? fr : null,
    ...(p.history || []).map(h => el('div', { class: 'pkmeta' }, `Kontrolle ${fmtDate(h.datum)}${h.ubb ? ' (' + h.ubb + ')' : ''}: ${h.status}${h.kommentar ? ' – ' + h.kommentar : ''}`)),
    (o.photos || []).length ? el('div', { class: 'pkorig' }, ...o.photos.map(x => el('img', { src: x.data, alt: 'Foto bei Erfassung' })), el('span', { class: 'hint' }, 'Fotos bei Erfassung')) : null,
    lab('Status'), chips, lab('Kommentar'), kom, lab('Fotos'), phBox].filter(Boolean));
  return card;
}

/* ---------- Pflichtfeld-Warnung, Fotos, Listen ---------- */
const pkMissing = () => pkUnchecked().map(p => ({ id: 'pk_list', section: 'pkontrolle', label: `Pendenz ${pkLabel(p)}: erledigt / nicht erledigt` }));

function pkPhotoFiles(add) {
  pkList().forEach(p => (p.photos || []).forEach((x, k) => add(x.data, `Kontrolle_${p.orig.nr}-vom-${slug(p.orig.datum)}_${k + 1}.jpg`)));
}

// Zeilen für die Pendenzen-Liste (CSV) – Kontrolle der übernommenen Pendenzen
function pkMassRows(base) {
  return pkList().map(p => [base.id, base.datum, base.projekt, 'Pendenzen-Kontrolle', `${p.orig.nr} (${fmtDate(p.orig.datum)})`, p.orig.bereich || '',
    p.orig.punkt || '', p.orig.text || '', p.orig.massnahme || '', p.orig.verantwortlich || '', p.orig.frist ? fmtDate(p.orig.frist) : '',
    p.status || 'nicht kontrolliert', p.kommentar || '', p.orig.E ? String(Math.round(p.orig.E)) : '', p.orig.N ? String(Math.round(p.orig.N)) : '', '', String((p.photos || []).length)]);
}

function initPk() {
  $('pkClose').onclick = () => $('dlgPk').close();
  $('pkFile').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const r = await readBegFile(f);
      if (r.st.id === state.id) { toast('Das ist die offene Begehung.'); return; }
      $('dlgPk').close();
      const n = pkImport(r.st, 'Begehungsdatei');
      toast(`${n} ${n === 1 ? 'Pendenz' : 'Pendenzen'} übernommen.`);
    } catch (err) { toast(err.message || 'Datei konnte nicht gelesen werden.'); }
  };
}
