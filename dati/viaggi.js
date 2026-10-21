/* Viaggi in nave sulla Mappa del Mondo (js/viaggi.js).

   giorni   = durata con CIELO SERENO, decisa dal Master, misurata da costa a costa (i punti più vicini tra le isole principali).
              Vale in tutte e due le direzioni. Si può scrivere anche 1.5 per «un giorno e mezzo».
   rotta    = i punti della rotta (coordinate della mappa, 2048 × 1536), dalla prima terra del nome alla seconda.
              Il primo e l'ultimo punto sono gli approdi: i punti di costa più vicini tra le due terre,
              misurati sull'isola principale di ogni continente (le isolette intorno non contano).
              La rotta è calcolata per passare nel cielo aperto: non sorvola altri continenti e gira attorno al Maelstrom.
              È la stessa con qualsiasi cielo: col brutto tempo la nave va solo più piano.
   nave     = dove sta ferma la nave su quella terra quando non c'è un viaggio (il suo approdo verso Ramsgate).

   Le altre condizioni del cielo moltiplicano i giorni (VG_CIELO.per) e arrotondano per eccesso al mezzo giorno.
   Il Maelstrom va sempre aggirato (VG_MAELSTROM è la zona da evitare). */
const VG_LUOGHI = {
  ramsgate:   { nome: "Ramsgate",              da: "da Ramsgate",              a: "a Ramsgate",              icona: "⚓", nave: [797, 700] },
  ardente:    { nome: "Continente Ardente",    da: "dal Continente Ardente",   a: "al Continente Ardente",   icona: "🔥", nave: [503, 514] },
  radiante:   { nome: "Continente Radiante",   da: "dal Continente Radiante",  a: "al Continente Radiante",  icona: "✨", nave: [1013, 414] },
  folgorante: { nome: "Continente Folgorante", da: "dal Continente Folgorante",a: "al Continente Folgorante",icona: "⚡", nave: [1615, 600] },
  terrestre:  { nome: "Continente Terrestre",  da: "dal Continente Terrestre", a: "al Continente Terrestre", icona: "🌍", nave: [560, 873] },
  oscuro:     { nome: "Continente Oscuro",     da: "dal Continente Oscuro",    a: "al Continente Oscuro",    icona: "🌑", nave: [869, 1056] },
  glaciale:   { nome: "Continente Glaciale",   da: "dal Continente Glaciale",  a: "al Continente Glaciale",  icona: "❄", nave: [1628, 1140] }
};
const VG_VIAGGI = {
  "ramsgate|ardente": { giorni: 2, rotta: [[737,678], [734,674], [506,518], [503,514]] },               /* Ramsgate ↔ Ardente */
  "ramsgate|radiante": { giorni: 4, rotta: [[787,668], [786,666], [786,662], [790,650], [806,622], [834,590], [1014,422], [1014,418], [1013,414]] },              /* Ramsgate ↔ Radiante */
  "ramsgate|folgorante": { giorni: 8, rotta: [[795,680], [794,678], [790,674], [790,670], [790,666], [786,662], [790,650], [806,622], [834,590], [862,566], [894,546], [950,522], [1010,510], [1430,518], [1610,598], [1615,600]] },           /* Ramsgate ↔ Folgorante */
  "ramsgate|terrestre": { giorni: 2, rotta: [[728,723], [726,722], [722,726], [560,873]] },             /* Ramsgate ↔ Terrestre */
  "ramsgate|oscuro": { giorni: 3, rotta: [[759,736], [758,742], [854,1026], [870,1050], [870,1054], [869,1056]] },               /* Ramsgate ↔ Oscuro */
  "ramsgate|glaciale": { giorni: 10, rotta: [[792,708], [794,714], [790,718], [786,722], [782,726], [778,730], [774,734], [770,738], [770,778], [782,814], [798,846], [826,882], [862,914], [902,938], [950,958], [1518,1070], [1610,1070], [1650,1110], [1650,1118], [1650,1122], [1646,1126], [1642,1130], [1638,1134], [1634,1138], [1628,1140]] },            /* Ramsgate ↔ Glaciale */
  "ardente|radiante": { giorni: 1.5, rotta: [[559,319], [562,318], [642,318], [674,286], [686,282], [830,290], [850,310], [874,318], [917,319]] },             /* Ardente ↔ Radiante */
  "ardente|folgorante": { giorni: 4, rotta: [[559,324], [682,366], [1610,570], [1615,574]] },            /* Ardente ↔ Folgorante */
  "ardente|terrestre": { giorni: 1, rotta: [[440,539], [442,542], [442,710], [430,730], [428,735]] },              /* Ardente ↔ Terrestre */
  "ardente|oscuro": { giorni: 4, rotta: [[450,539], [570,882], [582,978], [566,1102], [566,1118], [582,1134], [590,1134], [594,1134], [598,1135]] },                /* Ardente ↔ Oscuro */
  "ardente|glaciale": { giorni: 12, rotta: [[503,513], [506,518], [834,890], [862,914], [902,938], [950,958], [1518,1070], [1610,1070], [1650,1110], [1650,1118], [1646,1122], [1642,1126], [1638,1130], [1634,1134], [1629,1139]] },             /* Ardente ↔ Glaciale */
  "radiante|folgorante": { giorni: 1.5, rotta: [[1375,301], [1378,306], [1670,462], [1673,465]] },        /* Radiante ↔ Folgorante */
  "radiante|terrestre": { giorni: 4, rotta: [[920,341], [918,346], [486,778], [482,779]] },             /* Radiante ↔ Terrestre */
  "radiante|oscuro": { giorni: 7, rotta: [[1019,417], [1014,422], [742,666], [730,678], [718,702], [718,714], [722,726], [882,1050], [887,1053]] },               /* Radiante ↔ Oscuro */
  "radiante|glaciale": { giorni: 4, rotta: [[1359,316], [1374,330], [1398,366], [1402,378], [1494,758], [1502,766], [1650,1110], [1650,1118], [1650,1122], [1645,1124]] },            /* Radiante ↔ Glaciale */
  "folgorante|terrestre": { giorni: 12, rotta: [[1615,602], [1610,602], [1526,618], [1302,842], [1302,846], [1274,882], [1238,914], [1198,938], [1150,958], [1090,970], [870,966], [722,878], [570,878], [565,882]] },         /* Folgorante ↔ Terrestre */
  "folgorante|oscuro": { giorni: 8, rotta: [[1632,631], [1630,634], [1558,618], [1526,618], [1302,842], [1302,846], [1274,882], [1022,1126], [1018,1127]] },           /* Folgorante ↔ Oscuro */
  "folgorante|glaciale": { giorni: 1.5, rotta: [[1779,717], [1778,722], [1822,1134], [1822,1138], [1806,1154], [1794,1158], [1790,1158], [1786,1158], [1782,1154], [1778,1154], [1774,1150], [1746,1138], [1742,1138], [1738,1138], [1734,1138], [1730,1134], [1726,1130], [1722,1126], [1719,1121]] },        /* Folgorante ↔ Glaciale */
  "terrestre|oscuro": { giorni: 1.5, rotta: [[538,1044], [566,1118], [582,1134], [582,1138], [584,1140]] },           /* Terrestre ↔ Oscuro */
  "terrestre|glaciale": { giorni: 5, rotta: [[575,980], [698,1022], [1258,1086], [1418,1170], [1518,1242], [1530,1242], [1534,1242], [1538,1238], [1542,1234], [1546,1230], [1550,1226], [1554,1222], [1558,1218], [1562,1218], [1566,1218], [1570,1218], [1574,1218], [1578,1218], [1582,1218], [1586,1218], [1590,1218], [1594,1218], [1598,1222], [1602,1226], [1598,1230], [1594,1230], [1590,1230], [1586,1230], [1581,1234]] },            /* Terrestre ↔ Glaciale */
  "oscuro|glaciale": { giorni: 1.5, rotta: [[1095,1255], [1530,1242], [1534,1242], [1538,1238], [1542,1234], [1546,1230], [1550,1226], [1554,1222], [1558,1218], [1562,1218], [1566,1218], [1570,1218], [1574,1218], [1578,1218], [1582,1218], [1586,1218], [1590,1218], [1594,1218], [1598,1222], [1602,1226], [1598,1230], [1594,1234], [1590,1238], [1586,1242], [1581,1245]] },          /* Oscuro ↔ Glaciale */
};
const VG_CIELO = [
  { k: "sereno",   nome: "Cielo sereno",       icona: "☀",  per: 1,   nota: "La nave va a vele piene" },
  { k: "venti",    nome: "Venti contrari",     icona: "🌬", per: 1.3, nota: "La nave rallenta controvento" },
  { k: "burrasca", nome: "Burrasca",           icona: "🌧", per: 1.6, nota: "La nave avanza a fatica tra le raffiche" },
  { k: "tempesta", nome: "Tempesta aetherica", icona: "🌀", per: 2,   nota: "La nave procede a stento nella tempesta" }
];
/* zona da aggirare attorno al vortice: centro e raggi (orizzontale, verticale), margine compreso.
   Se la cambi, le rotte vanno ricalcolate. */
const VG_MAELSTROM = { x: 1050, y: 740, rx: 250, ry: 205 };   /* ovale orizzontale */
