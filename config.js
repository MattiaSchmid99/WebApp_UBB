'use strict';
/* =====================================================================
   SharePoint-Anbindung – Werte aus der App-Registrierung (Microsoft Entra ID) eintragen.
   Registrierung: Typ «Single-Page-Application», Redirect-URI = Adresse der App + 'redirect.html',
   delegierte Berechtigung Sites.Selected (mit Admin-Zustimmung) und Schreibrecht der App auf die Site.
   Solange tenantId oder clientId leer sind, ist die Anbindung aus und die App
   funktioniert wie bisher (Speichern über das Teilen-Menü).
   Diese Werte sind keine Geheimnisse; eine Web-App hat kein Client-Secret.
   ===================================================================== */
const SP_CONFIG = {
  tenantId: '',                 // Verzeichnis-ID (Mandanten-ID), z.B. '1a2b3c4d-…'
  clientId: '',                 // Anwendungs-ID (Client-ID) der App-Registrierung
  siteHost: '',                 // SharePoint-Host, z.B. 'firma.sharepoint.com'
  sitePath: '',                 // Pfad der Site, z.B. '/sites/UBB'
  library: '',                  // Name der Dokumentbibliothek; leer = Standardbibliothek («Dokumente»)
  rootFolder: 'UBB-Begehungen', // Hauptordner in der Bibliothek
  listName: 'UBB-Pendenzen',    // SharePoint-Liste für Pendenzen, Auflagen, Proben, Neophyten; leer = keine Liste
  scopes: ['https://graph.microsoft.com/Sites.Selected'], // Berechtigung (delegiert)
};
