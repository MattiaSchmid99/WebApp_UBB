# UBB Begehungsprotokoll – Web-App

## 1. Online stellen (GitHub Pages, kostenlos, einmalig ca. 10 Min.)

1. Auf https://github.com ein Konto erstellen (z.B. ein Team-Konto).
2. Oben rechts **+ → New repository**. Name z.B. `ubb-begehung`, Sichtbarkeit **Public**, **Create repository**.
3. Auf der leeren Repository-Seite **uploading an existing file** wählen.
4. Alle Dateien aus diesem Ordner hineinziehen (die Dateien, nicht den Ordner) → **Commit changes**.
5. **Settings → Pages**. Unter «Build and deployment»: Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → **Save**.
6. Nach 1–2 Minuten ist die App erreichbar unter `https://<kontoname>.github.io/ubb-begehung/`.

Hinweis: Bei «Public» ist nur der Programmcode öffentlich. Protokolldaten und Fotos verlassen das Smartphone nie, ausser beim Speichern des PDF.

Alternative: https://app.netlify.com/drop – Ordner hineinziehen (Konto nötig, damit die Seite bestehen bleibt).

## 2. Auf dem Smartphone einrichten

- **iPhone (Safari):** Link öffnen → Teilen-Symbol → **Zum Home-Bildschirm**.
- **Android (Chrome):** Link öffnen → Menü ⋮ → **App installieren** bzw. **Zum Startbildschirm hinzufügen**.

Danach die App immer über das Symbol auf dem Home-Bildschirm öffnen. Auf dem iPhone hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari: Ein Entwurf aus Safari ist dort nicht sichtbar und umgekehrt.

Nach dem ersten Öffnen funktioniert die App auch ohne Netz.

## 3. Verwendung

- Eingaben werden laufend auf dem Gerät gespeichert («Gespeichert ✓»). Die App kann jederzeit geschlossen werden.
- Auswahl erneut antippen = Auswahl aufheben.
- Unterfragen («Falls ja …») erscheinen erst bei «Ja».
- pH-Werte ausserhalb 6.5–9.0 werden rot markiert und im PDF vermerkt.
- **PDF erstellen** → **In OneDrive speichern / Teilen** → OneDrive wählen → Ordner wählen. Im PDF erscheinen nur ausgefüllte Felder und Abschnitte.
- **Neu** startet ein neues Protokoll. Auswahl «Vorausfüllen mit»:
  - *Projektdaten aus aktuellem Protokoll*: Projekt, Bauvorhaben, Art Baustelle, Bauleitung, Schutzgebiet und KbS bleiben erhalten.
  - *Leer*: nur Name und Kürzel (werden immer übernommen).
  - *Preset: …*: füllt die im Preset gespeicherten Felder.
- Es gibt immer nur einen offenen Entwurf. Vor «Neu» das PDF speichern.
- Browserdaten löschen bzw. die Home-Bildschirm-App entfernen löscht den offenen Entwurf.

## 3e. Daten sichern (ab Version 13) – wichtig

**Grundsatz:** Die **Begehungsdatei** ist das Original. Sie enthält sämtliche Daten (alle Antworten, Mängel, Auflagen, Proben, Neophyten, GPS-Werte, Fotos mit Beschriftung, Karten, Unterschrift) und kann jederzeit wieder in der App geöffnet, angepasst und neu als PDF/CSV ausgegeben werden. PDF und CSV sind Ausgaben daraus.

**Unten in der App:** «Begehungen» · «Presets» · «Speichern».

- **Speichern** erstellt drei Dateien mit gleichem Namen:
  - `….ubb.json` – Begehungsdatei. Auf Android heisst sie `….ubb.txt`, weil Android im Teilen-Menü keine .json-Dateien zulässt; der Inhalt ist identisch.
  - `….pdf` – Protokoll
  - `….csv` – diese Begehung als eine Zeile
  «Alle 3 Dateien in OneDrive speichern» → Projektordner wählen. Zusätzlich: «Fotos und Karten als Bilder speichern» (JPG mit sprechenden Namen, z.B. `M1_…`, `P2_…`, `N3_…`) und «Bestehende Sammel-CSV ergänzen».
- Ein **oranger Punkt** auf «Speichern» zeigt: Es gibt Änderungen, die noch nicht als Begehungsdatei gespeichert sind.
- **Begehungen:** Alle Begehungen bleiben auf dem Gerät, bis sie gelöscht werden. «Neue Begehung» verwirft nichts mehr. Pro Begehung steht, ob die Begehungsdatei aktuell gespeichert ist. Beim Löschen einer nicht gespeicherten Begehung warnt die App deutlich. Leere bzw. unbearbeitete neue Begehungen räumt die App beim Wechsel selbst weg.
- **Begehungsdatei öffnen:** Datei aus OneDrive wählen → die Begehung wird geöffnet (bzw. ersetzt die gleiche Begehung auf dem Gerät nach Rückfrage). So lassen sich Begehungen nachträglich anpassen, auch auf einem anderen Gerät.
- **Sammel-CSV aus Begehungsdateien:** mehrere Begehungsdateien wählen → die App erstellt neu
  - `UBB-Begehungen_<Projekt>.csv` – eine Zeile pro Begehung
  - `UBB-Massnahmen-Proben-Neophyten_<Projekt>.csv` – eine Zeile pro Mangel, Auflage, Probe und Neophyten-Bestand (mit Typ, Nr., Bereich, Massnahme, Verantwortlich, Frist, Status, Koordinaten)
  Die CSV-Dateien lassen sich so jederzeit vollständig neu erzeugen; das Ergänzen einer bestehenden CSV ist nicht mehr nötig.
- **Weiterverarbeitung:** Die Begehungsdatei ist JSON. Sie enthält zusätzlich einen Teil «uebersicht» mit den gleichen Spalten wie die CSV, z.B. für Excel Power Query.

**Grenze:** Das Speichern in OneDrive bleibt ein manueller Schritt. Erst danach ist eine Begehung ausserhalb des Smartphones gesichert.

## 3d. Neu in Version 11

- **Invasive Neophyten** (Bereich «Umweltgefährdende Organismen», bei «Gibt es Neophyten …?» = Ja): «+ Bestand hinzufügen» legt einen Bestand an und bestimmt den Standort per GPS. Pro Bestand: Art aus FrSV Anhang 2.1 (Umgang verboten, 22 Arten/Gruppen) oder 2.2 (Inverkehrbringen verboten, 31 Arten) bzw. «Andere Art», Foto, Standort, Massnahme «Bekämpfen Ja/Nein» (bei Ja mit Verantwortlich und Frist), Bemerkung.
- **Übersichtskarte Neophytenstandorte** (ab Version 12): Beim Erstellen des PDF erzeugt die App automatisch eine Karte mit allen Beständen mit Standort (Nummern wie in der Tabelle, rot = bekämpfen, weiss = nicht zu bekämpfen/offen). Der Massstab richtet sich nach der Ausdehnung (1:500 bis 1:100'000). Braucht Internet; ohne Netz steht im PDF ein Hinweis. Die Karte wird im Entwurf gespeichert und offline wiederverwendet, solange sich Standorte und Massnahmen nicht ändern.
- Zu bekämpfende Bestände erscheinen in der Mängelliste der App und in der Massnahmenliste auf Seite 1 des PDF (Nr. N1, N2 …), in der Zusammenfassung und im CSV.
- Die Fragen zu schützenswerten Biotopen und zu offenen Gruben/Schächten stehen neu unter «Flora, Fauna, Lebensräume». Die frühere, fast gleiche Frage «Bestehen Fallen für Kleintiere?» ist darin aufgegangen.
- Bestehende Entwürfe: Die frühere Auswahl «Welche Neophyten-Arten?» wird in Bestände übernommen (ohne Foto und Standort). Die CSV-Spalten der verschobenen Fragen bleiben gleich.
- Grundlage der Artenliste: FrSV (SR 814.911) Anhang 2, Fassung ab 1.9.2024. Bei Änderungen der Verordnung die Liste `NEOPHYTEN` in `schema.js` anpassen.

## 3c. Neu in Version 10

- **Bereiche zusammengelegt** (mit Zwischentiteln):
  - *Luft und Lärm*: Lärm · Luftreinhaltung – Maschinen und Geräte (M+G) · Erschütterungen und Körperschall
  - *Gewässerschutz und Entwässerung*: Entwässerung · Wassergefährdende Stoffe und Flüssigkeiten (WSF)
  - *Abfälle, umweltgefährdende Stoffe*: Abfälle · Betonumschlag
- **Materialbeprobungen** (neuer Bereich nach Abfälle): «+ Beprobung hinzufügen» legt eine Probe an und bestimmt die Position per GPS. Pro Probe: Bezeichnung, Datum, probenehmende Person (vorausgefüllt), Materialtyp (Aushub, Ausbruch, Unterboden, Oberboden, Baustoffe, Ausbruchasphalt, Baustellenabwasser), Position (GPS, neu bestimmen oder manuell LV95), Fotos, Bemerkung. Im PDF als Tabelle mit Fotos, im CSV als Spalten «Anzahl Proben» und «Proben».
- **Personalinstruktion / Umweltschulung** entfernt.
- Bestehende Entwürfe und Presets werden übernommen: Antworten bleiben erhalten, Auflagen und Mängel der früheren Abschnitte wandern in den neuen Bereich. Die CSV-Spalten heissen gleich wie bisher, bestehende Sammel-CSV können weiter ergänzt werden.

## 3b. Neu in Version 9

- **CSV-Export** (Knopf «CSV» unten): eine Zeile pro Begehung, eine Spalte pro Feld, für die Auswertung in Excel.
  - Erste Begehung eines Projekts: «Neue CSV-Datei erstellen» → in OneDrive im Projektordner speichern (Name `UBB-Begehungen_<Projekt>.csv`).
  - Weitere Begehungen: «Bestehende CSV-Datei ergänzen» → die Sammel-CSV aus OneDrive wählen → die App hängt die Begehung als Zeile an → Datei unter dem gleichen Namen wieder in OneDrive speichern und die alte ersetzen.
  - Wird dieselbe Begehung nochmals exportiert, ersetzt die App ihre Zeile (erkannt an der Spalte «Protokoll-ID»), statt sie doppelt anzuhängen.
  - Neue Felder späterer App-Versionen werden als zusätzliche Spalten angehängt; bestehende Spalten bleiben.
  - Format: UTF-8, Semikolon. Öffnen in Excel per Doppelklick.
- **Kamera in der App**: «Kamera» öffnet ein Live-Bild mit Auslöser direkt in der App, mehrere Fotos nacheinander möglich, «Fertig» übernimmt sie. Beim ersten Mal fragt der Browser nach der Kamera-Berechtigung. Wird sie verweigert, öffnet sich stattdessen die Kamera-App des Systems.
- **Mängelliste** als erste Karte der App und als erste Tabelle im PDF.
- **GIS-Karten** im Stil der Kartenblätter der GIS Umweltübersicht: Blattkopf, Hintergrund mit 60 % Sättigung, Nordpfeil, Massstabsbalken, Übersichtskarte, Legende und Quellen. Layerliste ohne Lärm, Luft, NIS und Naturgefahren.

## 3a. Neu in Version 7

- **Pflichtfelder** (mit * markiert): Datum, Projekt, UBB-Person, Art der Begehung. Fehlt eines, warnt die App vor dem PDF.
- **Wetter** wird beim Start eines neuen Protokolls automatisch abgerufen: Messwerte der nächsten MeteoSchweiz-Station (SwissMetNet, offene Daten): Temperatur, Feuchte, Wind, Niederschlag der letzten 24 h, tagsüber Sonnenscheindauer der letzten Stunde. Station und Distanz stehen im Text. Bewölkung bei Bedarf von Hand ergänzen. Knopf «Wetter abrufen» aktualisiert.
- **Verteiler** und **Kenntnisnahme Bauleitung** (Name + Unterschrift mit dem Finger) in den Allgemeinen Angaben. Die Unterschrift erscheint am Schluss des PDF.
- **Abschnitt nicht relevant**: oben in jedem Umweltbereich. Der Abschnitt wird ausgeblendet und im PDF nur in der Zusammenfassung aufgeführt. «Offene Fragen: n. rel.» setzt alle noch leeren Ja/Nein/n. rel.-Fragen auf «n. rel.».
- **Mängel**: bei jeder Frage «+ Mangel» → Beschreibung, Massnahme, Verantwortlich, Frist, Fotos. Die Mängel werden nummeriert (M1, M2 …) und erscheinen im Abschnitt, in der Massnahmenliste unter «Gesamteindruck» und auf Seite 1 des PDF.
- **Auflagen aus Baubewilligung / UVB**: aufklappbarer Bereich am Ende jedes Umweltbereichs. Auflagen erfassen, Herkunft und Status (erfüllt, nicht erfüllt, offen, n. rel.) setzen. Auflagen gehören zu den Projektdaten: Sie werden bei «Neu → Projektdaten übernehmen» und in Presets mitgenommen, der Status wird dabei zurückgesetzt. Nicht erfüllte Auflagen erscheinen in der Massnahmenliste.
- **Zusammenfassung auf Seite 1** des PDF: Gesamtbeurteilung, Eindruck, Umweltvorfall, Anzahl Mängel, nicht relevante Bereiche, Massnahmenliste mit Fristen.
- **Umweltvorfall**: bei «Ja» Ereignisprotokoll mit Was, Wann, Sofortmassnahmen, Gemeldet an, Meldezeit, Fotos.
- **Fotos**: «Kamera» öffnet direkt die Kamera, «Aus Galerie» wählt vorhandene Bilder.

## 4. Presets (z.B. pro Projekt)

Ein Preset füllt ausgewählte Felder vor: Projektnummer, Bauleitung, Schutzzonen, Massnahmenstufen, bekannte Neophyten usw.

**Preset anlegen**
1. Die gleichbleibenden Felder ausfüllen.
2. **Presets → Aktuelle Angaben als Preset speichern**.
3. Namen eingeben (z.B. Projektnummer) und pro Feld wählen, ob es zum Preset gehört.
4. Gleicher Name wie ein bestehendes Preset = überschreiben. Die bisherige Feldauswahl wird dabei vorausgewählt.

**Verwenden:** **Neu** → «Vorausfüllen mit» → Preset wählen. Oder im laufenden Protokoll **Presets → Anwenden** (überschreibt nur die Felder des Presets).

**Im Team teilen über OneDrive**
1. Eine Person: **Presets → Presets exportieren** → OneDrive → gemeinsamen Ordner wählen (z.B. `UBB/Presets`). Die Datei heisst `UBB-Presets_<Datum>.json` (bei manchen Android-Geräten `.txt`).
2. Alle anderen: **Presets → Presets importieren** → OneDrive → Datei wählen.
3. Beim Import werden Presets mit gleichem Namen aktualisiert, neue ergänzt. Lokal gelöschte oder nur lokal vorhandene Presets bleiben unberührt.

Empfehlung: Eine Person pflegt die Preset-Datei und exportiert nach Änderungen neu. Die anderen importieren die neueste Datei.

Die Presets liegen nur auf dem Gerät und in eurem OneDrive, nicht auf GitHub.

## 5. GIS-Lagekontrolle (letzter Abschnitt)

1. Layer, Hintergrund (Landeskarte farbig/grau, Luftbild) und Massstab wählen.
2. **Position bestimmen und Karte laden**. Beim ersten Mal den Standortzugriff erlauben. Ohne GPS: «Koordinaten manuell eingeben» (LV95) öffnen und E/N eintragen.
3. Die Vorschau zeigt den Standort (rotes Fadenkreuz, gestrichelter Kreis = GPS-Genauigkeit) auf dem Layer. Bei Bundesinventaren steht darunter, welche Objekte am Standort liegen.
4. Optional eine Bemerkung eintragen → **Zum Bericht hinzufügen**. Mehrere Karten möglich.

Im PDF erscheint jede Karte in voller Breite (180 mm). Der Massstab stimmt beim Druck auf A4 mit 100 %. Darunter stehen Layer, Koordinaten, Genauigkeit, Zeit, Objekte am Standort, Bemerkung und, wenn der Kartendienst sie liefert, die Legende.

Hinweise:
- Die Karte braucht Internet. Die Position muss in der Schweiz liegen.
- GPS-Genauigkeit im Wald oder zwischen Gebäuden oft ±10–30 m. Für Waldabstände (2 m) ist die Karte nur ein Hinweis, keine Messung.
- Die Amtliche Vermessung (Bodenbedeckung) ist nur bis ca. 1:10'000 lesbar.
- Lädt ein kantonaler Dienst nicht (Meldung unter dem Knopf), erscheint nur Hintergrund und Standort. Grund ist meist, dass der Server die Übernahme ins Bild nicht erlaubt.
- Die Layer stammen aus der «GIS Umweltübersicht» (Datei `gis-layers.js`): 31 Layer von Bund und geodienste.ch für alle Kantone, dazu 144 kantonale Layer (ohne Lärm, Luft, NIS und Naturgefahren). Der Kanton wird am Standort erkannt; seine Layer erscheinen dann in der Liste.
- Layerliste anpassen: `gis-layers.js`.

## 6. Logo

`afry-logo.png` (schwarz, für das PDF) und `afry-logo-white.png` (weiss, für die Kopfzeile der App) sind enthalten. Fehlen sie, steht stattdessen der Schriftzug «AFRY».

## 7. Anpassen

- **Fragen, Optionen, Abschnitte:** in `schema.js`. Labels und Optionen frei änderbar. Die `id` eines bestehenden Feldes nicht ändern.
- **PDF-Layout:** Funktion `buildPdf` in `app.js`. Schrift Helvetica 10 pt (PDF-Standardschrift, entspricht Arial in Form und Laufweite).
- **GIS-Layer:** `gis-layers.js`.
- **Nach jeder Änderung** in `sw.js` die Zeile `const VERSION = 'ubb-v13';` hochzählen (`ubb-v14` …), in `index.html` bei allen `<script src="…?v=13">` die Zahl erhöhen und in `app.js` `APP_VERSION` anpassen. Die Version steht unten in der App und in den PDF-Eigenschaften. und die geänderten Dateien erneut auf GitHub hochladen. Die Smartphones laden die neue Version beim nächsten Öffnen mit Netz (evtl. App zweimal öffnen).

## Dateien

| Datei | Zweck |
|---|---|
| index.html | Oberfläche |
| schema.js | Formularstruktur (Abschnitte, Fragen, Optionen) |
| app.js | Logik: Speichern, Fotos, Presets, PDF, Teilen |
| features.js | Mängel, Auflagen, Unterschrift, Wetter, Pflichtfelder, Abschnitt n. rel., Kamera |
| export.js | CSV-Zeile und Ergänzen einer Sammel-CSV |
| archive.js | Begehungen auf dem Gerät, Begehungsdatei, Speichern, Sammel-CSV aus Begehungsdateien |
| gis.js | GIS-Lagekontrolle (GPS, Kanton, Kartenbild) |
| gis-layers.js | Layerliste aus der GIS Umweltübersicht |
| afry-logo.png, afry-logo-white.png | Logo |
| jspdf.umd.min.js | PDF-Bibliothek (jsPDF, MIT-Lizenz) |
| sw.js | Offline-Funktion |
| manifest.webmanifest, icon-*.png | App-Symbol und Name auf dem Home-Bildschirm |
