'use strict';
/* =====================================================================
   SharePoint-Anbindung über Microsoft Graph
   - Anmeldung mit Firmenkonto (MSAL.js, Weiterleitung; 2FA macht Microsoft)
   - Speichern: Begehungsdatei, PDF, CSV und Fotos in die Bibliothek
       <rootFolder>/<Projekt>/<Datum>_<Art>_<Kennung>/
   - Warteschlange: ohne Netz oder Anmeldung wird später automatisch hochgeladen
   - Öffnen aus SharePoint, Sammel-CSV pro Projekt, zentrale Presets
   - optional: Liste «UBB-Pendenzen» (Pendenzen, Auflagen, Proben, Neophyten)
   Aktiv nur, wenn config.js ausgefüllt ist.
   ===================================================================== */

const GRAPH = 'https://graph.microsoft.com/v1.0';

class NeedLogin extends Error { constructor() { super('Anmeldung nötig'); this.name = 'NeedLogin'; } }
class SpConflict extends Error { constructor(item) { super('In SharePoint geändert'); this.item = item; this.name = 'SpConflict'; } }
class GraphError extends Error { constructor(status, msg) { super(msg || 'Graph-Fehler ' + status); this.status = status; this.name = 'GraphError'; } }

const SP = {
  msal: null, account: null, syncing: false, lastError: '', ready: false,

  enabled() { return !!(typeof SP_CONFIG !== 'undefined' && SP_CONFIG.tenantId && SP_CONFIG.clientId && SP_CONFIG.siteHost && SP_CONFIG.sitePath && window.msal); },
  base() { return location.origin + location.pathname.replace(/[^/]*$/, ''); },
  loggedIn() { return !!this.account; },

  async init() {
    document.body.classList.toggle('sp-on', this.enabled());
    if (!this.enabled()) return;
    try {
      this.msal = new msal.PublicClientApplication({
        auth: {
          clientId: SP_CONFIG.clientId,
          authority: `https://login.microsoftonline.com/${SP_CONFIG.tenantId}`,
          redirectUri: this.base() + 'redirect.html',
          postLogoutRedirectUri: this.base(),
        },
        cache: { cacheLocation: 'localStorage' },
      });
      await this.msal.initialize();
      const r = await this.msal.handleRedirectPromise().catch(e => { this.lastError = 'Anmeldung: ' + e.message; return null; });
      this.account = (r && r.account) || this.msal.getActiveAccount() || this.msal.getAllAccounts()[0] || null;
      if (this.account) this.msal.setActiveAccount(this.account);
      if (r && r.account) toast('Angemeldet als ' + (r.account.name || r.account.username));
    } catch (e) { console.error(e); this.lastError = 'Anmeldung nicht verfügbar: ' + e.message; }
    this.ready = true;
    window.addEventListener('online', () => this.sync());
    setInterval(() => { if (this.hasQueue()) this.sync(); }, 120000);
    this.sync();
  },

  async login() {
    if (!this.msal) return;
    flushSave(); await saveCurrent();
    await this.msal.loginRedirect({ scopes: SP_CONFIG.scopes, redirectStartPage: location.href.split('#')[0] });
  },
  async logout() {
    if (!this.msal || !this.account) return;
    await this.msal.clearCache({ account: this.account });
    this.account = null; spRefresh();
    toast('Abgemeldet.');
  },
  // Zugangsberechtigung holen; ohne gültige Anmeldung → NeedLogin (Anmelden nur auf Knopfdruck)
  async token() {
    if (!this.msal || !this.account) throw new NeedLogin();
    try {
      const r = await this.msal.acquireTokenSilent({ scopes: SP_CONFIG.scopes, account: this.account });
      return r.accessToken;
    } catch (e) {
      if (e instanceof msal.InteractionRequiredAuthError || /interaction_required|login_required|consent_required|no_tokens_found/i.test(e.errorCode || e.message)) throw new NeedLogin();
      throw e;
    }
  },

  /* ---------- Graph ---------- */
  async g(path, opts = {}) {
    const tok = await this.token();
    const r = await fetch(path.startsWith('http') ? path : GRAPH + path, { ...opts, headers: { Authorization: 'Bearer ' + tok, ...(opts.headers || {}) } });
    if (r.status === 401) throw new NeedLogin();
    if (!r.ok) {
      let msg = '';
      try { msg = (await r.json()).error.message; } catch {}
      throw new GraphError(r.status, msg);
    }
    return r;
  },
  async json(path, opts) { return (await this.g(path, opts)).json(); },
  enc: p => p.split('/').filter(Boolean).map(encodeURIComponent).join('/'),
  cfgKey() { return 'ubb-sp-' + SP_CONFIG.siteHost + SP_CONFIG.sitePath + '|' + (SP_CONFIG.library || ''); },

  async siteId() {
    if (this._site) return this._site;
    try { const c = JSON.parse(localStorage.getItem(this.cfgKey())); if (c && c.site && c.drive) { this._site = c.site; this._drive = c.drive; return c.site; } } catch {}
    const s = await this.json(`/sites/${SP_CONFIG.siteHost}:${SP_CONFIG.sitePath}?$select=id`);
    this._site = s.id;
    return s.id;
  },
  async driveId() {
    if (this._drive) return this._drive;
    const site = await this.siteId();
    let d;
    if (SP_CONFIG.library) {
      const all = await this.json(`/sites/${site}/drives?$select=id,name`);
      d = (all.value || []).find(x => x.name.toLowerCase() === SP_CONFIG.library.toLowerCase());
      if (!d) throw new GraphError(404, `Bibliothek «${SP_CONFIG.library}» nicht gefunden`);
    } else d = await this.json(`/sites/${site}/drive?$select=id`);
    this._drive = d.id;
    try { localStorage.setItem(this.cfgKey(), JSON.stringify({ site, drive: d.id })); } catch {}
    return d.id;
  },
  root() { return (SP_CONFIG.rootFolder || 'UBB-Begehungen').replace(/^\/+|\/+$/g, ''); },

  async ensureFolder(path) {
    this._folders ||= new Set();
    const d = await this.driveId(), parts = path.split('/').filter(Boolean);
    let cur = '';
    for (const name of parts) {
      const next = cur ? cur + '/' + name : name;
      if (!this._folders.has(next)) {
        try { await this.g(`/drives/${d}/root:/${this.enc(next)}?$select=id`); }
        catch (e) {
          if (!(e instanceof GraphError && e.status === 404)) throw e;
          const parent = cur ? `/drives/${d}/root:/${this.enc(cur)}:/children` : `/drives/${d}/root/children`;
          try {
            await this.g(parent, { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, folder: {}, '@microsoft.graph.conflictBehavior': 'fail' }) });
          } catch (e2) { if (!(e2 instanceof GraphError && e2.status === 409)) throw e2; }
        }
        this._folders.add(next);
      }
      cur = next;
    }
  },
  async put(path, blob) {
    const d = await this.driveId();
    return this.json(`/drives/${d}/root:/${this.enc(path)}:/content`, { method: 'PUT', headers: { 'Content-Type': blob.type || 'application/octet-stream' }, body: blob });
  },
  async del(path) {
    const d = await this.driveId();
    try { await this.g(`/drives/${d}/root:/${this.enc(path)}`, { method: 'DELETE' }); }
    catch (e) { if (!(e instanceof GraphError && e.status === 404)) throw e; }
  },
  async children(path) {
    const d = await this.driveId();
    let url = `/drives/${d}/root:/${this.enc(path)}:/children?$top=200&$select=id,name,size,lastModifiedDateTime,lastModifiedBy,eTag,folder,file,webUrl`;
    const out = [];
    try {
      while (url) { const j = await this.json(url); out.push(...(j.value || [])); url = j['@odata.nextLink'] || null; }
    } catch (e) { if (e instanceof GraphError && e.status === 404) return []; throw e; }
    return out;
  },
  // Download über die vorab berechtigte Download-Adresse (vermeidet CORS-Probleme bei Weiterleitungen)
  async download(item) {
    const d = await this.driveId();
    const meta = await this.json(`/drives/${d}/items/${item.id}?$select=id,name,@microsoft.graph.downloadUrl`);
    const r = await fetch(meta['@microsoft.graph.downloadUrl']);
    if (!r.ok) throw new GraphError(r.status, 'Download fehlgeschlagen');
    return new File([await r.blob()], item.name);
  },

  /* ---------- Warteschlange ---------- */
  hasQueue() { return archive.some(a => a.spQueued && (a.spUploadedRev || 0) < a.spQueued) || (state.spQueued && (state.sp?.uploadedRev || 0) < state.spQueued); },

  // Begehung zum Hochladen vormerken und sofort versuchen
  async queueCurrent() {
    state.spQueued = state.rev || 1;
    await saveCurrent();
    spRefresh();
    return this.sync(true);
  },

  // interactive: vom Knopf «In SharePoint speichern» – bei Konflikt nachfragen
  async sync(interactive) {
    if (!this.enabled() || this.syncing || !navigator.onLine) { spRefresh(); return; }
    if (!this.account) { spRefresh(); return; }
    this.syncing = true; this.lastError = ''; spRefresh();
    const conflicts = [];
    try {
      // aktuelle Begehung zuerst
      const ids = [state.id, ...archive.map(a => a.id).filter(id => id !== state.id)];
      for (const id of ids) {
        const st = id === state.id ? state : await DB.get(BKEY(id));
        if (!st || !st.spQueued || (st.sp?.uploadedRev || 0) >= st.spQueued) continue;
        try { await this.uploadBeg(st); }
        catch (e) {
          if (!(e instanceof SpConflict)) throw e;
          const it = e.item, who = it.lastModifiedBy?.user?.displayName || 'jemand anderem';
          const when = it.lastModifiedDateTime ? new Date(it.lastModifiedDateTime).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' }) : '';
          const label = [st.values.projekt, st.values.datum && fmtDate(st.values.datum)].filter(Boolean).join(', ');
          if (interactive && id === state.id && confirm(`Diese Begehung wurde in SharePoint inzwischen von ${who}${when ? ' (' + when + ')' : ''} geändert.\n\nOK = mit dem Stand dieses Geräts überschreiben\nAbbrechen = nicht hochladen (SharePoint-Stand über «Begehungen → Aus SharePoint öffnen» ansehen)`))
            await this.uploadBeg(st, true);
          else conflicts.push(`«${label}» (geändert von ${who})`);
        }
      }
      if (conflicts.length) this.lastError = `Nicht hochgeladen, in SharePoint inzwischen geändert: ${conflicts.join(', ')}. Begehung öffnen und «In SharePoint speichern» tippen, um zu entscheiden.`;
    } catch (e) {
      console.warn(e);
      this.lastError = e instanceof NeedLogin ? 'Anmeldung abgelaufen – bitte neu anmelden.'
        : e instanceof GraphError && e.status === 403 ? 'Keine Berechtigung für die SharePoint-Site – IT kontaktieren.'
        : e instanceof GraphError && e.status === 404 ? 'SharePoint-Site oder Bibliothek nicht gefunden – Einstellungen in config.js prüfen.'
        : !navigator.onLine || e instanceof TypeError ? 'Keine Verbindung – wird später automatisch hochgeladen.'
        : 'Hochladen fehlgeschlagen: ' + e.message;
    } finally {
      this.syncing = false; spRefresh();
    }
  },

  async uploadBeg(st, force) {
    prepState(st);
    const isCur = st.id === state.id;
    if (isCur && neoPoints().length) { try { await ensureNeoMap(); } catch {} }
    const rev = st.rev || 0, now = new Date().toISOString(), v = st.values;
    const project = spProjectFolder(v.projekt);
    const folderName = st.sp?.folderName || `${slug(v.datum || today())}_${slug([v.artBegehung, v.artBegehung_andere].filter(Boolean).join(' ')) || 'Begehung'}_${st.id.slice(-6)}`;
    const folder = `${this.root()}/${project}/${folderName}`;
    const prevSp = st.sp;
    // Dateien aus dem Stand dieser Begehung erzeugen. Die Begehungsdatei enthält bereits den
    // Upload-Stand, damit sie auf einem anderen Gerät geöffnet nicht erneut hochgeladen wird.
    let out;
    try { out = withState(st, () => {
      const base = fileName().replace(/\.pdf$/, '');
      const pdf = buildPdf();
      const files = [
        ...photoFiles().map(f => ({ name: 'Fotos/' + f.name, blob: f })),
        ...(pdf ? [{ name: base + '.pdf', blob: new Blob([pdf], { type: 'application/pdf' }) }] : []),
      ];
      const json = base + '.ubb.json';
      st.sp = { folderName, project, folder, paths: [...files.map(f => `${folder}/${f.name}`), `${folder}/${json}`], uploadedRev: rev, uploadedAt: now, listMsg: '' };
      const savedRev = st.savedRev, savedAt = st.savedAt;
      st.savedRev = rev; st.savedAt = now;
      // Begehungsdatei zuletzt: Sie ist das Original und zeigt einen vollständigen Upload an
      try { files.push({ name: json, blob: new Blob([begehungJson()], { type: 'application/json' }) }); }
      finally { st.savedRev = savedRev; st.savedAt = savedAt; }
      return { base, rows: spListRows(), files };
    }); } finally { st.sp = prevSp; } // erst nach erfolgreichem Upload übernehmen
    // Gleichzeitige Bearbeitung: Wurde die Begehungsdatei in SharePoint seit dem letzten eigenen Upload
    // bzw. seit dem Öffnen aus SharePoint geändert, nicht stillschweigend überschreiben.
    const remote = (await this.children(folder)).find(x => x.file && /\.ubb\.(json|txt)$/i.test(x.name));
    if (remote && !force && remote.eTag !== st.sp?.etag) throw new SpConflict(remote);
    await this.ensureFolder(folder);
    if (out.files.some(f => f.name.startsWith('Fotos/'))) await this.ensureFolder(folder + '/Fotos');
    const paths = [];
    let etag = '';
    for (const f of out.files) { const r = await this.put(`${folder}/${f.name}`, f.blob); paths.push(`${folder}/${f.name}`); if (/\.ubb\.json$/.test(f.name)) etag = r.eTag || ''; }
    // Dateien aus früheren Uploads entfernen, die es nicht mehr gibt (z.B. umbenannt)
    for (const p of (st.sp?.paths || [])) if (!paths.includes(p)) { try { await this.del(p); } catch (e) { console.warn(e); } }
    let listMsg = '';
    if (SP_CONFIG.listName) {
      try { await this.syncList(st, out.rows, folder); }
      catch (e) { if (e instanceof NeedLogin) throw e; console.warn(e); listMsg = 'Liste nicht aktualisiert: ' + e.message; }
    }
    const sp = { folderName, project, folder, paths, uploadedRev: rev, uploadedAt: now, listMsg, etag };
    // Stand speichern; bei der offenen Begehung nicht über laufende Änderungen schreiben
    const target = isCur && state.id === st.id ? state : st;
    target.sp = sp;
    target.savedRev = Math.max(target.savedRev || 0, rev); target.savedAt = now;
    if (target === state) await saveCurrent();
    else {
      await DB.set(BKEY(st.id), st);
      const i = archive.findIndex(a => a.id === st.id); if (i >= 0) archive[i] = { ...metaOf(st), updated: archive[i].updated };
      await DB.set(IDX_KEY, archive);
    }
    if (listMsg) this.lastError = listMsg;
    spAddProject(project);
  },

  /* ---------- Liste «UBB-Massnahmen» ---------- */
  LIST_COLUMNS: [
    { name: 'ProtokollID', text: {}, indexed: true },
    { name: 'Schluessel', text: {}, indexed: true },
    { name: 'Projekt', text: {} },
    { name: 'DatumBegehung', dateTime: { format: 'dateOnly' } },
    { name: 'Typ', choice: { choices: ['Pendenz', 'Auflage', 'Probe', 'Neophyt'], displayAs: 'dropDownMenu' } },
    { name: 'Nr', text: {} },
    { name: 'Bereich', text: {} },
    { name: 'Punkt', text: {} },
    { name: 'Beschreibung', text: { allowMultipleLines: true } },
    { name: 'Massnahme', text: { allowMultipleLines: true } },
    { name: 'Verantwortlich', text: {} },
    { name: 'Frist', dateTime: { format: 'dateOnly' } },
    { name: 'Status', choice: { choices: ['offen', 'erledigt', 'nicht geprüft', 'erfüllt', 'nicht erfüllt', 'n. rel.', 'keine Bekämpfung'], displayAs: 'dropDownMenu', allowTextEntry: true } },
    { name: 'Bemerkung', text: { allowMultipleLines: true } },
    { name: 'E_LV95', number: {} },
    { name: 'N_LV95', number: {} },
    { name: 'Genauigkeit_m', number: {} },
    { name: 'AnzahlFotos', number: {} },
    { name: 'Ordner', text: {} },
    { name: 'KontrolleDatum', dateTime: { format: 'dateOnly' } },
    { name: 'KontrolleKommentar', text: { allowMultipleLines: true } },
    { name: 'KontrolleProtokollID', text: {} },
  ],
  async listId() {
    if (this._list) return this._list;
    const site = await this.siteId();
    const name = SP_CONFIG.listName.replace(/'/g, "''");
    const j = await this.json(`/sites/${site}/lists?$filter=displayName eq '${name}'&$select=id,displayName`);
    let l = (j.value || [])[0];
    if (!l) {
      try {
        l = await this.json(`/sites/${site}/lists`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: SP_CONFIG.listName, columns: this.LIST_COLUMNS, list: { template: 'genericList' } }) });
      } catch (e) {
        if (e instanceof GraphError && e.status === 403) throw new Error(`Liste «${SP_CONFIG.listName}» fehlt und darf nicht automatisch angelegt werden – bitte durch die IT anlegen lassen.`);
        throw e;
      }
    }
    this._list = l.id;
    return l.id;
  },
  // Einträge dieser Begehung abgleichen. Der Status wird nur beim Anlegen gesetzt,
  // damit in SharePoint nachgeführte Status (z.B. «erledigt») erhalten bleiben.
  async syncList(st, rows, folder) {
    const site = await this.siteId(), list = await this.listId();
    const base = `/sites/${site}/lists/${list}/items`;
    const existing = [];
    let url = `${base}?$expand=fields($select=Schluessel,ProtokollID)&$filter=fields/ProtokollID eq '${st.id}'&$top=200`;
    while (url) {
      const j = await this.json(url, { headers: { Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' } });
      existing.push(...(j.value || [])); url = j['@odata.nextLink'] || null;
    }
    const byKey = new Map(existing.map(it => [it.fields.Schluessel, it]));
    for (const r of rows) {
      const fields = { ...r.fields, Ordner: folder };
      Object.keys(fields).forEach(k => { if (fields[k] === '' || fields[k] == null) delete fields[k]; });
      const it = byKey.get(r.key);
      if (it) {
        const { Status, ...upd } = fields;
        await this.g(`${base}/${it.id}/fields`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(upd) });
        byKey.delete(r.key);
      } else {
        await this.g(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
      }
    }
    // Einträge, die es in der Begehung nicht mehr gibt
    for (const it of byKey.values()) await this.g(`${base}/${it.id}`, { method: 'DELETE' });
    // Kontrolle übernommener Pendenzen beim ursprünglichen Listeneintrag nachführen
    const dat = st.values.datum ? st.values.datum + 'T12:00:00Z' : undefined;
    for (const p of st.pkontrolle || []) {
      if (!p.status && !p.kommentar) continue;
      const j = await this.json(`${base}?$expand=fields($select=Schluessel)&$filter=fields/Schluessel eq '${p.key.replace(/'/g, "''")}'&$top=1`,
        { headers: { Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' } });
      const it = (j.value || [])[0];
      if (!it) continue;
      const upd = { KontrolleDatum: dat, KontrolleKommentar: [p.status || 'nicht kontrolliert', p.kommentar].filter(Boolean).join(' – '), KontrolleProtokollID: st.id };
      if (p.status) upd.Status = p.status === 'erledigt' ? 'erledigt' : 'offen';
      await this.g(`${base}/${it.id}/fields`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(upd) });
    }
  },
};

// Zeilen für die Liste – mit stabilen Schlüsseln (IDs), damit Nummernwechsel nichts vertauschen
function spListRows() {
  const v = state.values, rows = [], secT = id => (SCHEMA.find(x => x.id === id) || {}).title || '';
  const d = s => (s ? s + 'T12:00:00Z' : '');
  const common = { ProtokollID: state.id, Projekt: v.projekt || '', DatumBegehung: d(v.datum) };
  const pos = o => (o && o.E ? { E_LV95: Math.round(o.E), N_LV95: Math.round(o.N), Genauigkeit_m: o.acc ? Math.round(o.acc) : '' } : {});
  const add = (key, f) => rows.push({ key: state.id + '|' + key, fields: { ...common, Schluessel: state.id + '|' + key, Title: `${f.Nr} ${f.Typ}: ${String(f.Beschreibung || f.Punkt || '').slice(0, 200)}`, ...f } });
  orderedMaengel().forEach((m, i) => add('M:' + m.id, { Typ: 'Pendenz', Nr: `PD${i + 1}`, Bereich: secT(m.section), Punkt: FIELDS[m.ref] ? FIELDS[m.ref].label : (m.refLabel || ''),
    Beschreibung: m.text, Massnahme: m.massnahme || '', Verantwortlich: m.verantwortlich || '', Frist: d(m.frist), Status: 'offen', AnzahlFotos: (m.photos || []).length }));
  for (const s of SCHEMA) for (const f of s.fields) if (f.type === 'auflagen' && !state.nrel[s.id])
    (v[f.id] || []).filter(a => String(a.text || '').trim()).forEach((a, i) => add('A:' + a.id, { Typ: 'Auflage', Nr: `A${i + 1}`, Bereich: s.title, Punkt: a.herkunft || '',
      Beschreibung: a.text, Status: a.status || 'nicht geprüft', Bemerkung: a.bemerkung || '', AnzahlFotos: 0 }));
  if (!state.nrel.proben) (v.proben_liste || []).forEach((p, i) => add('P:' + p.id, { Typ: 'Probe', Nr: `P${i + 1}`, Bereich: 'Materialbeprobungen', Punkt: p.typ || '',
    Beschreibung: [p.bez, p.datum && fmtDate(p.datum), p.person].filter(Boolean).join(', '), Bemerkung: p.bem || '', ...pos(p), AnzahlFotos: (p.photos || []).length }));
  if (v.org_neophyten === 'Ja' && !state.nrel.org) (v.org_bestaende || []).filter(b => b.art).forEach(b => add('N:' + b.id, { Typ: 'Neophyt', Nr: `N${v.org_bestaende.indexOf(b) + 1}`,
    Bereich: 'Umweltgefährdende Organismen', Punkt: neoName(b) + (neoAnh(b) ? ` (FrSV Anh. ${neoAnh(b)})` : ''),
    Massnahme: b.bekaempfen === 'Ja' ? 'Bestand bekämpfen' : b.bekaempfen === 'Nein' ? 'keine Bekämpfung' : '', Verantwortlich: b.verantwortlich || '', Frist: d(b.frist),
    Status: b.bekaempfen === 'Ja' ? 'offen' : b.bekaempfen === 'Nein' ? 'keine Bekämpfung' : '', Bemerkung: b.bem || '', ...pos(b), AnzahlFotos: (b.photos || []).length }));
  return rows;
}

/* ---------- Anzeige ---------- */
function spStatusText() {
  if (!SP.enabled()) return '';
  if (!SP.ready) return 'SharePoint wird verbunden …';
  if (!SP.account) return 'Nicht angemeldet';
  const q = SP.hasQueue();
  if (SP.syncing) return 'Wird in SharePoint gespeichert …';
  if (SP.lastError) return SP.lastError;
  if (q) return navigator.onLine ? 'Wartet auf Upload …' : 'Offline – wird später hochgeladen';
  return 'Angemeldet als ' + (SP.account.name || SP.account.username);
}
// alle SharePoint-Anzeigen aktualisieren
function spRefresh() {
  document.querySelectorAll('[data-sp-status]').forEach(n => { n.textContent = spStatusText(); n.className = 'spstatus' + (SP.lastError || (!SP.account && SP.ready) ? ' warn' : ''); });
  document.querySelectorAll('[data-sp-login]').forEach(n => { n.hidden = !SP.ready || !!SP.account; });
  document.querySelectorAll('[data-sp-logout]').forEach(n => { n.hidden = !SP.account; });
  if (document.querySelector('[data-sp-proj]') && spPickerAcc !== !!SP.account) spFillPicker(false);
  const cur = document.querySelector('[data-sp-cur]');
  if (cur) cur.innerHTML = '', cur.append(spBegStatus(state));
  document.querySelectorAll('[data-beg-status]').forEach(n => n.refresh && n.refresh());
  updateSaveIndicator();
  if ($('dlgArchive') && $('dlgArchive').open) renderArchive();
}
// Status einer Begehung in Bezug auf SharePoint
function spBegStatus(st) {
  const up = st.sp && st.sp.uploadedRev >= (st.rev || 0);
  if (up) return el('span', { class: 'st ok' }, `✓ In SharePoint gespeichert ${new Date(st.sp.uploadedAt).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}`);
  if (st.spQueued && (st.sp?.uploadedRev || 0) < st.spQueued) return el('span', { class: 'st warn' }, 'Wartet auf Upload nach SharePoint');
  if (st.sp) return el('span', { class: 'st warn' }, 'Geändert seit dem letzten Upload');
  return el('span', { class: 'st' }, 'Noch nicht in SharePoint');
}

// Block für Speichern-Dialog und Begehungen-Dialog
function spPanel(withUpload) {
  if (!SP.enabled()) return null;
  const login = el('button', { type: 'button', class: 'btn primary', 'data-sp-login': '', style: 'width:100%;max-width:none', onclick: () => SP.login() }, 'Mit Firmenkonto anmelden');
  const logout = el('button', { type: 'button', class: 'btn sm', 'data-sp-logout': '', onclick: () => SP.logout() }, 'Abmelden');
  const box = el('div', { class: 'sppanel' },
    el('div', { class: 'sphead' }, el('b', {}, 'SharePoint'), logout),
    el('div', { 'data-sp-status': '' }), login);
  if (withUpload) {
    box.append(el('div', { 'data-sp-cur': '' }),
      el('button', { type: 'button', class: 'btn primary', 'data-sp-logout': '', style: 'width:100%;max-width:none', onclick: async () => {
        await SP.queueCurrent();
        if (!SP.lastError && state.sp && state.sp.uploadedRev >= state.rev) toast('In SharePoint gespeichert.');
      } }, 'In SharePoint speichern'));
  }
  queueMicrotask(spRefresh);
  return box;
}

/* ---------- Aus SharePoint öffnen / Sammel-CSV ---------- */
// project: Ordnername; undefined = Projekt der offenen Begehung (falls in SharePoint vorhanden), null = alle Projekte
async function spBrowse(project) {
  const box = $('spList'), title = $('spTitle');
  if (project === undefined) {
    const cur = spProjectFolder(state.values.projekt);
    project = state.values.projekt && (spProjectsCached() || []).some(p => p.name === cur) ? cur : null;
  }
  box.innerHTML = ''; box.append(el('div', { class: 'hint' }, 'Wird geladen …'));
  if (!$('dlgSp').open) $('dlgSp').showModal();
  try {
    if (!project) {
      title.textContent = 'Projekte in SharePoint';
      const items = (await SP.children(SP.root())).filter(x => x.folder && !x.name.startsWith('_')).sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
      spSetProjects(items);
      box.innerHTML = '';
      if (!items.length) box.append(el('div', { class: 'empty' }, 'Noch keine Begehungen in SharePoint.'));
      items.forEach(p => box.append(el('div', { class: 'pitem' }, el('div', { class: 'pn' }, el('b', {}, p.name), el('span', {}, `${p.folder.childCount ?? ''} Begehung(en)`)),
        el('button', { type: 'button', class: 'btn sm', onclick: () => spBrowse(p.name) }, 'Öffnen'))));
    } else {
      title.textContent = project;
      const path = `${SP.root()}/${project}`;
      const items = (await SP.children(path)).filter(x => x.folder).sort((a, b) => b.name.localeCompare(a.name));
      box.innerHTML = '';
      box.append(el('div', { class: 'stack', style: 'margin-bottom:10px' },
        el('button', { type: 'button', class: 'btn sm', onclick: () => spBrowse(null) }, '← Alle Projekte'),
        el('button', { type: 'button', class: 'btn', onclick: () => spSammel(project, items) }, 'Sammel-CSV für dieses Projekt')));
      if (!items.length) box.append(el('div', { class: 'empty' }, 'Keine Begehungen.'));
      items.forEach(f => box.append(el('div', { class: 'pitem' }, el('div', { class: 'pn' }, el('b', {}, f.name.replace(/_[0-9a-z]{6}$/, '').replace(/_/g, ' · ')),
        el('span', {}, 'geändert ' + new Date(f.lastModifiedDateTime).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' }))),
        el('button', { type: 'button', class: 'btn sm', onclick: () => spOpenBeg(`${path}/${f.name}`) }, 'Öffnen'))));
    }
  } catch (e) { box.innerHTML = ''; box.append(el('div', { class: 'empty warn' }, spErr(e))); }
}
const spErr = e => e instanceof NeedLogin ? 'Bitte zuerst mit dem Firmenkonto anmelden.' : e instanceof GraphError && e.status === 403 ? 'Keine Berechtigung – IT kontaktieren.' : 'Fehler: ' + e.message;

async function spBegFile(folderPath) {
  const f = (await SP.children(folderPath)).find(x => x.file && /\.ubb\.(json|txt)$/i.test(x.name));
  if (!f) return null;
  const file = await SP.download(f);
  file.spETag = f.eTag || '';
  return file;
}
async function spOpenBeg(folderPath) {
  try {
    toast('Begehung wird geladen …');
    const file = await spBegFile(folderPath);
    if (!file) { toast('Keine Begehungsdatei in diesem Ordner.'); return; }
    $('dlgSp').close();
    // Stand aus SharePoint merken (Erkennung gleichzeitiger Änderungen)
    await importBegFile(file, st => { if (st.sp) st.sp.etag = file.spETag; });
  } catch (e) { toast(spErr(e)); }
}
async function spSammel(project, folders) {
  const box = $('spList');
  box.prepend(el('div', { class: 'hint', id: 'spProg' }, 'Begehungsdateien werden geladen …'));
  try {
    const files = [];
    for (const f of folders) {
      const b = await spBegFile(`${SP.root()}/${project}/${f.name}`);
      if (b) files.push(b);
      $('spProg').textContent = `Begehungsdateien geladen: ${files.length} / ${folders.length}`;
    }
    $('dlgSp').close();
    await buildSammelCsv(files, `${SP.root()}/${project}`);
  } catch (e) { toast(spErr(e)); $('spProg')?.remove(); }
}

/* ---------- Projektordner und Projekt-Auswahl ----------
   Jedes Projekt hat einen Ordner <rootFolder>/<Projektnr. und Ort>/ mit einem Unterordner pro Begehung.
   Der Ordnername entspricht dem Projektnamen (nur in SharePoint unzulässige Zeichen werden ersetzt). */
const spSafe = s => String(s || '').replace(/["*:<>?/\\|#%]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^[.~]+|\.+$/g, '').slice(0, 120).trim();
const spProjKey = () => 'ubb-sp-projects-' + SP.cfgKey();
let spProjects = null, spProjLoading = false, spPickerAcc = null;
function spProjectsCached() {
  if (!spProjects) try { spProjects = (JSON.parse(localStorage.getItem(spProjKey())) || {}).list || null; } catch {}
  return spProjects;
}
function spSetProjects(items) {
  spProjects = items.map(x => ({ name: x.name, count: x.folder ? x.folder.childCount ?? null : x.count ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
  try { localStorage.setItem(spProjKey(), JSON.stringify({ at: Date.now(), list: spProjects })); } catch {}
  spSyncPicker();
}
function spAddProject(name) {
  const l = spProjectsCached() || [];
  if (!l.some(p => p.name === name)) spSetProjects([...l, { name, count: 1 }]);
}
async function spLoadProjects() {
  spSetProjects((await SP.children(SP.root())).filter(x => x.folder && !x.name.startsWith('_')));
  return spProjects;
}
// Ordner eines Projekts: vorhandenen Ordner bevorzugen (Gross-/Kleinschreibung und Leerzeichen egal)
function spProjectFolder(projekt) {
  const safe = spSafe(projekt);
  if (!safe) return 'ohne Projekt';
  const ex = (spProjectsCached() || []).find(p => normP(p.name) === normP(safe));
  return ex ? ex.name : safe;
}

// Auswahlliste bei «Projektnr. und Ort»
function spProjectPicker() {
  const sel = el('select', { 'data-sp-proj': '', 'aria-label': 'Projekt aus SharePoint wählen', onchange: e => spPickProject(e.target) });
  const btn = el('button', { type: 'button', class: 'btn sm', title: 'Projektliste neu laden', 'aria-label': 'Projektliste neu laden', onclick: () => spFillPicker(true) }, '↻');
  queueMicrotask(() => spFillPicker(false));
  return el('div', { class: 'sppick' }, el('div', { class: 'row' }, sel, btn), el('div', { class: 'hint', 'data-sp-projhint': '' }));
}
async function spFillPicker(reload) {
  const sel = document.querySelector('[data-sp-proj]');
  if (!sel) return;
  spPickerAcc = !!SP.account;
  if ((reload || !spProjects) && SP.account && navigator.onLine && !spProjLoading) {
    spProjLoading = true;
    const hint = document.querySelector('[data-sp-projhint]');
    if (hint) hint.textContent = 'Projektliste wird geladen …';
    try { await spLoadProjects(); } catch (e) { if (hint) hint.textContent = 'Projektliste: ' + spErr(e); spProjLoading = false; return; }
    spProjLoading = false;
  }
  spSyncPicker();
}
function spSyncPicker() {
  const sel = document.querySelector('[data-sp-proj]'), hint = document.querySelector('[data-sp-projhint]');
  if (!sel) return;
  const list = spProjectsCached() || [];
  sel.innerHTML = '';
  sel.append(el('option', { value: '' }, list.length ? 'Projekt aus SharePoint wählen …' : SP.account ? 'Noch keine Projekte in SharePoint' : 'Projektliste: zuerst anmelden'));
  list.forEach(p => sel.append(el('option', { value: p.name }, p.name)));
  if (SP.account) sel.append(el('option', { value: '__new' }, '+ Neues Projekt …'));
  const v = String(state.values.projekt || '').trim(), cur = spProjectFolder(v);
  const ex = v && list.find(p => p.name === cur);
  sel.value = ex ? cur : '';
  if (!hint || spProjLoading) return;
  hint.className = 'hint';
  if (!v || !spProjects) hint.textContent = '';
  else if (ex) hint.textContent = `✓ Projektordner in SharePoint: ${ex.name}`;
  else { hint.textContent = `Neues Projekt – der Ordner «${spSafe(v)}» wird beim Speichern in SharePoint angelegt.`; hint.className = 'hint warnt'; }
}
// nach der Eingabe: abweichende Schreibweise eines vorhandenen Projekts übernehmen
function spNormalizeProject() {
  const v = String(state.values.projekt || '').trim(), cur = spProjectFolder(v);
  if (v && cur !== v && (spProjectsCached() || []).some(p => p.name === cur)) {
    setValue('projekt', cur); const inp = $('i_projekt'); if (inp) inp.value = cur;
  }
}
async function spPickProject(sel) {
  let name = sel.value;
  if (name === '__new') {
    const n = spSafe(prompt('Projektnr. und Ort des neuen Projekts:', '') || '');
    if (!n) { spSyncPicker(); return; }
    const ex = (spProjectsCached() || []).find(p => normP(p.name) === normP(n));
    if (ex) { toast(`Das Projekt «${ex.name}» gibt es bereits – ausgewählt.`); name = ex.name; }
    else {
      name = n;
      try { await SP.ensureFolder(`${SP.root()}/${n}`); spAddProject(n); toast(`Projektordner «${n}» in SharePoint angelegt.`); }
      catch (e) { toast(spErr(e) + ' Der Ordner wird beim Speichern angelegt.'); }
    }
  }
  if (!name) return;
  setValue('projekt', name);
  const inp = $('i_projekt'); if (inp) inp.value = name;
  spSyncPicker();
  // noch keine Pendenzen übernommen: die offenen der letzten Begehung dieses Projekts holen
  if (!pkList().length) pkTakeLatest(true);
}

/* ---------- Zentrale Presets ---------- */
const spPresetPath = () => `${SP.root()}/_Presets/UBB-Presets.json`;
async function spPresetsLoad() {
  try {
    const d = await SP.driveId();
    const item = await SP.json(`/drives/${d}/root:/${SP.enc(spPresetPath())}?$select=id,name`);
    await importPresets(await SP.download(item));
  } catch (e) { toast(e instanceof GraphError && e.status === 404 ? 'In SharePoint sind noch keine Presets gespeichert.' : spErr(e)); }
}
async function spPresetsSave() {
  if (!presets.length) { toast('Keine Presets vorhanden.'); return; }
  try {
    await SP.ensureFolder(`${SP.root()}/_Presets`);
    await SP.put(spPresetPath(), new Blob([JSON.stringify({ format: 'ubb-presets', version: 1, exported: new Date().toISOString(), presets }, null, 2)], { type: 'application/json' }));
    toast('Presets in SharePoint gespeichert.');
  } catch (e) { toast(spErr(e)); }
}

function initSp() {
  if (!SP.enabled()) return;
  $('spClose').onclick = () => $('dlgSp').close();
  $('archInfo').textContent = 'Alle Begehungen bleiben auf diesem Gerät, bis sie gelöscht werden. Gesichert sind sie, sobald sie in SharePoint gespeichert sind (oder die Begehungsdatei in OneDrive).';
  // Presets-Dialog um SharePoint ergänzen
  const st = $('dlgPresets').querySelector('.stack');
  st.prepend(
    el('button', { type: 'button', class: 'btn', onclick: spPresetsLoad }, 'Presets aus SharePoint laden'),
    el('button', { type: 'button', class: 'btn', onclick: spPresetsSave }, 'Presets in SharePoint speichern'));
  SP.init();
}
