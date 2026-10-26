'use strict';
/* =====================================================================
   Zusatzfunktionen: Abschnitt «n. rel.», Auflagen, Mängel/Massnahmenliste,
   Unterschrift, Wetter, Pflichtfelder. Nutzt state, el, uid, … aus app.js.
   ===================================================================== */

/* ---------- Abschnitt nicht relevant ---------- */
function toggleSectionNrel(s) {
  if (state.nrel[s.id]) delete state.nrel[s.id];
  else {
    const mc = state.maengel.filter(m => m.section === s.id).length;
    if (mc && !confirm(`In diesem Abschnitt sind ${mc} Mängel erfasst. Trotzdem als nicht relevant markieren? Die Mängel bleiben in der Massnahmenliste.`)) return;
    state.nrel[s.id] = true;
  }
  afterChange();
}

// Alle noch leeren Fragen mit Option «n. rel.» auf «n. rel.» setzen
function fillOpenNrel(s) {
  let n = 0;
  for (const f of s.fields) {
    if (f.type === 'radio' && f.options.includes('n. rel.') && isVisible(f) && !isFilled(f)) {
      state.values[f.id] = 'n. rel.'; refreshChips(f.id); n++;
    }
  }
  afterChange();
  toast(n ? `${n} offene Fragen auf «n. rel.» gesetzt.` : 'Keine offenen Fragen mit «n. rel.».');
}

/* ---------- Auflagen aus Baubewilligung / UVB ---------- */
const AUFL_HERKUNFT = ['Baubewilligung', 'UVB', 'Andere'];
const AUFL_STATUS = ['erfüllt', 'nicht erfüllt', 'offen', 'n. rel.'];

function renderAuflagen(f) {
  const list = () => (state.values[f.id] ||= []);
  const box = el('div', { class: 'aufl-items' });
  const det = el('details', { class: 'auflagen' },
    el('summary', {}, el('span', {}, 'Auflagen aus Baubewilligung / UVB'), el('span', { class: 'hint', id: 'ac_' + f.id }, '(optional)')),
    box);
  const count = () => {
    const a = list().filter(x => String(x.text || '').trim()), nf = a.filter(x => x.status === 'nicht erfüllt').length;
    const c = document.getElementById('ac_' + f.id);
    if (c) c.textContent = a.length ? `${a.length} Auflage${a.length === 1 ? '' : 'n'}${nf ? ` · ${nf} nicht erfüllt` : ''}` : '(optional)';
  };
  const changed = () => { count(); afterChange(); };

  function draw() {
    box.innerHTML = '';
    list().forEach((a, i) => {
      const txt = el('textarea', { rows: 2, placeholder: 'Auflage, z.B. «Ziff. 4.2: Bodendepots max. 2.5 m hoch»', oninput: e => { a.text = e.target.value; autosize(e.target); changed(); } });
      txt.value = a.text || '';
      const her = el('select', { onchange: e => { a.herkunft = e.target.value; changed(); } },
        AUFL_HERKUNFT.map(h => el('option', { value: h, selected: h === a.herkunft }, h)));
      const chips = el('div', { class: 'chips' }, AUFL_STATUS.map(st => el('button', {
        type: 'button', class: 'chip', 'aria-pressed': a.status === st ? 'true' : 'false',
        onclick: () => { a.status = a.status === st ? '' : st; draw(); changed(); },
      }, st)));
      const bem = el('input', { type: 'text', placeholder: 'Bemerkung', value: a.bemerkung || '', oninput: e => { a.bemerkung = e.target.value; changed(); } });
      box.append(el('div', { class: 'aufl' + (a.status === 'nicht erfüllt' ? ' bad' : '') },
        el('div', { class: 'aufl-head' }, el('b', {}, `A${i + 1}`), her,
          el('button', {
            type: 'button', class: 'btn sm', 'aria-label': 'Auflage löschen', onclick: () => {
              const ms = state.maengel.filter(m => m.ref === a.id);
              if (!confirm('Auflage löschen?' + (ms.length ? ` Die ${ms.length} zugehörigen Mängel werden ebenfalls gelöscht.` : ''))) return;
              state.values[f.id] = list().filter(x => x !== a);
              state.maengel = state.maengel.filter(m => m.ref !== a.id);
              draw(); changed();
            },
          }, '×')),
        txt, chips, bem,
        el('div', { class: 'mrow' }, el('div', { class: 'mlist', id: 'ml_' + a.id }),
          el('button', { type: 'button', class: 'mbtn', onclick: () => openMangel({ section: f.section, ref: a.id, refLabel: 'Auflage: ' + (a.text || '').slice(0, 80) }) }, '+ Mangel'))));
      requestAnimationFrame(() => autosize(txt));
    });
    box.append(el('button', {
      type: 'button', class: 'btn sm', onclick: () => {
        list().push({ id: uid(), text: '', herkunft: 'Baubewilligung', status: '', bemerkung: '' });
        draw(); changed();
        const t = box.querySelectorAll('textarea'); t[t.length - 1]?.focus();
      },
    }, '+ Auflage hinzufügen'));
    renderAllMaengelLists();
  }
  draw();
  if (list().length) det.open = true;
  queueMicrotask(count);
  return det;
}

/* ---------- Mängel und Massnahmenliste ---------- */
// Reihenfolge wie im Formular: Abschnitt → Feld bzw. Auflage → Erfassung
function orderedMaengel() {
  const out = [];
  for (const s of SCHEMA) {
    const refs = s.fields.flatMap(f => f.type === 'auflagen' ? (state.values[f.id] || []).map(a => a.id) : [f.id]);
    for (const r of refs) out.push(...state.maengel.filter(m => m.ref === r));
    out.push(...state.maengel.filter(m => m.section === s.id && !refs.includes(m.ref)));
  }
  return out;
}
const mangelNr = m => 'M' + (orderedMaengel().indexOf(m) + 1);

function mangelCard(m, nr) {
  const meta = [m.verantwortlich, m.frist && 'Frist ' + fmtDate(m.frist), m.photos?.length && `${m.photos.length} Foto${m.photos.length > 1 ? 's' : ''}`].filter(Boolean).join(' · ');
  return el('button', { type: 'button', class: 'mcard', onclick: () => openMangel(m) },
    el('b', {}, nr + ' '), m.text || '(ohne Beschreibung)', meta ? el('small', {}, meta) : null);
}

function renderAllMaengelLists() {
  const ord = orderedMaengel();
  document.querySelectorAll('.mlist[id^="ml_"]').forEach(box => {
    const ref = box.id.slice(3);
    box.innerHTML = '';
    ord.forEach((m, i) => { if (m.ref === ref) box.append(mangelCard(m, 'M' + (i + 1))); });
  });
  const all = document.getElementById('mlAll');
  if (all) {
    all.innerHTML = '';
    if (!ord.length) all.append(el('div', { class: 'hint' }, 'Keine Mängel erfasst. Mängel bei der jeweiligen Frage mit «+ Mangel» erfassen.'));
    ord.forEach((m, i) => {
      const sec = SCHEMA.find(s => s.id === m.section);
      const c = mangelCard(m, 'M' + (i + 1));
      c.prepend(el('small', { class: 'sec' }, sec ? sec.title : ''));
      all.append(c);
    });
  }
}

let mangelDraft = null;
function openMangel(src) {
  // src: bestehender Mangel oder { section, ref, refLabel } für einen neuen
  const existing = state.maengel.includes(src) ? src : null;
  mangelDraft = existing ? JSON.parse(JSON.stringify(existing)) :
    { id: uid(), section: src.section, ref: src.ref, refLabel: src.refLabel, text: '', massnahme: '', verantwortlich: '', frist: '', photos: [], created: new Date().toISOString() };
  $('mgRef').textContent = mangelDraft.refLabel || '';
  $('mgText').value = mangelDraft.text; $('mgMass').value = mangelDraft.massnahme;
  $('mgVer').value = mangelDraft.verantwortlich; $('mgFrist').value = mangelDraft.frist;
  $('mgTitle').textContent = existing ? `Mangel ${mangelNr(existing)} bearbeiten` : 'Mangel erfassen';
  $('mgDelete').style.display = existing ? '' : 'none';
  // Vorschläge für «Verantwortlich» aus bisherigen Einträgen
  $('mgVerList').innerHTML = '';
  [...new Set(state.maengel.map(m => m.verantwortlich).filter(Boolean))].forEach(n => $('mgVerList').append(el('option', { value: n })));
  drawMangelPhotos();
  $('dlgMangel').showModal();
  if (!existing) setTimeout(() => $('mgText').focus(), 50);
}

function drawMangelPhotos() {
  const box = $('mgPhotos');
  box.innerHTML = '';
  mangelDraft.photos.forEach(p => box.append(el('div', { class: 'ph' },
    el('img', { src: p.data, alt: 'Foto Mangel' }),
    el('button', { type: 'button', class: 'del', 'aria-label': 'Foto löschen', onclick: () => { mangelDraft.photos = mangelDraft.photos.filter(x => x !== p); drawMangelPhotos(); } }, '×'))));
  box.append(...photoAddTiles(async files => {
    for (const file of files) {
      try { mangelDraft.photos.push(await compressImage(file)); } catch { toast('Foto konnte nicht geladen werden.'); }
    }
    drawMangelPhotos();
  }));
}

function saveMangel() {
  const d = mangelDraft;
  d.text = $('mgText').value.trim(); d.massnahme = $('mgMass').value.trim();
  d.verantwortlich = $('mgVer').value.trim(); d.frist = $('mgFrist').value;
  if (!d.text) { toast('Bitte den Mangel beschreiben.'); $('mgText').focus(); return; }
  const i = state.maengel.findIndex(m => m.id === d.id);
  if (i >= 0) state.maengel[i] = d; else state.maengel.push(d);
  $('dlgMangel').close();
  afterChange(); flushSave();
}

function deleteMangel() {
  if (!confirm('Mangel löschen?')) return;
  state.maengel = state.maengel.filter(m => m.id !== mangelDraft.id);
  $('dlgMangel').close();
  afterChange();
}

/* ---------- Unterschrift ---------- */
function signaturePad(f) {
  const W = 900, H = 300;
  const c = el('canvas', { width: W, height: H, class: 'sig' });
  const g = c.getContext('2d');
  // transparent; die Hilfslinie kommt aus dem CSS-Hintergrund und landet nicht im Bild
  const clear = () => g.clearRect(0, 0, W, H);
  clear();
  if (state.values[f.id]) { const im = new Image(); im.onload = () => g.drawImage(im, 0, 0, W, H); im.src = state.values[f.id]; }
  let drawing = false, last = null, dirty = false;
  const pt = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  c.addEventListener('pointerdown', e => { drawing = true; last = pt(e); c.setPointerCapture(e.pointerId); e.preventDefault(); });
  c.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = pt(e);
    g.strokeStyle = '#000'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke();
    last = p; dirty = true; e.preventDefault();
  });
  const end = () => {
    if (!drawing) return; drawing = false;
    if (dirty) { state.values[f.id] = c.toDataURL('image/png'); afterChange(); }
  };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  const btn = el('button', { type: 'button', class: 'btn sm', onclick: () => { clear(); dirty = false; delete state.values[f.id]; afterChange(); } }, 'Unterschrift löschen');
  return el('div', {}, c, el('div', { style: 'margin-top:6px' }, btn));
}

/* ---------- Wetter: Messwerte MeteoSchweiz (SwissMetNet, Open Government Data) ----------
   Nächstgelegene Station zum Standort, aktuelle 10-Minuten-Werte (Datei «t_now»: gestern 12 UTC bis jetzt).
   Dateien: Semikolon, Windows-1252, Zeitstempel in UTC. Quelle muss genannt werden: «MeteoSchweiz». */
const MCH = 'https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/';
const MCH_STATIONS_KEY = 'ubb-mch-stations';

async function mchText(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return new TextDecoder('windows-1252').decode(await r.arrayBuffer());
}
function parseCsv(txt) {
  const lines = txt.split(/\r?\n/).filter(l => l.trim());
  const head = lines.shift().split(';').map(h => h.trim());
  return lines.map(l => { const c = l.split(';'); const o = {}; head.forEach((h, i) => { o[h] = (c[i] ?? '').trim(); }); return o; });
}
// Stationsliste (30 Tage im Browser gespeichert)
async function mchStations() {
  try {
    const c = JSON.parse(localStorage.getItem(MCH_STATIONS_KEY));
    if (c && Date.now() - c.t < 30 * 864e5 && c.list.length) return c.list;
  } catch {}
  const list = parseCsv(await mchText(MCH + 'ogd-smn_meta_stations.csv'))
    .map(s => ({ abbr: s.station_abbr, name: s.station_name, E: +s.station_coordinates_lv95_east, N: +s.station_coordinates_lv95_north, h: +s.station_height_masl || null }))
    .filter(s => s.abbr && s.E && s.N);
  try { localStorage.setItem(MCH_STATIONS_KEY, JSON.stringify({ t: Date.now(), list })); } catch {}
  return list;
}
const mchTime = s => { const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/.exec(s || ''); return m ? new Date(Date.UTC(+m[3], m[2] - 1, +m[1], +m[4], +m[5])) : null; };
const num = s => (s === '' || s == null || isNaN(+s)) ? null : +s;
const hhmm = d => d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });

// Werte einer Station; null, wenn keine aktuelle Temperatur vorhanden
async function mchStationData(st) {
  const a = st.abbr.toLowerCase();
  const rows = parseCsv(await mchText(`${MCH}${a}/ogd-smn_${a}_t_now.csv`)).map(r => ({ ...r, _t: mchTime(r.reference_timestamp) })).filter(r => r._t);
  rows.sort((x, y) => x._t - y._t);
  const last = [...rows].reverse().find(r => num(r.tre200s0) != null);
  if (!last) return null;
  const t = last._t;
  // Niederschlag: Summe der 10-Minuten-Werte der letzten 24 h (bzw. seit Dateibeginn)
  const win = rows.filter(r => r._t <= t && t - r._t < 24 * 3600e3);
  const rain = win.reduce((s, r) => s + (num(r.rre150z0) || 0), 0);
  const from = win.length ? win[0]._t : t;
  const sun = rows.filter(r => r._t <= t && t - r._t < 3600e3).map(r => num(r.sre000z0)).filter(v => v != null);
  return {
    t, temp: num(last.tre200s0), hum: num(last.ure200s0), wind: num(last.fu3010z0),
    rain, rainHours: Math.round((t - from) / 3600e3 + 1 / 6),
    sunMin: sun.length ? sun.reduce((a, b) => a + b, 0) : null,
  };
}

function weatherRow() {
  return el('div', { class: 'wxrow' },
    el('span', { class: 'hint', id: 'wxInfo' }, 'Messwerte der nächsten MeteoSchweiz-Station abrufen'),
    el('button', { type: 'button', class: 'btn sm', id: 'wxBtn', onclick: () => fetchWeather(true) }, 'Wetter abrufen'));
}

async function fetchWeather(manual) {
  const info = $('wxInfo'), btn = $('wxBtn');
  const set = t => { if (info) info.textContent = t; };
  if (!navigator.onLine) { if (manual) set('Keine Internetverbindung.'); return; }
  if (!navigator.geolocation) { if (manual) set('Standort nicht verfügbar.'); return; }
  if (btn) btn.disabled = true;
  set('Wetter wird abgerufen …');
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }));
    const { E, N } = wgs84ToLv95(pos.coords.latitude, pos.coords.longitude);
    const near = (await mchStations()).map(s => ({ ...s, d: Math.hypot(s.E - E, s.N - N) })).sort((a, b) => a.d - b.d).slice(0, 3);
    // nächste Station mit aktuellen Werten (manche Stationen messen nicht alles oder fallen aus)
    let st = null, w = null;
    for (const s of near) {
      try { w = await mchStationData(s); } catch { w = null; }
      if (w && Date.now() - w.t < 3 * 3600e3) { st = s; break; }
    }
    if (!st) throw new Error('Keine aktuellen Messwerte in der Nähe');
    const km = (st.d / 1000).toFixed(st.d < 10000 ? 1 : 0);
    const hLocal = parseInt(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Zurich' }).format(w.t), 10);
    const day = hLocal >= 7 && hLocal <= 19;
    const txt = [
      w.temp != null ? `${w.temp.toFixed(1)} °C` : null,
      w.hum != null ? `rel. Feuchte ${Math.round(w.hum)} %` : null,
      w.wind != null ? `Wind ${Math.round(w.wind)} km/h` : null,
      `Niederschlag ${w.rainHours >= 23 ? 'letzte 24 h' : `letzte ${w.rainHours} h`}: ${w.rain.toFixed(1)} mm`,
      day && w.sunMin != null ? `Sonne letzte Stunde: ${Math.round(w.sunMin)} min` : null,
    ].filter(Boolean).join(', ') + ` (MeteoSchweiz, Station ${st.name}, ${km} km)`;
    if (!manual && state.values.wetter) return;
    setValue('wetter', txt);
    const inp = $('i_wetter'); if (inp) inp.value = txt;
    set(`Quelle: MeteoSchweiz, Station ${st.name} (${km} km${st.h ? ', ' + Math.round(st.h) + ' m ü. M.' : ''}), Messung ${hhmm(w.t)} – Bewölkung bei Bedarf ergänzen`);
  } catch (e) {
    if (!(e && e.code)) console.warn(e);
    set(e && e.code === 1 ? 'Standortzugriff verweigert – Wetter bitte von Hand eintragen.' : 'Wetter konnte nicht abgerufen werden – bitte von Hand eintragen.');
  } finally { if (btn) btn.disabled = false; }
}

// Automatisch einmal pro Protokoll, wenn Wetter leer und Datum heute
function autoWeather() {
  if (state.wxAuto || state.values.wetter || state.values.datum !== today()) return;
  state.wxAuto = true; scheduleSave();
  fetchWeather(false);
}

/* ---------- Pflichtfelder ---------- */
const missingRequired = () => Object.values(FIELDS).filter(f => f.req && !isFilled(f));

function checkRequired(go) {
  const miss = missingRequired();
  if (!miss.length) return go();
  $('reqList').innerHTML = '';
  miss.forEach(f => $('reqList').append(el('li', {}, f.label)));
  $('reqFix').onclick = () => {
    $('dlgReq').close();
    const f = miss[0], s = document.getElementById('s_' + f.section);
    if (s) s.open = true;
    const w = document.getElementById('f_' + f.id);
    if (w) { w.scrollIntoView({ behavior: 'smooth', block: 'center' }); w.querySelector('input,textarea,button')?.focus({ preventScroll: true }); }
  };
  $('reqGo').onclick = () => { $('dlgReq').close(); go(); };
  $('dlgReq').showModal();
}

/* ---------- Kamera in der App (getUserMedia) ----------
   Das HTML-Attribut «capture» ist nur ein Hinweis; einige Android-Browser (z.B. Samsung Internet)
   zeigen trotzdem die Galerie. Darum eigenes Live-Bild mit Auslöser. */
const camAvailable = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;
let camStream = null;
async function openCamera(onFiles, fallback) {
  const dlg = $('dlgCam'), video = $('camVideo'), err = $('camErr');
  const shots = [];
  const count = () => { $('camCount').textContent = shots.length ? `${shots.length} Foto${shots.length > 1 ? 's' : ''}` : ''; };
  const stop = () => { if (camStream) camStream.getTracks().forEach(t => t.stop()); camStream = null; video.srcObject = null; };
  // Fotos werden asynchron als JPEG erzeugt: vor dem Übernehmen auf alle warten
  const finish = async keep => { stop(); dlg.close(); if (keep && shots.length) onFiles((await Promise.all(shots)).filter(Boolean)); };
  err.hidden = true; video.hidden = false; count();
  $('camInfo').textContent = 'Kamera wird gestartet …';
  dlg.showModal();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1920 } }, audio: false });
    video.srcObject = camStream;
    await video.play().catch(() => {});
    $('camInfo').textContent = 'Auslöser antippen – mehrere Fotos möglich';
  } catch (e) {
    stop(); dlg.close();
    if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) toast('Kamerazugriff verweigert – in den Browser-Einstellungen erlauben. Es öffnet sich die System-Kamera.');
    fallback && fallback();
    return;
  }
  $('camShot').onclick = () => {
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(video, 0, 0, w, h);
    const fl = $('camFlash'); fl.classList.add('on'); setTimeout(() => fl.classList.remove('on'), 60);
    shots.push(new Promise(res => c.toBlob(res, 'image/jpeg', 0.9))); count();
  };
  $('camDone').onclick = () => finish(true);
  $('camClose').onclick = () => { if (!shots.length || confirm(`${shots.length} Foto(s) verwerfen?`)) finish(false); };
  dlg.oncancel = e => { e.preventDefault(); $('camClose').onclick(); };
}

/* ---------- Materialbeprobungen ---------- */
function renderProben(f) {
  const list = () => (state.values[f.id] ||= []);
  const box = el('div', { class: 'proben' });
  const changed = () => afterChange();

  async function locate(p, posEl, btn) {
    posEl.textContent = 'Position wird per GPS bestimmt …'; posEl.className = 'pos';
    if (btn) btn.disabled = true;
    try {
      const g = await getGpsPosition();
      if (!inSwitzerland(g.E, g.N)) throw new Error('Position liegt ausserhalb der Schweiz.');
      Object.assign(p, { E: g.E, N: g.N, acc: g.acc, posTime: g.time, posSrc: 'GPS' });
      changed();
    } catch (e) { p.posErr = e.message || 'Position nicht verfügbar.'; }
    if (btn) btn.disabled = false;
    showPos(p, posEl);
  }
  function showPos(p, posEl) {
    posEl.innerHTML = '';
    if (p.E) {
      posEl.className = 'pos' + (p.acc > 30 ? ' warn' : '');
      posEl.append(el('b', {}, 'Position: '), `E ${Math.round(p.E).toLocaleString('de-CH')} / N ${Math.round(p.N).toLocaleString('de-CH')} (LV95)`, el('br'),
        p.posSrc === 'GPS' ? `GPS, Genauigkeit ±${Math.round(p.acc)} m${p.acc > 30 ? ' – ungenau, evtl. nochmals bestimmen' : ''}` : 'manuell eingegeben');
    } else {
      posEl.className = 'pos warn';
      posEl.textContent = p.posErr ? `Keine Position: ${p.posErr}` : 'Noch keine Position.';
    }
  }

  function card(p, i) {
    const inp = (attrs, key) => el('input', { ...attrs, value: p[key] || '', oninput: e => { p[key] = e.target.value; changed(); } });
    const posEl = el('div', { class: 'pos' });
    const btnPos = el('button', { type: 'button', class: 'btn sm' }, 'Position neu bestimmen');
    btnPos.onclick = () => locate(p, posEl, btnPos);
    const manE = el('input', { type: 'text', inputmode: 'decimal', placeholder: "E, z.B. 2'683'250" });
    const manN = el('input', { type: 'text', inputmode: 'decimal', placeholder: "N, z.B. 1'247'930" });
    const setMan = () => {
      const E = parseCoord(manE.value), N = parseCoord(manN.value);
      if (E && N && inSwitzerland(E, N)) { Object.assign(p, { E, N, acc: null, posSrc: 'manuell', posTime: new Date().toISOString() }); delete p.posErr; showPos(p, posEl); changed(); }
    };
    manE.oninput = setMan; manN.oninput = setMan;
    const chips = el('div', { class: 'chips' }, PROBEN_TYPEN.map(t => el('button', {
      type: 'button', class: 'chip', 'aria-pressed': p.typ === t ? 'true' : 'false',
      onclick: e => { p.typ = p.typ === t ? '' : t; e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.textContent === p.typ ? 'true' : 'false')); changed(); },
    }, t)));
    const phBox = el('div', { class: 'photos' });
    const drawPh = () => {
      phBox.innerHTML = '';
      (p.photos ||= []).forEach(x => phBox.append(el('div', { class: 'ph' }, el('img', { src: x.data, alt: 'Foto Probe' }),
        el('button', { type: 'button', class: 'del', 'aria-label': 'Foto löschen', onclick: () => { if (!confirm('Foto löschen?')) return; p.photos = p.photos.filter(y => y !== x); drawPh(); changed(); } }, '×'))));
      phBox.append(...photoAddTiles(async files => {
        for (const file of files) { try { p.photos.push(await compressImage(file)); } catch { toast('Foto konnte nicht geladen werden.'); } }
        drawPh(); changed();
      }));
    };
    drawPh(); showPos(p, posEl);
    const bem = el('textarea', { rows: 2, placeholder: 'Bemerkung, z.B. Analyseparameter, Labor, Auffälligkeiten', oninput: e => { p.bem = e.target.value; autosize(e.target); changed(); } });
    bem.value = p.bem || '';
    const lab = t => el('div', { class: 'plab' }, t);
    return el('div', { class: 'probe' },
      el('div', { class: 'aufl-head' }, el('b', {}, `P${i + 1}`), el('span', { style: 'flex:1' }),
        el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Probe löschen', onclick: () => {
          if (!confirm(`Probe P${i + 1} löschen?`)) return;
          state.values[f.id] = list().filter(x => x !== p); draw(); changed();
        } }, '×')),
      lab('Probenahme-Bezeichnung'), inp({ type: 'text', placeholder: 'z.B. P1 Aushub Baugrube Nord', autocomplete: 'off' }, 'bez'),
      el('div', { class: 'row2' },
        el('div', {}, lab('Datum'), inp({ type: 'date' }, 'datum')),
        el('div', {}, lab('Probenehmende Person'), inp({ type: 'text', autocomplete: 'off' }, 'person'))),
      lab('Materialtyp'), chips,
      lab('Position'), posEl,
      el('div', { class: 'row2' }, btnPos),
      el('details', { class: 'manual' }, el('summary', {}, 'Koordinaten manuell eingeben (LV95)'), el('div', { class: 'row2' }, manE, manN)),
      lab('Fotos'), phBox,
      lab('Bemerkung'), bem);
  }

  function draw() {
    box.innerHTML = '';
    list().forEach((p, i) => box.append(card(p, i)));
    box.append(el('button', {
      type: 'button', class: 'btn primary', style: 'max-width:none;width:100%', onclick: () => {
        const n = list().length + 1;
        const p = { id: uid(), bez: `P${n}`, datum: state.values.datum || today(), person: state.values.ubbName || '', typ: '', E: null, N: null, acc: null, photos: [], bem: '' };
        list().push(p); draw(); changed();
        const c = box.querySelectorAll('.probe')[n - 1];
        c.scrollIntoView({ behavior: 'smooth', block: 'start' });
        locate(p, c.querySelector('.pos'), null); // Position automatisch per GPS
      },
    }, '+ Beprobung hinzufügen'));
  }
  draw();
  return box;
}
