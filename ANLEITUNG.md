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

## 3i. Bodenfeuchte (ab Version 20)

- Unter «Wetter» steht das Feld **Bodenfeuchte (Saugspannung)**. Es wird beim Start eines Protokolls automatisch gefüllt; «Bodenwerte abrufen» aktualisiert.
- Quellen: **bodenmessnetz.ch** (Meteotest; SO, BL, AG, ZG, FR, GE, VD, BE, GR, GL, VS) **Bodenfeuchte Ostschweiz** (ZH, TG, UR) und **Messdaten Kanton Luzern** (6 Stationen). Verwendet wird die nächste Station mit aktuellen Werten (automatische Stationen: letzte 48 h, manuelle Stationen: letzte 4 Tage, im Text als «manuelle Messung» markiert).
- Im Text: Saugspannung in 20/35/(60) cm, Niederschlag der letzten 24 h, Station, Distanz und Messzeit, darunter die **Beurteilung** wie auf bodenmessnetz.ch: massgebend ist die Saugspannung in 35 cm; eigene Zeile für schwere Böden (Ton > 30 %), wenn sie abweicht; Warnung bei über 10 mm Niederschlag in 24 h. Nomogramm und Bodenart vor Ort beachten.
- Der Link «Details» öffnet die Station auf bodenmessnetz.ch.
- Nidwalden (Stans) und Schwyz (Oberarth, Siebnen) haben keine offene Datenschnittstelle: Ist eine dieser Stationen näher, steht unter dem Feld ein Hinweis mit Link. Tessin ist noch nicht angebunden. Distanz zur Station immer prüfen.

## 3h. Projektauswahl und Ablage (ab Version 16)

- **Projekt wählen** (nur mit SharePoint): Bei «Projektnr. und Ort» zeigt ein Dropdown alle Projektordner in SharePoint (`UBB-Begehungen/<Projekt>/`). Projekt wählen → das Feld wird ausgefüllt und die offenen Pendenzen der letzten Begehung dieses Projekts werden übernommen (falls noch keine übernommen sind). «↻» lädt die Liste neu. Ohne Netz zeigt die App die zuletzt geladene Liste.
- **+ Neues Projekt …** (im Dropdown): Projektnr. und Ort eingeben → der Ordner wird sofort in SharePoint angelegt (ohne Netz beim ersten Speichern). Gibt es das Projekt bereits (andere Gross-/Kleinschreibung oder Leerzeichen), wählt die App den vorhandenen Ordner, statt einen zweiten anzulegen.
- **Von Hand eintippen** geht weiterhin. Der Hinweis unter dem Feld zeigt, ob der Projektordner existiert («✓ Projektordner in SharePoint») oder beim Speichern neu angelegt wird. Eine abweichende Schreibweise eines vorhandenen Projekts wird nach der Eingabe auf den Ordnernamen korrigiert.
- **Ablage:** pro Projekt ein Ordner, darin pro Begehung ein Unterordner mit Begehungsdatei (JSON), PDF und Fotos. Der Ordnername entspricht «Projektnr. und Ort» (in SharePoint unzulässige Zeichen wie `: / ? * " < > | # %` werden durch Leerzeichen ersetzt).
- **Aus SharePoint öffnen** öffnet direkt das Projekt der offenen Begehung; «← Alle Projekte» zeigt alle.
- **Kein CSV mehr pro Begehung.** Gespeichert werden Begehungsdatei, PDF und Fotos. Die Sammel-CSV wird bei Bedarf aus den Begehungsdateien erzeugt (siehe 3e bzw. «Sammel-CSV für dieses Projekt» in SharePoint). «Bestehende Sammel-CSV ergänzen» entfällt.

## 3g. Pendenzen (ab Version 15)

- **«Mängel» heissen jetzt «Pendenzen»** (Nr. PD1, PD2 …). Erfassen wie bisher bei der jeweiligen Frage mit «+ Pendenz». Zu bekämpfende Neophyten-Bestände (N1, N2 …) gelten ebenfalls als Pendenzen.
- **Abschnitt «Pendenzen aus früheren Begehungen»** (nach «Allgemeine Angaben»): Bei «Neue Begehung» übernimmt die App automatisch die offenen Pendenzen der letzten Begehung mit gleicher «Projektnr. und Ort» – aus SharePoint (wenn angemeldet) und von diesem Gerät, die neuere gilt. Sonst im Abschnitt «Offene Pendenzen der letzten Begehung übernehmen» oder «Andere Begehung wählen …» (auch aus einer Begehungsdatei).
- Pro Pendenz: **erledigt / nicht erledigt**, **Kommentar**, **Fotos**. Angezeigt werden Herkunft (Nr. und Datum der Begehung), Punkt, Massnahme, Verantwortlich, Frist (überfällige orange) und die Fotos bei Erfassung.
- **Weiterführen:** «nicht erledigt» und nicht kontrollierte Pendenzen gehen in die nächste Begehung über, mit Verlauf (z.B. «Kontrolle 13.11.2026: nicht erledigt – Becken weiterhin voll»). Erledigte enden. «×» entfernt eine Pendenz aus der Kontrolle.
- Beim Speichern warnt die App bei Pendenzen ohne «erledigt / nicht erledigt».
- **PDF:** Seite 1 «Pendenzen» mit «Aus früheren Begehungen» (noch offene, mit Ergebnis der Kontrolle; erledigte als Liste) und «Neu». Zusätzlich der Abschnitt «Pendenzen aus früheren Begehungen» mit Status, Kommentar und Fotos.
- **CSV:** Spalten «Pendenzen-Kontrolle: Anzahl / erledigt / nicht erledigt»; die frühere Spalte «Mängel» heisst «Pendenzen».

## 3f. SharePoint (ab Version 14)

Aktiv, sobald `config.js` ausgefüllt ist (siehe 7.). Ohne Einträge in `config.js` funktioniert die App wie bisher.

- **Anmelden:** «Speichern» oder «Begehungen» → «Mit Firmenkonto anmelden». Die Anmeldung inkl. 2FA läuft bei Microsoft; die App sieht kein Passwort. Die Anmeldung bleibt auf dem Gerät gespeichert, bis sie abläuft oder «Abmelden» gedrückt wird.
- **In SharePoint speichern** (im Speichern-Dialog): lädt Begehungsdatei, PDF und alle Fotos/Karten hoch nach
  `UBB-Begehungen/<Projektnr. und Ort>/<Datum>_<Art>_<Kennung>/` (Fotos im Unterordner `Fotos`). Erneutes Speichern überschreibt im gleichen Ordner, auch nach Änderung von Datum oder Art.
- **Ohne Netz:** Die Begehung wird vorgemerkt («Wartet auf Upload») und automatisch hochgeladen, sobald wieder Netz da ist und die App offen ist. Ist die Anmeldung abgelaufen, erscheint ein Hinweis; nach dem Anmelden wird nachgeholt.
- **Status:** In «Begehungen» steht pro Begehung «✓ In SharePoint gespeichert», «Wartet auf Upload» oder «Geändert seit dem letzten Upload». Der orange Punkt auf «Speichern» verschwindet nach dem Upload.
- **Aus SharePoint öffnen** («Begehungen»): Projekt → Begehung → «Öffnen». So kann eine Begehung auf einem anderen Gerät weiterbearbeitet werden.
- **Sammel-CSV für ein Projekt:** «Aus SharePoint öffnen» → Projekt → «Sammel-CSV für dieses Projekt». Die beiden CSV-Dateien lassen sich direkt in den Projektordner speichern.
- **Presets zentral:** «Presets» → «Presets in SharePoint speichern» bzw. «… laden» (Datei `UBB-Begehungen/_Presets/UBB-Presets.json`).
- **Liste «UBB-Pendenzen»** (optional): Pendenzen, Auflagen, Proben und Neophyten-Bestände werden als Listeneinträge geführt (eine Zeile pro Eintrag, mit Projekt, Frist, Verantwortlich, Koordinaten, Ordner). Ein in SharePoint nachgeführter **Status** (z.B. «erledigt») wird beim erneuten Hochladen nicht überschrieben. Wird eine übernommene Pendenz in einer späteren Begehung kontrolliert, führt die App Status («erledigt» bzw. «offen»), Datum und Kommentar der Kontrolle beim ursprünglichen Listeneintrag nach. Fehlt die Liste und darf die App sie nicht anlegen, werden die Dateien trotzdem hochgeladen; die App meldet dies.
- **Mehrere Personen an derselben Begehung:** Wurde die Begehung in SharePoint inzwischen von jemand anderem gespeichert, fragt die App vor dem Überschreiben nach (OK = eigener Stand, Abbrechen = nicht hochladen; den SharePoint-Stand über «Aus SharePoint öffnen» ansehen). Automatische Uploads im Hintergrund überschreiben in diesem Fall nie, sondern melden den Konflikt.
- Die Dateien selbst speichern (OneDrive, Herunterladen) bleibt als Alternative im gleichen Dialog.

## 3e. Daten sichern (ab Version 13) – wichtig

**Grundsatz:** Die **Begehungsdatei** ist das Original. Sie enthält sämtliche Daten (alle Antworten, Pendenzen inkl. Kontrolle, Auflagen, Proben, Neophyten, GPS-Werte, Fotos mit Beschriftung, Karten, Unterschrift) und kann jederzeit wieder in der App geöffnet, angepasst und neu als PDF/CSV ausgegeben werden. PDF und CSV sind Ausgaben daraus.

**Unten in der App:** «Begehungen» · «Presets» · «Speichern».

- **Speichern** erstellt zwei Dateien mit gleichem Namen:
  - `….ubb.json` – Begehungsdatei. Auf Android heisst sie `….ubb.txt`, weil Chrome, Edge und Samsung Internet keine .json-Dateien teilen; der Inhalt ist identisch und die App öffnet beide.
  - `….pdf` – Protokoll
  «Alle 2 Dateien in OneDrive speichern» → Projektordner wählen. Zusätzlich: «Fotos und Karten als Bilder speichern» (JPG mit sprechenden Namen, z.B. `PD1_…`, `P2_…`, `N3_…`). Ein CSV pro Begehung gibt es ab Version 16 nicht mehr.
- Ein **oranger Punkt** auf «Speichern» zeigt: Es gibt Änderungen, die noch nicht als Begehungsdatei gespeichert sind.
- **Begehungen:** Alle Begehungen bleiben auf dem Gerät, bis sie gelöscht werden. «Neue Begehung» verwirft nichts mehr. Pro Begehung steht, ob die Begehungsdatei aktuell gespeichert ist. Beim Löschen einer nicht gespeicherten Begehung warnt die App deutlich. Leere bzw. unbearbeitete neue Begehungen räumt die App beim Wechsel selbst weg.
- **Begehungsdatei öffnen:** Datei aus OneDrive wählen → die Begehung wird geöffnet (bzw. ersetzt die gleiche Begehung auf dem Gerät nach Rückfrage). So lassen sich Begehungen nachträglich anpassen, auch auf einem anderen Gerät.
- **Sammel-CSV aus Begehungsdateien:** mehrere Begehungsdateien wählen → die App erstellt neu
  - `UBB-Begehungen_<Projekt>.csv` – eine Zeile pro Begehung
  - `UBB-Pendenzen-Auflagen-Proben_<Projekt>.csv` – eine Zeile pro Pendenz, Pendenzen-Kontrolle, Auflage, Probe und Neophyten-Bestand (mit Typ, Nr., Bereich, Massnahme, Verantwortlich, Frist, Status, Koordinaten)
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
  - *Luft und Lärm*: Lärm · Luftreinhaltung – Maschinen und Geräte (M+G) (Erschütterungen ab Version 17 entfernt)
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
1. Eine Person: **Presets → Presets exportieren** → OneDrive → gemeinsamen Ordner wählen (z.B. `UBB/Presets`). Die Datei heisst `UBB-Presets_<Datum>.json` (auf Android `.txt`).
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
- Die Layer stammen aus der «GIS Umweltübersicht» (Datei `gis-layers.js`), ab Version 18 reduziert auf: Planerischer Gewässerschutz, Gewässerraum, Fruchtfolgeflächen, Kataster der belasteten Standorte (Kantone und Bund), Amtliche Vermessung – Bodenbedeckung, Statische Waldgrenzen, Auengebiete, Hoch- und Flachmoore, Amphibienlaichgebiete, TWW (11 Layer für alle Kantone) sowie kantonal Waldareal, Archäologie, kantonale Naturschutz-Inventare und Prüfperimeter Bodenverschiebungen (88 Layer). Der Kanton wird am Standort erkannt; seine Layer erscheinen dann in der Liste.
- Layerliste anpassen: `gis-layers.js`.

## 6. Logo

`afry-logo.png` (schwarz, für das PDF) und `afry-logo-white.png` (weiss, für die Kopfzeile der App) sind enthalten. Fehlen sie, steht stattdessen der Schriftzug «AFRY».

## 7. Anpassen

- **Fragen, Optionen, Abschnitte:** in `schema.js`. Labels und Optionen frei änderbar. Die `id` eines bestehenden Feldes nicht ändern.
- **PDF-Layout:** Funktion `buildPdf` in `app.js`. Schrift Helvetica 10 pt (PDF-Standardschrift, entspricht Arial in Form und Laufweite).
- **GIS-Layer:** `gis-layers.js`.
- **SharePoint (`config.js`):** `tenantId`, `clientId` (aus der App-Registrierung der IT), `siteHost` (z.B. `firma.sharepoint.com`), `sitePath` (z.B. `/sites/UBB`), optional `library` (leer = Standard-Dokumentbibliothek), `rootFolder`, `listName` (leer = keine Liste). Die Werte sind keine Geheimnisse. Leer lassen = SharePoint aus.
- **Nach jeder Änderung** in `sw.js` die Zeile `const VERSION = 'ubb-v20';` hochzählen (`ubb-v21` …), in `index.html` bei allen `<script src="…?v=20">` die Zahl erhöhen und in `app.js` `APP_VERSION` anpassen. Die Version steht unten in der App und in den PDF-Eigenschaften. Danach die geänderten Dateien erneut auf GitHub hochladen. Die Smartphones laden die neue Version beim nächsten Öffnen mit Netz (evtl. App zweimal öffnen).

## Dateien

| Datei | Zweck |
|---|---|
| index.html | Oberfläche |
| schema.js | Formularstruktur (Abschnitte, Fragen, Optionen) |
| app.js | Logik: Speichern, Fotos, Presets, PDF, Teilen |
| features.js | Pendenzen, Auflagen, Unterschrift, Wetter, Bodenfeuchte, Pflichtfelder, Abschnitt n. rel., Kamera |
| export.js | CSV-Spalten einer Begehung (für die Sammel-CSV) |
| archive.js | Begehungen auf dem Gerät, Begehungsdatei, Speichern, Sammel-CSV aus Begehungsdateien |
| gis.js | GIS-Lagekontrolle (GPS, Kanton, Kartenbild) |
| gis-layers.js | Layerliste aus der GIS Umweltübersicht |
| pendenzen.js | Pendenzen aus früheren Begehungen (Übernahme, Kontrolle) |
| sp.js | SharePoint: Anmeldung, Projektauswahl, Upload, Warteschlange, Öffnen, Sammel-CSV, Presets, Liste |
| config.js | SharePoint-Einstellungen (leer = aus) |
| redirect.html | Rückkehrseite nach der Microsoft-Anmeldung |
| msal-browser.min.js, msal-redirect-bridge.min.js | Microsoft-Anmeldebibliothek (MSAL.js, MIT-Lizenz, LICENSE-msal.txt) |
| afry-logo.png, afry-logo-white.png | Logo |
| jspdf.umd.min.js | PDF-Bibliothek (jsPDF, MIT-Lizenz) |
| sw.js | Offline-Funktion |
| manifest.webmanifest, icon-*.png | App-Symbol und Name auf dem Home-Bildschirm |
