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
  "ramsgate|radiante": { giorni: 4, rotta: [[788,666], [965,415]] },              /* Ramsgate ↔ Radiante */
  "ramsgate|folgorante": { giorni: 8, rotta: [[797,691], [798,666], [810,642], [838,606], [850,594], [886,566], [914,550], [954,534], [1014,522], [1098,522], [1158,538], [1194,554], [1488,700]] },           /* Ramsgate ↔ Folgorante */
  "ramsgate|terrestre": { giorni: 2, rotta: [[745,738], [718,883]] },             /* Ramsgate ↔ Terrestre */
  "ramsgate|oscuro": { giorni: 3, rotta: [[754,739], [766,954], [766,1014], [751,1045]] },               /* Ramsgate ↔ Oscuro */
  "ramsgate|glaciale": { giorni: 10, rotta: [[795,708], [782,734], [786,778], [798,814], [810,838], [838,874], [850,886], [886,914], [914,930], [958,946], [1010,958], [1090,958], [1158,942], [1194,926], [1360,835]] },            /* Ramsgate ↔ Glaciale */
  "ardente|radiante": { giorni: 1.5, rotta: [[807,233], [836,233]] },             /* Ardente ↔ Radiante */
  "ardente|folgorante": { giorni: 4, rotta: [[808,247], [842,302], [946,402], [962,418], [990,426], [1366,430], [1382,426], [1567,339]] },            /* Ardente ↔ Folgorante */
  "ardente|terrestre": { giorni: 1, rotta: [[287,591], [295,610]] },              /* Ardente ↔ Terrestre */
  "ardente|oscuro": { giorni: 4, rotta: [[387,564], [570,878], [574,898], [590,1058], [589,1062]] },                /* Ardente ↔ Oscuro */
  "ardente|glaciale": { giorni: 12, rotta: [[803,261], [846,306], [1070,522], [1114,526], [1158,538], [1194,554], [1218,570], [1254,598], [1408,747]] },             /* Ardente ↔ Glaciale */
  "radiante|folgorante": { giorni: 1.5, rotta: [[1549,219], [1588,310]] },        /* Radiante ↔ Folgorante */
  "radiante|terrestre": { giorni: 4, rotta: [[967,416], [730,674], [718,698], [726,885]] },             /* Radiante ↔ Terrestre */
  "radiante|oscuro": { giorni: 7, rotta: [[978,420], [730,674], [718,698], [722,762], [848,1041]] },               /* Radiante ↔ Oscuro */
  "radiante|glaciale": { giorni: 4, rotta: [[1377,422], [1428,737]] },            /* Radiante ↔ Glaciale */
  "folgorante|terrestre": { giorni: 12, rotta: [[1489,719], [1394,742], [1250,886], [1214,914], [1186,930], [1142,946], [1090,958], [834,954], [759,917]] },         /* Folgorante ↔ Terrestre */
  "folgorante|oscuro": { giorni: 8, rotta: [[1499,732], [1510,802], [1510,818], [1498,854], [1486,874], [1303,1114]] },           /* Folgorante ↔ Oscuro */
  "folgorante|glaciale": { giorni: 1.5, rotta: [[1500,731], [1488,757]] },        /* Folgorante ↔ Glaciale */
  "terrestre|oscuro": { giorni: 1.5, rotta: [[713,1016], [714,1046]] },           /* Terrestre ↔ Oscuro */
  "terrestre|glaciale": { giorni: 5, rotta: [[760,922], [1022,958], [1118,958], [1194,926], [1360,844]] },            /* Terrestre ↔ Glaciale */
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
const VG_MAELSTROM = { x: 1050, y: 740, rx: 250, ry: 205 };   /* ovale orizzontale */
