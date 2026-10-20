'use strict';
/* =====================================================================
   GIS-Lagekontrolle (reduzierte Version der «GIS Umweltübersicht»)
   Layer wählen → Position (GPS oder manuell, LV95) → WMS-Karte mit Standort
   → als Bild in den Bericht. Layerliste unten anpassbar.
   ===================================================================== */

const GEOADMIN = 'https://wms.geo.admin.ch/';
const GD = slug => `https://geodienste.ch/db/${slug}/deu`;

// Layerliste: gis-layers.js (übernommen aus der «GIS Umweltübersicht»)
// src: eine oder mehrere WMS-Quellen (z.B. zwei Modellversionen auf geodienste.ch)
// identify: Layer-IDs von geo.admin.ch für die Abfrage «Objekte am Standort»
const CANTONS = ['ZH','BE','LU','UR','SZ','OW','NW','GL','ZG','FR','SO','BS','BL','SH','AR','AI','SG','GR','AG','TG','TI','VD','VS','NE','GE','JU'];
const gisLayersFor = kt => [...GIS_NATIONAL, ...((GIS_CANTONAL[kt] || []).map(l => ({ ...l, group: `Kanton ${kt}: ${l.group}`, canton: kt })))];
function findLayer(id) {
  const n = GIS_NATIONAL.find(l => l.id === id);
  if (n) return n;
  for (const [kt, list] of Object.entries(GIS_CANTONAL)) { const l = list.find(x => x.id === id); if (l) return { ...l, canton: kt }; }
  return null;
}

// Kanton am Standort (geo.admin.ch, Kantonsgrenzen)
async function detectCanton(E, N) {
  const u = wmsUrl('https://api3.geo.admin.ch/rest/services/api/MapServer/identify', {
    geometry: `${E.toFixed(0)},${N.toFixed(0)}`, geometryType: 'esriGeometryPoint', imageDisplay: '500,500,96',
    mapExtent: `${(E - 500).toFixed(0)},${(N - 500).toFixed(0)},${(E + 500).toFixed(0)},${(N + 500).toFixed(0)}`,
    tolerance: 0, layers: 'all:ch.swisstopo.swissboundaries3d-kanton-flaeche.fill', returnGeometry: 'false', sr: '2056', lang: 'de',
  });
  const r = await fetch(u); const j = await r.json();
  for (const x of j.results || []) {
    const a = x.attributes || x.properties || {};
    const ak = String(a.ak || a.kanton || a.abbreviation || '').trim();
    if (/^[A-Z]{2}$/.test(ak)) return ak;
    const nr = +(a.kantonsnummer || a.kantonsnr || x.featureId || x.id);
    if (nr >= 1 && nr <= 26) return CANTONS[nr - 1];
  }
  return null;
}

const GIS_BG = [
  { id: 'farbe', label: 'Landeskarte farbig', layers: 'ch.swisstopo.pixelkarte-farbe' },
  { id: 'grau', label: 'Landeskarte grau', layers: 'ch.swisstopo.pixelkarte-grau' },
  { id: 'luft', label: 'Luftbild', layers: 'ch.swisstopo.swissimage' },
];
const GIS_SCALES = [1000, 2000, 5000, 10000, 25000];

// Kartenbild: 1500 × 1000 px, im PDF 180 mm breit → Massstab exakt bei A4-Druck 100 %
const MAP_PX_W = 1500, MAP_PX_H = 1000, MAP_MM_W = 180;
const GIS_PREF_KEY = 'ubb-gis-pref';

const fmtCH = n => Math.round(n).toLocaleString('de-CH');

/* ---------- Koordinaten ---------- */
// WGS84 → LV95, Näherungsformeln swisstopo (Genauigkeit ca. 1 m)
function wgs84ToLv95(lat, lon) {
  const p = (lat * 3600 - 169028.66) / 10000, l = (lon * 3600 - 26782.5) / 10000;
  const E = 2600072.37 + 211455.93 * l - 10938.51 * l * p - 0.36 * l * p * p - 44.54 * l ** 3;
  const N = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p ** 3;
  return { E, N };
}
function parseCoord(s) { const n = parseFloat(String(s).replace(/['’\s]/g, '').replace(',', '.')); return isNaN(n) ? null : n; }
const inSwitzerland = (E, N) => E > 2480000 && E < 2840000 && N > 1070000 && N < 1300000;

function getGpsPosition() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('Dieses Gerät bietet keine Standortbestimmung.'));
    navigator.geolocation.getCurrentPosition(
      p => {
        const { E, N } = wgs84ToLv95(p.coords.latitude, p.coords.longitude);
        res({ E, N, acc: p.coords.accuracy, time: new Date().toISOString(), source: 'GPS' });
      },
      e => rej(new Error(e.code === 1
        ? 'Standortzugriff verweigert. In den Einstellungen des Browsers bzw. der App erlauben.'
        : e.code === 3 ? 'GPS-Zeitüberschreitung. Unter freiem Himmel nochmals versuchen.' : 'Position nicht verfügbar.')),
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
  });
}

/* ---------- WMS ---------- */
function wmsUrl(base, params) {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}
const getMapUrl = (url, layers, bbox, transparent) => wmsUrl(url, {
  SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetMap', LAYERS: layers, STYLES: '', CRS: 'EPSG:2056',
  BBOX: bbox.map(v => v.toFixed(1)).join(','), WIDTH: MAP_PX_W, HEIGHT: MAP_PX_H,
  FORMAT: 'image/png', TRANSPARENT: transparent ? 'TRUE' : 'FALSE',
});

function loadImg(url, ms = 25000) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const t = setTimeout(() => { img.src = ''; rej(new Error('Zeitüberschreitung')); }, ms);
    img.onload = () => { clearTimeout(t); res(img); };
    img.onerror = () => { clearTimeout(t); rej(new Error('nicht ladbar')); };
    img.src = url;
  });
}

/* ---------- Abfrage «Objekte am Standort» (nur geo.admin.ch) ---------- */
async function identifyGeoadmin(ids, E, N, bbox, tolM) {
  const tolPx = Math.max(3, Math.round(tolM / ((bbox[2] - bbox[0]) / MAP_PX_W)));
  const u = wmsUrl('https://api3.geo.admin.ch/rest/services/api/MapServer/identify', {
    geometry: `${E.toFixed(1)},${N.toFixed(1)}`, geometryType: 'esriGeometryPoint', geometryFormat: 'geojson',
    imageDisplay: `${MAP_PX_W},${MAP_PX_H},96`, mapExtent: bbox.map(v => v.toFixed(1)).join(','),
    tolerance: tolPx, layers: 'all:' + ids, returnGeometry: 'false', sr: '2056', lang: 'de',
  });
  const r = await fetch(u);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  const seen = new Set();
  return (j.results || []).map(x => {
    const a = x.properties || x.attributes || {};
    const name = a.label || a.name || a.objname || a.bezeichnung || a.titel || a.ort || '';
    const nr = a.objnummer || a.nr || a.obj_nr || a.objektnummer || '';
    const txt = [x.layerName || x.layerBodId, [name, nr && `Nr. ${nr}`].filter(Boolean).join(', ') || `Objekt ${x.featureId ?? x.id ?? ''}`].join(': ');
    if (seen.has(txt)) return null; seen.add(txt); return txt;
  }).filter(Boolean).slice(0, 12);
}

/* ---------- Legende (falls der Server sie mit CORS liefert) ---------- */
async function loadLegend(layer) {
  const urls = [];
  for (const s of layer.src) {
    for (const l of s.layers.split(',')) {
      if (s.url === GEOADMIN) urls.push(`https://api3.geo.admin.ch/static/images/legends/${l}_de.png`);
      else urls.push(wmsUrl(s.url, { SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetLegendGraphic', FORMAT: 'image/png', LAYER: l, SLD_VERSION: '1.1.0' }));
      if (s.url !== GEOADMIN) break; // geodienste: Gruppenlegende genügt
    }
    if (s.url !== GEOADMIN) break;   // bei mehreren Modellversionen nur eine Legende
  }
  const imgs = (await Promise.all(urls.map(u => loadImg(u, 12000).catch(() => null)))).filter(i => i && i.naturalWidth > 4 && i.naturalHeight > 4);
  if (!imgs.length) return null;
  const w = Math.min(900, Math.max(...imgs.map(i => i.naturalWidth)));
  let h = 0; const parts = imgs.map(i => { const s = Math.min(1, w / i.naturalWidth); const ph = Math.round(i.naturalHeight * s); h += ph + 8; return { i, s, ph }; });
  h = Math.min(h, 2400);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  let y = 0; for (const p of parts) { if (y >= h) break; g.drawImage(p.i, 0, y, p.i.naturalWidth * p.s, p.ph); y += p.ph + 8; }
  try { return { data: c.toDataURL('image/png'), w, h }; } catch { return null; }
}

/* ---------- Karte zusammensetzen ---------- */
async function buildMap(layer, bg, scale, pos) {
  const gw = MAP_MM_W / 1000 * scale, gh = gw * MAP_PX_H / MAP_PX_W;
  const bbox = [pos.E - gw / 2, pos.N - gh / 2, pos.E + gw / 2, pos.N + gh / 2];
  const c = document.createElement('canvas'); c.width = MAP_PX_W; c.height = MAP_PX_H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, MAP_PX_W, MAP_PX_H);
  const problems = [];

  const [bgImg, ...ovImgs] = await Promise.all([
    loadImg(getMapUrl(GEOADMIN, bg.layers, bbox, false)).catch(e => { problems.push('Hintergrund: ' + e.message); return null; }),
    ...layer.src.map(s => loadImg(getMapUrl(s.url, s.layers, bbox, true)).catch(e => { problems.push(`${new URL(s.url).host}: ${e.message}`); return null; })),
  ]);
  if (bgImg) { g.globalAlpha = bg.id === 'luft' ? 1 : 0.85; g.drawImage(bgImg, 0, 0); g.globalAlpha = 1; }
  const okOverlays = ovImgs.filter(Boolean);
  okOverlays.forEach(i => { g.globalAlpha = layer.opacity ?? 0.8; g.drawImage(i, 0, 0); });
  g.globalAlpha = 1;

  const px = gw / MAP_PX_W; // m pro Pixel
  const cx = MAP_PX_W / 2, cy = MAP_PX_H / 2;
  // Genauigkeitskreis
  if (pos.acc && pos.acc / px > 12) {
    g.beginPath(); g.arc(cx, cy, pos.acc / px, 0, Math.PI * 2);
    g.fillStyle = 'rgba(220,0,0,0.10)'; g.fill();
    g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeStyle = '#d00'; g.stroke(); g.setLineDash([]);
  }
  // Fadenkreuz + Punkt
  g.lineWidth = 5; g.strokeStyle = '#fff';
  g.beginPath(); g.moveTo(cx - 34, cy); g.lineTo(cx - 12, cy); g.moveTo(cx + 12, cy); g.lineTo(cx + 34, cy);
  g.moveTo(cx, cy - 34); g.lineTo(cx, cy - 12); g.moveTo(cx, cy + 12); g.lineTo(cx, cy + 34); g.stroke();
  g.lineWidth = 2.5; g.strokeStyle = '#d00'; g.stroke();
  g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fillStyle = '#d00'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();

  // Titelbox oben links
  g.font = 'bold 26px Arial, Helvetica, sans-serif';
  const title = (layer.canton ? `Kanton ${layer.canton}: ` : '') + layer.label, sub = `1:${fmtCH(scale)} · ${bg.label}`;
  const tw = Math.min(MAP_PX_W - 160, Math.max(g.measureText(title).width, 300) + 28);
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(0, 0, tw, 76);
  g.fillStyle = '#000'; g.fillRect(0, 0, 6, 76);
  g.fillText(fitText(g, title, tw - 28), 18, 34);
  g.font = '22px Arial, Helvetica, sans-serif'; g.fillStyle = '#333'; g.fillText(sub, 18, 64);

  // Nordpfeil oben rechts
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(MAP_PX_W - 70, 0, 70, 92);
  g.fillStyle = '#000'; g.beginPath(); g.moveTo(MAP_PX_W - 35, 14); g.lineTo(MAP_PX_W - 52, 58); g.lineTo(MAP_PX_W - 35, 48); g.lineTo(MAP_PX_W - 18, 58); g.closePath(); g.fill();
  g.font = 'bold 24px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('N', MAP_PX_W - 35, 84); g.textAlign = 'left';

  // Massstabsbalken unten links
  const target = gw / 5, pow = 10 ** Math.floor(Math.log10(target));
  const len = [1, 2, 5, 10].map(k => k * pow).filter(v => v <= target).pop() || pow;
  const lpx = len / px;
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(0, MAP_PX_H - 64, lpx + 60, 64);
  g.fillStyle = '#000'; g.fillRect(20, MAP_PX_H - 26, lpx, 10);
  g.fillStyle = '#fff'; g.fillRect(20 + lpx / 4, MAP_PX_H - 24, lpx / 4, 6); g.fillRect(20 + lpx * 3 / 4, MAP_PX_H - 24, lpx / 4, 6);
  g.fillStyle = '#000'; g.font = '20px Arial, Helvetica, sans-serif';
  g.fillText('0', 16, MAP_PX_H - 36); g.textAlign = 'right';
  g.fillText(len >= 1000 ? `${len / 1000} km` : `${len} m`, 24 + lpx, MAP_PX_H - 36); g.textAlign = 'left';

  // Quellenvermerk unten rechts
  const attr = `Hintergrund © swisstopo · Daten: ${layer.by}`;
  g.font = '17px Arial, Helvetica, sans-serif';
  const aw = g.measureText(attr).width + 20;
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(MAP_PX_W - aw, MAP_PX_H - 30, aw, 30);
  g.fillStyle = '#333'; g.fillText(attr, MAP_PX_W - aw + 10, MAP_PX_H - 10);

  if (!okOverlays.length) {
    g.fillStyle = 'rgba(161,92,0,0.9)'; g.fillRect(0, 90, MAP_PX_W, 44);
    g.fillStyle = '#fff'; g.font = 'bold 22px Arial, Helvetica, sans-serif';
    g.fillText('Themenebene konnte nicht geladen werden – nur Hintergrund und Standort dargestellt', 18, 120);
  }

  let data;
  try { data = c.toDataURL('image/jpeg', 0.82); }
  catch { throw new Error('Der Kartenserver erlaubt keine Übernahme ins Bild (CORS). Anderen Layer wählen.'); }
  return { data, bbox, problems, layerOk: okOverlays.length > 0, bgOk: !!bgImg };
}

function fitText(g, s, max) {
  if (g.measureText(s).width <= max) return s;
  while (s.length > 4 && g.measureText(s + '…').width > max) s = s.slice(0, -1);
  return s + '…';
}

/* ---------- Oberfläche ---------- */
const GIS = {
  pending: null, // Vorschau, noch nicht übernommen
  pos: null,

  prefs() { try { return JSON.parse(localStorage.getItem(GIS_PREF_KEY)) || {}; } catch { return {}; } },
  savePrefs(p) { try { localStorage.setItem(GIS_PREF_KEY, JSON.stringify(p)); } catch {} },

  render(f, w) {
    const pref = this.prefs();
    const ktSel = el('select', { id: 'gisCanton' },
      el('option', { value: '' }, '– nur Bund / geodienste.ch –'),
      CANTONS.map(k => el('option', { value: k, selected: k === pref.canton }, `Kanton ${k}${GIS_CANTONAL[k] ? '' : ' (keine kantonalen Layer)'}`)));
    const layerSel = el('select', { id: 'gisLayer' });
    this.fillLayers(layerSel, ktSel.value, pref.layer);
    ktSel.addEventListener('change', () => { this.fillLayers(layerSel, ktSel.value, layerSel.value); save(); });
    const bgSel = el('select', { id: 'gisBg' }, GIS_BG.map(b => el('option', { value: b.id, selected: b.id === pref.bg }, b.label)));
    const scaleSel = el('select', { id: 'gisScale' }, GIS_SCALES.map(s => el('option', { value: s, selected: s === (pref.scale || 2000) }, `1:${fmtCH(s)}`)));
    function save() { GIS.savePrefs({ layer: layerSel.value, bg: bgSel.value, scale: +scaleSel.value, canton: ktSel.value }); }
    [layerSel, bgSel, scaleSel].forEach(s => s.addEventListener('change', save));

    const posBox = el('div', { class: 'pos', id: 'gisPos' }, 'Position: noch nicht bestimmt');
    const manE = el('input', { type: 'text', inputmode: 'decimal', id: 'gisManE', placeholder: "E, z.B. 2'683'250" });
    const manN = el('input', { type: 'text', inputmode: 'decimal', id: 'gisManN', placeholder: "N, z.B. 1'247'930" });
    const manual = el('details', { class: 'manual' }, el('summary', {}, 'Koordinaten manuell eingeben (LV95, ohne GPS)'), el('div', { class: 'row2' }, manE, manN));
    const msg = el('div', { class: 'msg', id: 'gisMsg' });
    const prev = el('div', { id: 'gisPreview' });
    const list = el('div', { class: 'maplist', id: 'gisList' });

    const btnLoad = el('button', { type: 'button', class: 'btn primary', id: 'gisLoad', style: 'max-width:none' }, 'Position bestimmen und Karte laden');
    btnLoad.onclick = () => this.load(f, { layerSel, ktSel, bgSel, scaleSel, manE, manN, manual, posBox, msg, prev, btnLoad, save });

    w.append(el('div', { class: 'gis' },
      el('div', {}, el('label', { for: 'gisCanton', style: 'display:block;font-size:14px;font-weight:700;margin-bottom:6px' }, 'Kanton (wird am Standort automatisch erkannt)'), ktSel),
      el('div', {}, el('label', { class: 'lbl', for: 'gisLayer', style: 'display:block;font-size:14px;font-weight:700;margin-bottom:6px' }, 'Layer'), layerSel),
      el('div', { class: 'row2' },
        el('div', {}, el('label', { for: 'gisBg', style: 'display:block;font-size:14px;font-weight:700;margin-bottom:6px' }, 'Hintergrund'), bgSel),
        el('div', {}, el('label', { for: 'gisScale', style: 'display:block;font-size:14px;font-weight:700;margin-bottom:6px' }, 'Massstab'), scaleSel)),
      manual, btnLoad, posBox, msg, prev,
      el('div', { class: 'lbl', style: 'font-size:14px;font-weight:700' }, 'Im Bericht'), list));
    this.renderList(f);
  },

  fillLayers(sel, kt, keep) {
    sel.innerHTML = '';
    let grp = null, og = null;
    gisLayersFor(kt).forEach(l => {
      if (l.group !== grp) { grp = l.group; og = el('optgroup', { label: grp }); sel.append(og); }
      og.append(el('option', { value: l.id, selected: l.id === keep }, l.label));
    });
  },

  setMsg(box, txt, err) { box.textContent = txt || ''; box.className = 'msg' + (err ? ' err' : ''); },

  async load(f, ui) {
    let layer = findLayer(ui.layerSel.value);
    const bg = GIS_BG.find(b => b.id === ui.bgSel.value);
    const scale = +ui.scaleSel.value;
    ui.prev.innerHTML = ''; this.setMsg(ui.msg, '');
    if (!navigator.onLine) { this.setMsg(ui.msg, 'Keine Internetverbindung. Die Karte braucht Netz.', true); return; }
    ui.btnLoad.disabled = true;
    try {
      // Position
      const mE = parseCoord(ui.manE.value), mN = parseCoord(ui.manN.value);
      let pos;
      if (ui.manual.open && mE && mN) {
        if (!inSwitzerland(mE, mN)) throw new Error('Manuelle Koordinaten liegen nicht in der Schweiz (LV95: E 2\'xxx\'xxx, N 1\'xxx\'xxx).');
        pos = { E: mE, N: mN, acc: null, time: new Date().toISOString(), source: 'manuell' };
      } else {
        ui.btnLoad.textContent = 'Position wird bestimmt …';
        pos = await getGpsPosition();
        if (!inSwitzerland(pos.E, pos.N)) throw new Error('Die Position liegt ausserhalb der Schweiz.');
      }
      this.pos = pos;
      // Kanton erkennen; kantonaler Layer eines anderen Kantons → Liste aktualisieren und abbrechen
      const kt = await detectCanton(pos.E, pos.N).catch(() => null);
      if (kt && kt !== ui.ktSel.value) {
        ui.ktSel.value = kt; this.fillLayers(ui.layerSel, kt, ui.layerSel.value); ui.save();
        if (layer.canton && layer.canton !== kt) {
          this.setMsg(ui.msg, `Der Standort liegt im Kanton ${kt}. Die Layerliste wurde angepasst – bitte Layer wählen und erneut laden.`, true);
          return;
        }
        this.setMsg(ui.msg, `Kanton ${kt} erkannt, kantonale Layer sind jetzt in der Liste.`);
      }
      ui.posBox.className = 'pos' + (pos.acc > 30 ? ' warn' : '');
      ui.posBox.innerHTML = '';
      ui.posBox.append(el('b', {}, 'Position: '), `E ${fmtCH(pos.E)} / N ${fmtCH(pos.N)} (LV95)`, el('br'),
        pos.source === 'GPS' ? `GPS, Genauigkeit ±${Math.round(pos.acc)} m${pos.acc > 30 ? ' – ungenau, evtl. nochmals bestimmen' : ''}` : 'manuell eingegeben',
        ` · ${new Date(pos.time).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`);

      // Karte
      ui.btnLoad.textContent = 'Karte wird geladen …';
      const [map, hits, legend] = await Promise.all([
        buildMap(layer, bg, scale, pos),
        layer.identify ? identifyGeoadmin(layer.identify, pos.E, pos.N, [pos.E - 90 * scale / 1000, pos.N - 60 * scale / 1000, pos.E + 90 * scale / 1000, pos.N + 60 * scale / 1000], Math.max(pos.acc || 0, 5))
          .then(r => ({ status: r.length ? 'ok' : 'none', items: r })).catch(() => ({ status: 'na', items: [] }))
          : Promise.resolve({ status: 'na', items: [] }),
        loadLegend(layer),
      ]);
      this.pending = {
        id: uid(), data: map.data, w: MAP_PX_W, h: MAP_PX_H,
        layerId: layer.id, layerLabel: (layer.canton ? `Kanton ${layer.canton}: ` : '') + layer.label, by: layer.by, bgLabel: bg.label, scale,
        E: pos.E, N: pos.N, acc: pos.acc, source: pos.source, time: pos.time,
        hits: hits.items, hitsStatus: layer.identify ? hits.status : 'na',
        legend, layerOk: map.layerOk, remark: '',
      };
      if (map.problems.length) this.setMsg(ui.msg, 'Nicht alles geladen: ' + map.problems.join(' · '), true);
      this.renderPreview(f, ui);
    } catch (e) {
      console.error(e);
      this.setMsg(ui.msg, e.message || 'Fehler beim Laden der Karte.', true);
    } finally {
      ui.btnLoad.disabled = false; ui.btnLoad.textContent = 'Position bestimmen und Karte laden';
    }
  },

  hitsText(m) {
    if (m.hitsStatus === 'ok') return m.hits;
    if (m.hitsStatus === 'none') return ['Keine Objekte dieses Layers am Standort.'];
    return [];
  },

  renderPreview(f, ui) {
    const m = this.pending;
    ui.prev.innerHTML = '';
    if (!m) return;
    const hits = this.hitsText(m);
    const remark = el('input', { type: 'text', placeholder: 'Bemerkung zur Karte (optional)', style: 'border:0;border-top:1px solid var(--line)' });
    ui.prev.append(el('div', { class: 'preview' },
      el('img', { src: m.data, alt: 'Kartenausschnitt' }),
      hits.length ? el('div', { class: 'cap' }, el('b', {}, 'Am Standort: '), el('ul', {}, hits.map(h => el('li', {}, h)))) : null,
      remark,
      el('div', { class: 'cap', style: 'display:flex;gap:8px' },
        el('button', {
          type: 'button', class: 'btn primary', style: 'max-width:none', onclick: () => {
            m.remark = remark.value.trim();
            (state.gis[f.id] ||= []).push(m);
            this.pending = null; ui.prev.innerHTML = '';
            this.renderList(f); afterChange(); flushSave();
            toast('Karte zum Bericht hinzugefügt.');
          },
        }, 'Zum Bericht hinzufügen'),
        el('button', { type: 'button', class: 'btn', onclick: () => { this.pending = null; ui.prev.innerHTML = ''; } }, 'Verwerfen'))));
  },

  renderList(f) {
    const box = document.getElementById('gisList');
    if (!box) return;
    box.innerHTML = '';
    const maps = state.gis[f.id] || [];
    if (!maps.length) { box.append(el('div', { class: 'msg' }, 'Noch keine Karte übernommen.')); return; }
    maps.forEach(m => {
      box.append(el('div', { class: 'mitem' },
        el('img', { src: m.data, alt: m.layerLabel }),
        el('div', { class: 'mi' },
          el('div', {}, el('b', {}, m.layerLabel), el('br'),
            `1:${fmtCH(m.scale)} · E ${fmtCH(m.E)} / N ${fmtCH(m.N)}${m.acc ? ` · ±${Math.round(m.acc)} m` : ' · manuell'}`,
            ...this.hitsText(m).map(h => [el('br'), '• ' + h]).flat()),
          el('button', {
            type: 'button', class: 'btn sm', 'aria-label': 'Karte entfernen', onclick: () => {
              if (!confirm('Karte aus dem Bericht entfernen?')) return;
              state.gis[f.id] = state.gis[f.id].filter(x => x.id !== m.id);
              this.renderList(f); afterChange();
            },
          }, '×')),
        el('input', { type: 'text', placeholder: 'Bemerkung zur Karte', value: m.remark || '', oninput: e => { m.remark = e.target.value; scheduleSave(); } })));
    });
  },
};
