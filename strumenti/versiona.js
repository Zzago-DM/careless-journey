/* Etichette di versione per i file del sito — da lanciare prima di ogni pubblicazione:
       node strumenti/versiona.js
   Cosa fa:
   1. a ogni file richiamato dalla pagina (js/…, css/…, dati/…, sezioni/…) aggiunge un'etichetta "?v=…"
      che cambia solo quando cambia il contenuto di quel file: così il browser scarica di nuovo
      solo i file davvero modificati, e mai un miscuglio di vecchio e nuovo;
   2. scrive la versione dell'intera pagina in index.html (TCJ_VERSIONE) e in versione.json:
      se un browser apre una copia vecchia della pagina, se ne accorge e si aggiorna.
   Si può lanciare quante volte si vuole: se nulla è cambiato, non cambia nulla. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const RADICE = path.join(__dirname, "..");
/* file che richiamano altri file del sito, in ordine: prima quelli "interni", per ultima la pagina */
const DA_AGGIORNARE = ["sezioni/mappe/maelstrom.js", "index.html"];
const RIF = /(["'`])((?:js|css|dati|sezioni|media)\/[A-Za-z0-9_\-\/.]+?\.(?:js|css|html|json|webp|png|jpg|svg))(?:\?v=[0-9a-f]+)?\1/g;
const impronta = t => crypto.createHash("sha1").update(t).digest("hex").slice(0, 8);
const leggi = f => fs.readFileSync(path.join(RADICE, f));
let cambiati = 0;

for (const f of DA_AGGIORNARE) {
  const prima = leggi(f).toString("utf8");
  let dopo = prima.replace(RIF, (tutto, q, rif) => {
    const p = path.join(RADICE, rif);
    if (!fs.existsSync(p)) { console.warn("  ! " + f + ": non trovo " + rif + " (lasciato com'è)"); return tutto; }
    return q + rif + "?v=" + impronta(fs.readFileSync(p)) + q;
  });
  if (f === "index.html") {
    const senza = dopo.replace(/var TCJ_VERSIONE="[^"]*"/, 'var TCJ_VERSIONE=""');
    const v = impronta(senza);
    dopo = senza.replace('var TCJ_VERSIONE=""', 'var TCJ_VERSIONE="' + v + '"');
    const vj = JSON.stringify({ versione: v }) + "\n";
    const pj = path.join(RADICE, "versione.json");
    if (!fs.existsSync(pj) || fs.readFileSync(pj, "utf8") !== vj) { fs.writeFileSync(pj, vj); cambiati++; console.log("  versione.json → " + v); }
    else console.log("  versione invariata: " + v);
  }
  if (dopo !== prima) { fs.writeFileSync(path.join(RADICE, f), dopo); cambiati++; console.log("  aggiornato " + f); }
}
console.log(cambiati ? "Fatto." : "Niente da aggiornare.");
