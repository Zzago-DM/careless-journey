/* Viaggi in nave sulla Mappa del Mondo (js/viaggi.js).

   giorni   = durata con CIELO SERENO, decisa dal Master, misurata da costa a costa (i punti più vicini tra le due terre).
              Vale in tutte e due le direzioni. Si può scrivere anche 1.5 per «un giorno e mezzo».
   rotta    = i punti della rotta (coordinate della mappa, 2048 × 1536), dalla prima terra del nome alla seconda.
              Il primo e l'ultimo punto sono gli approdi: i punti di costa più vicini tra le due terre.
              La rotta è calcolata per passare nel cielo aperto: non sorvola altri continenti e gira attorno al Maelstrom.
              È la stessa con qualsiasi cielo: col brutto tempo la nave va solo più piano.
   nave     = dove sta ferma la nave su quella terra quando non c'è un viaggio (il suo approdo verso Ramsgate).

   Le altre condizioni del cielo moltiplicano i giorni (VG_CIELO.per) e arrotondano per eccesso al mezzo giorno.
   Il Maelstrom va sempre aggirato (VG_MAELSTROM è la zona da evitare). */
const VG_LUOGHI = {
  ramsgate:   { nome: "Ramsgate",              da: "da Ramsgate",              a: "a Ramsgate",              icona: "⚓", nave: [797, 700] },
  ardente:    { nome: "Continente Ardente",    da: "dal Continente Ardente",   a: "al Continente Ardente",   icona: "🔥", nave: [619, 506] },
  radiante:   { nome: "Continente Radiante",   da: "dal Continente Radiante",  a: "al Continente Radiante",  icona: "✨", nave: [965, 415] },
  folgorante: { nome: "Continente Folgorante", da: "dal Continente Folgorante",a: "al Continente Folgorante",icona: "⚡", nave: [1488, 700] },
  terrestre:  { nome: "Continente Terrestre",  da: "dal Continente Terrestre", a: "al Continente Terrestre", icona: "🌍", nave: [718, 883] },
  oscuro:     { nome: "Continente Oscuro",     da: "dal Continente Oscuro",    a: "al Continente Oscuro",    icona: "🌑", nave: [751, 1045] },
  glaciale:   { nome: "Continente Glaciale",   da: "dal Continente Glaciale",  a: "al Continente Glaciale",  icona: "❄", nave: [1360, 835] }
};
const VG_VIAGGI = {
  "ramsgate|ardente": { giorni: 2, rotta: [[746,664], [619,506]] },               /* Ramsgate ↔ Ardente */
  "ramsgate|radiante": { giorni: 4, rotta: [[788,666], [854,550], [870,526], [965,415]] },              /* Ramsgate ↔ Radiante */
  "ramsgate|folgorante": { giorni: 8, rotta: [[797,691], [834,590], [854,550], [870,526], [902,490], [942,458], [986,438], [1014,430], [1058,426], [1102,434], [1134,446], [1158,458], [1488,700]] },           /* Ramsgate ↔ Folgorante */
  "ramsgate|terrestre": { giorni: 2, rotta: [[745,738], [718,883]] },             /* Ramsgate ↔ Terrestre */
  "ramsgate|oscuro": { giorni: 3, rotta: [[754,739], [766,954], [766,1014], [751,1045]] },               /* Ramsgate ↔ Oscuro */
  "ramsgate|glaciale": { giorni: 10, rotta: [[795,708], [814,830], [834,890], [854,930], [874,958], [902,990], [942,1022], [986,1042], [1014,1050], [1058,1054], [1102,1046], [1134,1034], [1158,1022], [1198,990], [1360,835]] },            /* Ramsgate ↔ Glaciale */
  "ardente|radiante": { giorni: 1.5, rotta: [[807,233], [836,233]] },             /* Ardente ↔ Radiante */
  "ardente|folgorante": { giorni: 4, rotta: [[808,247], [842,302], [946,402], [962,418], [990,426], [1366,430], [1382,426], [1567,339]] },            /* Ardente ↔ Folgorante */
  "ardente|terrestre": { giorni: 1, rotta: [[287,591], [295,610]] },              /* Ardente ↔ Terrestre */
  "ardente|oscuro": { giorni: 4, rotta: [[387,564], [570,878], [574,898], [590,1058], [589,1062]] },                /* Ardente ↔ Oscuro */
  "ardente|glaciale": { giorni: 12, rotta: [[803,261], [846,306], [970,426], [1058,426], [1102,434], [1134,446], [1158,458], [1198,490], [1394,710], [1408,747]] },             /* Ardente ↔ Glaciale */
  "radiante|folgorante": { giorni: 1.5, rotta: [[1549,219], [1588,310]] },        /* Radiante ↔ Folgorante */
  "radiante|terrestre": { giorni: 4, rotta: [[967,416], [894,498], [870,526], [850,558], [826,610], [778,774], [726,885]] },             /* Radiante ↔ Terrestre */
  "radiante|oscuro": { giorni: 7, rotta: [[978,420], [898,494], [870,526], [850,558], [826,610], [810,666], [806,718], [810,958], [848,1041]] },               /* Radiante ↔ Oscuro */
  "radiante|glaciale": { giorni: 4, rotta: [[1377,422], [1428,737]] },            /* Radiante ↔ Glaciale */
  "folgorante|terrestre": { giorni: 12, rotta: [[1489,719], [1410,738], [1250,918], [1246,930], [1226,958], [1198,990], [1158,1022], [1114,1042], [1086,1050], [1042,1054], [998,1046], [966,1034], [759,917]] },         /* Folgorante ↔ Terrestre */
  "folgorante|oscuro": { giorni: 8, rotta: [[1499,732], [1510,802], [1510,818], [1498,854], [1486,874], [1303,1114]] },           /* Folgorante ↔ Oscuro */
  "folgorante|glaciale": { giorni: 1.5, rotta: [[1500,731], [1488,757]] },        /* Folgorante ↔ Glaciale */
  "terrestre|oscuro": { giorni: 1.5, rotta: [[713,1016], [714,1046]] },           /* Terrestre ↔ Oscuro */
  "terrestre|glaciale": { giorni: 5, rotta: [[760,922], [966,1034], [1014,1050], [1058,1054], [1102,1046], [1134,1034], [1158,1022], [1198,990], [1360,844]] },            /* Terrestre ↔ Glaciale */
  "oscuro|glaciale": { giorni: 1.5, rotta: [[1360,1365], [1383,1381]] },          /* Oscuro ↔ Glaciale */
};
const VG_CIELO = [
  { k: "sereno",   nome: "Cielo sereno",       icona: "☀",  per: 1,   nota: "La nave va a vele piene" },
  { k: "venti",    nome: "Venti contrari",     icona: "🌬", per: 1.3, nota: "La nave rallenta controvento" },
  { k: "burrasca", nome: "Burrasca",           icona: "🌧", per: 1.6, nota: "La nave avanza a fatica tra le raffiche" },
  { k: "tempesta", nome: "Tempesta aetherica", icona: "🌀", per: 2,   nota: "La nave procede a stento nella tempesta" }
];
/* zona da aggirare attorno al vortice: centro e raggi (orizzontale, verticale), margine compreso.
   Se la cambi, le rotte vanno ricalcolate. */
const VG_MAELSTROM = { x: 1050, y: 740, rx: 235, ry: 300 };
