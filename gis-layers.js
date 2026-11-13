'use strict';
/* Layerliste aus «GIS Umweltübersicht» (Konfigurationsstand _v 14), auf Wunsch reduziert (Version 18):
   Bund/geodienste.ch: Planerischer Gewässerschutz, Gewässerraum, Fruchtfolgeflächen, Kataster der belasteten
   Standorte (Kantone und Bund), Amtliche Vermessung – Bodenbedeckung, Statische Waldgrenzen, Auengebiete,
   Hoch- und Flachmoore, Amphibienlaichgebiete, TWW.
   Kantonal: Waldareal, Archäologie, kantonale Naturschutz-Inventare, Prüfperimeter Bodenverschiebungen.
   GIS_NATIONAL: Bund (geo.admin.ch) und harmonisierte kantonale Daten (geodienste.ch), gültig für alle Kantone.
   GIS_CANTONAL: kantonale Dienste je Kanton. */
const GIS_NATIONAL = [
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
  "label": "Kataster der belasteten Standorte (Kantone)",
  "src": [
   {
    "url": "https://geodienste.ch/db/kataster_belasteter_standorte/deu",
    "layers": "daten"
   }
  ],
  "by": "geodienste.ch",
  "id": "gd_kbs"
 },
 {
  "group": "Boden, Altlasten, Störfall",
  "label": "Kataster der belasteten Standorte des Bundes (öV, Militär, zivile Flugplätze)",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bav.kataster-belasteter-standorte-oev,ch.vbs.kataster-belasteter-standorte-militaer,ch.bazl.kataster-belasteter-standorte-zivilflugplaetze"
   }
  ],
  "by": "Bund (geo.admin.ch)",
  "identify": "ch.bav.kataster-belasteter-standorte-oev,ch.vbs.kataster-belasteter-standorte-militaer,ch.bazl.kataster-belasteter-standorte-zivilflugplaetze",
  "id": "b_kbs"
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
  "group": "Flora, Fauna, Lebensräume",
  "label": "Auengebiete",
  "src": [
   {
    "url": "https://wms.geo.admin.ch/",
    "layers": "ch.bafu.bundesinventare-auen"
   }
  ],
  "by": "Bund (geo.admin.ch)",
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
  "by": "Bund (geo.admin.ch)",
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
  "by": "Bund (geo.admin.ch)",
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
  "by": "Bund (geo.admin.ch)",
  "identify": "ch.bafu.bundesinventare-trockenwiesen_trockenweiden",
  "id": "b_tww"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter für Bodenverschiebungen (PBV)",
   "src": [
    {
     "url": "https://wms.zh.ch/FaBoPBV2ZHWMS",
     "layers": "pruefperimeter-fuer-bodenverschiebungen-pbv"
    }
   ],
   "by": "Kanton ZH",
   "id": "zh_pbv"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Hinweise auf anthropogene Böden (Grundlage Bodenverschiebungen)",
   "src": [
    {
     "url": "https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_geoscientificinformation03_de_ms_wms/MapServer/WMSServer",
     "layers": "BODANTHR_BODANTHR_VW_14068"
    }
   ],
   "by": "Kanton BE",
   "id": "be_pbv"
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
   "id": "be_pbv1"
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
   "id": "lu_pbv"
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
   "id": "ur_pbv"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter für Bodenverschiebung",
   "src": [
    {
     "url": "https://map.geo.sz.ch/mapserv_proxy",
     "layers": "ch.sz.a211a.pruefperimeter_bodenverschiebung.gartenanlagen_kulturen,ch.sz.a211a.pruefperimeter_bodenverschiebung.schiessanlagen,ch.sz.a211a.pruefperimeter_bodenverschiebung.korrosionsschutzobjekte,ch.sz.a211a.pruefperimeter_bodenverschiebung.verkehrstraeger,ch.sz.a211a.pruefperimeter_bodenverschiebung.altbau_gewerbe_industrie,ch.sz.a211a.pruefperimeter_bodenverschiebung.flaechen_diverse_hinweise,ch.sz.a211a.pruefperimeter_bodenverschiebung.standorte_diverse_hinweise"
    }
   ],
   "by": "Kanton SZ",
   "id": "sz_pbv"
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
  }
 ],
 "GL": [
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
   "id": "gl_0"
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
   "id": "gl_1"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenverschiebung",
   "src": [
    {
     "url": "https://services.geo.zg.ch/ows/pbv",
     "layers": "zg.pruefperimeter_bodenverschiebung"
    }
   ],
   "by": "Kanton ZG",
   "id": "zg_pbv"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenabtrag",
   "src": [
    {
     "url": "https://geo.so.ch/api/wms",
     "layers": "ch.so.afu.schadstoffbelastete_boeden"
    }
   ],
   "by": "Kanton SO",
   "id": "so_pbv"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Verdachtsflächen Bodenbelastung (Siedlung bis 1960, Verkehr, Schiessanlagen, Korrosionsschutz, geogen)",
   "src": [
    {
     "url": "https://geowms.bl.ch/",
     "layers": "boden_verdachtsflaechen_siedlung_bis_1960,boden_verdachtsflaechen_strasse,boden_verdachtsflaechen_bahn,boden_verdachtsflaechen_tram,boden_verdachtsflaechen_schiessanlage,boden_verdachtsflaechen_korrosion_objekte,boden_verdachtsflaechen_geogen"
    }
   ],
   "by": "Kanton BL",
   "id": "bl_pbv"
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
  }
 ],
 "AR": [
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
   "id": "ar_0"
  }
 ],
 "AI": [
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
   "id": "ai_0"
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
   "group": "Naturschutz-Inventare kantonal",
   "label": "Schutzverordnung: geschützter Wald, Einzelbäume, Baumgruppen, Gehölze",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00033_WMS/guest",
     "layers": "SV_Geschuetzter_Wald_F,SV_Geschuetzter_Wald_L,SV_Einzelbaum_Baumgruppe_Gehoelz_F,SV_Einzelbaum_Baumgruppe_Gehoelz_L,SV_Einzelbaum_Baumgruppe_Gehoelz_P"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_8"
  },
  {
   "group": "Naturschutz-Inventare kantonal",
   "label": "Waldreservate mit Vertrag",
   "src": [
    {
     "url": "https://services.geo.sg.ch/wss/service/SG00069_WMS/guest",
     "layers": "Waldreservatsperimeter"
    }
   ],
   "by": "Kanton SG",
   "id": "sg_9"
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
   "id": "sg_pbv"
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
   "group": "Prüfperimeter Bodenverschiebungen",
   "label": "Prüfperimeter Bodenaushub",
   "src": [
    {
     "url": "https://wms.geo.ag.ch/public/ch_ag_geo_afu_ppba/wms",
     "layers": "ch_ag_geo_afu_ppba"
    }
   ],
   "by": "Kanton AG",
   "id": "ag_pbv"
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
   "id": "vs_pbv"
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
  }
 ]
};
