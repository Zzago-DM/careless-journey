/* Aspetto dell'Area dello Slayer — una scelta in più, solo per l'area del player.

   Di base l'area resta la scheda classica. Dalla barra «Aspetto dell'area» ogni player può trasformare le sezioni
   della propria scheda in: 📚 libri su uno scaffale, ⚗ ampolle, 🗄 cassetti di una cassettiera, 🃏 carte su un tavolo
   da gioco pirata, 🔨 attrezzi appesi a una parete, 📖 capitoli di un indice o 📌 fogli su una bacheca.
   Toccando un oggetto, sotto si apre solo quella sezione (la stessa della scheda classica, con gli stessi dati).

   - Misure, forme e inclinazioni partono a caso e restano uguali finché il player non preme «↻ Mescola».
   - Con lo stile Ampolle, «✎ Personalizza ampolle» permette di scegliere forma e colore di ogni ampolla.
   - L'ordine degli oggetti è quello della scheda: se il player sposta i riquadri con «✎ Modifica area», cambia anche qui.
   - La scelta sta nella chiave tcj-asp-<pg> ({s: stile, seed: numero, amp: {sezione: {f: forma, c: colore}}}),
     dentro il pacchetto online del personaggio (js/sync-giocatori.js), così lo segue su ogni dispositivo.
   - Nuove sezioni (un nuovo data-pz in sezioni/scheda.js) compaiono da sole; per dargli nome, icona e attrezzo
     aggiungile a NOMI e ATTREZZI qui sotto. */
(function(){
  var NOMI = {licenza:["🪪","Licenza dello Slayer"],livello:["⭐","Livello e rango"],pv:["❤","Punti Vita"],malus:["📝","Altri malus"],
    stati:["🌀","Stati alterati"],statistiche:["📊","Statistiche"],competenze:["🎯","Competenze"],arma1:["⚔","Arma principale"],
    abilita:["✨","Abilità dell'arma"],nuclei:["🔮","Nuclei"],arma2:["🏹","Arma secondaria"],equip:["🎒","Equipaggiamento"],
    inventario:["📦","Inventario"],monete:["💰","Monete"],celle:["💎","Celle"],corone:["👑","Corone Aetheriche"],
    note:["📜","Note personali"],salvataggi:["☁","Salvataggi"]};
  var STILI = [["scheda","Scheda classica"],["libri","📚 Libri"],["ampolle","⚗ Ampolle"],["cassettiera","🗄 Cassettiera"],
    ["tavolo","🃏 Tavolo pirata"],["attrezzi","🔨 Attrezzi"],["capitoli","📖 Capitoli"],["bacheca","📌 Bacheca"]];
  var RN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV"];
  var CUOIO = ["#5c1f1a","#1f3a5c","#2f4a2a","#4a2d5c","#6b4a1f","#1f4a4a","#3a2a1a","#6b2a3a","#2a2a4a","#4a3a12","#1a3a2a","#5c3a1f","#3a1f2a","#24405a","#5a2414","#40502a","#2a1a3a","#504030"];
  var LIQ = ["#6ec6e8","#e2603a","#8a6cd8","#5aa84a","#e8c24a","#d84a6a","#4ad8c0","#c8e86a","#f08ad0","#7aa8ff","#ff9a40","#b0f0ff"];
  var PIN = ["#b8322a","#2a6ab8","#d8a830","#3a8a3a","#8a3ab8"];
  var FORME = [
    '<path d="M30 6h10v24q20 8 20 34a25 25 0 0 1-50 0q0-26 20-34z"/>',
    '<path d="M29 6h12v28l22 50q3 10-8 10H15q-11 0-8-10l22-50z"/>',
    '<rect x="24" y="6" width="22" height="86" rx="11"/>',
    '<path d="M28 6h14v14q14 4 14 16v48q0 8-8 8H22q-8 0-8-8V36q0-12 14-16z"/>',
    '<path d="M29 6h12v12q24 10 24 36t-30 38q-30-12-30-38t24-36z"/>'];
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

  var wrap, bar, vis, ed, testa, pg = null, pref = null, sez = [], misure = {}, aperta = null, modo = false, scelta = null, perRiga = 0;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
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
      misure[k] = { h: Math.round(t(195, 250)), w: Math.round(t(50, 70)), sc: t(.8, 1.2), f: Math.floor(t(0, 5)), r: t(-4, 4), lv: t(.45, .85),
        span: r() < .3 ? 2 : 1, dh: Math.round(t(70, 110)), bh: Math.round(t(80, 130)), dx: t(-1, 1), dy: t(-1, 1) }; }); }
  function forma(k){ var a = pref.amp[k]; return a && a.f >= 0 && a.f < FORME.length ? a.f : misure[k].f; }
  function colore(s){ var a = pref.amp[s.k]; return a && a.c ? a.c : LIQ[s.i % LIQ.length]; }
  function ampolla(s){ var m = misure[s.k], c = colore(s), f = forma(s.k), W = Math.round(108 * m.sc), H = Math.round(154 * m.sc), y0 = Math.round(96 - m.lv * 80), id = "asp-cl-" + s.k;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 70 100" aria-hidden="true"><defs><clipPath id="' + id + '">' + FORME[f] + '</clipPath></defs>' +
      '<g fill="rgba(200,230,255,.10)" stroke="rgba(230,240,255,.55)" stroke-width="2">' + FORME[f] + '</g>' +
      '<g clip-path="url(#' + id + ')"><rect x="0" y="' + y0 + '" width="70" height="100" fill="' + c + '" opacity=".85"/><rect x="0" y="' + y0 + '" width="70" height="3" fill="#fff" opacity=".35"/>' +
      '<circle class="bolla" cx="' + (28 + s.i % 3 * 6) + '" cy="88" r="2.5" fill="#fff" opacity=".7" style="animation-delay:-' + (s.i % 4) + 's"/><circle class="bolla" cx="' + (40 - s.i % 2 * 8) + '" cy="90" r="1.8" fill="#fff" opacity=".7" style="animation-delay:-' + (s.i % 3 + 1.4) + 's"/></g>' +
      '<path d="M20 ' + (y0 + 8) + 'q-3 14 2 26" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '<rect x="27" y="0" width="16" height="10" rx="2" fill="#8a6440"/><rect x="27" y="0" width="16" height="3" rx="1" fill="#a87a50"/></svg>'; }
  function righe(lista, n){ var out = []; for(var i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n)); return out; }
  function quantiPerRiga(){ var w = vis.clientWidth || wrap.clientWidth || 900;
    if(pref.s === "libri") return Math.max(4, Math.min(10, Math.floor((w - 90) / 64)));
    if(pref.s === "ampolle") return w < 480 ? 3 : w < 760 ? 4 : 6;
    return 0; }
  function voce(s, cls, stile, dentro){ return '<div class="ar-it ' + cls + (aperta === s.k ? ' on' : '') + '" role="button" tabindex="0" data-k="' + s.k + '" aria-label="Apri ' + esc(s.nm) + '"' + (stile ? ' style="' + stile + '"' : '') + '>' + dentro + '</div>'; }
  function disegna(){
    if(!wrap) return;
    var s = pref.s, h = "";
    sez = sezioni(); calcola(); perRiga = quantiPerRiga();
    vis.hidden = (s === "scheda"); wrap.classList.toggle("ar-vista", s !== "scheda");
    if(s === "libri"){
      var rr = righe(sez, perRiga);
      h = '<div class="ar-lib">' + rr.map(function(r, ri){ var u = '<div class="ar-pal">' + (ri === 0 ? '<div class="ar-ferma"></div>' : '');
        r.forEach(function(x, j){ var m = misure[x.k], or = x.i % 3 === 0 ? "#e0c070" : "#c9a24a", incl = (ri === rr.length - 1 && j === r.length - 1 && r.length > 2);
          u += voce(x, "ar-libro" + (incl ? " inclinato" : ""), '--lb-or:' + or + ';--lb-et:' + (x.i % 4 === 2 ? '#d8c8a0' : '#e9dbb4') + ';width:' + m.w + 'px;height:' + m.h + 'px;background:linear-gradient(90deg,rgba(0,0,0,.25),transparent 30%,rgba(255,255,255,.06) 50%,transparent 70%,rgba(0,0,0,.3)),' + CUOIO[x.i % CUOIO.length],
            '<div class="b" style="top:10px"></div><div class="b" style="top:20px;height:3px"></div><span class="i">' + x.ic + '</span><div class="t">' + esc(x.nm) + '</div><div class="b" style="bottom:10px"></div>'); });
        return u + (ri === 0 ? '<div class="ar-ferma" style="transform:scaleX(-1)"></div>' : '') + '</div>'; }).join('') + '<div style="height:16px"></div></div>';
    } else if(s === "ampolle"){
      h = '<div class="ar-amp">' + righe(sez, perRiga).map(function(r){ return '<div class="ar-pal">' + r.map(function(x){
        return voce(x, "ar-ampolla", "", ampolla(x) + '<span class="ar-cart" style="--r:' + misure[x.k].r.toFixed(1) + 'deg">' + esc(x.nm) + '</span>'); }).join('') + '</div>'; }).join('') + '<div style="height:16px"></div></div>';
    } else if(s === "cassettiera"){
      h = '<div class="ar-cas">' + sez.map(function(x){ var m = misure[x.k];
        return voce(x, "ar-cass", 'grid-column:span ' + m.span + ';height:' + m.dh + 'px', '<span class="ic">' + x.ic + '</span><span class="tg">' + esc(x.nm) + '</span><span class="mn"></span>'); }).join('') + '</div>';
    } else if(s === "tavolo"){
      var col = 6, rows = Math.ceil(sez.length / col);
      h = '<div class="ar-tav" style="height:' + (rows * 178 + 40) + 'px">';
      [[48,46],[50.5,44],[53,42],[52,45.5],[14,88],[86,90],[88,87],[72,6],[8,48],[31,50],[62,30],[94,52],[40,92]].forEach(function(q){ h += '<span class="ar-moneta" style="left:' + q[0] + '%;top:' + q[1] + '%"></span>'; });
      sez.forEach(function(x, n){ var c = n % col, r = Math.floor(n / col), m = misure[x.k];
        h += voce(x, "ar-carta", 'left:calc(' + (2 + c * 16.2) + '% + ' + Math.round(m.r * 3) + 'px);top:' + (24 + r * 175 + Math.round(m.r * 4)) + 'px;transform:rotate(' + (m.r * 2.2).toFixed(1) + 'deg)',
          '<span class="n a">' + RN[n] + '</span><span class="ic">' + x.ic + '</span><span class="nm">' + esc(x.nm) + '</span><span class="n z">' + RN[n] + '</span>'); });
      h += '<svg class="ar-boccale" style="right:16px;top:18px" width="54" height="64" viewBox="0 0 54 64" aria-hidden="true"><rect x="6" y="10" width="32" height="48" rx="4" fill="#7a5028" stroke="#3a2410" stroke-width="2"/><path d="M6 22h32M6 46h32" stroke="#c9a24a" stroke-width="3"/><path d="M38 20q14 0 14 14t-14 12" stroke="#3a2410" stroke-width="5" fill="none"/><ellipse cx="22" cy="10" rx="17" ry="6" fill="#f4ead0"/></svg></div>';
    } else if(s === "attrezzi"){
      h = '<div class="ar-att">' + sez.map(function(x){ return voce(x, "ar-attr", '--r:' + misure[x.k].r.toFixed(1) + 'deg',
        '<span class="pg"></span><svg width="84" height="126" viewBox="0 0 60 90" aria-hidden="true">' + (ATTREZZI[x.k] || ATTREZZI._) + '</svg><span class="tg">' + esc(x.nm) + '</span>'); }).join('') + '</div>';
    } else if(s === "capitoli"){
      var nome = ""; try { var c = SC_CHARS.find(function(c){ return c.k === pg; }); if(c) nome = " — " + c.n; } catch(e){}
      h = '<div class="ar-cap"><h3>Indice</h3><div class="sb">Diario dello Slayer' + esc(nome) + '</div><div class="col">' + sez.map(function(x, n){
        return voce(x, "ar-capr", "", '<span class="r">' + RN[n] + '</span><span class="nm">' + esc(x.nm) + '</span><span class="pt"></span><span class="p">' + (n * 7 + 3) + '</span>'); }).join('') + '</div></div>';
    } else if(s === "bacheca"){
      h = '<div class="ar-bac">' + sez.map(function(x){ var m = misure[x.k];
        return voce(x, "ar-foglio", '--r:' + (m.r * .9).toFixed(1) + 'deg;--h:' + m.bh + 'px;--pc:' + PIN[x.i % PIN.length], '<span class="pin"></span><div class="ic">' + x.ic + '</div><div class="nm">' + esc(x.nm) + '</div>'); }).join('') + '</div>';
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
  function mostra(k, scorri){
    aperta = k;
    wrap.querySelectorAll(":scope>[data-pz]").forEach(function(e){ e.classList.toggle("ar-aperta", e.dataset.pz === k); });
    vis.querySelectorAll(".ar-it").forEach(function(e){ e.classList.toggle("on", e.dataset.k === k); });
    var x = sez.find(function(s){ return s.k === k; });
    testa.hidden = false; testa.innerHTML = '<span>' + (x ? x.ic + ' ' + esc(x.nm) : '') + '</span><button type="button">✕ Chiudi</button>';
    testa.querySelector("button").onclick = function(){ chiudi(); try { vis.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e){} };
    if(scorri) setTimeout(function(){ try { testa.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e){} }, 60);
  }
  function chiudi(){ aperta = null; testa.hidden = true;
    wrap.querySelectorAll(".ar-aperta").forEach(function(e){ e.classList.remove("ar-aperta"); });
    vis.querySelectorAll(".ar-it.on").forEach(function(e){ e.classList.remove("on"); }); }
  function editor(){
    if(!modo || !scelta || pref.s !== "ampolle"){ ed.hidden = true; ed.innerHTML = ""; return; }
    var x = sez.find(function(s){ return s.k === scelta; }); if(!x){ ed.hidden = true; return; }
    var f = forma(x.k), c = colore(x);
    ed.hidden = false;
    ed.innerHTML = '<div class="t">⚗ ' + esc(x.nm) + ' — scegli forma e colore</div>' +
      '<div class="g">' + FORME.map(function(p, i){ return '<button type="button" data-f="' + i + '" class="' + (i === f ? 'on' : '') + '" aria-label="Forma ' + (i + 1) + '"><svg width="30" height="42" viewBox="0 0 70 100" aria-hidden="true"><g fill="' + c + '" stroke="#fff" stroke-width="3">' + p + '</g></svg></button>'; }).join('') + '</div>' +
      '<div class="g">' + LIQ.map(function(l){ return '<button type="button" class="c' + (l === c ? ' on' : '') + '" data-c="' + l + '" style="background:' + l + '" aria-label="Colore ' + l + '"></button>'; }).join('') + '</div>' +
      '<button type="button" class="x" data-r="1">↺ Come prima</button>';
  }
  function tocca(k){
    if(modo && pref.s === "ampolle"){ scelta = k; disegna(); vis.querySelectorAll(".ar-it").forEach(function(e){ e.classList.toggle("on", e.dataset.k === k); }); return; }
    if(aperta === k){ chiudi(); return; }
    mostra(k, true);
  }
  function monta(){
    wrap = document.querySelector("#scheda .sc-wrap"); if(!wrap || document.querySelector(".ar-bar")) return !!wrap;
    bar = document.createElement("div"); bar.className = "ar-bar"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Aspetto dell'area");
    bar.innerHTML = '<span>Aspetto dell\'area</span>' + STILI.map(function(s){ return '<button type="button" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') +
      '<button type="button" data-mx="1" title="Nuove misure e forme casuali">↻ Mescola</button><button type="button" class="ar-pers" hidden>✎ Personalizza ampolle</button>';
    vis = document.createElement("div"); vis.className = "ar-v"; vis.hidden = true;
    ed = document.createElement("div"); ed.className = "ar-ed"; ed.hidden = true;
    testa = document.createElement("div"); testa.className = "ar-testa"; testa.hidden = true;
    [bar, ed, vis, testa].forEach(function(n){ wrap.parentNode.insertBefore(n, wrap); });
    vis.addEventListener("click", function(e){ var it = e.target.closest(".ar-it"); if(it) tocca(it.dataset.k); });
    vis.addEventListener("keydown", function(e){ if(e.key !== "Enter" && e.key !== " ") return; var it = e.target.closest(".ar-it"); if(it){ e.preventDefault(); tocca(it.dataset.k); } });
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
    var rt = null; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ if(pref && quantiPerRiga() !== perRiga) disegna(); }, 200); });
    return true;
  }
  function aggiorna(){ if(!monta()) return; if(cur() !== pg || !pref){ aperta = null; modo = false; scelta = null; } carica(); disegna(); }
  /* quando si apre l'area o si cambia personaggio, ogni player ritrova il suo aspetto */
  if(typeof window.scBuild === "function"){ var o = window.scBuild; window.scBuild = function(){ var r = o.apply(this, arguments); try { aggiorna(); } catch(e){} return r; }; }
  window.addEventListener("storage", function(e){ if(e.key && e.key.indexOf("tcj-asp-") === 0) aggiorna(); });
  window.tcjAreaAspetto = { aggiorna: aggiorna };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", aggiorna); else aggiorna();
})();
