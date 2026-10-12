/* Calcola l'«impronta» di un codice per le aree dei giocatori (da incollare in PA_HASH, js/area-giocatori.js).
       node strumenti/impronta.js "NuovoCodice"
   Maiuscole e minuscole non contano: il sito confronta sempre il codice in minuscolo. */
const crypto = require("crypto");
const codice = process.argv.slice(2).join(" ").trim();
if(!codice){ console.log('Uso: node strumenti/impronta.js "NuovoCodice"'); process.exit(1); }
console.log(crypto.createHash("sha256").update("tcj·" + codice.toLowerCase(), "utf8").digest("hex"));
