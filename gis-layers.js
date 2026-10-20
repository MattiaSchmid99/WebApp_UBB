'use strict';
/* Layerliste übernommen aus «GIS Umweltübersicht» (Konfigurationsstand _v 11, 20.10.2026).
   GIS_NATIONAL: Bund (geo.admin.ch) und harmonisierte kantonale Daten (geodienste.ch), gültig für alle Kantone.
   GIS_CANTONAL: kantonale Dienste je Kanton. Bei Änderungen in der GIS Umweltübersicht hier nachführen. */
const GIS_NATIONAL = [
 {
  "group": "Lärm, Luft, NIS",
  "label": "Lärmempfindlichkeitsstufen (in Nutzungszonen)",
  "src": [
   {
    "url": "https://geodienste.ch/db/npl_laermempfindlichkeitsstufen_v1_2_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_les"
 },
 {
  "group": "Lärm, Luft, NIS",
  "label": "Strassenverkehrslärm Tag (Lr)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.laerm-strassenlaerm_tag"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.laerm-strassenlaerm_tag",
  "id": "b_strl"
 },
 {
  "group": "Lärm, Luft, NIS",
  "label": "Eisenbahnlärm Tag (Lr)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.laerm-bahnlaerm_tag"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.laerm-bahnlaerm_tag",
  "id": "b_bahnl"
 },
 {
  "group": "Lärm, Luft, NIS",
  "label": "Stickstoffdioxid NO₂ (Jahresmittel)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.luftreinhaltung-stickstoffdioxid"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.luftreinhaltung-stickstoffdioxid",
  "id": "b_no2"
 },
 {
  "group": "Lärm, Luft, NIS",
  "label": "Elektrische Anlagen über 36 kV (Leitungen, Masten, Unterwerke)",
  "src": [
   {
    "url": "https://geodienste.ch/db/elektrische_anlagen_ueber_36kv_v1_0_0/deu",
    "layers": "elektrische_anlagen_ueber_36kv"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_elek"
 },
 {
  "group": "Lärm, Luft, NIS",
  "label": "Mobilfunkanlagen",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bakom.standorte-mobilfunkanlagen"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bakom.standorte-mobilfunkanlagen",
  "id": "b_mobil"
 },
 {
  "group": "Grundwasser, Gewässer",
  "label": "Planerischer Gewässerschutz (Gewässerschutzbereiche, Grundwasserschutzzonen/-areale, Zuströmbereiche)",
  "src": [
   {
    "url": "https://geodienste.ch/db/planerischer_gewaesserschutz_v1_1_1/deu",
    "layers": "daten"
   },
   {
    "url": "https://geodienste.ch/db/planerischer_gewaesserschutz_v1_2_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gws"
 },
 {
  "group": "Grundwasser, Gewässer",
  "label": "Grundwasservorkommen (Grundwasserleiter, Isohypsen)",
  "src": [
   {
    "url": "https://geodienste.ch/db/grundwasservorkommen_v2_0_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gwv"
 },
 {
  "group": "Grundwasser, Gewässer",
  "label": "Gewässerraum (rechtskräftig und laufende Änderungen)",
  "src": [
   {
    "url": "https://geodienste.ch/db/gewaesserraum/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gewr"
 },
 {
  "group": "Grundwasser, Gewässer",
  "label": "Ökomorphologie Stufe F (Abschnitte, Abstürze, Bauwerke)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.oekomorphologie-f_abschnitte,ch.bafu.oekomorphologie-f_abstuerze,ch.bafu.oekomorphologie-f_bauwerke"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.oekomorphologie-f_abschnitte,ch.bafu.oekomorphologie-f_abstuerze,ch.bafu.oekomorphologie-f_bauwerke",
  "id": "b_oeko"
 },
 {
  "group": "Grundwasser, Gewässer",
  "label": "Strategische Revitalisierungsplanung (Zeitfenster Umsetzung)",
  "src": [
   {
    "url": "https://geodienste.ch/db/revitalisierung_fliessgewaesser_v1_2_0/deu",
    "layers": "zeitfenster_geplante_umsetzung"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_revi"
 },
 {
  "group": "Boden, Altlasten, Störfall",
  "label": "Fruchtfolgeflächen",
  "src": [
   {
    "url": "https://geodienste.ch/db/fruchtfolgeflaechen/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_fff"
 },
 {
  "group": "Boden, Altlasten, Störfall",
  "label": "Kataster der belasteten Standorte (Kantone + öV, Militär, zivile Flugplätze)",
  "src": [
   {
    "url": "https://geodienste.ch/db/kataster_belasteter_standorte/deu",
    "layers": "daten"
   },
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bav.kataster-belasteter-standorte-oev,ch.vbs.kataster-belasteter-standorte-militaer,ch.bazl.kataster-belasteter-standorte-zivilflugplaetze"
   }
  ],
  "by": "geodienste.ch",
  "identify": "ch.bav.kataster-belasteter-standorte-oev,ch.vbs.kataster-belasteter-standorte-militaer,ch.bazl.kataster-belasteter-standorte-zivilflugplaetze",
  "id": "gd_kbs"
 },
 {
  "group": "Boden, Altlasten, Störfall",
  "label": "Konsultationsbereiche Nationalstrassen und Rohrleitungen, Eisenbahnstrecken StFV",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.astra.konsultationsbereiche-nationalstrassen,ch.bfe.rohrleitungen-konsultationsbereiche,ch.bav.lage-stoerfallverordnung_eisenbahnanlagen"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.astra.konsultationsbereiche-nationalstrassen,ch.bfe.rohrleitungen-konsultationsbereiche,ch.bav.lage-stoerfallverordnung_eisenbahnanlagen",
  "id": "b_stfv"
 },
 {
  "group": "Wald",
  "label": "Statische Waldgrenzen (Nutzungsplanung)",
  "src": [
   {
    "url": "https://geodienste.ch/db/npl_waldgrenzen_v1_2_0/deu",
    "layers": "waldgrenzen"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_wald"
 },
 {
  "group": "Wald",
  "label": "Waldreservate (rechtskräftig und laufende Änderungen)",
  "src": [
   {
    "url": "https://geodienste.ch/db/waldreservate_v2_0_0/deu",
    "layers": "daten"
   },
   {
    "url": "https://geodienste.ch/db/waldreservate_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_waldr"
 },
 {
  "id": "av_farbe",
  "group": "Wald",
  "label": "Amtliche Vermessung farbig – Bodenbedeckung (bis ca. 1:12'000)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.kantone.cadastralwebmap-farbe"
   }
  ],
  "by": "Kantone / swisstopo",
  "opacity": 1
 },
 {
  "id": "tlm_wald",
  "group": "Wald",
  "label": "swissTLM3D Wald (alle Massstäbe)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.swisstopo.swisstlm3d-wald"
   }
  ],
  "by": "swisstopo",
  "identify": "ch.swisstopo.swisstlm3d-wald"
 },
 {
  "group": "Naturgefahren",
  "label": "Synoptische Gefahrenkarte: höchste Gefahrenstufe aller Prozesse",
  "src": [
   {
    "url": "https://geodienste.ch/db/gefahrenkarten_v1_3_0/deu",
    "layers": "synoptisches_gefahrenhinweisgebiet,synoptisches_gefahrengebiet"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gef"
 },
 {
  "group": "Naturgefahren",
  "label": "Gefahrenkarte Wasser (Hochwasser, Murgang, Ufererosion)",
  "src": [
   {
    "url": "https://geodienste.ch/db/gefahrenkarten_v1_3_0/deu",
    "layers": "gefahrenhinweisgebiet_wasser,gefahrengebiet_wasser"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gefw"
 },
 {
  "group": "Naturgefahren",
  "label": "Gefahrenkarte Rutschung",
  "src": [
   {
    "url": "https://geodienste.ch/db/gefahrenkarten_v1_3_0/deu",
    "layers": "gefahrenhinweisgebiet_rutschung,gefahrengebiet_ruschtung"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gefr"
 },
 {
  "group": "Naturgefahren",
  "label": "Gefahrenkarte Sturz (Stein-/Blockschlag, Fels-/Bergsturz)",
  "src": [
   {
    "url": "https://geodienste.ch/db/gefahrenkarten_v1_3_0/deu",
    "layers": "gefahrenhinweisgebiet_sturz,gefahrengebiet_sturz"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gefs"
 },
 {
  "group": "Naturgefahren",
  "label": "Gefahrenkarte Lawine",
  "src": [
   {
    "url": "https://geodienste.ch/db/gefahrenkarten_v1_3_0/deu",
    "layers": "gefahrenhinweisgebiet_lawine,gefahrengebiet_lawine"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_gefl"
 },
 {
  "group": "Naturgefahren",
  "label": "Gefährdungskarte Oberflächenabfluss",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.gefaehrdungskarte-oberflaechenabfluss"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.gefaehrdungskarte-oberflaechenabfluss",
  "id": "b_oberf"
 },
 {
  "group": "Naturgefahren",
  "label": "Naturereigniskataster (vergangene Ereignisse)",
  "src": [
   {
    "url": "https://geodienste.ch/db/naturereigniskataster_v1_0_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_nek"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Auengebiete",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-auen"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-auen",
  "id": "b_auen"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Hoch- und Flachmoore, Moorlandschaften",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-moorlandschaften,ch.bafu.bundesinventare-flachmoore,ch.bafu.bundesinventare-hochmoore"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-moorlandschaften,ch.bafu.bundesinventare-flachmoore,ch.bafu.bundesinventare-hochmoore",
  "id": "b_moore"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Amphibienlaichgebiete",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-amphibien,ch.bafu.bundesinventare-amphibien_wanderobjekte"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-amphibien,ch.bafu.bundesinventare-amphibien_wanderobjekte",
  "id": "b_amph"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Trockenwiesen und -weiden (TWW)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-trockenwiesen_trockenweiden"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-trockenwiesen_trockenweiden",
  "id": "b_tww"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Eidg. Jagdbanngebiete und Wasser-/Zugvogelreservate",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-jagdbanngebiete,ch.bafu.bundesinventare-vogelreservate"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-jagdbanngebiete,ch.bafu.bundesinventare-vogelreservate",
  "id": "b_jagd"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Smaragd-Gebiete (Berner Konvention)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.schutzgebiete-smaragd"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.schutzgebiete-smaragd",
  "id": "b_smar"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Wildtierkorridore überregional, Vernetzungsachsen, Wildtierpassagen",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.fauna-vernetzungsachsen_national,ch.bafu.fauna-wildtierkorridor_national,ch.bafu.fauna-wildtierpassagen"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.fauna-vernetzungsachsen_national,ch.bafu.fauna-wildtierkorridor_national,ch.bafu.fauna-wildtierpassagen",
  "id": "b_wtk"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Wildruhezonen (ohne Routennetz)",
  "src": [
   {
    "url": "https://geodienste.ch/db/wildruhezonen_v2_1_1/deu",
    "layers": "wildruhezone"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_wrz"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Amphibienwanderungen mit Verkehrskonflikten",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.amphibienwanderung-verkehrskonflikte"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.amphibienwanderung-verkehrskonflikte",
  "id": "b_amphk"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Pro Natura Naturschutzgebiete",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.pronatura.naturschutzgebiete"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.pronatura.naturschutzgebiete",
  "id": "b_prona"
 },
 {
  "group": "Flora, Fauna, Lebensräume",
  "label": "Biodiversitätsförderflächen Qualitätsstufe II und Vernetzung",
  "src": [
   {
    "url": "https://geodienste.ch/db/lwb_biodiversitaetsfoerderflaechen_v2_0_0/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_bff"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "BLN – Landschaften und Naturdenkmäler von nationaler Bedeutung",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-bln"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-bln",
  "id": "b_bln"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "Pärke von nationaler Bedeutung (Zonierung)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.schutzgebiete-paerke_nationaler_bedeutung"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bafu.schutzgebiete-paerke_nationaler_bedeutung",
  "id": "b_park"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "Überlagernde Nutzungsplaninhalte (kommunale Schutzzonen Natur, Landschaft, Ortsbild, Archäologie u.a.)",
  "src": [
   {
    "url": "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu",
    "layers": "ueberlagernde_nutzungsplaninhalte_flaechenbezogene_festlegungen,ueberlagernde_nutzungsplaninhalte_linienbezogene_festlegungen,ueberlagernde_nutzungsplaninhalte_punktbezogene_festlegungen"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_nplu"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "Grundnutzung (Zonenplan)",
  "src": [
   {
    "url": "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu",
    "layers": "grundnutzung"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_nplg"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "ISOS – schützenswerte Ortsbilder",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bak.bundesinventar-schuetzenswerte-ortsbilder"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.bak.bundesinventar-schuetzenswerte-ortsbilder",
  "id": "b_isos"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "IVS – historische Verkehrswege (national, regional/lokal)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.astra.ivs-reg_loc,ch.astra.ivs-nat"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.astra.ivs-reg_loc,ch.astra.ivs-nat",
  "id": "b_ivs"
 },
 {
  "group": "Landschaft, Ortsbild, Kultur",
  "label": "KGS-Inventar (Kulturgüter von nationaler Bedeutung)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.babs.kulturgueter"
   }
  ],
  "by": "BAFU / swisstopo (geo.admin.ch)",
  "identify": "ch.babs.kulturgueter",
  "id": "b_kgs"
 }
];

const GIS_CANTONAL = {
 "ZH": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldareal",
   "src": [
    {
     "url": "https://wms.zh.ch/WaldarealZHWMS",
     "layers": "waldareal"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Zonen",
   "src": [
    {
     "url": "https://wms.zh.ch/ArchDenkmalZHWMS",
     "layers": "archaeologische-zonen"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Schutzanordnungen Natur und Landschaft: Naturschutz",
   "src": [
    {
     "url": "https://wms.zh.ch/FnsSchutzanordnungenZHWMS",
     "layers": "schutztyp-naturschutz,ueberlagernde-schutzzonen-naturschutz"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzinventar (Objekte 1980, Ergänzungen 1995)",
   "src": [
    {
     "url": "https://wms.zh.ch/FnsInvZHWMS",
     "layers": "naturschutzobjekte,naturschutzobjekte-ergaenzungen-95"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Waldstandorte von naturkundlicher Bedeutung (WNB)",
   "src": [
    {
     "url": "https://wms.zh.ch/WaldWNBZHWMS",
     "layers": "WaldWNBZHWMS"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Schutzanordnungen Natur und Landschaft: Landschaftsschutz",
   "src": [
    {
     "url": "https://wms.zh.ch/FnsSchutzanordnungenZHWMS",
     "layers": "schutztyp-landschaftsschutz,ueberlagernde-schutzzonen-landschaftsschutz"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_5"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter für Bodenverschiebungen (PBV)",
   "src": [
    {
     "url": "https://wms.zh.ch/FaBoPBV2ZHWMS",
     "layers": "pruefperimeter-fuer-bodenverschiebungen-pbv"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_6"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalschutzobjekte (überkommunal, Inventar)",
   "src": [
    {
     "url": "https://wms.zh.ch/ArchDenkmalZHWMS",
     "layers": "denkmalschutzobjekte-kanton-zuerich,inv-objekte,inv-umgebung"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_7"
  }
 ],
 "BE": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonale Naturschutzgebiete",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_environment01_de_ms_wms/MapServer/WMSServer",
     "layers": "NSG_NSGP_VW_15549,NSG_NSGP_VW_14278,NSG_NSGP_VW_13597,NSG_NSGZ_VW_20969"
    }
   ],
   "by": "Kanton BE",
   "id": "be_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Trockenwiesen und -weiden (national, regional)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_environment01_de_ms_wms/MapServer/WMSServer",
     "layers": "TROSTA_TS_VW_19010,TROSTA_TS_VW_19009,TROSTA_TS_VW_19007,TROSTA_TS_VW_19006"
    }
   ],
   "by": "Kanton BE",
   "id": "be_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Flachmoore regional, Waldnaturinventar",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_environment03_de_ms_wms/MapServer/WMSServer",
     "layers": "FEUGEB_FG_VW_18973,FEUGEB_FG_VW_18972,WNI_WNIOB_VW_11054,WNI_WNIOB_VW_2870"
    }
   ],
   "by": "Kanton BE",
   "id": "be_2"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Hinweise auf anthropogene Böden (Grundlage Bodenverschiebungen)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_geoscientificinformation03_de_ms_wms/MapServer/WMSServer",
     "layers": "BODANTHR_BODANTHR_VW_14068"
    }
   ],
   "by": "Kanton BE",
   "id": "be_3"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Kantonal geschützte botanische und geologische Objekte",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_environment01_de_ms_wms/MapServer/WMSServer",
     "layers": "GBO_GBOF_VW_19259,GBO_GBOP_VW_19258,GGO_GGOP_VW_20736"
    }
   ],
   "by": "Kanton BE",
   "id": "be_4"
  },
  {
   "group": "Archäologie",
   "label": "Archäologisches Inventar: Schutzgebiete und Fundstellen",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_society01_de_ms_wms/MapServer/WMSServer",
     "layers": "ARCHINV_SCHUTZG_VW_14629,ARCHINV_FUNDST_VW_14657"
    }
   ],
   "by": "Kanton BE",
   "id": "be_5"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzgebiete (Uferschutzpläne)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_planningcadastre01_de_ms_wms/MapServer/WMSServer",
     "layers": "UZP_LSG_VW_13624"
    }
   ],
   "by": "Kanton BE",
   "id": "be_6"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzgebiete (kommunale Nutzungsplanung)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_planningcadastre07_de_ms_wms/MapServer/WMSServer",
     "layers": "NUPLA_UEFL_VW_33242"
    }
   ],
   "by": "Kanton BE",
   "id": "be_7"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Bodenhinweiskarte (Altbaugebiete, Verkehr, Ablagerungen, Schiessanlagen, Spezialkulturen, Gärten, Korrosionsschutz)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_geoscientificinformation05_de_ms_wms/MapServer/WMSServer",
     "layers": "BOHIKA_ALTBAU_VW_42652,BOHIKA_VERKEHR_VW_42651,BOHIKA_ABLASTAO_VW_42653,BOHIKA_SCHIESS_VW_42649,BOHIKA_SPEZKULT_VW_42648,BOHIKA_GARTEN_VW_42647,BOHIKA_KORROBJ_VW_42646"
    }
   ],
   "by": "Kanton BE",
   "id": "be_8"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalpflege: Unterschutzstellungsobjekte",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_society03_de_ms_wms/MapServer/WMSServer",
     "layers": "DENKSCHO_DSO_VW_36675"
    }
   ],
   "by": "Kanton BE",
   "id": "be_9"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Repräsentative regionale Geotope",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_geoscientificinformation02_de_ms_wms/MapServer/WMSServer",
     "layers": "GEOTREG_GTREGF_VW_13683,GEOTREG_GTREGP_VW_13638"
    }
   ],
   "by": "Kanton BE",
   "id": "be_10"
  }
 ],
 "LU": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldflächen (Wald nach Waldrecht)",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/WALDFLAE_DS_V1_MP/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/ARCHFSTL_DS_V1_MP/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Inventar der Naturobjekte regionaler Bedeutung (INR)",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/INRINVEX_DS_V2_MP/MapServer/WMSServer",
     "layers": "0,1"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_2"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenverschiebung",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/PBVXXXXX_DS_V3_MP/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_3"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophyten – alle Arten (Daten Info Flora)",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/NEOBIOTA_DS_V3_MP/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Zonenplan: überlagernde Zonen (u.a. Natur- und Landschaftsschutzzonen)",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/ZONPLANX_COL_V3_MP/MapServer/WMSServer",
     "layers": "5,6,7"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_5"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Kantonales Denkmalverzeichnis",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/BILUKDVX_COL_V4_MP/MapServer/WMSServer",
     "layers": "6,7,8,9"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_6"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geotope (INR)",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/INRGEOXX_COL_V1_MP/MapServer/WMSServer",
     "layers": "1,2,3"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_7"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Lebensrauminventar im Wald",
   "src": [
    {
     "url": "https://public.geo.lu.ch/ogd/services/managed/LRIWALDX_DS_V1_MP/MapServer/WMSServer",
     "layers": "0,2,4"
    }
   ],
   "by": "Kanton LU",
   "id": "lu_8"
  }
 ],
 "UR": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Übrige Biotope; kantonales Inventar Schutzobjekte Natur",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "raumplanung:ch023_uebrige_biotope,raumplanung:ur062_kantonales_inventar_schutzobjekte_natur"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_0"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Kantonales Inventar Schutzobjekte Landschaft",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "raumplanung:ur062_kantonales_inventar_schutzobjekte_landschaft"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_1"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Kantonales Inventar Kultur- und Denkmalschutzobjekte",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "raumplanung:ur063_kantonales_inventar_kultur_denkmal_flaechen,raumplanung:ur063_kantonales_inventar_kultur_denkmal_linien,raumplanung:ur063_kantonales_inventar_kultur_denkmal_punkte"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_2"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Funderwartungsgebiete",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "weitere:archaeologische_funderwartungsgebiete"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Trockenwiesen, landwirtschaftlicher Naturschutz",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "raumplanung:ch189_trockenwiesen,landwirtschaft:ur011_landwirtschaftlicher_naturschutz"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_4"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Flächen mit vermuteten Bodenbelastungen",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "umwelt:fvbb"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_5"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophyten",
   "src": [
    {
     "url": "https://geo.ur.ch/wms",
     "layers": "umwelt:neophyten"
    }
   ],
   "by": "Kanton UR",
   "id": "ur_6"
  }
 ],
 "SZ": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonale Biotope, kantonale Naturschutzgebiete",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a036a.kantonale_biotope,ch.sz.a051b.nutzungsplanung_kantonal.natur_und_heimatschutz"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_0"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Invasive Neophyten",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a047a.neophyten"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_1"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen (Gebiete)",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a152a.archaeologische_fundstellen.flaeche"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonale Naturschutzgebiete, Pflanzenschutzreservate, Waldreservate",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.anjf.anjf_kant_naturschutzgebiete,ch.sz.anjf.anjf_kant_pflanzenschutzreservate,ch.sz.a117.waldreservate"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_3"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Richtplan Natur und Landschaft (Richtplaninhalt)",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a084a.richtplan.flaechenelement.landschaft.richtplaninhalt,ch.sz.a084a.richtplan.linienelement.landschaft.richtplaninhalt,ch.sz.a084a.richtplan.punktelement.landschaft.richtplaninhalt"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_4"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter für Bodenverschiebung",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a211a.pruefperimeter_bodenverschiebung.gartenanlagen_kulturen,ch.sz.a211a.pruefperimeter_bodenverschiebung.schiessanlagen,ch.sz.a211a.pruefperimeter_bodenverschiebung.korrosionsschutzobjekte,ch.sz.a211a.pruefperimeter_bodenverschiebung.verkehrstraeger,ch.sz.a211a.pruefperimeter_bodenverschiebung.altbau_gewerbe_industrie,ch.sz.a211a.pruefperimeter_bodenverschiebung.flaechen_diverse_hinweise,ch.sz.a211a.pruefperimeter_bodenverschiebung.standorte_diverse_hinweise"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_5"
  }
 ],
 "OW": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzzonen regional und lokal, Naturobjekte regional",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/ow/service",
     "layers": "ch.ow.naturschutzzonen-regional,ch.ow.naturschutzzonen-lokal,ch.ow.naturschutzobjekte-regional"
    }
   ],
   "by": "Kanton OW",
   "id": "ow_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Trockenwiesen und Flachmoore (kantonale Inventare)",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/ow/service",
     "layers": "ch.ow.trockenwiesen-inventar,ch.ow.flachmoore-inventar"
    }
   ],
   "by": "Kanton OW",
   "id": "ow_1"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzgebiete nationaler und regionaler Bedeutung",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/ow/service",
     "layers": "ch.ow.landschaftsschutz-national,ch.ow.landschaftsschutzgebiete-regional"
    }
   ],
   "by": "Kanton OW",
   "id": "ow_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geschützte Kulturobjekte",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/ow/service",
     "layers": "ch.ow.geschuetzte-kulturobjekte"
    }
   ],
   "by": "Kanton OW",
   "id": "ow_3"
  }
 ],
 "NW": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzobjekte (Inventar), Trockenwiesen (kantonales Inventar)",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/nw/service",
     "layers": "ch.nw.naturschutzobjekte-inventar,ch.nw.trockenwiesen-inventar"
    }
   ],
   "by": "Kanton NW",
   "id": "nw_0"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutz nationaler und regionaler Bedeutung",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/nw/service",
     "layers": "ch.nw.landschaftsschutz-national-regional"
    }
   ],
   "by": "Kanton NW",
   "id": "nw_1"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Kulturgüter (kantonales Inventar), Ortsbildschutzobjekte",
   "src": [
    {
     "url": "https://www.gis-daten.ch/wms/nw/service",
     "layers": "ch.nw.kulturgueter-inventar,ch.nw.ortsbildschutzobjekte-inventar"
    }
   ],
   "by": "Kanton NW",
   "id": "nw_2"
  }
 ],
 "GL": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldbestand",
   "src": [
    {
     "url": "https://wms.geo.gl.ch/",
     "layers": "ch.gl.biota.waldbestand"
    }
   ],
   "by": "Kanton GL",
   "id": "gl_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Zonen",
   "src": [
    {
     "url": "https://wms.geo.gl.ch/",
     "layers": "ch.gl.society.archaeologischezonen"
    }
   ],
   "by": "Kanton GL",
   "id": "gl_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzgebiete, Biotope (kantonal und national)",
   "src": [
    {
     "url": "https://wms.geo.gl.ch/",
     "layers": "ch.gl.natureprotection.nsg-perimeter,ch.gl.natureprotection.nsg-zonen,ch.gl.natureprotection.biotope-flaechen,ch.gl.natureprotection.biotope-linien,ch.gl.natureprotection.biotope-national"
    }
   ],
   "by": "Kanton GL",
   "id": "gl_2"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsverzeichnis",
   "src": [
    {
     "url": "https://wms.geo.gl.ch/",
     "layers": "ch.gl.natureprotection.landschaftsverzeichnis"
    }
   ],
   "by": "Kanton GL",
   "id": "gl_3"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalschutzobjekte, KGS-Objekte lokal",
   "src": [
    {
     "url": "https://wms.geo.gl.ch/",
     "layers": "ch.gl.society.denkmalschutzobjekte_flaechen,ch.gl.society.denkmalschutzobjekte_punkte,ch.gl.society.kgs-objekte_lokal"
    }
   ],
   "by": "Kanton GL",
   "id": "gl_4"
  }
 ],
 "ZG": [
  {
   "group": "Wald (Waldareal)",
   "label": "Wald (Nutzungsplanung)",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/nutzungsplanung",
     "layers": "zg_wald"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_1"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenverschiebung",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/pbv",
     "layers": "zg.pruefperimeter_bodenverschiebung"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstätten",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/nutzungsplanung",
     "layers": "zg_archaeologische_fundstaetten"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzgebiete kantonal und gemeindlich",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/naturschutz",
     "layers": "zg_naturschutzgebiete_kantonal,zg_naturschutzgebiete_kantonal_ueberlagernde_zonen,zg_naturschutzgebiet_gemeindlich"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzzonen und Naturobjekte (Nutzungsplanung)",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/nutzungsplanung",
     "layers": "zg_naturschutzzone_kantonal,zg_naturschutzzone_gewaesser_kantonal,zg_naturschutzzone_gemeindlich,zg_naturschutzzone_gewaesser_gemeindlich,zg_naturschuzzone_wald_gemeindlich,zg_naturobjekt"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_4"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Besondere Waldlebensräume",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/besondere_waldlebensraeume",
     "layers": "zg_besondere_waldlebensraeume"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_5"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzzonen kantonal und gemeindlich",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/nutzungsplanung",
     "layers": "zg_landschaftsschutzzone_kantonal,zg_landschaftsschutzzone_gemeindlich"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_6"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmäler (geschützt, schützenswert)",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/denkmaeler",
     "layers": "zg_denkmaeler_geschuetzt,zg_denkmaeler_schuetzenswert"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_7"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Ortsbildschutzzonen",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/nutzungsplanung",
     "layers": "zg_ortsbildschutzzone,zg_ortsbildschutzzone_wart"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_8"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geomorphologie (geschützte Objekte)",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/geomorphologie",
     "layers": "zg_geomorphologie_objekt"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_9"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophyten",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/neophyten",
     "layers": "zg_neophyten"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_10"
  }
 ],
 "FR": [
  {
   "group": "Archäologie",
   "label": "Documentation archéologique",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Documentation_archeologique/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Réserves naturelles cantonales",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Reserves_naturelles_cantonales/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Sites prioritaires prairies et pâturages secs",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Sites_prioritaires__prairies_et_paturages_secs_/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Sites à batraciens d’importance cantonale",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Sites_a_batraciens_d_importance_cantonale__objets_fixes/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_3"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Paysages d’importance cantonale (PIC)",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Paysages_d_importance_cantonale__PIC_/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Réserves paysagères cantonales",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Reserves_paysageres_cantonales/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_5"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Biens culturels immeubles protégés",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Biens_culturels_immeubles_proteges__RBCI__SBC_/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_6"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Géotopes d’importance cantonale",
   "src": [
    {
     "url": "https://maps.fr.ch/ags/services/opendata/Geotopes_d_importance_cantonale__GIC____Etude_de_base/MapServer/WMSServer",
     "layers": "0"
    }
   ],
   "by": "Kanton FR",
   "id": "fr_7"
  }
 ],
 "SO": [
  {
   "group": "Wald (Waldareal)",
   "label": "Wald (Nutzungsplanung)",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.arp.nutzungsplanung.wald"
    }
   ],
   "by": "Kanton SO",
   "id": "so_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.ada.archaeologie.fundstellen"
    }
   ],
   "by": "Kanton SO",
   "id": "so_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturreservate, Naturschutzobjekte",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.arp.naturreservate.reservate,ch.so.arp.naturschutzobjekte"
    }
   ],
   "by": "Kanton SO",
   "id": "so_2"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenabtrag",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.afu.schadstoffbelastete_boeden"
    }
   ],
   "by": "Kanton SO",
   "id": "so_3"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalschutz, Geotope, Ortsbildschutz",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.ada.denkmalschutz,ch.so.afu.geotope,ch.so.arp.nutzungsplanung.ortsbildschutz"
    }
   ],
   "by": "Kanton SO",
   "id": "so_4"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophyten (Daten Info Flora)",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.afu.neophyten_infoflora"
    }
   ],
   "by": "Kanton SO",
   "id": "so_5"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Waldreservate (Programm Biodiversität im Wald)",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.arp.waldreservate"
    }
   ],
   "by": "Kanton SO",
   "id": "so_6"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Juraschutzzone (Richtplan), Natur/Landschaft (Nutzungsplanung)",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.arp.richtplan.juraschutz,ch.so.arp.nutzungsplanung.natur_landschaft_gruppe"
    }
   ],
   "by": "Kanton SO",
   "id": "so_7"
  }
 ],
 "BS": [
  {
   "group": "Wald (Waldareal)",
   "label": "Rechtlicher Wald",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.rechtlicherwald_rewa"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologischer Zonenplan",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.archaeologischer_zonenplan_arzp.archaeologische_zonen"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonales Inventar der geschützten Naturobjekte",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.kantonales_inventar_der_geschuetzten_naturobjekte_kign.inventar_der_geschuetzten_naturobjekte"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalverzeichnis",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.denkmalverzeichnis_dmvs.denkmalobjekt"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Waldreservate, Inventar der schutzwürdigen Naturobjekte",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.waldreservate_wldr,NI_2025_Naturobjekt"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Richtplan Natur und Landschaft",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "ch.bs.richtplankarte_rplk.natur_landschaft_flaeche,ch.bs.richtplankarte_rplk.natur_landschaft_linie,ch.bs.richtplankarte_rplk.natur_landschaft_punkt"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_5"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophytenverbreitung 2019",
   "src": [
    {
     "url": "https://wms.geo.bs.ch/",
     "layers": "NK_2019_Verbreitung_fill,NK_2019_Verbreitung_outline"
    }
   ],
   "by": "Kanton BS",
   "id": "bs_6"
  }
 ],
 "BL": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldflächen",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "wald_waldflaechen"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Trockenwiesen und -weiden (rechtsgültig)",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "trockenwiesen_rechtsgueltig"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_1"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Verdachtsflächen Bodenbelastung (Siedlung bis 1960, Verkehr, Schiessanlagen, Korrosionsschutz, geogen)",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "boden_verdachtsflaechen_siedlung_bis_1960,boden_verdachtsflaechen_strasse,boden_verdachtsflaechen_bahn,boden_verdachtsflaechen_tram,boden_verdachtsflaechen_schiessanlage,boden_verdachtsflaechen_korrosion_objekte,boden_verdachtsflaechen_geogen"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_2"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Schutzzonen",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "arch_schutzzonen_flaeche"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturobjekte kantonal, Naturschutzzonen (kantonal, kommunal)",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "naturobjekte_kantonal_flaechen,naturobjekte_kantonal_linien,naturobjekte_kantonal_punkte,naturschutzzonen_aus_grundnutzung_kantonal,naturschutzzonen_aus_grundnutzung_kommunal"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Richtplan: Vorranggebiete Landschaft und Natur",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "krip_landsch_vorrang_landschaft,krip_landsch_vorrang_natur"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_5"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Inventar der geschützten Kulturdenkmäler",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "geschuetzte_kulturdenkmaeler"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_6"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Invasive Neophyten (alle Arten)",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "invasive_neophyten_alle_arten_group"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_7"
  }
 ],
 "SH": [
  {
   "group": "Wald (Waldareal)",
   "label": "Wald",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.forst.wald"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.archaeologie.fundstellen.flaeche,sh.archaeologie.fundstellen.punkt"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzinventar Kanton und Gemeinden",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.naturschutzinventar.kanton.flaeche,sh.naturschutzinventar.kanton.punkt,sh.naturschutzinventar.gemeinde.flaeche,sh.naturschutzinventar.gemeinde.linie,sh.naturschutzinventar.gemeinde.punkt"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Denkmalschutzobjekte",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.planung.denkmalpflege.denkmalschutz"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_3"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Invasive Neophyten (Daten Info Flora)",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.neophyten.neophyten_infoflora"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_4"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Richtplan Landschaft",
   "src": [
    {
     "url": "https://wms.geo.sh.ch/wms",
     "layers": "sh.richtplan.landschaft.flaeche,sh.richtplan.landschaft.punkt"
    }
   ],
   "by": "Kanton SH",
   "id": "sh_5"
  }
 ],
 "AR": [
  {
   "group": "Wald (Waldareal)",
   "label": "Bestandeskarte 2024 (Waldbestand)",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktar",
     "layers": "ch.geoportal.wald_flora_fauna.3516.0.bestandeskarte_2024_kt_arai"
    }
   ],
   "by": "Kanton AR",
   "id": "ar_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturinventar der Gemeinden, Waldreservate",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktar",
     "layers": "ch.geoportal.umwelt_naturschutz.1623.0.naturinventar_gde,ch.geoportal.wald_flora_fauna.806.0.waldreservate_kt_ar"
    }
   ],
   "by": "Kanton AR",
   "id": "ar_1"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Schutzzonenplan kantonal, Zonenplan Schutz der Gemeinden (Natur- und Landschaftsschutzzonen)",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktar",
     "layers": "ch.geoportal.raumplanung_grundstueckskataster.300.0.schutzzonenplan_kantonal_kt_ar,ch.geoportal.raumplanung_grundstueckskataster.316.0.zonenplan_schutz_gde"
    }
   ],
   "by": "Kanton AR",
   "id": "ar_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geotopinventar",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktar",
     "layers": "ch.geoportal.umwelt_naturschutz.134.0.geotopinventar_kt"
    }
   ],
   "by": "Kanton AR",
   "id": "ar_3"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophytenstandorte",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktar",
     "layers": "ch.geoportal.wald_flora_fauna.173.0.neophytenstandorte_kt"
    }
   ],
   "by": "Kanton AR",
   "id": "ar_4"
  }
 ],
 "AI": [
  {
   "group": "Wald (Waldareal)",
   "label": "Bestandeskarte 2024 (Waldbestand)",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktai",
     "layers": "ch.geoportal.wald_flora_fauna.3516.0.bestandeskarte_2024_kt_arai"
    }
   ],
   "by": "Kanton AI",
   "id": "ai_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzflächen, Pflanzenschutzgebiete, Naturinventar der Gemeinden, Waldreservate",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktai",
     "layers": "ch.geoportal.basiskarten_bodenbedeckung_bilddaten.3102.0.naturschutzflaechen_kt_ai,ch.geoportal.basiskarten_bodenbedeckung_bilddaten.3640.0.pflanzenschutzgebiete_kt_ai,ch.geoportal.umwelt_naturschutz.1623.0.naturinventar_gde,ch.geoportal.umwelt_naturschutz.660.0.waldreservate_kt_ai"
    }
   ],
   "by": "Kanton AI",
   "id": "ai_1"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Zonenplan Schutz der Gemeinden (Natur- und Landschaftsschutzzonen)",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktai",
     "layers": "ch.geoportal.raumplanung_grundstueckskataster.316.0.zonenplan_schutz_gde"
    }
   ],
   "by": "Kanton AI",
   "id": "ai_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geotopinventar",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktai",
     "layers": "ch.geoportal.umwelt_naturschutz.134.0.geotopinventar_kt"
    }
   ],
   "by": "Kanton AI",
   "id": "ai_3"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Neophytenstandorte",
   "src": [
    {
     "url": "https://www.geoportal.ch/services/wms/ktai",
     "layers": "ch.geoportal.wald_flora_fauna.173.0.neophytenstandorte_kt"
    }
   ],
   "by": "Kanton AI",
   "id": "ai_4"
  }
 ],
 "SG": [
  {
   "group": "Wald (Waldareal)",
   "label": "Basiswald",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00101_WMS/guest",
     "layers": "Basiswald_Fuellung,Basiswald_Rand"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_0"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen, schützenswert",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00061_WMS/guest",
     "layers": "Perimeter,Linien"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Schutzverordnung: Naturschutzgebiete, Lebensräume, Naturobjekte",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00033_WMS/guest",
     "layers": "SV_Naturschutzgebiet_F,SV_Lebensraum_F,SV_Naturobjekt_F,SV_Naturschutzgebiet_L,SV_Lebensraum_L,SV_Naturobjekt_L,SV_Naturschutzgebiet_P,SV_Lebensraum_P,SV_Naturobjekt_P"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonales Inventar Auengebiete (regional)",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00018_WMS/guest",
     "layers": "Auengebiete_regional"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonales Inventar Flachmoore (regional)",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00051_WMS/guest",
     "layers": "Flachmoore_regional"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_4"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Kantonales Inventar Trockenwiesen und -weiden (regional)",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00052_WMS/guest",
     "layers": "Trockenwiesen_und_weiden_regional"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_5"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Schutzverordnung: Landschafts- und Kulturlandschaftsschutz",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00033_WMS/guest",
     "layers": "SV_Kulturlandschaftsschutz_F,SV_Landschaftsschutz_F,SV_Landschaftsschutz_L,SV_Landschaftsschutz_P"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_6"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfgebiete Bodenverschiebung",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00082_WMS/guest",
     "layers": "Pruefgebiete_Bodenverschiebung_F"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_7"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Schutzverordnung: Ortsbild, Kulturobjekte, Geotope",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00033_WMS/guest",
     "layers": "SV_Ortsbildschutzgebiet_F,SV_Kulturobjekt_F,SV_Kulturobjekt_L,SV_Kulturobjekt_P,SV_Geotopschutz_F,SV_Geotopschutz_P"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_8"
  }
 ],
 "GR": [
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Biotopinventar",
   "src": [
    {
     "url": "https://wms.geo.gr.ch/naturschutz",
     "layers": "Biotope"
    }
   ],
   "by": "Kanton GR",
   "id": "gr_0"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsinventar",
   "src": [
    {
     "url": "https://wms.geo.gr.ch/naturschutz",
     "layers": "Landschaften"
    }
   ],
   "by": "Kanton GR",
   "id": "gr_1"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geotope",
   "src": [
    {
     "url": "https://wms.geo.gr.ch/naturschutz",
     "layers": "Geotope"
    }
   ],
   "by": "Kanton GR",
   "id": "gr_2"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Zonenplan: Natur- und Landschaftsschutzzonen",
   "src": [
    {
     "url": "https://wms.geo.gr.ch/nutzungsplanung",
     "layers": "ZP_Natur_Landschaftsschutzzonen"
    }
   ],
   "by": "Kanton GR",
   "id": "gr_3"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Zonenplan: Ortsbild- und Kulturgüterschutzzonen",
   "src": [
    {
     "url": "https://wms.geo.gr.ch/nutzungsplanung",
     "layers": "ZP_Ortsbild_Kulturgueterschutzzonen"
    }
   ],
   "by": "Kanton GR",
   "id": "gr_4"
  }
 ],
 "AG": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldareal",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_va_WGFLAECHE/wms",
     "layers": "ch_ag_geo_va_wgflaeche_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Waldnaturschutzinventar",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_aw_wni/wms",
     "layers": "ch_ag_geo_aw_wni_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Trockenwieseninventar",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_alg_twinv/wms",
     "layers": "ch_ag_geo_alg_twinv_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_2"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Geschützte Naturobjekte in der Bauzone",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_bznatur/wms",
     "layers": "ch_ag_geo_are_bznatur_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_3"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzgebiete kantonaler Bedeutung (Richtplan)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_rp11nkb/wms",
     "layers": "ch_ag_geo_are_rp11nkb_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_4"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Naturschutzgebiete kantonaler Bedeutung im Wald (Richtplan)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_rp11wni/wms",
     "layers": "ch_ag_geo_are_rp11wni_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_5"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Geschützte Naturobjekte im Kulturlandplan",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_klnatur/wms",
     "layers": "ch_ag_geo_are_klnatur_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_6"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzdekrete (Flächen)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_alg_landschutzdekf/wms",
     "layers": "ch_ag_geo_alg_landschutzdekf_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_7"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzdekrete (Linien)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_alg_landschutzdekl/wms",
     "layers": "ch_ag_geo_alg_landschutzdekl_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_8"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzdekrete (Punkte)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_alg_landschutzdekp/wms",
     "layers": "ch_ag_geo_alg_landschutzdekp_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_9"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaften von kantonaler Bedeutung (Richtplan)",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_rp11lkb/wms",
     "layers": "ch_ag_geo_are_rp11lkb_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_10"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Landschaftsschutzzonen im Kulturlandplan",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_kllandschaft/wms",
     "layers": "ch_ag_geo_are_kllandschaft_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_11"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenaushub",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_afu_ppba/wms",
     "layers": "ch_ag_geo_afu_ppba"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_12"
  },
  {
   "group": "Archäologie",
   "label": "Archäologische Fundstellen",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_ka_arch/wms",
     "layers": "ch_ag_geo_ka_arch_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_13"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geschützte Kulturobjekte in der Bauzone",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_bzkultur/wms",
     "layers": "ch_ag_geo_are_bzkultur_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_14"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Geschützte Kulturobjekte im Kulturlandplan",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_are_klkultur/wms",
     "layers": "ch_ag_geo_are_klkultur_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_15"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Kantonale Denkmalschutzobjekte",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_ka_denkmalschutzobj/wms",
     "layers": "ch_ag_geo_ka_denkmalschutzobj_01"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_16"
  }
 ],
 "TG": [
  {
   "group": "Wald (Waldareal)",
   "label": "Waldareal",
   "src": [
    {
     "url": "https://ows.geo.tg.ch/geofy_access_proxy/waldareal",
     "layers": "waldareal_layer"
    }
   ],
   "by": "Kanton TG",
   "id": "tg_0"
  },
  {
   "group": "Archäologie",
   "label": "KGS-Inventar regionale B-Objekte Archäologie",
   "src": [
    {
     "url": "https://ows.geo.tg.ch/geofy_access_proxy/kgs_inventar_b_archaeologie",
     "layers": "kgs_inventar_b_archaeologie"
    }
   ],
   "by": "Kanton TG",
   "id": "tg_1"
  }
 ],
 "TI": [
  {
   "group": "Archäologie",
   "label": "Mappa archeologica",
   "src": [
    {
     "url": "https://wms.geo.ti.ch/service",
     "layers": "ac_032_1_v1_0_mappa_archeologica_elementi"
    }
   ],
   "by": "Kanton TI",
   "id": "ti_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Decreti di protezione; natura e paesaggio (aree protette, oggetti inventario); riserve forestali",
   "src": [
    {
     "url": "https://wms.geo.ti.ch/service",
     "layers": "ti_002_1_v1_0_decreti_protezione_,ac_030_1_v1_0_natura_paesaggio_area_protetta,ac_030_1_v1_0_natura_paesaggio_inventario,ch_160_1_v2_0_riserve_forestali_"
    }
   ],
   "by": "Kanton TI",
   "id": "ti_1"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Inventario beni culturali (regionale e locale)",
   "src": [
    {
     "url": "https://wms.geo.ti.ch/service",
     "layers": "ch_188_1_v1_0_inventario_pbc_regionale_locale_"
    }
   ],
   "by": "Kanton TI",
   "id": "ti_2"
  }
 ],
 "VS": [
  {
   "group": "Archäologie",
   "label": "Archäologische Schutzbereiche",
   "src": [
    {
     "url": "https://sit.vs.ch/arcgis/services/Archaeologie/MapServer/WMSServer",
     "layers": "1"
    }
   ],
   "by": "Kanton VS",
   "id": "vs_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Schutzgebiete gemäss kantonalen Entscheiden",
   "src": [
    {
     "url": "https://sit.vs.ch/arcgis/services/Natur/MapServer/WMSServer",
     "layers": "13,12"
    }
   ],
   "by": "Kanton VS",
   "id": "vs_1"
  },
  {
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Gebiete mit nachgewiesenen Bodenbelastungen",
   "src": [
    {
     "url": "https://sit.vs.ch/arcgis/services/UMWELTSCHUTZ/MapServer/WMSServer",
     "layers": "26"
    }
   ],
   "by": "Kanton VS",
   "id": "vs_2"
  },
  {
   "group": "Landschaftsschutzobjekte",
   "label": "Zonennutzungspläne: überlagernde Zonen (u.a. Natur- und Landschaftsschutz)",
   "src": [
    {
     "url": "https://sit.vs.ch/arcgis/services/ZNP/MapServer/WMSServer",
     "layers": "1"
    }
   ],
   "by": "Kanton VS",
   "id": "vs_3"
  }
 ],
 "JU": [
  {
   "group": "Archäologie",
   "label": "Inventaire des sites archéologiques et paléontologiques",
   "src": [
    {
     "url": "https://geoservices.jura.ch/wms",
     "layers": "ju.occ_02_07_inventaire_sites_archeo_paleonto"
    }
   ],
   "by": "Kanton JU",
   "id": "ju_0"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Réserves naturelles et zones de protection paysagère cantonales",
   "src": [
    {
     "url": "https://geoservices.jura.ch/wms",
     "layers": "ju.env_04_01_reserves_naturelles_zones_protection_paysagere"
    }
   ],
   "by": "Kanton JU",
   "id": "ju_1"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Plan d’affectation communal: patrimoine naturel",
   "src": [
    {
     "url": "https://geoservices.jura.ch/wms",
     "layers": "ju.sdt_02_01_patrimoine_naturel_surface,ju.sdt_02_01_patrimoine_naturel_ligne,ju.sdt_02_01_patrimoine_naturel_point"
    }
   ],
   "by": "Kanton JU",
   "id": "ju_2"
  },
  {
   "group": "Sonstige geschützte Inventare",
   "label": "Patrimoine bâti (PAL), géotopes géomorphologiques",
   "src": [
    {
     "url": "https://geoservices.jura.ch/wms",
     "layers": "ju.sdt_02_01_patrimoine_bati_ligne,ju.sdt_02_01_patrimoine_bati_point,ju.env_18_01"
    }
   ],
   "by": "Kanton JU",
   "id": "ju_3"
  },
  {
   "group": "Neophyten (Fundmeldungen)",
   "label": "Carte des néophytes (Info Flora)",
   "src": [
    {
     "url": "https://geoservices.jura.ch/wms",
     "layers": "ju.env_04_27_neophytes_infoflora_ailante,ju.env_04_27_neophytes_infoflora_ambroisie,ju.env_04_27_neophytes_infoflora_berce_caucase,ju.env_04_27_neophytes_infoflora_buddleia,ju.env_04_27_neophytes_infoflora_bunias,ju.env_04_27_neophytes_infoflora_impatiente_glanduleuse,ju.env_04_27_neophytes_infoflora_renouee,ju.env_04_27_neophytes_infoflora_robinier,ju.env_04_27_neophytes_infoflora_senecon,ju.env_04_27_neophytes_infoflora_solidage,ju.env_04_27_neophytes_infoflora_sumac,ju.env_04_27_neophytes_infoflora_vergerette,ju.env_04_27_neophytes_infoflora_autre"
    }
   ],
   "by": "Kanton JU",
   "id": "ju_4"
  }
 ]
};
