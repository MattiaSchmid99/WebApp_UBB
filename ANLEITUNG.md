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
- **Neu** startet ein leeres Protokoll. Mit «Projektdaten übernehmen» bleiben Projekt, Bauvorhaben, Art Baustelle, Bauleitung, Schutzgebiet und KbS erhalten (praktisch für Folgebegehungen). Name und Kürzel werden immer übernommen.
- Es gibt immer nur einen offenen Entwurf. Vor «Neu» das PDF speichern.
- Browserdaten löschen bzw. die Home-Bildschirm-App entfernen löscht den offenen Entwurf.

## 4. Anpassen

- **Fragen, Optionen, Abschnitte:** in `schema.js`. Labels und Optionen frei änderbar. Die `id` eines bestehenden Feldes nicht ändern.
- **PDF-Layout:** Funktion `buildPdf` in `app.js`.
- **Nach jeder Änderung** in `sw.js` die Zeile `const VERSION = 'ubb-v1';` hochzählen (`ubb-v2` …) und die geänderten Dateien erneut auf GitHub hochladen. Die Smartphones laden die neue Version beim nächsten Öffnen mit Netz (evtl. App zweimal öffnen).

## Dateien

| Datei | Zweck |
|---|---|
| index.html | Oberfläche |
| schema.js | Formularstruktur (Abschnitte, Fragen, Optionen) |
| app.js | Logik: Speichern, Fotos, PDF, Teilen |
| jspdf.umd.min.js | PDF-Bibliothek (jsPDF, MIT-Lizenz) |
| sw.js | Offline-Funktion |
| manifest.webmanifest, icon-*.png | App-Symbol und Name auf dem Home-Bildschirm |
