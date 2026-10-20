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
- Die Layer stammen aus der «GIS Umweltübersicht» (Datei `gis-layers.js`): 43 Layer von Bund und geodienste.ch für alle Kantone, dazu 156 kantonale Layer. Der Kanton wird am Standort erkannt; seine Layer erscheinen dann in der Liste.
- Layerliste anpassen: `gis-layers.js`.

## 6. Logo

`afry-logo.png` (schwarz, für das PDF) und `afry-logo-white.png` (weiss, für die Kopfzeile der App) sind enthalten. Fehlen sie, steht stattdessen der Schriftzug «AFRY».

## 7. Anpassen

- **Fragen, Optionen, Abschnitte:** in `schema.js`. Labels und Optionen frei änderbar. Die `id` eines bestehenden Feldes nicht ändern.
- **PDF-Layout:** Funktion `buildPdf` in `app.js`. Schrift Helvetica 10 pt (PDF-Standardschrift, entspricht Arial in Form und Laufweite).
- **GIS-Layer:** `gis-layers.js`.
- **Nach jeder Änderung** in `sw.js` die Zeile `const VERSION = 'ubb-v4';` hochzählen (`ubb-v5` …) und die geänderten Dateien erneut auf GitHub hochladen. Die Smartphones laden die neue Version beim nächsten Öffnen mit Netz (evtl. App zweimal öffnen).

## Dateien

| Datei | Zweck |
|---|---|
| index.html | Oberfläche |
| schema.js | Formularstruktur (Abschnitte, Fragen, Optionen) |
| app.js | Logik: Speichern, Fotos, Presets, PDF, Teilen |
| gis.js | GIS-Lagekontrolle (GPS, Kanton, Kartenbild) |
| gis-layers.js | Layerliste aus der GIS Umweltübersicht |
| afry-logo.png, afry-logo-white.png | Logo |
| jspdf.umd.min.js | PDF-Bibliothek (jsPDF, MIT-Lizenz) |
| sw.js | Offline-Funktion |
| manifest.webmanifest, icon-*.png | App-Symbol und Name auf dem Home-Bildschirm |
