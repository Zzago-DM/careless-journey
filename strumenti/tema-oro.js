/* Genera css/29-tema-oro-auto.css: la versione dorata dei colori cremisi della Zona Master e degli strumenti del Master.

       node strumenti/tema-oro.js

   Legge i fogli di stile elencati in FILE, trova le regole che usano i rossi del Master (#c84848, rgba(200,56,56,…),
   #ff6060, i rosa spenti dei testi…) e le riscrive con gli stessi selettori preceduti da html[data-el=oro], cambiando
   solo quei colori in oro. Gli altri colori (elementi, Mael, stati) restano come sono.
   Il tema «Oro del Master» si accende dal menu ⚔ Slayer › Zona Master › Colore del sito (vale solo sul dispositivo del Master).
   Rilancialo dopo aver aggiunto in questi file nuovi stili rossi per la Zona Master. Le parti fatte a mano
   (sole al posto dell'anello runico, scintille, animazioni) stanno in css/30-tema-oro.css. */
const fs = require("fs");
const path = require("path");
const RADICE = path.join(__dirname, "..");
/* [file, filtro sui selettori (null = tutte le regole rosse del file)] */
const FILE = [
  ["css/01-base.css", /\.master-btn|\.npc|\.pw|#ms|\.ms|(^|[\s,>])\.sc[\s,:.{]|\.sc$|\.scl|\.mq|\.mm[a-z]|\.bmc|\.fmb|\.mbcard|\.lock|\.pl-/],
  ["css/04-master-icone.css", null],
  ["css/05-plancia-galleria.css", null],
  ["css/06-master-animazioni.css", null],
  ["css/11-plancia-drop.css", null],
  ["css/18-sync-giocatori.css", null],
  ["css/21-incontri.css", /\.ie-|#inc-ed/],
  ["css/23-reliquie.css", /\.mr-|#mr|master/],
  ["css/24-master-mael.css", null],
];
const ESCLUDI = /morto|data-el|:root|@keyframes/;

/* ---------- colori ---------- */
function rgb2hsl(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if(mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl2rgb(h, s, l){
  h /= 360;
  const f = (p, q, t) => { if(t < 0) t += 1; if(t > 1) t -= 1; if(t < 1/6) return p + (q - p) * 6 * t; if(t < 1/2) return q; if(t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  if(s === 0) return [l, l, l].map(v => Math.round(v * 255));
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1/3), f(p, q, h), f(p, q, h - 1/3)].map(v => Math.round(v * 255));
}
function rosso(r, g, b){ const [h, s, l] = rgb2hsl(r, g, b); return s >= .12 && l > .04 && (h >= 345 || h <= 9); }
function oro(r, g, b){
  const [, s, l] = rgb2hsl(r, g, b);
  /* oro intenso: tonalità 42°, un po' più saturo e chiaro dei rossi di partenza */
  return hsl2rgb(42, Math.min(1, s * 1.25 + .18), Math.min(.9, l * 1.03 + .01));
}
function hex(n){ return n.toString(16).padStart(2, "0"); }
let cambi = 0;
function converti(v){
  return v
    .replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (m, x) => {
      if(x.length === 3) x = x.split("").map(c => c + c).join("");
      const r = parseInt(x.slice(0, 2), 16), g = parseInt(x.slice(2, 4), 16), b = parseInt(x.slice(4, 6), 16);
      if(!rosso(r, g, b)) return m;
      cambi++; const o = oro(r, g, b); return "#" + o.map(hex).join("");
    })
    .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)/g, (m, r, g, b, a) => {
      if(!rosso(+r, +g, +b)) return m;
      cambi++; const o = oro(+r, +g, +b); return (a ? "rgba(" : "rgb(") + o.join(",") + (a || "") + ")";
    });
}

/* ---------- lettura dei fogli (basta un livello di @media) ---------- */
function blocchi(css){
  const out = []; let i = 0;
  while(i < css.length){
    const ap = css.indexOf("{", i); if(ap < 0) break;
    const testa = css.slice(i, ap).trim();
    let prof = 1, j = ap + 1;
    while(j < css.length && prof){ if(css[j] === "{") prof++; else if(css[j] === "}") prof--; j++; }
    out.push({ testa, corpo: css.slice(ap + 1, j - 1) });
    i = j;
  }
  return out;
}
function regole(css, filtro, media){
  let out = "";
  blocchi(css).forEach(({ testa, corpo }) => {
    if(/^@media|^@supports/.test(testa)){ const dentro = regole(corpo, filtro, true); if(dentro) out += testa + "{\n" + dentro + "}\n"; return; }
    if(/^@/.test(testa) || ESCLUDI.test(testa)) return;
    const sel = testa.split(",").map(s => s.trim()).filter(Boolean);
    const scelti = filtro ? sel.filter(s => filtro.test(s)) : sel;
    if(!scelti.length) return;
    const dich = corpo.split(";").map(d => d.trim()).filter(Boolean).filter(d => /:/.test(d));
    const nuove = [];
    dich.forEach(d => { const prima = cambi, n = converti(d); if(cambi !== prima) nuove.push(n); });
    if(!nuove.length) return;
    out += (media ? "  " : "") + scelti.map(s => "html[data-el=oro] " + s.replace(/^html\s*/, "")).join(",") + "{" + nuove.join(";") + "}\n";
  });
  return out;
}

let css = "/* GENERATO da strumenti/tema-oro.js — non modificare a mano: rilancia lo strumento.\n   Tema «Oro del Master»: i rossi della Zona Master diventano oro. */\n";
FILE.forEach(([f, filtro]) => {
  const testo = fs.readFileSync(path.join(RADICE, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const r = regole(testo, filtro, false);
  if(r) css += "\n/* da " + f + " */\n" + r;
});
fs.writeFileSync(path.join(RADICE, "css/29-tema-oro-auto.css"), css);
console.log("css/29-tema-oro-auto.css: " + cambi + " colori convertiti");
