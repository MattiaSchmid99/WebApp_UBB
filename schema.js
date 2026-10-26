// Formularstruktur gemäss "UBB Baustellenjournal - Protokoll-Vorlage"
// Feldtypen: text, textarea, date, number, radio, multi, photos, sub (Zwischentitel)
// showIf: Feld nur sichtbar, wenn ein anderes Feld einen bestimmten Wert hat
// Anpassungen: Labels/Optionen hier ändern; IDs nicht ändern, sonst gehen bestehende Entwürfe verloren.

const J = ['Ja', 'Nein'];
const JNR = ['Ja', 'Nein', 'n. rel.'];
const IO = ['i.O.', 'nicht i.O.'];
const ZONEN = ['S1 (Fassungsbereich)', 'S2 (Engere Schutzzone)', 'S3 (Weitere Schutzzone)', 'Spezialzone'];

const SCHEMA = [
  {
    id: 'maengel', title: 'Mängelliste', noPhotos: true,
    intro: 'Mängel bei der jeweiligen Frage mit «+ Mangel» erfassen. Hier stehen alle Mängel dieser Begehung; antippen zum Bearbeiten. Im PDF steht die Liste ganz oben.',
    fields: [{ id: 'maengel_ml', label: 'Erfasste Mängel', type: 'mlist' }],
  },
  {
    id: 'allg', title: 'Allgemeine Angaben', fields: [
      { id: 'datum', label: 'Datum', type: 'date', req: true },
      { id: 'wetter', label: 'Wetter', type: 'text', weather: true },
      { id: 'projekt', label: 'Projektnr. und Ort', type: 'text', keep: true, req: true },
      { id: 'ubbName', label: 'UBB-Person (Name)', type: 'text', width: 'w2', profile: true, req: true },
      { id: 'ubbKuerzel', label: 'Kürzel', type: 'text', width: 'w1', profile: true },
      { id: 'bauvorhaben', label: 'Bauvorhaben', type: 'text', keep: true },
      { id: 'artBaustelle', label: 'Art d. Baustelle', type: 'text', keep: true },
      { id: 'artBegehung', label: 'Art d. Begehung', type: 'radio', options: ['Allg. Begehung', 'Probenahme', 'Abnahme', 'Amphibienkontrolle'], other: true, req: true },
      { id: 'bauleitung', label: 'Bauleitung', hint: 'Name, Adresse, Tel.', type: 'textarea', keep: true },
      { id: 'teilnehmende', label: 'Teilnehmende', hint: 'Name, Funktionen', type: 'textarea' },
      { id: 'besonderheiten', label: 'Besonderheiten', hint: 'z.B. Neophyten, KbS Standort, etc.', type: 'textarea' },
      { id: 'gwSchutz', label: 'Grundwasserschutzgebiet', type: 'radio', options: [...ZONEN, 'Keines'], keep: true },
      { id: 'kbs', label: 'KbS-Standort betroffen', type: 'radio', options: J, keep: true },
      { id: 'besAndere', label: 'Andere', type: 'text' },
      { id: 'verteiler', label: 'Verteiler', hint: 'Name, Funktion/Firma – eine Person pro Zeile', type: 'textarea', keep: true },
      { id: 'kenntnis_sub', label: 'Kenntnisnahme Bauleitung (optional)', type: 'sub' },
      { id: 'kenntnis_name', label: 'Name, Funktion', type: 'text', keep: true },
      { id: 'kenntnis_sign', label: 'Unterschrift', hint: 'Mit dem Finger im Feld unterschreiben', type: 'signature' },
    ]
  },
  {
    id: 'laerm', title: 'Luft und Lärm', fields: [
      { id: 'laerm_area', label: 'Lärm', type: 'sub', area: 'Luft und Lärm' },
      { id: 'laerm_stufePhase', label: 'Massnahmenstufe (lärmige Bauphase)', type: 'radio', options: ['A', 'B', 'C'] },
      { id: 'laerm_stufeArbeiten', label: 'Massnahmenstufe (lärmintensive Bauarbeiten)', type: 'radio', options: ['A', 'B', 'C'] },
      { id: 'laerm_ruhezeiten', label: 'Werden Ruhezeiten eingehalten?', hint: '19 bis 7 Uhr und 12 bis 13 Uhr', type: 'radio', options: J },
      { id: 'laerm_taetigkeiten', label: 'Welche lärmintensiven Tätigkeiten werden ausgeführt?', type: 'multi', options: ['Keine', 'Baggern', 'Rammen', 'Spitzen', 'Bohren / Fräsen', 'Schuttrutsche', 'Verkehr'], other: true },
      { id: 'laerm_andereQuellen', label: 'Sind andere Lärmquellen vorhanden?', hint: 'z.B. leerlaufende Motoren, grössere Abstände zur Siedlung möglich...', type: 'radio', options: J },
      { id: 'laerm_abschirmung', label: 'Ist eine Lärmabschirmung notwendig und möglich?', hint: 'z.B. bei festinstallierten, lärmintensiven Maschinen', type: 'radio', options: J },
      { id: 'laerm_fotos', label: 'Fotos', type: 'photos' },
      { id: 'laerm_bem', label: 'Bemerkungen', type: 'textarea' },
      { id: 'mg_area', label: 'Luftreinhaltung – Maschinen und Geräte (M+G)', type: 'sub', area: 'Luftreinhaltung – Maschinen und Geräte (M+G)', hint: 'Hilfsmittel: Baubewilligung, Maschinenliste, Checkliste Baustellenkontrolle' },
      { id: 'mg_auffaellig', label: 'Auffällige Baumaschinen (anhand Maschinenliste)', type: 'textarea' },
      { id: 'mg_fotos', label: 'Fotos', type: 'photos' },
      { id: 'mg_lkwAnzahl', label: 'Anzahl durchgeführter LKW-Kontrollen', type: 'number', width: 'w1' },
      { id: 'mg_lkwEuro6', label: 'davon Euro VI', type: 'number', width: 'w1' },
      { id: 'mg_lkwEuro5', label: 'davon Euro V', type: 'number', width: 'w1' },
      { id: 'mg_abgaskleber', label: 'Ablaufdatum Abgaswartungskleber', type: 'radio', options: IO },
      { id: 'mg_partikelfilter', label: 'Sind Partikelfilter vorhanden?', hint: 'Kontrolle d. Auspuffes auf Sauberkeit', type: 'radio', options: JNR },
      { id: 'mg_untergrund', label: 'Sind Untergrundsflächen sauber?', hint: 'Gegen Staubaufwirbelung', type: 'radio', options: JNR },
      { id: 'mg_bem', label: 'Bemerkungen (Abweichungen von ML oder korrekter PF-Wartung)', type: 'textarea' },
      { id: 'ersch_area', label: 'Erschütterungen und Körperschall', type: 'sub', area: 'Erschütterungen und Körperschall', hint: 'Hilfsmittel: SN 640 312a, Erschütterungsschutzkonzept' },
      { id: 'ersch_arbeiten', label: 'Werden erschütterungsintensive Arbeiten ausgeführt?', hint: 'z.B. Rammen, Sprengen, Verdichten', type: 'radio', options: JNR },
      { id: 'ersch_grenzwerte', label: 'Werden Grenzwerte gemäss SN 640 312a eingehalten?', type: 'radio', options: JNR },
      { id: 'ersch_gebaeude', label: 'Sind erschütterungsempfindliche Gebäude oder Anlagen in der Nähe?', hint: 'z.B. Wohnbauten, Denkmäler, Leitungen', type: 'radio', options: JNR },
      { id: 'ersch_messung', label: 'Wird eine Erschütterungsmessung durchgeführt?', type: 'radio', options: JNR },
      { id: 'ersch_fotos', label: 'Fotos', type: 'photos' },
      { id: 'ersch_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'gew', title: 'Gewässerschutz und Entwässerung', fields: [
      { id: 'gew_area', label: 'Entwässerung', type: 'sub', area: 'Gewässerschutz und Entwässerung' },
      { id: 'gew_zone', label: 'Grundwasserschutzzone', type: 'radio', options: [...ZONEN, 'Kein Schutzgebiet'] },
      { id: 'gew_bereich', label: 'Gewässerschutzbereich', type: 'radio', options: ['Ao (oberirdisch)', 'Au (unterirdisch)', 'Zu (Zuströmbereich)', 'üB (übrige Bereiche)', 'Kein Schutzgebiet'] },
      { id: 'gew_fassung', label: 'Besteht die Gefahr einer Beschädigung einer Wasser- o. Quellfassung?', type: 'radio', options: JNR },
      { id: 'gew_sub1', label: 'Überwachung d. Baustellenabwassers', type: 'sub' },
      { id: 'gew_ph', label: 'pH Einleitungswert', hint: 'Soll 6.5 – 9.0', type: 'number', width: 'w1', ph: true },
      { id: 'gew_truebSoll', label: 'Trübmessung Soll', type: 'text', width: 'w1' },
      { id: 'gew_truebIst', label: 'Trübmessung Ist', type: 'text', width: 'w1' },
      { id: 'gew_flockung', label: 'Flockungsmittel', type: 'text' },
      { id: 'gew_waschplatz', label: 'Ist Waschplatz vorhanden?', type: 'radio', options: JNR },
      { id: 'gew_absatzbecken', label: 'Ist Absatzbecken vorhanden?', type: 'radio', options: JNR },
      { id: 'gew_sub2', label: 'Sind folgende Installationen i.O.?', type: 'sub' },
      { id: 'gew_oelabscheider', label: 'Ölabscheider / Tauchwand', type: 'radio', options: JNR },
      { id: 'gew_neutralisation', label: 'Neutralisation', type: 'radio', options: JNR },
      { id: 'gew_neutralisationPh', label: 'pH-Wert Neutralisation', type: 'number', width: 'w1', ph: true, showIf: { f: 'gew_neutralisation', v: 'Ja' } },
      { id: 'gew_pumpensumpf', label: 'Pumpensümpfe', type: 'radio', options: JNR },
      { id: 'gew_pumpensumpfGeschuetzt', label: 'Pumpensümpfe geschützt?', type: 'radio', options: J, showIf: { f: 'gew_pumpensumpf', v: 'Ja' } },
      { id: 'gew_fotos', label: 'Fotos', type: 'photos' },
      { id: 'gew_bem', label: 'Bemerkungen', type: 'textarea' },
      { id: 'wsf_area', label: 'Wassergefährdende Stoffe und Flüssigkeiten (WSF)', type: 'sub', area: 'Wassergefährdende Stoffe und Flüssigkeiten (WSF)' },
      { id: 'wsf_korrekt', label: 'Werden wassergefährdende Stoffe korrekt gelagert?', hint: 'Auffangwannen, Löschwasserrückhalt, nur mit Ausnahmebewilligung in Schutzzone lagern', type: 'radio', options: JNR },
      { id: 'wsf_stoffarten', label: 'Stoff-Arten', type: 'text' },
      { id: 'wsf_lagerungText', label: 'Lagerung, Sicherung', type: 'text' },
      { id: 'wsf_betankungText', label: 'Betankung und Umschlag', type: 'text' },
      { id: 'wsf_oelbindemittel', label: 'Ölbindemittel vorhanden?', type: 'radio', options: JNR },
      { id: 'wsf_bioOel', label: 'Bio-Hydrauliköl vorhanden?', type: 'radio', options: JNR },
      { id: 'wsf_lagerung', label: 'Lagerung', type: 'radio', options: IO },
      { id: 'wsf_sicherung', label: 'Sicherung', type: 'radio', options: IO },
      { id: 'wsf_umschlag', label: 'Umschlag / Betankung', type: 'radio', options: IO },
      { id: 'wsf_fotos', label: 'Fotos', type: 'photos' },
      { id: 'wsf_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'boden', title: 'Bodenschutz', aids: 'Bodenbestimmungsblatt', fields: [
      { id: 'boden_getrennt', label: 'Wird Boden/Aushub getrennt gelagert?', hint: 'Getrennter Ober-, Unterboden und Aushub', type: 'radio', options: JNR },
      { id: 'boden_depot', label: 'Bodendepot (Beschreibung / Bemerkung)', hint: 'Oberboden max. 1.5 m, Unterboden max. 2.5 m, trapezförmig, keine Gegenstände darauf lagern, keine Neophyten i.d. Nähe, falls > 3 Monate m. Saatgutmischung begrünt', type: 'textarea' },
      { id: 'boden_fotos', label: 'Fotos', type: 'photos' },
      { id: 'boden_pisten', label: 'Werden Pisten u. Installationsplatz korrekt erstellt / genutzt?', hint: 'Korrekt befahren?', type: 'radio', options: JNR },
      { id: 'boden_geotextil', label: 'Wurde Geotextil (30–50 cm Kies) oder Untergrund korrekt installiert?', type: 'radio', options: JNR },
      { id: 'boden_belastet', label: 'Wird mit belastetem Bodenaushub korrekt umgegangen?', type: 'radio', options: JNR },
      { id: 'boden_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'abf', title: 'Abfälle, umweltgefährdende Stoffe', fields: [
      { id: 'abf_area', label: 'Abfälle', type: 'sub', area: 'Abfälle, umweltgefährdende Stoffe' },
      { id: 'abf_getrennt', label: 'Werden die Abfälle getrennt?', hint: 'Metall, Holz, Beton, etc. gemäss Mehrmuldenkonzept', type: 'radio', options: JNR },
      { id: 'abf_herum', label: 'Liegt Abfall herum?', type: 'radio', options: JNR },
      { id: 'abf_fotos', label: 'Fotos', type: 'photos' },
      { id: 'abf_bem', label: 'Bemerkungen', type: 'textarea' },
      { id: 'beton_area', label: 'Betonumschlag', type: 'sub', area: 'Betonumschlag' },
      { id: 'beton_reinigung', label: 'Reinigungsplatz', type: 'radio', options: JNR },
      { id: 'beton_reinigungGefasst', label: 'Abwasser gefasst?', type: 'radio', options: J, showIf: { f: 'beton_reinigung', v: 'Ja' } },
      { id: 'beton_ba', label: 'Beton- o. Mörtelanlage (BA)', type: 'radio', options: JNR },
      { id: 'beton_baBehandlung', label: 'BA: Abwasser', type: 'radio', options: ['recycliert', 'neutralisiert'], showIf: { f: 'beton_ba', v: 'Ja' } },
      { id: 'beton_bu', label: 'Beton-Umschlaggerät (BU)', type: 'radio', options: JNR },
      { id: 'beton_buBehandlung', label: 'BU: Abwasser', type: 'radio', options: ['recycliert', 'neutralisiert'], showIf: { f: 'beton_bu', v: 'Ja' } },
      { id: 'beton_gwAbsenkung', label: 'Grundwasserabsenkung', type: 'radio', options: J },
      { id: 'beton_gwAbsenkungPh', label: 'pH-Wert Grundwasserabsenkung', hint: 'Soll 6.5 – 9.0', type: 'number', width: 'w1', ph: true, showIf: { f: 'beton_gwAbsenkung', v: 'Ja' } },
      { id: 'beton_fotos', label: 'Fotos', type: 'photos' },
      { id: 'beton_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'proben', title: 'Materialbeprobungen', noPhotos: true,
    intro: 'Mit «+ Beprobung hinzufügen» eine Probe erfassen. Die Position wird beim Hinzufügen per GPS bestimmt.',
    fields: [
      { id: 'proben_liste', label: 'Proben', type: 'proben' },
      { id: 'proben_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'org', title: 'Umweltgefährdende Organismen', fields: [
      { id: 'org_neophyten', label: 'Gibt es Neophyten in oder rund um den Perimeter?', type: 'radio', options: JNR },
      { id: 'org_bestaende', label: 'Bestände invasiver Neophyten (FrSV Anhang 2)', hint: 'Pro Bestand: Art, Foto, Standort und ob er bekämpft werden muss. Zu bekämpfende Bestände erscheinen in der Massnahmenliste.', type: 'neophyten', showIf: { f: 'org_neophyten', v: 'Ja' } },
      { id: 'org_tiere', label: 'Gibt es Hinweise auf gebietsfremde Tierarten?', type: 'radio', options: JNR },
      { id: 'org_tiereWelche', label: 'Welche Tierarten?', type: 'text', showIf: { f: 'org_tiere', v: 'Ja' } },
      { id: 'org_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'wald', title: 'Wald', fields: [
      { id: 'wald_abstand', label: 'Wird der Waldabstand (min. 2 m, ausser m. Ausnahmebewilligung) eingehalten?', type: 'radio', options: JNR },
      { id: 'wald_rodung', label: 'Werden die Rodungsflächen eingehalten?', type: 'radio', options: JNR },
      { id: 'wald_boden', label: 'Wird der Waldboden mit Maschinen befahren?', type: 'radio', options: JNR },
      { id: 'wald_lager', label: 'Werden Gegenstände oder Bodendepots auf Waldgebiet gelagert?', hint: 'z.B. Baumaschinen, Schnee', type: 'radio', options: JNR },
      { id: 'wald_baumschutz', label: 'Werden andere Massnahmen zum Baumschutz eingehalten?', type: 'radio', options: JNR },
      { id: 'wald_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'ffl', title: 'Flora, Fauna, Lebensräume', fields: [
      { id: 'org_biotope', label: 'Werden schützenswerte Biotope / Naturschutzgebiete beachtet?', type: 'radio', options: JNR, csvArea: 'Umweltgefährdende Organismen' },
      { id: 'ffl_amphibien', label: 'Werden Amphibienschutzmassnahmen eingehalten?', type: 'radio', options: JNR },
      { id: 'ffl_ruhezeiten', label: 'Werden Ruhezeiten (Winterschlaf, Brutzeit, etc.) eingehalten?', type: 'radio', options: JNR },
      { id: 'org_fallen', label: 'Gibt es offene Gruben oder Schächte, welche als Tierfallen dienen können?', hint: 'Fallen für Kleintiere', type: 'radio', options: JNR, csvArea: 'Umweltgefährdende Organismen' },
      { id: 'ffl_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'licht', title: 'Landschaft, Ortsbild, Lichtimmissionen', aids: 'Beleuchtungskonzept', fields: [
      { id: 'licht_konzept', label: 'Wird Beleuchtungskonzept eingehalten?', type: 'radio', options: JNR },
      { id: 'licht_uebermaessig', label: 'Wird übermässig viel Licht benutzt (insb. i. d. Nacht)?', type: 'radio', options: JNR },
      { id: 'licht_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'bericht', title: 'Berichterstattung / Reporting', noPhotos: true, fields: [
      { id: 'bericht_vorfaelle', label: 'Sind seit der letzten Begehung Umweltvorfälle aufgetreten?', type: 'radio', options: J },
      { id: 'vorfall_was', label: 'Ereignis: Was ist passiert?', hint: 'Art, Ort, betroffene Umweltbereiche, ausgetretene Stoffe/Mengen', type: 'textarea', showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'vorfall_wann', label: 'Wann?', type: 'datetime', showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'vorfall_massnahmen', label: 'Sofortmassnahmen', hint: 'Was wurde von wem unternommen?', type: 'textarea', showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'vorfall_gemeldet', label: 'Gemeldet an', type: 'multi', options: ['Bauleitung', 'Bauherrschaft', 'Gemeinde', 'Kant. Umweltfachstelle', 'Feuerwehr / Ölwehr', 'Polizei', 'Noch nicht gemeldet'], other: true, showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'vorfall_meldezeit', label: 'Meldung am', type: 'datetime', showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'vorfall_fotos', label: 'Fotos Ereignis', type: 'photos', showIf: { f: 'bericht_vorfaelle', v: 'Ja' } },
      { id: 'bericht_pendenzen', label: 'Bestehen offene Pendenzen / Auflagen aus der Baubewilligung?', type: 'radio', options: J },
      { id: 'bericht_pendenzenText', label: 'Offene Pendenzen / Verantwortliche Person / Termin', type: 'textarea' },
      { id: 'bericht_behoerde', label: 'Wird ein formeller Bericht an die Behörde ausgelöst?', type: 'radio', options: J },
      { id: 'bericht_naechste', label: 'Datum nächste Begehung', type: 'date' },
      { id: 'bericht_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'gesamt', title: 'Gesamteindruck der Baustelle', fields: [
      { id: 'gesamt_beurteilung', label: 'Gesamtbeurteilung', type: 'radio', options: ['In Ordnung', 'Kleinere Mängel', 'Erhebliche Mängel'] },
      { id: 'gesamt_eindruck', label: 'Eindruck der Baustelle', type: 'textarea' },
      { id: 'gesamt_massnahmen', label: 'Weitere erforderliche Massnahmen, inkl. zuständiger Person', type: 'textarea' },
      { id: 'gesamt_bem', label: 'Bemerkungen', type: 'textarea' },
    ]
  },
  {
    id: 'gis', title: 'GIS-Lagekontrolle', noPhotos: true,
    intro: 'Layer wählen, Position bestimmen, Kartenausschnitt in den Bericht übernehmen. Prüft z.B. Betroffenheit von Inventaren oder Waldabstand.',
    fields: [
      { id: 'gis_karten', label: 'Kartenausschnitte', type: 'gis' },
    ]
  },
];

// Invasive gebietsfremde Pflanzen gemäss Freisetzungsverordnung (FrSV, SR 814.911), Anhang 2, Fassung ab 1.9.2024
// 2.1: Umgang in der Umwelt verboten · 2.2: Inverkehrbringen verboten
const NEOPHYTEN = [
  ...[['Ailanthus altissima', 'Götterbaum'], ['Ambrosia spp.', 'Ambrosien, Traubenkräuter'], ['Asclepias syriaca', 'Syrische Seidenpflanze'],
    ['Cabomba caroliniana', 'Karolina-Haarnixe'], ['Celastrus orbiculatus', 'Rundblättriger Baumwürger'], ['Crassula helmsii', 'Nadelkraut'],
    ['Elodea spp. (E. canadensis, E. densa, E. nuttallii)', 'Wasserpest'], ['Heracleum mantegazzianum', 'Riesenbärenklau'], ['Humulus japonicus', 'Japanischer Hopfen'],
    ['Hydrocotyle ranunculoides', 'Grosser Wassernabel'], ['Impatiens glandulifera', 'Drüsiges Springkraut'], ['Lagarosiphon major', 'Schmalrohr'],
    ['Ludwigia spp.', 'Südamerikanische Heusenkräuter inkl. Hybride'], ['Myriophyllum spp. (M. aquaticum, M. heterophyllum)', 'Tausendblätter (gebietsfremde)'],
    ['Pueraria lobata', 'Kopoubohne'], ['Reynoutria spp. (Fallopia spp.)', 'Asiatische Knöteriche inkl. Hybride'], ['Rhus typhina', 'Essigbaum'],
    ['Salvinia molesta', 'Lästiger Schwimmfarn'], ['Senecio inaequidens', 'Schmalblättriges Greiskraut'], ['Sicyos angulatus', 'Haargurke'],
    ['Solidago spp. (ohne S. virgaurea)', 'Amerikanische Goldruten inkl. Hybride'], ['Toxicodendron radicans', 'Kletternder Giftsumach'],
  ].map(([sci, de]) => ({ anh: '2.1', sci, de })),
  ...[['Acacia dealbata', 'Falsche Mimose'], ['Amorpha fruticosa', 'Bastardindigo'], ['Artemisia verlotiorum', 'Verlotscher Beifuss'],
    ['Aster novi-belgii aggr.', 'Neubelgische Aster'], ['Azolla filiculoides', 'Grosser Algenfarn'], ['Broussonetia papyrifera', 'Papiermaulbeerbaum'],
    ['Buddleja davidii', 'Schmetterlingsstrauch, Sommerflieder'], ['Bunias orientalis', 'Glattes Zackenschötchen'], ['Cornus sericea', 'Seidiger Hornstrauch'],
    ['Cotoneaster horizontalis', 'Korallenstrauch'], ['Echinocystis lobata', 'Stachelgurke'], ['Erigeron annuus', 'Einjähriges Berufkraut'],
    ['Galega officinalis', 'Geissraute'], ['Glyceria striata', 'Gestreiftes Süssgras'], ['Lonicera henryi', 'Henrys Geissblatt'],
    ['Lonicera japonica', 'Japanisches Geissblatt'], ['Lupinus polyphyllus', 'Vielblättrige Lupine'], ['Oenanthe javanica', 'Wasserfenchel'],
    ['Parthenocissus quinquefolia aggr.', 'Jungfernrebe'], ['Paulownia tomentosa', 'Blauglockenbaum'], ['Pennisetum setaceum', 'Afrikanisches Lampenputzergras'],
    ['Phyllostachys aurea', 'Gold-Bambus'], ['Prunus laurocerasus', 'Kirschlorbeer'], ['Prunus serotina', 'Herbst-Traubenkirsche'],
    ['Pseudosasa japonica', 'Japanischer Bambus'], ['Rubus armeniacus', 'Armenische Brombeere'], ['Rubus phoenicolasius', 'Rotborstige Himbeere'],
    ['Sagittaria latifolia', 'Breitblättriges Pfeilkraut'], ['Sedum spurium', 'Kaukasus-Fettkraut'], ['Sedum stoloniferum', 'Ausläuferbildendes Fettkraut'],
    ['Trachycarpus fortunei', 'Chinesische Hanfpalme'],
  ].map(([sci, de]) => ({ anh: '2.2', sci, de })),
];
const NEO_ANH = { '2.1': 'Anhang 2.1 – Umgang verboten', '2.2': 'Anhang 2.2 – Inverkehrbringen verboten' };
const neoBySci = sci => NEOPHYTEN.find(n => n.sci === sci);
// frühere Auswahlliste «Welche Neophyten-Arten?» → FrSV-Art
const NEO_OLD = { 'Kanadische Goldrute': 'Solidago spp. (ohne S. virgaurea)', 'Sommerflieder': 'Buddleja davidii', 'Berufkraut': 'Erigeron annuus',
  'Armenische Brombeere': 'Rubus armeniacus', 'Götterbaum': 'Ailanthus altissima', 'Südafrikanisches Greiskraut': 'Senecio inaequidens', 'Japanischer Knöterich': 'Reynoutria spp. (Fallopia spp.)' };

// Probentypen Materialbeprobung
const PROBEN_TYPEN = ['Aushub', 'Ausbruch', 'Unterboden', 'Oberboden', 'Baustoffe', 'Ausbruchasphalt', 'Baustellenabwasser'];

// Frühere Abschnitte, die in andere aufgegangen sind (für bestehende Entwürfe, Presets und Mängel)
const SECTION_MOVED = { mg: 'laerm', ersch: 'laerm', wsf: 'gew', beton: 'abf', pers: 'bericht' };

// Umweltbereiche: Abschnitte mit Mängelerfassung, «n. rel.» für den ganzen Abschnitt und Auflagen
const NON_ENV = ['maengel', 'allg', 'bericht', 'gesamt', 'gis'];
for (const s of SCHEMA) s.env = !NON_ENV.includes(s.id);

// Fotofeld in jedem Abschnitt ohne eigenes Fotofeld ergänzen (vor "Bemerkungen")
for (const s of SCHEMA) {
  if (s.noPhotos || s.fields.some(f => f.type === 'photos')) continue;
  const f = { id: s.id + '_fotos', label: 'Fotos', type: 'photos' };
  const last = s.fields[s.fields.length - 1];
  if (last && /_bem$/.test(last.id)) s.fields.splice(s.fields.length - 1, 0, f);
  else s.fields.push(f);
}

// Optionaler Bereich «Auflagen aus Baubewilligung/UVB» am Ende jedes Umweltbereichs
for (const s of SCHEMA) {
  if (s.env) s.fields.push({ id: s.id + '_auflagen', label: 'Auflagen aus Baubewilligung / UVB', type: 'auflagen', keep: true });
}
