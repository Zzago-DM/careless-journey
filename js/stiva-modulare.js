/* Stiva Modulare — Nave › Stiva Modulare › «Entra nella Stiva Modulare».
   La stanza è un quadrato di lato 3x: al centro la NAVATA (larga x, lunga 3x) con l'ascensore all'altezza della parete
   tra le stanze 3 e 4; ai lati 4 spazi per parte (S1–S4 a sinistra, D1–D4 a destra), ognuno largo x e profondo ¾x.
   - piccola = 1 spazio · media = 2 spazi vicini sullo stesso lato · grande = la navata oppure un lato intero (4 spazi)
   - ogni stanza si può ampliare o ridurre di una misura, tra quelle che il suo tipo permette; si può smontare
   - la navata senza nessun uso resta un corridoio vuoto
   Le stanze si cambiano quando si vuole (quando farlo lo decidono Master e giocatori al tavolo).
   Ogni stanza ha una descrizione di cosa ci si fa, un set di competenze e un foglio di note comune.
   I dati stanno nella stiva condivisa (js/stiva.js, repository gruppo, stiva.json), campo mod:
     mod.st  = [ { id, t: tipo, s: [spazi 0–7], nome, comp: [competenze dello spazio libero], note } ]   (0–3 = S1–S4, 4–7 = D1–D4)
     mod.nav = null oppure { t: tipo, nome, comp, note } */
(function(){
  "use strict";
  if(!window.STV) return;
  var S = window.STV, esc = S.disegno.esc;

  /* ---------- catalogo ---------- */
  var T = [
    { id: "lab", i: "🔬", n: "Laboratorio aetherico", mis: "pm", comp: ["beh", "inv2", "poz"], d: "Studiare artefatti, reliquie, parti di mostro e campioni d'aether; fare esperimenti. Nella media si lavora in due." },
    { id: "bib", i: "📚", n: "Biblioteca", mis: "pm", comp: ["stor", "trad", "inv2"], d: "Raccogliere libri, mappe e documenti trovati nei viaggi; fare ricerche su Mael, Behemoth e luoghi; tenere il diario di bordo." },
    { id: "inf", i: "⚕️", n: "Infermeria", mis: "pm", comp: ["poz", "intu", "nat"], d: "Curare ferite e stati dopo una caccia, riposare. Nella media ci sono più letti per ospitare feriti." },
    { id: "off", i: "🔨", n: "Officina", mis: "pm", comp: ["rap", "perc", "atl"], d: "Riparare armi, armature e pezzi della nave; piccoli lavori di costruzione." },
    { id: "ghi", i: "🧊", n: "Ghiacciaia", mis: "pm", comp: ["soprav", "nat"], d: "Conservare viveri freschi e parti di mostro che si guastano." },
    { id: "ser", i: "🌿", n: "Serra", mis: "mg", comp: ["nat", "poz", "amm"], d: "Coltivare erbe per i tonici e un po' di cibo fresco; un angolo di verde a bordo." },
    { id: "cab", i: "🛏️", n: "Cabina", mis: "pm", comp: ["pers", "intr", "intu"], d: "Ospitare PNG, passeggeri o membri dell'equipaggio. La media può essere un alloggio con più letti o una cabina di lusso." },
    { id: "cel", i: "⛓️", n: "Cella", mis: "pm", comp: ["intim", "ing", "intu"], d: "Tenere prigionieri. Nella media ci sono più celle o una stanza per gli interrogatori." },
    { id: "add", i: "🗡️", n: "Sala d'addestramento", mis: "g", comp: ["atl", "acro"], d: "Allenarsi al combattimento, fare sparring, provare armi nuove." },
    { id: "pol", i: "🎯", n: "Poligono di tiro", mis: "g", comp: ["perc", "rap"], d: "Esercitarsi con pistole e archi aetherici, con bersagli fissi e mobili." },
    { id: "sti", i: "📦", n: "Stiva aggiuntiva", mis: "mg", comp: ["atl", "furt"], d: "Carichi ingombranti, casse, prede di grossa taglia." },
    { id: "lib", i: "✎", n: "Spazio libero", mis: "pmg", comp: [], d: "Nome e uso li scrivete voi." }
  ];
  var MIS = { p: "piccola", m: "media", g: "grande" };
  var REGOLA = "Chi passa del tempo in una stanza durante il viaggio sceglie una competenza del suo set: fino alla fine della missione successiva, se non ce l'ha la ottiene come competenza temporanea, se ce l'ha già prende +1. Una stanza piccola la può usare 1 Slayer per viaggio, una media 2, una grande tutto il gruppo.";
  var MAX_NOTE = 2000, MAX_NOME = 40;
  function tipo(id){ for(var i = 0; i < T.length; i++) if(T[i].id === id) return T[i]; return null; }
  function COMP(){ return typeof SC_COMPS !== "undefined" ? SC_COMPS : []; }
  function nomeComp(id){ var c = COMP().filter(function(x){ return x.id === id; })[0]; return c ? c.nm : id; }
  function spazio(i){ return (i < 4 ? "S" : "D") + (i % 4 + 1); }
  function misura(n){ return n >= 4 ? "g" : n === 2 ? "m" : "p"; }
  function nomeStanza(r){ var t = tipo(r.t); return (r.t === "lib" && r.nome) ? r.nome : (t ? t.n : "Stanza"); }
  function compDi(r){ var t = tipo(r.t); return r.t === "lib" ? (Array.isArray(r.comp) ? r.comp : []) : (t ? t.comp : []); }
  function uid(){ return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- dati ---------- */
  function normStanza(r){
    var o = { t: r.t, nome: String(r.nome || "").slice(0, MAX_NOME), note: String(r.note || "").slice(0, MAX_NOTE) };
    if(r.t === "lib") o.comp = (Array.isArray(r.comp) ? r.comp : []).filter(function(c){ return typeof c === "string"; }).slice(0, 3);
    return o;
  }
  function M(d){
    var m = d.mod && typeof d.mod === "object" ? d.mod : {}, usati = {}, st = [];
    (Array.isArray(m.st) ? m.st : []).forEach(function(r){
      if(!r || !tipo(r.t) || !Array.isArray(r.s)) return;
      var s = r.s.map(function(x){ return parseInt(x, 10); }).filter(function(x){ return x >= 0 && x < 8; }).sort(function(a, b){ return a - b; });
      if(!valido(s) || tipo(r.t).mis.indexOf(misura(s.length)) < 0 || s.some(function(x){ return usati[x]; })) return;
      s.forEach(function(x){ usati[x] = 1; });
      var o = normStanza(r); o.id = String(r.id || uid()); o.s = s; st.push(o);
    });
    var nav = m.nav && tipo(m.nav.t) && tipo(m.nav.t).mis.indexOf("g") >= 0 ? normStanza(m.nav) : null;
    d.mod = { st: st, nav: nav };
    return d.mod;
  }
  /* spazi vicini, sullo stesso lato, 1, 2 o 4 */
  function valido(s){
    if([1, 2, 4].indexOf(s.length) < 0) return false;
    var lato = s[0] < 4 ? 0 : 1;
    for(var i = 0; i < s.length; i++){ if((s[i] < 4 ? 0 : 1) !== lato) return false; if(i && s[i] !== s[i - 1] + 1) return false; }
    return true;
  }
  function mod(){ return M(JSON.parse(JSON.stringify(S.doc()))); }
  function stanzaIn(m, i){ for(var k = 0; k < m.st.length; k++) if(m.st[k].s.indexOf(i) >= 0) return m.st[k]; return null; }
  function liberi(m, s, tranne){ return s.every(function(i){ var r = stanzaIn(m, i); return !r || r.id === tranne; }); }
  function stanzaId(m, id){ return m.st.filter(function(r){ return r.id === id; })[0] || null; }

  /* ---------- disegno della pianta ---------- */
  var X = 220, P = 165, L = 3 * X, ASC_Y = 3 * P;
  var WOOD = "#2a1d12", WALL = "#a87c3c";
  function Disegno(){ this.g = []; this.tx = []; }
  Disegno.prototype = {
    r: function(x, y, w, h, f, s, sw, rx, ex){ this.g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); },
    c: function(x, y, R, f, s, sw, ex){ this.g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); },
    l: function(x1, y1, x2, y2, s, sw, ex){ this.g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); },
    p: function(str){ this.g.push(str); },
    t: function(x, y, s, f, sz, ex){ this.tx.push({ x: x, y: y, s: s, f: f, sz: sz, ex: ex || "" }); }
  };
  function letto(D, x, y, w, h, col){ w = w || 34; h = h || 62; D.r(x, y, w, h, "#5a3d22", "#3a2614", 1.5, 3); D.r(x + 3, y + 4, w - 6, 13, "#e6dccd", "", 0, 3); D.r(x + 3, y + 20, w - 6, h - 24, col || "#7a4a3a", "", 0, 2); }
  function libri(D, x, y, w, h, vert){ D.r(x, y, w, h, "#3d2614", "#5a3d22", 1.5); var n = vert ? Math.floor(h / 7) : Math.floor(w / 7), C = ["#8a2a2a", "#2a5a7a", "#6a7a2a", "#7a5a2a", "#4a2a6a", "#8a6a2a"]; for(var i = 0; i < n; i++){ if(vert) D.r(x + 2, y + 2 + i * 7, w - 4, 5, C[i % 6]); else D.r(x + 2 + i * 7, y + 2, 5, h - 4, C[i % 6]); } }
  function cassa(D, x, y, s){ s = s || 26; D.r(x, y, s, s, "#9a6a38", "#4a2c13", 2); D.l(x, y, x + s, y + s, "#4a2c13", 2); D.l(x + s, y, x, y + s, "#4a2c13", 2); }
  function barile(D, x, y, R){ R = R || 13; D.c(x, y, R, "#704626", "#3a2614", 2); D.c(x, y, R - 5, "none", "#8d8d8d", 1.5); }

  /* ogni arredo è pensato per uno spazio (X × P), con la porta sul lato destro; per le stanze di destra si specchia */
  var ARREDO = {
    lab: function(D, x, y){
      D.r(x + 10, y + 10, X - 34, 26, "#4a4640", "#6a655c", 1.5); D.c(x + 34, y + 23, 8, "rgba(111,184,200,.55)", "#9fd8e8"); D.c(x + 58, y + 23, 6, "rgba(160,112,232,.55)", "#c8a8ff"); D.c(x + 78, y + 23, 7, "rgba(79,200,120,.55)", "#9fe8b8");
      D.l(x + 120, y + 23, x + 140, y + 46, "#8a8070", 3); D.c(x + 140, y + 46, 7, "rgba(230,230,255,.25)", "#dcd6c8", 1.5);
      D.r(x + 12, y + P - 52, 78, 40, "#0c0907", "#d2a85a", 1.5);
      ["#7ec8e3", "#e05a20", "#e8c820", "#4a9640", "#d4a8ff", "#8860d0"].forEach(function(k, i){ var cx = x + 24 + (i % 3) * 24, cy = y + P - 41 + Math.floor(i / 3) * 18; D.p('<polygon class="sm-cristallo" points="' + cx + ',' + (cy - 6) + ' ' + (cx + 5) + ',' + cy + ' ' + cx + ',' + (cy + 6) + ' ' + (cx - 5) + ',' + cy + '" fill="' + k + '"/>'); });
      D.c(x + 150, y + 100, 9, "#5a3d22", "#3a2614", 1.5);
    },
    bib: function(D, x, y){
      libri(D, x + 8, y + 8, X - 40, 16, false); libri(D, x + 8, y + 28, 16, P - 38, true);
      D.r(x + 70, y + 62, 80, 46, "#6a4526", "#3a2614", 2, 3); D.r(x + 84, y + 72, 26, 18, "#e6dccd", "#a39478", 1, 0, 'transform="rotate(-8 ' + (x + 97) + ' ' + (y + 81) + ')"'); D.r(x + 118, y + 76, 22, 10, "#d8c8a0", "", 0, 5);
      D.c(x + 110, y + 124, 9, "#5a3d22", "#3a2614"); D.c(x + 110, y + 48, 9, "#5a3d22", "#3a2614"); D.c(x + 170, y + 128, 12, "#2a5a7a", "#d2a85a", 1.5);
    },
    inf: function(D, x, y){
      letto(D, x + 14, y + 12); letto(D, x + 62, y + 12); D.r(x + 12, y + P - 40, 52, 28, "#e6dccd", "#a39478", 1.5, 2); D.t(x + 38, y + P - 20, "✚", "#c84848", 16);
      D.r(x + 120, y + 14, 60, 22, "#4a6a6a", "#2a3a3a", 1.5); D.c(x + 150, y + 100, 12, "#c8c0b0", "#8a8070", 1.5); D.c(x + 150, y + 100, 6, "#7ec8e3");
    },
    off: function(D, x, y){
      D.r(x + 10, y + 10, X - 34, 26, "#5a3d22", "#3a2614", 2); D.l(x + 30, y + 14, x + 30, y + 32, "#9a9a9a", 3); D.l(x + 44, y + 14, x + 52, y + 32, "#9a9a9a", 3); D.r(x + 70, y + 16, 22, 12, "#8a8a8a");
      D.p('<path d="M' + (x + 40) + ' ' + (y + 92) + ' h44 l-8 14 h-28 z" fill="#4a4a4a" stroke="#2a2a2a" stroke-width="1.5"/>'); D.r(x + 50, y + 106, 24, 16, "#3a3a3a");
      D.r(x + 10, y + 50, 14, P - 60, "#3a2614", "#5a3d22"); for(var i = 0; i < 5; i++) D.l(x + 12, y + 60 + i * 18, x + 22, y + 60 + i * 18, "#9a9a9a", 2);
      cassa(D, x + 130, y + P - 40); cassa(D, x + 160, y + P - 40, 22);
    },
    ghi: function(D, x, y){
      D.r(x + 6, y + 6, X - 12, P - 12, "rgba(126,200,227,.10)", "rgba(158,216,240,.55)", 3, 2, 'stroke-dasharray="2 4"');
      for(var i = 0; i < 4; i++) D.r(x + 16 + i * 36, y + 16, 30, 30, "rgba(190,230,250,.75)", "#e8f6ff", 1.5, 3);
      for(var j = 0; j < 3; j++) D.r(x + 16 + j * 36, y + 52, 30, 30, "rgba(190,230,250,.6)", "#e8f6ff", 1.5, 3);
      cassa(D, x + 20, y + P - 44, 26); cassa(D, x + 52, y + P - 44, 26); barile(D, x + 120, y + P - 30); barile(D, x + 150, y + P - 30);
      D.l(x + 164, y + 16, x + 164, y + 80, "#8d8d8d", 2); D.c(x + 164, y + 80, 4, "#8a3a3a");
    },
    cab: function(D, x, y){
      D.r(x + 60, y + 40, 90, 80, "#5a2a2a", "#8a5a3a", 2, 4, 'opacity=".8"'); letto(D, x + 14, y + 14, 42, 72, "#2a4a6a");
      D.r(x + 120, y + 12, 60, 20, "#6a4526", "#3a2614", 1.5); D.c(x + 150, y + 42, 8, "#5a3d22", "#3a2614");
      D.r(x + 14, y + P - 34, 40, 22, "#4a2c13", "#2a1a0a", 1.5); D.c(x + 100, y + 80, 4, "#ffd27a", "", 0, 'class="sm-lume"');
    },
    cel: function(D, x, y){
      D.r(x + 6, y + 6, X - 90, P - 12, "#1a1410"); for(var i = 0; i < 12; i++) D.l(x + X - 84, y + 8 + i * 13, x + X - 84, y + 14 + i * 13, "#9a9a9a", 3);
      D.r(x + 14, y + 14, 30, 58, "#3a3226", "#2a2218", 1.5); D.c(x + 100, y + P - 28, 9, "#5a4a3a", "#3a2a1a");
      D.c(x + 60, y + P - 40, 3, "#9a9a9a"); D.l(x + 60, y + P - 40, x + 76, y + P - 30, "#9a9a9a", 2); D.t(x + X - 42, y + P / 2 + 5, "🗝", "#a39478", 16);
    }
  };
  function serra(D, x, y){ for(var i = 0; i < 4; i++){ D.r(x + 16, y + 18 + i * 74, X - 60, 40, "#3a2414", "#5a3d22", 2, 3); for(var j = 0; j < 7; j++) D.c(x + 30 + j * 20, y + 38 + i * 74, 7 + (j % 2) * 2, ["#3f7a3a", "#5aa04a", "#4a8a3a"][(i + j) % 3]); } barile(D, x + X - 26, y + 2 * P - 30, 14); D.c(x + X - 26, y + 2 * P - 30, 7, "#4a8aa8"); }
  function stiva(D, x, y){
    for(var i = 0; i < 4; i++) for(var j = 0; j < 3; j++){ var cx = x + 18 + j * 44, cy = y + 18 + i * 48; if((i + j) % 3 === 1) barile(D, cx + 14, cy + 14, 15); else cassa(D, cx, cy, 30); }
    D.r(x + 20, y + 2 * P - 100, 120, 70, "#4a3a2a", "#2a1a0a", 2, 3); D.l(x + 20, y + 2 * P - 100, x + 140, y + 2 * P - 30, "#2a1a0a", 2); D.l(x + 140, y + 2 * P - 100, x + 20, y + 2 * P - 30, "#2a1a0a", 2);
  }
  function addestramento(D, x, y){
    var h = 4 * P;
    D.r(x + 24, y + 30, X - 48, 240, "rgba(140,40,40,.35)", "#8a3a3a", 2, 4); D.c(x + X / 2, y + 150, 70, "none", "rgba(230,200,160,.35)", 2, 'stroke-dasharray="5 6"');
    [[60, 100], [160, 100], [110, 200]].forEach(function(q){ D.c(x + q[0], y + q[1], 11, "#b89a68", "#5a3d22", 2); D.l(x + q[0] - 16, y + q[1], x + q[0] + 16, y + q[1], "#5a3d22", 4); });
    D.r(x + 6, y + 292, 16, 150, "#3a2614"); D.r(x + X - 22, y + 292, 16, 150, "#3a2614");
    for(var i = 0; i < 5; i++){ D.l(x + 8, y + 300 + i * 30, x + 20, y + 300 + i * 30, "#c8c8c8", 3); D.l(x + X - 8, y + 300 + i * 30, x + X - 20, y + 300 + i * 30, "#c8c8c8", 3); }
    D.r(x + 40, y + h - 50, X - 80, 24, "#5a3d22", "#3a2614", 1.5, 3);
  }
  function poligono(D, x, y){
    var h = 4 * P;
    for(var i = 1; i < 3; i++) D.l(x + i * X / 3, y + 80, x + i * X / 3, y + 400, "rgba(230,200,160,.35)", 2, 'stroke-dasharray="8 6"');
    for(var k = 0; k < 3; k++){ var cx = x + X / 6 + k * X / 3; [22, 15, 8].forEach(function(R, n){ D.c(cx, y + 40, R, ["#e6dccd", "#c84848", "#e6dccd"][n], "#3a2614", 1.5); }); D.c(cx, y + 40, 3, "#c84848"); }
    D.r(x + 10, y + 404, X - 20, 18, "#6a4526", "#3a2614", 2, 2); for(var j = 0; j < 3; j++) D.c(x + X / 6 + j * X / 3, y + 436, 8, "#5a3d22", "#3a2614");
    D.r(x + 30, y + h - 60, X - 60, 34, "#3a2614", "#5a3d22", 1.5, 2); for(var z = 0; z < 8; z++) D.l(x + 38 + z * 19, y + h - 56, x + 38 + z * 19, y + h - 30, "#8a6a3a", 3);
  }
  function libero(D, x, y, h){ D.r(x + 12, y + 12, X - 24, h - 24, "none", "rgba(210,168,90,.5)", 1.5, 4, 'stroke-dasharray="6 5"'); }
  function arreda(D, t, n){   /* n = quanti spazi */
    var y = 0, k;
    if(ARREDO[t]){ for(k = 0; k < n; k++) ARREDO[t](D, 0, k * P); return; }
    if(t === "ser"){ for(k = 0; k < n; k += 2) serra(D, 0, k * P); return; }
    if(t === "sti"){ for(k = 0; k < n; k += 2) stiva(D, 0, k * P); return; }
    if(t === "add") return addestramento(D, 0, y);
    if(t === "pol") return poligono(D, 0, y);
    if(t === "lib") return libero(D, 0, 0, n * P);
  }
  function pavimento(x, y, w, h, colore){
    var g = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + colore + '"/>';
    for(var i = 1; i < w / 22; i++) g += '<line x1="' + (x + i * 22) + '" y1="' + (y + 2) + '" x2="' + (x + i * 22) + '" y2="' + (y + h - 2) + '" stroke="rgba(0,0,0,.18)"/>';
    return g;
  }
  function gruppo(D, x, y, w, specchia){
    var t = '<g transform="translate(' + x + ',' + y + ')' + (specchia ? ' translate(' + w + ',0) scale(-1,1)' : '') + '">' + D.g.join("") + '</g>';
    t += '<g transform="translate(' + x + ',' + y + ')">' + D.tx.map(function(q){ return '<text x="' + (specchia ? w - q.x : q.x) + '" y="' + q.y + '" fill="' + q.f + '" font-size="' + q.sz + '" text-anchor="middle" ' + q.ex + '>' + q.s + '</text>'; }).join("") + '</g>';
    return t;
  }
  /* etichetta della stanza: nome intero sul computer, solo l'icona (più grande) sul telefono */
  function etichetta(cx, y, testo, w, icona){
    var lw = Math.min(w - 16, testo.length * 7.4 + 22);
    return '<g class="sm-etq sm-etq-l"><rect x="' + (cx - lw / 2) + '" y="' + (y - 15) + '" width="' + lw + '" height="22" rx="11" fill="rgba(12,9,7,.82)" stroke="rgba(210,168,90,.45)"/>'
      + '<text x="' + cx + '" y="' + y + '" fill="#ecc77e" font-size="12.5" text-anchor="middle">' + esc(testo) + '</text></g>'
      + '<g class="sm-etq sm-etq-i"><circle cx="' + cx + '" cy="' + (y - 14) + '" r="25" fill="rgba(12,9,7,.82)" stroke="rgba(210,168,90,.55)" stroke-width="2"/>'
      + '<text x="' + cx + '" y="' + (y - 4) + '" fill="#ecc77e" font-size="28" text-anchor="middle">' + icona + '</text></g>';
  }
  function rectStanza(s){ var sx = s[0] < 4 ? 0 : 2 * X; return { x: sx, y: (s[0] % 4) * P, w: X, h: s.length * P }; }
  function pianta(m){
    var h = '<svg class="sm-svg" viewBox="-6 -6 ' + (L + 12) + ' ' + (L + 12) + '" role="img" aria-label="Pianta della Stiva Modulare">';
    h += pavimento(0, 0, L, L, WOOD);
    /* spazi vuoti */
    for(var i = 0; i < 8; i++){
      if(stanzaIn(m, i)) continue;
      var sx = i < 4 ? 0 : 2 * X, sy = (i % 4) * P;
      h += '<rect x="' + (sx + 10) + '" y="' + (sy + 10) + '" width="' + (X - 20) + '" height="' + (P - 20) + '" rx="4" fill="rgba(0,0,0,.18)" stroke="rgba(210,168,90,.35)" stroke-dasharray="6 6"/>'
        + '<text x="' + (sx + X / 2) + '" y="' + (sy + P / 2 - 2) + '" fill="rgba(210,168,90,.6)" font-size="28" text-anchor="middle">＋</text>'
        + '<text x="' + (sx + X / 2) + '" y="' + (sy + P / 2 + 24) + '" fill="#a39478" font-size="13" text-anchor="middle">' + spazio(i) + ' · spazio vuoto</text>';
    }
    /* stanze */
    m.st.forEach(function(r){
      var q = rectStanza(r.s), D = new Disegno(), dx = r.s[0] >= 4;
      h += pavimento(q.x, q.y, q.w, q.h, WOOD);
      arreda(D, r.t, r.s.length);
      h += gruppo(D, q.x, q.y, q.w, dx);
      h += etichetta(q.x + q.w / 2, q.y + q.h - 14, tipo(r.t).i + " " + nomeStanza(r), q.w, tipo(r.t).i);
    });
    /* navata */
    h += pavimento(X, 0, X, L, "#2e2014");
    if(m.nav){ var D2 = new Disegno(); arreda(D2, m.nav.t, 4); h += gruppo(D2, X, 0, X, false); }
    h += '<rect x="' + (X + X / 2 - 44) + '" y="' + (ASC_Y - 44) + '" width="88" height="88" fill="#2e2014"/>'
      + '<rect x="' + (X + X / 2 - 34) + '" y="' + (ASC_Y - 34) + '" width="68" height="68" fill="#0c0907" stroke="#ecc77e" stroke-width="2"/>'
      + '<text x="' + (X + X / 2) + '" y="' + (ASC_Y + 9) + '" fill="#ecc77e" font-size="24" text-anchor="middle">⇅</text>';
    if(m.nav) h += etichetta(X + X / 2, L - 14, tipo(m.nav.t).i + " " + nomeStanza(m.nav), X, tipo(m.nav.t).i);
    else h += '<text x="' + (X + X / 2) + '" y="40" fill="#a39478" font-size="14" text-anchor="middle" font-style="italic">navata · corridoio vuoto</text>';
    /* pareti e porte */
    m.st.forEach(function(r){
      var q = rectStanza(r.s), px = r.s[0] < 4 ? q.x + q.w : q.x, py = q.y + q.h / 2;
      h += '<rect x="' + (q.x + 1.5) + '" y="' + (q.y + 1.5) + '" width="' + (q.w - 3) + '" height="' + (q.h - 3) + '" fill="none" stroke="' + WALL + '" stroke-width="3"/>'
        + '<line x1="' + px + '" y1="' + (py - 20) + '" x2="' + px + '" y2="' + (py + 20) + '" stroke="#2e2014" stroke-width="7"/>';
    });
    h += '<line x1="' + X + '" y1="0" x2="' + X + '" y2="' + L + '" stroke="' + WALL + '" stroke-width="2" stroke-dasharray="2 10" opacity=".55"/>'
      + '<line x1="' + (2 * X) + '" y1="0" x2="' + (2 * X) + '" y2="' + L + '" stroke="' + WALL + '" stroke-width="2" stroke-dasharray="2 10" opacity=".55"/>'
      + '<rect x="0" y="0" width="' + L + '" height="' + L + '" fill="none" stroke="#d2a85a" stroke-width="5"/>';
    /* zone da toccare (sopra a tutto) */
    var z = function(k, x, y, w, hh, et){ return '<rect class="sm-hit' + (selUguale(k) ? " on" : "") + '" data-k="' + k + '" x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (w - 6) + '" height="' + (hh - 6) + '" rx="4" tabindex="0" role="button" aria-label="' + esc(et) + '"/>'; };
    for(var s2 = 0; s2 < 8; s2++) if(!stanzaIn(m, s2)) h += z("s" + s2, s2 < 4 ? 0 : 2 * X, (s2 % 4) * P, X, P, spazio(s2) + ", spazio vuoto");
    m.st.forEach(function(r){ var q = rectStanza(r.s); h += z("r" + r.id, q.x, q.y, q.w, q.h, nomeStanza(r)); });
    h += z("nav", X, 0, X, L, "Navata" + (m.nav ? ": " + nomeStanza(m.nav) : ", corridoio vuoto"));
    return h + '</svg>';
  }

  /* ---------- finestra ---------- */
  var ov = document.createElement("div");
  ov.className = "stv-ov sm-ov"; ov.hidden = true;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "sm-t");
  ov.innerHTML = '<div class="stv-sala sm-sala"><div class="stv-lume" aria-hidden="true"></div>'
    + '<div class="stv-top"><div><div class="stv-k">Careless Journey · 3° piano di poppa</div><h3 class="stv-t" id="sm-t">Stiva Modulare</h3></div>'
    + '<button type="button" class="mae-x stv-x" id="sm-x" aria-label="Esci dalla Stiva Modulare">✕</button></div>'
    + '<p class="stv-sub">Una navata centrale con l\'ascensore e otto spazi ai lati, da allestire come serve al gruppo. Toccate uno spazio, una stanza o la navata.</p>'
    + '<div class="stv-stato" id="sm-stato" aria-live="polite"></div>'
    + '<div class="sm-corpo"><div class="sm-pianta" id="sm-pianta"></div><div class="sm-pan" id="sm-pan" aria-live="polite"></div></div></div>';
  document.body.appendChild(ov);
  var sel = null, scrivendo = false;
  function selUguale(k){ return sel && sel === k; }

  function chips(lista){ return '<div class="sm-chips">' + lista.map(function(c){ return '<span class="sm-chip">' + esc(nomeComp(c)) + '</span>'; }).join("") + '</div>'; }
  function schedaTipo(t, r){
    var cl = r ? compDi(r) : t.comp;
    return '<p class="sm-d">' + esc(t.d) + '</p>'
      + '<div class="stv-lbl">Competenze</div>' + (cl.length ? chips(cl) : '<p class="stv-nota">' + (t.id === "lib" ? "Nessuna: le sceglie il Master." : "Nessuna.") + '</p>');
  }
  function opzioniMisura(m, i){
    var lato = i < 4 ? 0 : 4, out = [];
    T.forEach(function(t){
      var b = [];
      if(t.mis.indexOf("p") >= 0) b.push({ et: "Piccola", s: [i] });
      if(t.mis.indexOf("m") >= 0){
        if(i % 4 < 3 && liberi(m, [i + 1])) b.push({ et: "Media con " + spazio(i + 1), s: [i, i + 1] });
        if(i % 4 > 0 && liberi(m, [i - 1])) b.push({ et: "Media con " + spazio(i - 1), s: [i - 1, i] });
      }
      if(t.mis.indexOf("g") >= 0){ var lt = [lato, lato + 1, lato + 2, lato + 3]; if(liberi(m, lt)) b.push({ et: "Grande · lato intero", s: lt }); }
      out.push({ t: t, b: b });
    });
    return out;
  }
  function pannello(){
    var p = document.getElementById("sm-pan"), m = mod(), h = "";
    if(!p) return;
    if(scrivendo && p.contains(document.activeElement) && /sm-(note|nome)/.test(document.activeElement.id)) return;   /* non cancellare ciò che si sta scrivendo */
    if(sel && sel.charAt(0) === "r" && !stanzaId(m, sel.slice(1))) sel = null;
    if(sel && sel.charAt(0) === "s" && stanzaIn(m, +sel.slice(1))){ var rr = stanzaIn(m, +sel.slice(1)); sel = "r" + rr.id; }
    if(!sel){
      var n = m.st.length + (m.nav ? 1 : 0);
      h = '<div class="sm-h">La Stiva Modulare</div><p class="sm-d">' + (n ? n + (n === 1 ? " stanza allestita." : " stanze allestite.") : "Ancora niente di allestito: è un grande spazio vuoto.") + ' Toccate la pianta per allestire uno spazio, cambiare una stanza o scegliere l\'uso della navata.</p>'
        + '<div class="stv-lbl">Misure</div><p class="sm-d"><b>Piccola</b>: 1 spazio · <b>media</b>: 2 spazi vicini sullo stesso lato · <b>grande</b>: la navata oppure un lato intero. Ogni stanza si può ampliare o ridurre di una misura.</p>'
        + '<div class="stv-lbl">Competenze</div><p class="sm-d">' + esc(REGOLA) + '</p>';
    } else if(sel.charAt(0) === "s"){
      var i = +sel.slice(1);
      h = '<div class="sm-h">Spazio ' + spazio(i) + ' · vuoto</div><p class="stv-nota">Scegliete cosa allestire qui.</p><div class="sm-cat">'
        + opzioniMisura(m, i).map(function(o){
          return '<div class="sm-cat-r"><div class="sm-cat-n">' + o.t.i + ' ' + esc(o.t.n) + ' <small>' + o.t.mis.split("").map(function(x){ return MIS[x]; }).join(" · ") + '</small></div>'
            + '<div class="sm-cat-b">' + (o.b.length ? o.b.map(function(b){ return '<button type="button" class="eq-btn" data-az="crea" data-t="' + o.t.id + '" data-s="' + b.s.join(",") + '">' + esc(b.et) + '</button>'; }).join("") : '<span class="stv-nota">' + (o.t.mis === "g" ? "va nella navata o su un lato intero libero" : "non c'è spazio libero accanto") + '</span>') + '</div></div>';
        }).join("") + '</div>';
    } else if(sel === "nav"){
      var nv = m.nav;
      h = '<div class="sm-h">Navata' + (nv ? " · " + tipo(nv.t).i + " " + esc(nomeStanza(nv)) : " · corridoio vuoto") + '</div>'
        + '<p class="stv-nota">Larga x e lunga 3x, con l\'ascensore all\'altezza della parete tra le stanze 3 e 4. Ospita una stanza grande alla volta.</p>'
        + '<div class="sm-cat-b sm-nav-b">' + T.filter(function(t){ return t.mis.indexOf("g") >= 0; }).map(function(t){ var on = nv && nv.t === t.id; return '<button type="button" class="eq-opt' + (on ? " on" : "") + '" data-az="nav" data-t="' + t.id + '">' + t.i + ' ' + esc(t.n) + '</button>'; }).join("")
        + '<button type="button" class="eq-opt' + (nv ? "" : " on") + '" data-az="nav" data-t="">⬚ Corridoio vuoto</button></div>';
      if(nv) h += dettagli(nv, "nav", m);
    } else {
      var r = stanzaId(m, sel.slice(1)), t = tipo(r.t), mi = misura(r.s.length);
      h = '<div class="sm-h">' + t.i + ' ' + esc(nomeStanza(r)) + '</div><p class="stv-nota">' + MIS[mi][0].toUpperCase() + MIS[mi].slice(1) + ' · ' + r.s.map(spazio).join(", ") + '</p>';
      h += dettagli(r, r.id, m);
      var az = azioniMisura(m, r);
      h += '<div class="sm-azioni">' + az.map(function(a){ return '<button type="button" class="eq-btn eq-ghost" data-az="misura" data-id="' + r.id + '" data-s="' + a.s.join(",") + '">' + esc(a.et) + '</button>'; }).join("")
        + '<button type="button" class="eq-btn eq-ghost sm-smonta" data-az="smonta" data-id="' + r.id + '">✕ Smonta</button></div>';
    }
    if(sel) h += '<button type="button" class="sm-indietro" data-az="chiudi">← Panoramica</button>';
    p.innerHTML = h;
  }
  function inAttesa(id, k, v){ var a = attesa[id + "|" + k]; return a ? a.v : v; }
  function dettagli(r, id, m){
    var t = tipo(r.t), h = "";
    if(r.t === "lib"){
      h += '<label class="stv-lbl" for="sm-nome">Nome della stanza</label><input type="text" class="sm-in" id="sm-nome" data-id="' + esc(id) + '" maxlength="' + MAX_NOME + '" placeholder="Spazio libero" value="' + esc(inAttesa(id, "nome", r.nome)) + '">';
      h += '<p class="sm-d">' + esc(t.d) + '</p><div class="stv-lbl">Competenze · fino a 3</div><div class="sm-chips">'
        + COMP().map(function(c){ var on = (r.comp || []).indexOf(c.id) >= 0; return '<button type="button" class="sm-chip sm-chip-b' + (on ? " on" : "") + '" data-az="comp" data-id="' + esc(id) + '" data-c="' + c.id + '" aria-pressed="' + on + '">' + esc(c.nm) + '</button>'; }).join("") + '</div>';
    } else h += schedaTipo(t, r);
    h += '<label class="stv-lbl" for="sm-note" style="margin-top:.9rem">Note · le vedono tutti</label><textarea class="sm-note" id="sm-note" data-id="' + esc(id) + '" maxlength="' + MAX_NOTE + '" placeholder="Cosa ci fate, cosa avete studiato, chi ospitate…">' + esc(inAttesa(id, "note", r.note)) + '</textarea>';
    return h;
  }
  function azioniMisura(m, r){
    var t = tipo(r.t), s = r.s, n = s.length, out = [], lato = s[0] < 4 ? 0 : 4;
    if(n === 1 && t.mis.indexOf("m") >= 0){
      if(s[0] % 4 < 3 && liberi(m, [s[0] + 1])) out.push({ et: "＋ Amplia a media (con " + spazio(s[0] + 1) + ")", s: [s[0], s[0] + 1] });
      if(s[0] % 4 > 0 && liberi(m, [s[0] - 1])) out.push({ et: "＋ Amplia a media (con " + spazio(s[0] - 1) + ")", s: [s[0] - 1, s[0]] });
    }
    if(n === 2 && t.mis.indexOf("g") >= 0){ var lt = [lato, lato + 1, lato + 2, lato + 3]; if(liberi(m, lt, r.id)) out.push({ et: "＋ Amplia a grande (lato intero)", s: lt }); }
    if(n === 2 && t.mis.indexOf("p") >= 0) out.push({ et: "− Riduci a piccola (" + spazio(s[0]) + ")", s: [s[0]] });
    if(n === 4 && t.mis.indexOf("m") >= 0) out.push({ et: "− Riduci a media (" + spazio(s[0]) + ", " + spazio(s[1]) + ")", s: [s[0], s[1]] });
    return out;
  }
  function disegna(){
    if(ov.hidden) return;
    var st = document.getElementById("sm-stato"), s = S.stato();
    st.textContent = s === "ok" ? "In diretta · la vedono tutti" : S.messaggio(); st.setAttribute("data-s", s === "ok" ? "ok" : s === "attesa" ? "att" : "ko");
    var m = mod();
    document.getElementById("sm-pianta").innerHTML = pianta(m);
    pannello();
  }
  S.on(disegna);

  /* ---------- modifiche ---------- */
  function cambia(fn, msg){ return S.accoda(S.chi(), function(d){ fn(M(d)); }, msg); }
  function crea(t, s){
    var id = uid(), tp = tipo(t);
    if(cambia(function(m){ if(!valido(s) || !liberi(m, s)) return; m.st.push({ id: id, t: t, s: s.slice(), nome: "", note: "", comp: t === "lib" ? [] : undefined }); }, "allestisce " + tp.n + " in " + s.map(spazio).join("+"))){
      sel = "r" + id; suono("charge"); disegna();
    }
  }
  function cambiaMisura(id, s){
    cambia(function(m){ var r = stanzaId(m, id); if(!r || !valido(s) || !liberi(m, s, id) || tipo(r.t).mis.indexOf(misura(s.length)) < 0) return; r.s = s.slice(); }, "cambia la misura di una stanza");
    suono("paper"); disegna();
  }
  function smonta(id){
    var m = mod(), r = stanzaId(m, id); if(!r) return;
    var chiedi = typeof tcjConferma === "function" ? tcjConferma({ titolo: "Smontare «" + nomeStanza(r) + "»?", testo: "Lo spazio torna vuoto per tutti" + (r.note ? " e le note della stanza si perdono" : "") + ".", si: "Sì, smonta", attesa: 1 }) : Promise.resolve(confirm("Smontare «" + nomeStanza(r) + "»?"));
    chiedi.then(function(ok){ if(!ok) return; cambia(function(mm){ mm.st = mm.st.filter(function(x){ return x.id !== id; }); }, "smonta " + nomeStanza(r)); sel = null; disegna(); });
  }
  function navata(t){
    var m = mod(); if((m.nav ? m.nav.t : "") === t) return;
    var vai = function(){ cambia(function(mm){ mm.nav = t ? { t: t, nome: "", note: "", comp: t === "lib" ? [] : undefined } : null; }, t ? "allestisce la navata: " + tipo(t).n : "svuota la navata"); suono("paper"); disegna(); };
    if(m.nav && m.nav.note && typeof tcjConferma === "function") tcjConferma({ titolo: "Cambiare l'uso della navata?", testo: "Le note di «" + nomeStanza(m.nav) + "» si perdono.", si: "Sì, cambia", attesa: 1 }).then(function(ok){ if(ok) vai(); });
    else vai();
  }
  function campo(id, k, v, msg){
    cambia(function(m){ var r = id === "nav" ? m.nav : stanzaId(m, id); if(r) r[k] = v; }, msg);
  }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }

  ov.addEventListener("click", function(e){
    if(e.target === ov){ chiudi(); return; }
    var t = e.target;
    if(t.closest("#sm-x")){ chiudi(); return; }
    var hit = t.closest(".sm-hit"); if(hit){ salvaTutto(); sel = hit.getAttribute("data-k"); suono("paper"); disegna(); return; }
    var b = t.closest("[data-az]"); if(!b) return;
    var az = b.getAttribute("data-az"), id = b.getAttribute("data-id");
    var sp = (b.getAttribute("data-s") || "").split(",").filter(Boolean).map(Number);
    if(az === "crea") crea(b.getAttribute("data-t"), sp);
    else if(az === "misura") cambiaMisura(id, sp);
    else if(az === "smonta") smonta(id);
    else if(az === "nav") navata(b.getAttribute("data-t"));
    else if(az === "chiudi"){ sel = null; disegna(); }
    else if(az === "comp"){
      var c = b.getAttribute("data-c"), m = mod(), r = id === "nav" ? m.nav : stanzaId(m, id); if(!r) return;
      var l = (r.comp || []).slice(), k = l.indexOf(c);
      if(k >= 0) l.splice(k, 1); else { if(l.length >= 3){ S.avviso("Al massimo 3 competenze per stanza.", true); return; } l.push(c); }
      campo(id, "comp", l, "competenze di " + nomeStanza(r)); disegna();
    }
  });
  ov.addEventListener("keydown", function(e){
    if((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("sm-hit")){ e.preventDefault(); sel = e.target.getAttribute("data-k"); disegna(); var x = ov.querySelector('.sm-hit[data-k="' + sel + '"]'); if(x) x.focus(); }
  });
  /* nome e note: si salvano un attimo dopo che si smette di scrivere, ognuno per conto suo; uscendo dal campo si salvano subito */
  var attesa = {};
  function salvaCampo(chiave){
    var a = attesa[chiave]; if(!a) return;
    clearTimeout(a.t); delete attesa[chiave];
    campo(a.id, a.k, a.v, a.k === "note" ? "note della stiva modulare" : "nome di una stanza");
    if(!Object.keys(attesa).length) scrivendo = false;
    if(a.k === "nome") document.getElementById("sm-pianta").innerHTML = pianta(mod());
  }
  ov.addEventListener("input", function(e){
    var el = e.target, id = el.getAttribute && el.getAttribute("data-id"); if(!id) return;
    var k = el.id === "sm-note" ? "note" : el.id === "sm-nome" ? "nome" : null; if(!k) return;
    var chiave = id + "|" + k; scrivendo = true;
    if(attesa[chiave]) clearTimeout(attesa[chiave].t);
    attesa[chiave] = { id: id, k: k, v: el.value, t: setTimeout(function(){ salvaCampo(chiave); }, 1000) };
  });
  ov.addEventListener("focusout", function(e){
    var el = e.target, id = el.getAttribute && el.getAttribute("data-id"); if(!id) return;
    var k = el.id === "sm-note" ? "note" : el.id === "sm-nome" ? "nome" : null; if(k){ var ch = id + "|" + k; setTimeout(function(){ salvaCampo(ch); }, 220); }
  });
  function salvaTutto(){ Object.keys(attesa).forEach(salvaCampo); }
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !ov.hidden){ if(sel){ sel = null; disegna(); } else chiudi(); } });

  function apri(){
    ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    sel = null; disegna(); suono("gong");
    S.guarda("modulare", true);
    setTimeout(function(){ try { document.getElementById("sm-x").focus(); } catch(_){} }, 60);
  }
  function chiudi(){
    salvaTutto(); S.guarda("modulare", false);
    ov.classList.remove("on"); setTimeout(function(){ if(!ov.classList.contains("on")) ov.hidden = true; }, 260);
    if(!document.querySelector(".inc-win.on,.cj-overlay.open,.rel-ov.on,.stv-ov.on:not(.sm-ov)")) document.body.style.overflow = "";
  }
  window.smApri = function(){ try { if(typeof nvClose === "function") nvClose(); } catch(_){} apri(); };
})();
