/* Aspetto dell'Area dello Slayer — una scelta in più, solo per l'area del player.

   Di base l'area resta la scheda classica. Dalla barra «Aspetto dell'area» ogni player può trasformare le sezioni
   della propria scheda in: 📚 libri su uno scaffale (gli stessi volumi della libreria della Zona Master), ⚗ ampolle di vetro
   con dentro i liquidi, 🗄 cassetti di una cassettiera, 🃏 carte su un tavolo da gioco pirata, 🔨 attrezzi appesi a una parete,
   📖 capitoli di un vecchio libro aperto o 📌 fogli su una bacheca di sughero.
   Toccando un oggetto, sotto si apre solo quella sezione (la stessa della scheda classica, con gli stessi dati).

   - Misure, forme e inclinazioni partono a caso e restano uguali finché il player non preme «↻ Mescola».
   - Con lo stile Ampolle, «✎ Personalizza ampolle» permette di scegliere forma e colore di ogni ampolla.
   - L'ordine degli oggetti è quello della scheda: se il player sposta i riquadri con «✎ Modifica area», cambia anche qui.
   - La scelta sta nella chiave tcj-asp-<pg> ({s: stile, seed: numero, amp: {sezione: {f: forma, c: colore}}}),
     dentro il pacchetto online del personaggio (js/sync-giocatori.js), così lo segue su ogni dispositivo.
   - Nuove sezioni (un nuovo data-pz in sezioni/scheda.js) compaiono da sole; per dargli nome, icona e attrezzo
     aggiungile a NOMI e ATTREZZI qui sotto.
   - Le trame (legno, carta, sughero) sono in css/33-area-aspetto.css; i libri usano gli stili della libreria del Master
     (css/20-master-libreria.css). */
(function(){
  var NOMI = {licenza:["🪪","Licenza dello Slayer"],livello:["⭐","Livello e rango"],pv:["❤","Punti Vita"],malus:["📝","Altri malus"],
    stati:["🌀","Stati alterati"],statistiche:["📊","Statistiche"],competenze:["🎯","Competenze"],arma1:["⚔","Arma principale"],
    abilita:["✨","Abilità dell'arma"],nuclei:["🔮","Nuclei"],arma2:["🏹","Arma secondaria"],equip:["🎒","Equipaggiamento"],
    inventario:["📦","Inventario"],monete:["💰","Monete"],celle:["💎","Celle"],corone:["👑","Corone Aetheriche"],
    note:["📜","Note personali"],salvataggi:["☁","Salvataggi"]};
  var STILI = [["scheda","Scheda classica"],["libri","📚 Libri"],["ampolle","⚗ Ampolle"],["cassettiera","🗄 Cassettiera"],
    ["tavolo","🃏 Tavolo pirata"],["attrezzi","🔨 Attrezzi"],["capitoli","📖 Capitoli"],["bacheca","📌 Bacheca"]];
  var RN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV"];
  var FREGI = ["✦","❖","✧","◆","❂","✠"];
  var SEMI = ["♠","♥","♦","♣"];
  var LIQ = ["#4fb8e8","#e0502a","#8a5cd8","#4aa83a","#e8b830","#d83a5a","#2fc8b0","#b8e050","#f070c0","#5a88ff","#ff8a30","#a0e8ff"];
  var PIN = ["#c8322a","#2a6ac8","#d8a020","#2f8a3a","#8a3ac8","#e8e0d0"];
  var CARTE = ["#f2e8d0","#efe0bc","#e8dcc4","#f4ecd8","#e6d6b0","#efe6cf"];
  /* forme delle ampolle (viewBox 0 0 80 124): contorno, fondo, inizio del corpo, due riflessi, larghezza */
  var FORME = [
    {d:"M34 12h12v27c16 5 26 18 26 36a32 32 0 0 1-64 0c0-18 10-31 26-36z", bot:107, top:42, l:["M15 64q-4 18 6 32","M63 62q5 9 3 20"], x:[8,72]},
    {d:"M34 12h12v30l26 56q4 12-9 12H17q-13 0-9-12l26-56z", bot:110, top:46, l:["M31 50l-15 34","M50 54l9 20"], x:[4,76]},
    {d:"M31 12h18v86a9 9 0 0 1-18 0z", bot:107, top:18, l:["M35 22v68","M45 30v24"], x:[31,49]},
    {d:"M33 12h14v14c12 3 18 10 18 22v52q0 10-10 10H25q-10 0-10-10V48c0-12 6-19 18-22z", bot:110, top:32, l:["M21 52v46","M59 56v18"], x:[15,65]},
    {d:"M34 12h12v16c20 8 28 24 28 42 0 22-16 38-34 40-18-2-34-18-34-40 0-18 8-34 28-42z", bot:110, top:32, l:["M13 62q-1 20 11 34","M66 58q5 10 1 22"], x:[6,74]}];
  var ATTREZZI = {
    licenza:'<circle cx="30" cy="40" r="22" fill="#c9a24a" stroke="#6a4a10" stroke-width="2"/><circle cx="30" cy="40" r="15" fill="#e8d088" stroke="#8a6418"/><path d="M30 29v22M20 35l20 10M20 45l20-10" stroke="#5a7aa0" stroke-width="3"/><path d="M20 58l-6 24 10-6 6 8 4-24" fill="#8b2e1e"/><path d="M40 58l6 24-10-6-6 8-4-24" fill="#a83a28"/>',
    livello:'<path d="M18 6h24l-6 22H24z" fill="#1f4a8a"/><path d="M24 6h12l-3 22h-6z" fill="#c8322a"/><circle cx="30" cy="46" r="17" fill="#d8b04a" stroke="#6a4a10" stroke-width="2"/><path d="M30 34l3.5 7.5 8 .8-6 5.4 1.8 8L30 51.6 22.7 55.7l1.8-8-6-5.4 8-.8z" fill="#fff3c0"/>',
    pv:'<path d="M24 8h12v10h-12z" fill="#7a4a24"/><path d="M18 20q12-6 24 0l4 10v42q0 10-16 10t-16-10V30z" fill="#9a5a32" stroke="#4a2810" stroke-width="2"/><path d="M14 44h32v14H14z" fill="#b8322a"/><path d="M30 46v10M25 51h10" stroke="#fff" stroke-width="3"/><path d="M42 28q14 10 8 30" stroke="#6a3a18" stroke-width="3" fill="none"/>',
    malus:'<g fill="#9aa2aa" stroke="#4a5058" stroke-width="1"><rect x="14" y="16" width="5" height="54"/><rect x="28" y="22" width="5" height="54"/><rect x="42" y="12" width="5" height="54"/></g><g fill="#5a6068"><rect x="10" y="12" width="13" height="5" rx="1"/><rect x="24" y="18" width="13" height="5" rx="1"/><rect x="38" y="8" width="13" height="5" rx="1"/></g>',
    stati:'<ellipse cx="30" cy="40" rx="20" ry="22" fill="#efe6d4" stroke="#a89a80" stroke-width="2"/><ellipse cx="30" cy="40" rx="8" ry="9" fill="#d8ccb4" stroke="#a89a80"/><path d="M30 62q-4 12 -18 18h20q10-4 10-18" fill="#efe6d4" stroke="#a89a80" stroke-width="2"/><path d="M14 34q16-6 32 0M12 46q18-6 36 0" stroke="#c8b898" fill="none"/>',
    statistiche:'<circle cx="30" cy="44" r="24" fill="#c9a24a" stroke="#6a4a10" stroke-width="2"/><circle cx="30" cy="44" r="18" fill="#f2e8d2"/><path d="M30 28l5 16H25z" fill="#b8322a"/><path d="M25 44h10l-5 16z" fill="#3a3e44"/><circle cx="30" cy="44" r="2.5" fill="#6a4a10"/><rect x="26" y="14" width="8" height="7" rx="2" fill="#a07a30"/>',
    competenze:'<rect x="26" y="22" width="8" height="64" rx="3" fill="#7a4a24" stroke="#3a2010"/><path d="M8 10h44v16H8z" fill="#6a7078" stroke="#2a2e34" stroke-width="2"/><path d="M8 10l-4 8 4 8z" fill="#4a5058"/>',
    arma1:'<path d="M30 4l9 50H21z" fill="#cfd6dc" stroke="#6a7580" stroke-width="2"/><path d="M30 8v44" stroke="#fff" opacity=".6"/><rect x="14" y="54" width="32" height="6" rx="2" fill="#a08040" stroke="#5a4010"/><rect x="26" y="60" width="8" height="24" rx="2" fill="#5a3418"/><circle cx="30" cy="88" r="4" fill="#a08040"/>',
    abilita:'<path d="M10 52l38-24 4 8-38 24z" fill="#8a8e94" stroke="#3a3e44" stroke-width="2"/><path d="M12 54l36-23" stroke="#c8ccd2"/><path d="M38 10l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#ffe46a"/><path d="M16 22l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#ffe46a"/>',
    nuclei:'<rect x="22" y="2" width="16" height="7" rx="3" fill="none" stroke="#3a2a1a" stroke-width="3"/><rect x="12" y="12" width="36" height="8" fill="#3a2a1a"/><rect x="15" y="20" width="30" height="44" fill="#8fd8ff" stroke="#3a2a1a" stroke-width="3"/><path d="M30 28l7 14-7 14-7-14z" fill="#e8f8ff"/><rect x="12" y="64" width="36" height="8" fill="#3a2a1a"/>',
    arma2:'<path d="M30 14v58" stroke="#6a4a24" stroke-width="5"/><path d="M30 14q-14-2-18 10M30 14q14-2 18 10M30 14l0-10" stroke="#8a929a" stroke-width="4" fill="none"/><path d="M12 24l-2 6M48 24l2 6" stroke="#8a929a" stroke-width="4"/><path d="M30 72q-10 10 0 16" stroke="#c8a46a" stroke-width="3" fill="none"/>',
    equip:'<path d="M14 26q16-12 32 0v52q0 6-6 6H20q-6 0-6-6z" fill="#8a6a3a" stroke="#4a3418" stroke-width="2"/><path d="M14 30q16 10 32 0v12q-16 8-32 0z" fill="#6a4e28"/><rect x="26" y="40" width="8" height="8" fill="#c9a24a"/><path d="M20 22q10-16 20 0" stroke="#4a3418" stroke-width="3" fill="none"/>',
    inventario:'<circle cx="30" cy="48" r="22" fill="none" stroke="#c8a46a" stroke-width="6"/><circle cx="30" cy="48" r="13" fill="none" stroke="#b08a50" stroke-width="6"/><circle cx="30" cy="48" r="5" fill="#a07a40"/><path d="M30 26q-6-12 4-20" stroke="#c8a46a" stroke-width="4" fill="none"/>',
    monete:'<path d="M18 26q12-6 24 0l6 40q0 14-18 14t-18-14z" fill="#7a5028" stroke="#3a2410" stroke-width="2"/><path d="M18 26q12 8 24 0" stroke="#3a2410" stroke-width="3" fill="none"/><circle cx="22" cy="14" r="7" fill="#e0b84a" stroke="#8a6418"/><circle cx="36" cy="18" r="6" fill="#e0b84a" stroke="#8a6418"/>',
    celle:'<path d="M28 20v62" stroke="#6a4224" stroke-width="5"/><path d="M6 22q24-18 48 0l-4 2q-20-12-40 0z" fill="#7a8088" stroke="#3a3e44" stroke-width="2"/><path d="M40 60l8-6 6 8-8 6z" fill="#8a6cd8"/><path d="M44 72l5-4 4 5-5 4z" fill="#6ec6e8"/>',
    corone:'<rect x="8" y="34" width="40" height="12" rx="3" fill="#a08040" stroke="#4a3410" stroke-width="2" transform="rotate(-20 28 40)"/><rect x="42" y="16" width="12" height="16" rx="2" fill="#6a4a24" transform="rotate(-20 48 24)"/><circle cx="12" cy="52" r="6" fill="#8fd8ff" stroke="#4a3410" stroke-width="2"/><path d="M20 70l8-10 8 10 6-14 4 20H16l-2-20z" fill="#e0b84a" stroke="#8a6418"/>',
    note:'<rect x="12" y="20" width="34" height="56" rx="3" fill="#5c2a1a" stroke="#2a1008" stroke-width="2"/><rect x="16" y="24" width="28" height="48" fill="#efe3c4"/><path d="M20 34h20M20 42h20M20 50h14" stroke="#8a6a3a"/><path d="M48 6q-16 22-18 46l3 1q6-24 18-44z" fill="#f4f0e6" stroke="#8a8070"/>',
    salvataggi:'<circle cx="30" cy="22" r="14" fill="none" stroke="#c9a24a" stroke-width="6"/><rect x="27" y="34" width="6" height="46" fill="#c9a24a" stroke="#6a4a10"/><path d="M33 64h10v6H33zM33 74h7v6h-7z" fill="#c9a24a" stroke="#6a4a10"/>',
    _:'<rect x="16" y="16" width="28" height="60" rx="4" fill="#8a6a3a" stroke="#4a3418" stroke-width="2"/><path d="M22 30h16M22 40h16M22 50h10" stroke="#efe3c4" stroke-width="3"/>'};
  var ORDINE = Object.keys(NOMI);

  var wrap, bar, vis, ed, testa, pg = null, pref = null, sez = [], misure = {}, aperta = null, modo = false, scelta = null, forma0 = "";
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function mix(a, b, t){ var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), o = "#";
    [16, 8, 0].forEach(function(s){ var x = (A >> s) & 255, y = (B >> s) & 255; o += ("0" + Math.round(x + (y - x) * t).toString(16)).slice(-2); }); return o; }
  function cur(){ try { return typeof scCur !== "undefined" ? scCur : null; } catch(e){ return null; } }
  function carica(){ pg = cur(); var o = null; try { o = JSON.parse(localStorage.getItem("tcj-asp-" + pg) || "null"); } catch(e){}
    if(!o || typeof o !== "object") o = {};
    if(!STILI.some(function(s){ return s[0] === o.s; })) o.s = "scheda";
    if(typeof o.seed !== "number") o.seed = Math.floor(Math.random() * 1e6);
    if(!o.amp || typeof o.amp !== "object") o.amp = {};
    pref = o; }
  function salva(){ if(!pg) return; try { localStorage.setItem("tcj-asp-" + pg, JSON.stringify(pref)); } catch(e){} }
  /* numeri casuali ripetibili: stesso seme = stesse misure */
  function generatore(seme){ var x = (seme % 233280 + 233280) % 233280 || 7; return function(){ x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
  function sezioni(){ return Array.prototype.slice.call(wrap.children).filter(function(e){ return e.dataset && e.dataset.pz; }).map(function(e){
      var k = e.dataset.pz, n = NOMI[k], t = e.querySelector("h3,.sc-lbl,.sc-h,.pa-id-title");
      return { k: k, ic: n ? n[0] : "◆", nm: n ? n[1] : ((t && t.textContent.trim()) || k), i: ORDINE.indexOf(k) < 0 ? ORDINE.length : ORDINE.indexOf(k) }; }); }
  function calcola(){ var r = generatore(pref.seed), t = function(a, b){ return a + r() * (b - a); };
    misure = {}; ORDINE.concat(sez.map(function(s){ return s.k; })).forEach(function(k){ if(misure[k]) return;
      misure[k] = { alt: r(), cuoio: Math.floor(t(0, 6)), stretto: r() < .2, sc: t(.82, 1.12), f: Math.floor(t(0, 5)), r: t(-4, 4), lv: t(.4, .82),
        span: r() < .3 ? 2 : 1, dh: Math.round(t(78, 112)), tx: Math.round(t(0, 500)), bh: Math.round(t(86, 132)), dx: t(-1, 1), dy: t(-1, 1),
        carta: Math.floor(t(0, CARTE.length)), strappo: r() < .45, seme: Math.floor(t(0, 4)) }; }); }
  function forma(k){ var a = pref.amp[k]; return a && a.f >= 0 && a.f < FORME.length ? a.f : misure[k].f; }
  function colore(s){ var a = pref.amp[s.k]; return a && a.c ? a.c : LIQ[s.i % LIQ.length]; }
  function tel(){ return (vis.clientWidth || wrap.clientWidth || 900) < 560; }

  /* ---------- un'ampolla di vetro: liquido con menisco e bolle, riflessi, tappo di sughero e spago ---------- */
  function ampolla(s, k){
    var m = misure[s.k], c = colore(s), F = FORME[forma(s.k)], id = "asp" + s.i + "-" + s.k, W = Math.round(80 * k * m.sc), H = Math.round(124 * k * m.sc);
    var y0 = Math.round(F.bot - m.lv * (F.bot - F.top - 6)), chi = mix(c, "#ffffff", .14), scu = mix(c, "#000000", .58), lw = (F.x[1] - F.x[0]) / 2;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 80 124" aria-hidden="true" style="--glow:' + c + '"><defs>' +
      '<clipPath id="' + id + 'c"><path d="' + F.d + '"/></clipPath>' +
      '<linearGradient id="' + id + 'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + chi + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + scu + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'g" cx=".5" cy=".72" r=".55"><stop offset="0" stop-color="' + mix(c, "#ffffff", .3) + '" stop-opacity=".45"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".14" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity=".05"/><stop offset=".93" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient>' +
      '<linearGradient id="' + id + 'k" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4a28"/><stop offset=".38" stop-color="#c89c68"/><stop offset=".7" stop-color="#9a7046"/><stop offset="1" stop-color="#5e3c1e"/></linearGradient>' +
      '<radialGradient id="' + id + 'o"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>' +
      '<radialGradient id="' + id + 'p"><stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="40" cy="' + (F.bot + 2) + '" rx="' + (lw * 1.15 + 6) + '" ry="5" fill="url(#' + id + 'o)"/>' +
      '<ellipse cx="40" cy="' + (F.bot + 3) + '" rx="' + (lw * 1.5 + 10) + '" ry="7" fill="url(#' + id + 'p)"/>' +
      '<path d="' + F.d + '" fill="rgba(200,225,255,.05)"/>' +
      '<g clip-path="url(#' + id + 'c)"><rect x="0" y="' + y0 + '" width="80" height="124" fill="url(#' + id + 'l)"/><rect x="0" y="' + y0 + '" width="80" height="124" fill="url(#' + id + 'g)"/>' +
        '<ellipse cx="40" cy="' + y0 + '" rx="' + (lw + 2) + '" ry="2.6" fill="' + mix(c, "#ffffff", .3) + '" opacity=".8"/><ellipse cx="40" cy="' + y0 + '" rx="' + (lw + 2) + '" ry="2.6" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".7"/>' +
        '<circle class="bolla" cx="' + (36 + s.i % 3 * 4) + '" cy="' + (F.bot - 6) + '" r="2" fill="#fff" opacity=".7" style="animation-delay:-' + (s.i % 4) + 's"/>' +
        '<circle class="bolla" cx="' + (44 - s.i % 2 * 7) + '" cy="' + (F.bot - 4) + '" r="1.4" fill="#fff" opacity=".7" style="animation-delay:-' + (s.i % 3 + 1.6) + 's"/>' +
        '<circle class="bolla" cx="' + (40 + s.i % 2 * 3) + '" cy="' + (F.bot - 8) + '" r="1" fill="#fff" opacity=".6" style="animation-delay:-' + (s.i % 5 + .7) + 's"/></g>' +
      '<path d="' + F.d + '" fill="url(#' + id + 'v)" stroke="rgba(235,245,255,.6)" stroke-width="1.4"/>' +
      '<path d="' + F.d + '" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>' +
      '<path class="riflesso" d="' + F.l[0] + '" stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '<path d="' + F.l[1] + '" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".32"/>' +
      '<path d="M' + (F.x[0] === 31 ? 33.5 : 36.5) + ' 15V' + (F.top - 4) + '" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>' +
      '<ellipse cx="40" cy="12.5" rx="' + (F.x[0] === 31 ? 9.5 : 7.5) + '" ry="2" fill="none" stroke="rgba(235,245,255,.7)" stroke-width="1.5"/>' +
      '<rect x="34" y="0" width="12" height="13" rx="2" fill="url(#' + id + 'k)"/><ellipse cx="40" cy="1" rx="6" ry="1.6" fill="#b08458"/>' +
      '<circle cx="37.5" cy="5" r=".7" fill="#4a2e14" opacity=".6"/><circle cx="42" cy="8" r=".6" fill="#4a2e14" opacity=".6"/><circle cx="40.5" cy="3.5" r=".5" fill="#4a2e14" opacity=".5"/>' +
      '<path d="M33 10.5h14M33 8.2h14" stroke="#c8b088" stroke-width="1.3"/><path d="M47 9.5q5 2 3 7" stroke="#c8b088" stroke-width="1.1" fill="none"/></svg>';
  }

  /* ---------- oggetti sul tavolo pirata ---------- */
  function moneta(r, rot){ return '<svg width="' + (r * 2 + 4) + '" height="' + (r * 2 + 6) + '" viewBox="-2 -2 ' + (r * 2 + 4) + ' ' + (r * 2 + 6) + '" style="transform:rotate(' + rot + 'deg)">' +
      '<ellipse cx="' + (r + 2) + '" cy="' + (r + 4) + '" rx="' + r + '" ry="' + r + '" fill="rgba(0,0,0,.45)"/>' +
      '<circle cx="' + r + '" cy="' + r + '" r="' + r + '" fill="url(#ar-oro)" stroke="#6a4a10" stroke-width="1"/>' +
      '<circle cx="' + r + '" cy="' + r + '" r="' + (r * .74) + '" fill="none" stroke="#8a6418" stroke-width="1" stroke-dasharray="1.5 1.5"/>' +
      '<path d="M' + r + ' ' + (r * .45) + 'l' + (r * .14) + ' ' + (r * .32) + ' ' + (r * .34) + ' ' + (r * .04) + '-' + (r * .26) + ' ' + (r * .22) + ' ' + (r * .08) + ' ' + (r * .34) + '-' + (r * .3) + '-' + (r * .17) + '-' + (r * .3) + ' ' + (r * .17) + ' ' + (r * .08) + '-' + (r * .34) + '-' + (r * .26) + '-' + (r * .22) + ' ' + (r * .34) + '-' + (r * .04) + 'z" fill="#a07a20" opacity=".8"/></svg>'; }
  function pila(n){ var s = '<svg width="40" height="' + (n * 4 + 26) + '" viewBox="0 0 40 ' + (n * 4 + 26) + '"><ellipse cx="22" cy="' + (n * 4 + 20) + '" rx="19" ry="6" fill="rgba(0,0,0,.45)"/>';
    for(var i = n; i >= 0; i--){ var y = i * 4 + 10, dx = (i * 7 % 3) - 1; s += '<rect x="' + (2 + dx) + '" y="' + y + '" width="34" height="5" fill="url(#ar-bordo)"/><ellipse cx="' + (19 + dx) + '" cy="' + y + '" rx="17" ry="5.5" fill="url(#ar-oro)" stroke="#6a4a10" stroke-width=".6"/>'; }
    return s + '</svg>'; }
  function candela(){ return '<svg width="86" height="150" viewBox="0 0 86 150"><defs><radialGradient id="ar-luce"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".85"/><stop offset=".3" stop-color="#ffb850" stop-opacity=".35"/><stop offset="1" stop-color="#ff9030" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ar-cera" x1="0" x2="1"><stop offset="0" stop-color="#c8b48a"/><stop offset=".4" stop-color="#f6ead0"/><stop offset="1" stop-color="#b8a070"/></linearGradient></defs>' +
      '<circle class="ar-alone" cx="43" cy="38" r="40" fill="url(#ar-luce)"/>' +
      '<ellipse cx="46" cy="136" rx="34" ry="9" fill="rgba(0,0,0,.5)"/><ellipse cx="43" cy="132" rx="32" ry="9" fill="url(#ar-oro)" stroke="#5a3c08"/><ellipse cx="43" cy="129" rx="22" ry="5" fill="#8a6418" opacity=".6"/>' +
      '<rect x="31" y="58" width="24" height="72" rx="3" fill="url(#ar-cera)"/><path d="M31 62q4 10 0 22M50 60q3 14 1 26M41 58q-2 8 1 14" stroke="#efe2c0" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="43" cy="58" rx="12" ry="3.5" fill="#efe2c0"/><path d="M43 58v-7" stroke="#2a1a0a" stroke-width="1.5"/>' +
      '<g class="ar-fiamma"><path d="M43 52c-7-7-6-18 0-28 6 10 7 21 0 28z" fill="#ffb030"/><path d="M43 50c-4-5-3-11 0-16 3 5 4 11 0 16z" fill="#fff6c8"/></g></svg>'; }
  function dado(v, rot){ var P = {1:[[50,50]],2:[[30,30],[70,70]],3:[[28,28],[50,50],[72,72]],4:[[30,30],[70,30],[30,70],[70,70]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[30,26],[70,26],[30,50],[70,50],[30,74],[70,74]]}[v];
    return '<svg width="40" height="44" viewBox="0 0 100 110" style="transform:rotate(' + rot + 'deg)"><rect x="8" y="14" width="88" height="88" rx="18" fill="rgba(0,0,0,.45)"/>' +
      '<rect x="2" y="4" width="88" height="88" rx="18" fill="url(#ar-avorio)" stroke="#8a7a5a" stroke-width="2"/>' +
      P.map(function(p){ return '<circle cx="' + (p[0] - 4) + '" cy="' + (p[1] - 2) + '" r="8" fill="#2a1a10"/><circle cx="' + (p[0] - 6) + '" cy="' + (p[1] - 4) + '" r="2.5" fill="#fff" opacity=".25"/>'; }).join('') + '</svg>'; }
  function boccale(){ return '<svg width="78" height="96" viewBox="0 0 78 96"><defs><linearGradient id="ar-doghe" x1="0" x2="1"><stop offset="0" stop-color="#4a2c14"/><stop offset=".35" stop-color="#8a5a2c"/><stop offset=".7" stop-color="#6a4220"/><stop offset="1" stop-color="#3a2210"/></linearGradient>' +
      '<linearGradient id="ar-ferro" x1="0" x2="1"><stop offset="0" stop-color="#3a3e44"/><stop offset=".4" stop-color="#a8acb2"/><stop offset="1" stop-color="#2a2e34"/></linearGradient></defs>' +
      '<ellipse cx="36" cy="90" rx="30" ry="6" fill="rgba(0,0,0,.5)"/><rect x="8" y="16" width="46" height="72" rx="5" fill="url(#ar-doghe)"/>' +
      '<path d="M18 18v68M30 18v68M42 18v68" stroke="rgba(0,0,0,.35)"/><rect x="7" y="28" width="48" height="6" fill="url(#ar-ferro)"/><rect x="7" y="70" width="48" height="6" fill="url(#ar-ferro)"/>' +
      '<path d="M54 30q18 0 18 18t-18 18" stroke="url(#ar-ferro)" stroke-width="7" fill="none"/>' +
      '<ellipse cx="31" cy="16" rx="24" ry="7" fill="#efe6d0"/><path d="M8 16q4-10 12-6 6-8 14-2 8-6 14 1 8 0 6 7" fill="#f8f2e2"/><ellipse cx="31" cy="15" rx="20" ry="4" fill="#fff" opacity=".5"/></svg>'; }

  function voce(s, cls, stile, dentro, extra){ return '<div class="ar-it ' + cls + (aperta === s.k ? ' on' : '') + '" role="button" tabindex="0" data-k="' + s.k + '" aria-label="Apri ' + esc(s.nm) + '"' + (stile ? ' style="' + stile + '"' : '') + (extra || '') + '>' + dentro + '</div>'; }
  function righe(lista, n){ var out = []; for(var i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n)); return out; }

  /* ---------- libri: gli stessi volumi della libreria della Zona Master ---------- */
  function libri(){
    var L = Math.max(280, (vis.clientWidth || 900) - (tel() ? 34 : 52)), t = tel(), H0 = t ? 158 : 212, H1 = t ? 196 : 262, fs = t ? 10.5 : 13.5, gap = t ? 3 : 4;
    var vol = sez.map(function(x, n){ var m = misure[x.k], h = Math.round(H0 + m.alt * (H1 - H0)), spazio = h - (t ? 64 : 76);
      var perR = Math.max(6, Math.floor(spazio / (fs * .74))), rr = Math.min(3, Math.max(1, Math.ceil(x.nm.length / perR)));
      var w = Math.round((t ? 15 : 21) * rr + (t ? 18 : 30) + (m.stretto ? 0 : (t ? 4 : 8)));
      return { x: x, n: n, h: h, w: w, c: m.cuoio }; });
    var tot = 0; vol.forEach(function(v){ tot += v.w + gap; });
    var nRip = Math.max(Math.ceil(tot / L), t ? 1 : Math.ceil(vol.length / 9)), obiettivo = tot / nRip, file = [], fila = [], usata = 0;
    vol.forEach(function(v){ if(fila.length && (usata + v.w + gap > L || (usata + v.w / 2 > obiettivo && file.length < nRip - 1))){ file.push({ v: fila, u: usata }); fila = []; usata = 0; } fila.push(v); usata += v.w + gap; });
    if(fila.length) file.push({ v: fila, u: usata });
    var h = '<div class="lb-box ar-lb"><div class="lb-mobile" style="--fs:' + fs + 'px">';
    file.forEach(function(f, nr){ var resto = L - f.u, libriH = f.v.map(function(v, j){
        var incl = resto > (t ? 120 : 200) && j === f.v.length - 1 && f.v.length > 1;
        return '<div class="ar-it lb-libro c' + v.c + (v.x.k === aperta ? ' on' : '') + (incl ? ' lb-inclinato' : '') + (misure[v.x.k].stretto ? ' lb-stretto' : '') + '" role="button" tabindex="0" data-k="' + v.x.k + '" aria-label="Apri ' + esc(v.x.nm) + '" style="--h:' + v.h + 'px;--w:' + v.w + 'px;--i:' + v.n + '">' +
          '<span class="lb-dorso" aria-hidden="true"><span class="lb-fascia su"></span><span class="lb-num">' + RN[v.n] + '</span><span class="lb-fregio">' + FREGI[v.x.i % FREGI.length] + '</span>' +
          '<span class="lb-tit"><b>' + esc(v.x.nm) + '</b></span><span class="lb-fascia giu"></span></span><span class="lb-luce" aria-hidden="true"></span></div>'; }).join('');
      var dx = resto > (t ? 70 : 120) ? '<span class="' + (nr % 2 ? 'lb-candela' : 'lb-pila') + ' dx" aria-hidden="true">' + (nr % 2 ? '<i></i><b></b>' : '<i></i><i></i><i></i>') + '</span>' : '';
      var sx = resto > (t ? 150 : 260) ? '<span class="' + (nr % 2 ? 'lb-pila' : 'lb-candela') + ' sx" aria-hidden="true">' + (nr % 2 ? '<i></i><i></i><i></i>' : '<i></i><b></b>') + '</span>' : '';
      h += '<div class="lb-ripiano">' + sx + '<div class="lb-libri">' + libriH + '</div>' + dx + '<span class="lb-asse" aria-hidden="true"></span></div>'; });
    var sel = sez.find(function(x){ return x.k === aperta; });
    return h + '</div><div class="lb-targa" aria-hidden="true"><small>' + (sel ? 'Volume aperto' : '') + '</small><b>' + (sel ? esc(sel.nm) : 'Scegli un volume') + '</b></div></div>';
  }

  function disegna(){
    if(!wrap) return;
    var s = pref.s, h = "", t;
    sez = sezioni(); calcola(); t = tel(); forma0 = s + "|" + t + "|" + Math.round((vis.clientWidth || 0) / 60);
    vis.hidden = (s === "scheda"); wrap.classList.toggle("ar-vista", s !== "scheda");
    if(s === "libri"){ h = libri();
    } else if(s === "ampolle"){
      var k = t ? .6 : 1.12, n = t ? 4 : ((vis.clientWidth || 900) < 860 ? 5 : 6);
      h = '<div class="ar-amp">' + righe(sez, n).map(function(r){ return '<div class="ar-mens">' + r.map(function(x){
        return voce(x, "ar-ampolla", "", ampolla(x, k) + '<span class="ar-targhetta">' + esc(x.nm) + '</span>'); }).join('') + '</div>'; }).join('') + '</div>';
    } else if(s === "cassettiera"){
      var colC = t ? 2 : 4, celle = 0;
      h = '<div class="ar-cas-mob"><div class="ar-cas">' + sez.map(function(x){ var m = misure[x.k], alto = m.dh > 104, sp = Math.min(m.span, colC); celle += sp * (alto ? 2 : 1);
        return voce(x, "ar-cass", 'grid-column:span ' + sp + (alto ? ';grid-row:span 2' : '') + ';--tx:-' + m.tx + 'px', '<span class="ar-porta"><b>' + esc(x.nm) + '</b></span><span class="ar-maniglia"></span>'); }).join('');
      for(var v = (colC - celle % colC) % colC; v > 0; v--) h += '<div class="ar-cass vuoto" aria-hidden="true" style="--tx:-' + (v * 97) + 'px"><span class="ar-maniglia"></span></div>';
      h += '</div></div>';
    } else if(s === "tavolo"){
      var col = 6, rows = Math.ceil(sez.length / col);
      h = '<div class="ar-tav" style="' + (t ? '' : 'height:' + (rows * 190 + 56) + 'px;') + '--lx:91%;--ly:14%">';
      if(!t){
        h += '<span class="ar-ogg su" style="right:2.4%;top:10px">' + candela() + '</span>';
        h += '<span class="ar-ogg" style="right:4%;top:' + (rows * 190 - 110) + 'px">' + boccale() + '</span>';
        h += '<span class="ar-ogg" style="right:9.5%;top:190px">' + pila(7) + '</span><span class="ar-ogg" style="right:3.5%;top:225px">' + pila(4) + '</span>';
        h += '<span class="ar-ogg su" style="right:12%;top:' + (rows * 95 + 20) + 'px">' + dado(5, -14) + '</span><span class="ar-ogg su" style="right:6%;top:' + (rows * 95 + 52) + 'px">' + dado(3, 22) + '</span>';
        [[80.6,30,10,10],[88,58,9,-20],[83.5,62,8,30],[93,44,9,0],[81,94,9,15],[12.4,33,8,40],[53.5,63,9,-5],[26,96,8,12]].forEach(function(q){ h += '<span class="ar-ogg" style="left:' + q[0] + '%;top:' + q[1] + '%">' + moneta(q[2], q[3]) + '</span>'; });
      }
      h += '<div class="ar-carte">' + sez.map(function(x, n){ var c = n % col, r = Math.floor(n / col), m = misure[x.k];
        var pos = t ? '' : 'left:calc(' + (1.5 + c * 13.4) + '% + ' + Math.round(m.dx * 8) + 'px);top:' + (26 + r * 190 + Math.round(m.dy * 10)) + 'px;transform:rotate(' + (m.r * 2).toFixed(1) + 'deg);z-index:' + (10 + n);
        var seme = SEMI[m.seme] + "︎", rosso = m.seme === 1 || m.seme === 2;
        return voce(x, "ar-carta", pos, '<span class="cf"></span><span class="ix a" style="color:' + (rosso ? '#a8261a' : '#2b1d10') + '">' + RN[n] + '<i>' + seme + '</i></span>' +
          '<span class="ov"><svg width="58" height="84" viewBox="0 0 60 90" aria-hidden="true">' + (ATTREZZI[x.k] || ATTREZZI._) + '</svg></span>' +
          '<span class="nm">' + esc(x.nm) + '</span><span class="ix z" style="color:' + (rosso ? '#a8261a' : '#2b1d10') + '">' + RN[n] + '<i>' + seme + '</i></span>'); }).join('') + '</div></div>';
    } else if(s === "attrezzi"){
      h = '<div class="ar-att">' + sez.map(function(x){ return voce(x, "ar-attr", '--r:' + misure[x.k].r.toFixed(1) + 'deg',
        '<span class="pg"></span><svg width="84" height="126" viewBox="0 0 60 90" aria-hidden="true">' + (ATTREZZI[x.k] || ATTREZZI._) + '</svg><span class="sp"></span><span class="tg">' + esc(x.nm) + '</span>'); }).join('') + '</div>';
    } else if(s === "capitoli"){
      var nome = ""; try { var ch = SC_CHARS.find(function(c){ return c.k === pg; }); if(ch) nome = ch.n; } catch(e){}
      var meta = Math.ceil(sez.length / 2), riga = function(x, n){ return voce(x, "ar-capr", "", '<span class="r">' + RN[n] + '</span><span class="nm' + (n === 0 ? ' cap0' : '') + '">' + esc(x.nm) + '</span><span class="pt"></span><span class="p">' + (n * 7 + 3) + '</span>'); };
      h = '<div class="ar-cap"><div class="ar-cap-pag"><div class="ar-cap-p"><h3>Indice</h3><div class="sb">Diario dello Slayer' + (nome ? ' · ' + esc(nome) : '') + '</div><div class="orn">❦</div>' +
        sez.slice(0, meta).map(function(x, n){ return riga(x, n); }).join('') + '<span class="np">i</span></div><div class="ar-cap-p"><div style="height:4.6rem"></div>' +
        sez.slice(meta).map(function(x, n){ return riga(x, n + meta); }).join('') + '<span class="np">ii</span></div></div></div>';
    } else if(s === "bacheca"){
      var rg = generatore(pref.seed + 99);
      h = '<div class="ar-bac">' + sez.map(function(x){ var m = misure[x.k], cp = "";
        if(m.strappo){ var p = []; for(var q = 0; q <= 10; q++) p.push((q * 10) + "% " + (rg() * 5).toFixed(1) + "px"); cp = "polygon(" + p.join(",") + ",100% 100%,0 100%)"; }
        return voce(x, "ar-foglio", '--r:' + (m.r * .9).toFixed(1) + 'deg;--h:' + m.bh + 'px;--pc:' + PIN[x.i % PIN.length] + ';--fc:' + CARTE[m.carta] + (cp ? ';--cp:' + cp : ''),
          '<span class="ar-puntina"></span><div class="ic">' + x.ic + '</div><div class="nm">' + esc(x.nm) + '</div>'); }).join('') + '</div>';
    }
    vis.innerHTML = h;
    vis.classList.toggle("ar-modo", modo && s === "ampolle");
    bar.querySelectorAll("button[data-s]").forEach(function(b){ var on = b.dataset.s === s; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    var pb = bar.querySelector(".ar-pers"); pb.hidden = (s !== "ampolle"); pb.classList.toggle("on", modo); pb.textContent = modo ? "✓ Fine personalizzazione" : "✎ Personalizza ampolle";
    bar.querySelector("[data-mx]").hidden = (s === "scheda" || s === "capitoli");
    if(s !== "ampolle"){ modo = false; scelta = null; }
    editor();
    if(aperta && sez.some(function(x){ return x.k === aperta; }) && s !== "scheda") mostra(aperta, false); else chiudi();
  }
  function targa(k){ var tg = vis.querySelector(".lb-targa"); if(!tg) return; var x = sez.find(function(s){ return s.k === k; });
    tg.querySelector("small").textContent = x ? "Volume aperto" : ""; tg.querySelector("b").textContent = x ? x.nm : "Scegli un volume"; tg.classList.toggle("on", !!x); }
  function mostra(k, scorri){
    aperta = k;
    wrap.querySelectorAll(":scope>[data-pz]").forEach(function(e){ e.classList.toggle("ar-aperta", e.dataset.pz === k); });
    vis.querySelectorAll(".ar-it").forEach(function(e){ e.classList.toggle("on", e.dataset.k === k); });
    targa(k);
    var x = sez.find(function(s){ return s.k === k; });
    testa.hidden = false; testa.innerHTML = '<span>' + (x ? x.ic + ' ' + esc(x.nm) : '') + '</span><button type="button">✕ Chiudi</button>';
    testa.querySelector("button").onclick = function(){ chiudi(); try { vis.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e){} };
    if(scorri) setTimeout(function(){ try { testa.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e){} }, 60);
  }
  function chiudi(){ aperta = null; testa.hidden = true; targa(null);
    wrap.querySelectorAll(".ar-aperta").forEach(function(e){ e.classList.remove("ar-aperta"); });
    vis.querySelectorAll(".ar-it.on").forEach(function(e){ e.classList.remove("on"); }); }
  function editor(){
    if(!modo || !scelta || pref.s !== "ampolle"){ ed.hidden = true; ed.innerHTML = ""; return; }
    var x = sez.find(function(s){ return s.k === scelta; }); if(!x){ ed.hidden = true; return; }
    var f = forma(x.k), c = colore(x);
    ed.hidden = false;
    ed.innerHTML = '<div class="t">⚗ ' + esc(x.nm) + ' — scegli forma e colore</div>' +
      '<div class="g">' + FORME.map(function(F, i){ return '<button type="button" data-f="' + i + '" class="' + (i === f ? 'on' : '') + '" aria-label="Forma ' + (i + 1) + '"><svg width="30" height="46" viewBox="0 0 80 124" aria-hidden="true"><path d="' + F.d + '" fill="' + c + '" fill-opacity=".8" stroke="#fff" stroke-width="3"/></svg></button>'; }).join('') + '</div>' +
      '<div class="g">' + LIQ.map(function(l){ return '<button type="button" class="c' + (l === c ? ' on' : '') + '" data-c="' + l + '" style="background:' + l + '" aria-label="Colore ' + l + '"></button>'; }).join('') + '</div>' +
      '<button type="button" class="x" data-r="1">↺ Come prima</button>';
  }
  function tocca(k, el){
    if(modo && pref.s === "ampolle"){ scelta = k; disegna(); vis.querySelectorAll(".ar-it").forEach(function(e){ e.classList.toggle("on", e.dataset.k === k); }); return; }
    if(aperta === k){ chiudi(); return; }
    /* il volume viene sfilato dallo scaffale prima di aprirsi */
    if(el && el.classList.contains("lb-libro")){ el.classList.add("estratto"); setTimeout(function(){ el.classList.remove("estratto"); mostra(k, true); }, 380); return; }
    mostra(k, true);
  }
  function monta(){
    wrap = document.querySelector("#scheda .sc-wrap"); if(!wrap || document.querySelector(".ar-bar")) return !!wrap;
    document.getElementById("scheda").classList.add("ar-scope");
    if(!document.getElementById("ar-defs")) document.body.insertAdjacentHTML("beforeend", '<svg id="ar-defs" class="ar-svgdef" aria-hidden="true" focusable="false"><defs>' +
      '<filter id="ar-rilievo" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/><feSpecularLighting in="b" surfaceScale="3" specularConstant=".85" specularExponent="16" lighting-color="#fff" result="s"><feDistantLight azimuth="225" elevation="42"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/></filter>' +
      '<radialGradient id="ar-oro" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#e8b840"/><stop offset=".8" stop-color="#a87818"/><stop offset="1" stop-color="#6a4a10"/></radialGradient>' +
      '<linearGradient id="ar-bordo" x1="0" x2="1"><stop offset="0" stop-color="#6a4a10"/><stop offset=".4" stop-color="#e8c060"/><stop offset="1" stop-color="#7a5414"/></linearGradient>' +
      '<linearGradient id="ar-avorio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#ece0c4"/><stop offset="1" stop-color="#c8b890"/></linearGradient></defs></svg>');
    bar = document.createElement("div"); bar.className = "ar-bar"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Aspetto dell'area");
    bar.innerHTML = '<span>Aspetto dell\'area</span>' + STILI.map(function(s){ return '<button type="button" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') +
      '<button type="button" data-mx="1" title="Nuove misure e forme casuali">↻ Mescola</button><button type="button" class="ar-pers" hidden>✎ Personalizza ampolle</button>';
    vis = document.createElement("div"); vis.className = "ar-v"; vis.hidden = true;
    ed = document.createElement("div"); ed.className = "ar-ed"; ed.hidden = true;
    testa = document.createElement("div"); testa.className = "ar-testa"; testa.hidden = true;
    [bar, ed, vis, testa].forEach(function(n){ wrap.parentNode.insertBefore(n, wrap); });
    vis.addEventListener("click", function(e){ var it = e.target.closest(".ar-it"); if(it) tocca(it.dataset.k, it); });
    vis.addEventListener("keydown", function(e){ if(e.key !== "Enter" && e.key !== " ") return; var it = e.target.closest(".ar-it"); if(it){ e.preventDefault(); tocca(it.dataset.k, it); } });
    vis.addEventListener("pointerover", function(e){ var it = e.target.closest(".lb-libro"); if(it && !aperta){ var x = sez.find(function(s){ return s.k === it.dataset.k; }); var tg = vis.querySelector(".lb-targa"); if(x && tg){ tg.querySelector("small").textContent = ""; tg.querySelector("b").textContent = x.nm; tg.classList.add("on"); } } });
    vis.addEventListener("pointerleave", function(){ if(!aperta) targa(null); });
    bar.addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b) return;
      if(b.dataset.mx){ pref.seed = Math.floor(Math.random() * 1e6); salva(); disegna(); return; }
      if(b.classList.contains("ar-pers")){ modo = !modo; scelta = null; disegna(); return; }
      pref.s = b.dataset.s; modo = false; scelta = null; salva(); disegna(); });
    ed.addEventListener("click", function(e){ var b = e.target.closest("button"); if(!b || !scelta) return;
      var a = pref.amp[scelta] || {};
      if(b.dataset.f !== undefined) a.f = +b.dataset.f;
      if(b.dataset.c) a.c = b.dataset.c;
      if(b.dataset.r){ delete pref.amp[scelta]; } else pref.amp[scelta] = a;
      salva(); var k = scelta; disegna(); vis.querySelectorAll(".ar-it").forEach(function(el){ el.classList.toggle("on", el.dataset.k === k); }); });
    /* se il player riordina i riquadri (✎ Modifica area), l'ordine degli oggetti lo segue */
    var t = null; new MutationObserver(function(){ clearTimeout(t); t = setTimeout(function(){ if(pref && pref.s !== "scheda") disegna(); }, 120); }).observe(wrap, { childList: true });
    /* ridisegno quando cambia la larghezza (telefono girato, finestra ridimensionata) */
    var rt = null; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ if(pref && pref.s !== "scheda" && forma0 !== pref.s + "|" + tel() + "|" + Math.round((vis.clientWidth || 0) / 60)) disegna(); }, 200); });
    return true;
  }
  function aggiorna(){ if(!monta()) return; if(cur() !== pg || !pref){ aperta = null; modo = false; scelta = null; } carica(); disegna(); }
  /* quando si apre l'area o si cambia personaggio, ogni player ritrova il suo aspetto */
  if(typeof window.scBuild === "function"){ var o = window.scBuild; window.scBuild = function(){ var r = o.apply(this, arguments); try { aggiorna(); } catch(e){} return r; }; }
  window.addEventListener("storage", function(e){ if(e.key && e.key.indexOf("tcj-asp-") === 0) aggiorna(); });
  window.tcjAreaAspetto = { aggiorna: aggiorna };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", aggiorna); else aggiorna();
})();
