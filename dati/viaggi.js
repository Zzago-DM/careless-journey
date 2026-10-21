/* Viaggi in nave sulla Mappa del Mondo (js/viaggi.js).

   giorni   = durata con CIELO SERENO, decisa dal Master, misurata da costa a costa (i punti più vicini tra le due terre).
              Vale in tutte e due le direzioni. Si può scrivere anche 1.5 per «un giorno e mezzo».
   approdi  = i due punti di costa da cui parte e a cui arriva la rotta (coordinate della mappa, 2048 × 1536):
              il primo è sulla prima terra del nome, il secondo sulla seconda. Calcolati come i punti di costa più vicini.
   nave     = dove sta ferma la nave su quella terra quando non c'è un viaggio (il suo approdo verso Ramsgate).

   Le altre condizioni del cielo moltiplicano i giorni (VG_CIELO.per) e arrotondano per eccesso al mezzo giorno.
   Il Maelstrom va sempre aggirato: le rotte gli girano attorno da sole (VG_MAELSTROM). */
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
  "ramsgate|ardente": { giorni: 2, approdi: [[746,664], [619,506]] },               /* Ramsgate ↔ Ardente */
  "ramsgate|radiante": { giorni: 4, approdi: [[788,666], [965,415]] },              /* Ramsgate ↔ Radiante */
  "ramsgate|folgorante": { giorni: 8, approdi: [[797,691], [1488,700]] },           /* Ramsgate ↔ Folgorante */
  "ramsgate|terrestre": { giorni: 2, approdi: [[745,738], [718,883]] },             /* Ramsgate ↔ Terrestre */
  "ramsgate|oscuro": { giorni: 3, approdi: [[754,739], [751,1045]] },               /* Ramsgate ↔ Oscuro */
  "ramsgate|glaciale": { giorni: 10, approdi: [[795,708], [1360,835]] },            /* Ramsgate ↔ Glaciale */
  "ardente|radiante": { giorni: 1.5, approdi: [[807,233], [836,233]] },             /* Ardente ↔ Radiante */
  "ardente|folgorante": { giorni: 4, approdi: [[808,247], [1567,339]] },            /* Ardente ↔ Folgorante */
  "ardente|terrestre": { giorni: 1, approdi: [[287,591], [295,610]] },              /* Ardente ↔ Terrestre */
  "ardente|oscuro": { giorni: 4, approdi: [[387,564], [589,1062]] },                /* Ardente ↔ Oscuro */
  "ardente|glaciale": { giorni: 12, approdi: [[803,261], [1408,747]] },             /* Ardente ↔ Glaciale */
  "radiante|folgorante": { giorni: 1.5, approdi: [[1549,219], [1588,310]] },        /* Radiante ↔ Folgorante */
  "radiante|terrestre": { giorni: 4, approdi: [[967,416], [726,885]] },             /* Radiante ↔ Terrestre */
  "radiante|oscuro": { giorni: 7, approdi: [[978,420], [848,1041]] },               /* Radiante ↔ Oscuro */
  "radiante|glaciale": { giorni: 4, approdi: [[1377,422], [1428,737]] },            /* Radiante ↔ Glaciale */
  "folgorante|terrestre": { giorni: 12, approdi: [[1489,719], [759,917]] },         /* Folgorante ↔ Terrestre */
  "folgorante|oscuro": { giorni: 8, approdi: [[1499,732], [1303,1114]] },           /* Folgorante ↔ Oscuro */
  "folgorante|glaciale": { giorni: 1.5, approdi: [[1500,731], [1488,757]] },        /* Folgorante ↔ Glaciale */
  "terrestre|oscuro": { giorni: 1.5, approdi: [[713,1016], [714,1046]] },           /* Terrestre ↔ Oscuro */
  "terrestre|glaciale": { giorni: 5, approdi: [[760,922], [1360,844]] },            /* Terrestre ↔ Glaciale */
  "oscuro|glaciale": { giorni: 1.5, approdi: [[1360,1365], [1383,1381]] },          /* Oscuro ↔ Glaciale */
};
const VG_CIELO = [
  { k: "sereno",   nome: "Cielo sereno",       icona: "☀",  per: 1,   rotta: "Rotta diretta" },
  { k: "venti",    nome: "Venti contrari",     icona: "🌬", per: 1.3, rotta: "Si bordeggia controvento" },
  { k: "burrasca", nome: "Burrasca",           icona: "🌧", per: 1.6, rotta: "Deviazione larga tra le raffiche" },
  { k: "tempesta", nome: "Tempesta aetherica", icona: "🌀", per: 2,   rotta: "Giro lungo e tortuoso" }
];
/* zona da aggirare: centro e raggi (orizzontale, verticale) attorno al vortice, margine compreso */
const VG_MAELSTROM = { x: 1050, y: 740, rx: 235, ry: 300 };
