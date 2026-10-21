/* ⛵ Viaggi — pannello sulla Mappa del Mondo: partenza, arrivo e condizioni del cielo.
   Mostra quanti giorni di navigazione servono (tempi in dati/viaggi.js) e disegna la rotta della nave:
   la nave non impiega il tempo vero, ma la forma della rotta cambia col cielo, e il Maelstrom viene sempre aggirato.

   Ogni player gestisce la propria nave: lo stato sta nella chiave tcj-vg-<pg>, che fa parte del pacchetto
   del personaggio (js/sync-giocatori.js) e segue il player su ogni dispositivo con «☁ Salva online».
   Senza un personaggio attivo (visitatori, Master) la nave resta solo in questo browser (chiave tcj-vg).
   Sostituisce la vecchia rotta fissa da Ramsgate: wmRoute() ora disegna questa nave. */
(function(){
  if(typeof VG_LUOGHI === "undefined" || typeof VG_VIAGGI === "undefined") return;
  var ORDINE = ["ramsgate","ardente","radiante","folgorante","terrestre","oscuro","glaciale"];
  var M = VG_MAELSTROM, CIELO = {}; VG_CIELO.forEach(function(c){ CIELO[c.k] = c; });
  var NS = "http://www.w3.org/2000/svg";

  /* ---------------- dati e conti ---------------- */
  function viaggio(da, a){
    var v = VG_VIAGGI[da + "|" + a]; if(v) return { giorni: v.giorni, p0: v.approdi[0], p1: v.approdi[1] };
    v = VG_VIAGGI[a + "|" + da];     if(v) return { giorni: v.giorni, p0: v.approdi[1], p1: v.approdi[0] };
    return null;
  }
  function giorni(da, a, c){ var v = viaggio(da, a); if(!v) return null; return Math.ceil(v.giorni * (CIELO[c] || VG_CIELO[0]).per * 2 - 1e-9) / 2; }
  function durata(g){
    if(g == null) return "";
    var n = Math.floor(g), mezzo = g - n >= .5;
    if(!n) return "mezza giornata";
    return n + (n === 1 ? " giorno" : " giorni") + (mezzo ? " e mezzo" : "");
  }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  /* ---------------- stato personale ---------------- */
  function chiave(){ var k = ""; try { k = (typeof paActive === "function") ? paActive() : ""; } catch(e){} return k ? "tcj-vg-" + k : "tcj-vg"; }
  function leggi(){
    var s = null; try { s = JSON.parse(localStorage.getItem(chiave()) || "null"); } catch(e){}
    s = s && typeof s === "object" ? s : {};
    if(!VG_LUOGHI[s.pos]) s.pos = "ramsgate";
    if(!Array.isArray(s.xy) || s.xy.length !== 2) s.xy = VG_LUOGHI[s.pos].nave.slice();
    if(!CIELO[s.c]) s.c = "sereno";
    if(s.v && !(VG_LUOGHI[s.v.da] && VG_LUOGHI[s.v.a] && s.v.da !== s.v.a && CIELO[s.v.c])) s.v = null;
    return s;
  }
  function scrivi(s){ try { localStorage.setItem(chiave(), JSON.stringify({ pos: s.pos, xy: s.xy, c: s.c, v: s.v || null })); } catch(e){} }

  /* ---------------- rotte ---------------- */
  function nz(p, m){ var dx = (p[0] - M.x) / (M.rx * m), dy = (p[1] - M.y) / (M.ry * m); return dx * dx + dy * dy; }   /* <1 = dentro la zona */
  function attraversa(a, b, m){ for(var i = 0; i <= 40; i++){ var t = i / 40; if(nz([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], m) < 1) return true; } return false; }
  function sulBordo(th, k){ return [M.x + M.rx * k * Math.cos(th), M.y + M.ry * k * Math.sin(th)]; }
  function ang(p){ return Math.atan2((p[1] - M.y) / M.ry, (p[0] - M.x) / M.rx); }
  function lungh(pp){ var L = 0; for(var i = 1; i < pp.length; i++) L += Math.hypot(pp[i][0] - pp[i-1][0], pp[i][1] - pp[i-1][1]); return L; }

  /* rotta più corta che gira attorno al Maelstrom (filo teso attorno alla zona) */
  function base(a, b){
    if(!attraversa(a, b, 1)) return [a, b];
    var ta = ang(a), tb = ang(b), best = null;
    [1, -1].forEach(function(dir){
      var d = tb - ta; while(dir > 0 ? d <= 0 : d >= 0) d += dir * 2 * Math.PI;
      var n = Math.max(6, Math.ceil(Math.abs(d) / .12)), pp = [a];
      for(var i = 0; i <= n; i++) pp.push(sulBordo(ta + d * i / n, 1.1));
      pp.push(b);
      for(var cambiato = true; cambiato;){            /* tolgo i punti inutili finché il filo non tocca la zona */
        cambiato = false;
        for(var j = 1; j < pp.length - 1; j++){ if(!attraversa(pp[j-1], pp[j+1], 1.02)){ pp.splice(j, 1); cambiato = true; break; } }
      }
      var L = lungh(pp); if(!best || L < best.L) best = { pp: pp, L: L };
    });
    return best.pp;
  }
  /* punti a passo regolare lungo la spezzata */
  function campiona(pp, n){
    var L = lungh(pp), out = [], seg = 0, fatto = 0;
    for(var i = 0; i <= n; i++){
      var s = L * i / n;
      while(seg < pp.length - 2 && fatto + Math.hypot(pp[seg+1][0] - pp[seg][0], pp[seg+1][1] - pp[seg][1]) < s){ fatto += Math.hypot(pp[seg+1][0] - pp[seg][0], pp[seg+1][1] - pp[seg][1]); seg++; }
      var l = Math.hypot(pp[seg+1][0] - pp[seg][0], pp[seg+1][1] - pp[seg][1]) || 1, t = Math.min(1, (s - fatto) / l);
      out.push([pp[seg][0] + (pp[seg+1][0] - pp[seg][0]) * t, pp[seg][1] + (pp[seg+1][1] - pp[seg][1]) * t]);
    }
    return out;
  }
  function seme(str){ var h = 2166136261; for(var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return function(){ h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }

  /* la rotta vera: la base piegata in modo diverso a seconda del cielo, sempre fuori dal Maelstrom */
  function rotta(da, a, c){
    var v = viaggio(da, a); if(!v) return null;
    var pp = base(v.p0, v.p1), L = lungh(pp), n = Math.max(24, Math.min(160, Math.round(L / 9)));
    var P = campiona(pp, n), r = seme(da + a + c), f1 = r() * 6.28, f2 = r() * 6.28;
    /* lato verso cui la rotta si incurva: lontano dal Maelstrom */
    var mi = P[Math.floor(n / 2)], mj = P[Math.floor(n / 2) + 1] || P[n], tx = mj[0] - mi[0], ty = mj[1] - mi[1], tl = Math.hypot(tx, ty) || 1;
    var lato = ((-ty / tl) * (mi[0] - M.x) + (tx / tl) * (mi[1] - M.y)) >= 0 ? 1 : -1;
    var arco, amp, giri;
    if(c === "sereno"){ arco = Math.min(60, Math.max(16, L * .05)); amp = 0; }
    else if(c === "venti"){ arco = Math.min(120, Math.max(28, L * .1)); amp = Math.min(30, 7 + L * .04); giri = Math.max(2, Math.round(L / 170)); }
    else if(c === "burrasca"){ arco = Math.min(170, Math.max(42, L * .15)); amp = Math.min(30, 8 + L * .045); giri = Math.max(2, L / 210); }
    else { arco = Math.min(240, Math.max(60, L * .22)); amp = Math.min(40, 10 + L * .06); giri = Math.max(2.5, L / 160); }
    var Q = P.map(function(p, i){
      var t = i / n, q = P[Math.min(n, i + 1)], o = P[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], dl = Math.hypot(dx, dy) || 1;
      var nx = -dy / dl * lato, ny = dx / dl * lato, inv = Math.pow(Math.sin(Math.PI * t), .7), off = arco * Math.sin(Math.PI * t);
      if(c === "venti"){ var u = (t * giri * 2) % 2; off += amp * inv * (u < 1 ? u * 2 - 1 : 3 - u * 2); }            /* bordeggio: lati dritti */
      else if(c === "burrasca") off += amp * inv * (.7 * Math.sin(6.283 * giri * t + f1) + .3 * Math.sin(6.283 * giri * 2.3 * t + f2));
      else if(c === "tempesta") off += arco * .35 * Math.sin(2 * Math.PI * t) + amp * inv * (.6 * Math.sin(6.283 * giri * t + f1) + .4 * Math.sin(6.283 * giri * 1.9 * t + f2));
      return [p[0] + nx * off, p[1] + ny * off];
    });
    Q[0] = P[0]; Q[n] = P[n];
    Q = Q.map(function(p){                              /* il Maelstrom si aggira sempre */
      var d = nz(p, 1); if(d >= 1.03 * 1.03) return p;
      var k = 1.03 / Math.sqrt(d || .0001); return [M.x + (p[0] - M.x) * k, M.y + (p[1] - M.y) * k];
    });
    if(c === "venti"){                                  /* tengo solo gli angoli del bordeggio */
      var K = [Q[0]], passi = giri * 2;
      for(var s = 1; s < passi; s++) K.push(Q[Math.round(n * s / passi)]);
      K.push(Q[n]);
      var fine = [K[0]]; for(var j = 1; j < K.length; j++){ var pz = campiona([K[j-1], K[j]], 6).slice(1); pz.forEach(function(p){ var d = nz(p, 1); if(d < 1.03 * 1.03){ var k = 1.03 / Math.sqrt(d || .0001); p = [M.x + (p[0] - M.x) * k, M.y + (p[1] - M.y) * k]; } fine.push(p); }); }
      return { pts: fine, d: "M" + fine.map(function(p){ return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L"), a: v.p0, b: v.p1 };
    }
    return { pts: Q, d: liscia(Q), a: v.p0, b: v.p1 };
  }
  function liscia(Q){                                   /* Catmull-Rom → curve morbide */
    var d = "M" + Q[0][0].toFixed(1) + "," + Q[0][1].toFixed(1);
    for(var i = 0; i < Q.length - 1; i++){
      var p0 = Q[Math.max(0, i - 1)], p1 = Q[i], p2 = Q[i + 1], p3 = Q[Math.min(Q.length - 1, i + 2)];
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }
  window.vgRotta = rotta;   /* per controlli dalla console */

  /* ---------------- disegno sulla mappa ---------------- */
  function nave(flip){
    return '<g transform="scale(' + (flip ? -1.6 : 1.6) + ',1.6)"><path d="M-14,2 L14,2 L9,9 L-9,9 Z" fill="#c8a84b" stroke="#2a1c08" stroke-width="1"/><path d="M-1,1 L-1,-16 L11,-1 Z" fill="#f4ead2" stroke="#2a1c08" stroke-width=".8"/><path d="M-3,1 L-3,-12 L-12,0 Z" fill="#e8dcc0" stroke="#2a1c08" stroke-width=".8"/></g>';
  }
  function disegnaRotta(R, modo, c){       /* modo: "anteprima" | "viaggio" | "salpa" */
    var g = document.getElementById("wm-route"); if(!g) return;
    var flip = R.b[0] < R.a[0], dur = modo === "viaggio" ? "16s" : (modo === "salpa" ? "5s" : "4s");
    g.setAttribute("class", "vg-g vg-" + modo + " vg-c-" + c);
    g.innerHTML = '<path d="' + R.d + '" class="wm-rt-glow"/><path id="wm-rt-path" d="' + R.d + '" class="wm-rt"/>' +
      '<circle cx="' + R.a[0] + '" cy="' + R.a[1] + '" r="9" class="vg-from"/>' +
      '<circle cx="' + R.b[0] + '" cy="' + R.b[1] + '" r="30" class="wm-rt-dest"><animate attributeName="r" values="26;42;26" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.2;.9" dur="2.4s" repeatCount="indefinite"/></circle>' +
      '<g class="wm-ship">' + nave(flip) + '<animateMotion id="wm-am" begin="indefinite" dur="' + dur + '" repeatCount="' + (modo === "viaggio" ? "indefinite" : "1") + '" fill="freeze" rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .35 1"><mpath href="#wm-rt-path"/></animateMotion></g>';
    g.classList.remove("draw"); void g.getBoundingClientRect(); g.classList.add("draw");
    try { document.getElementById("wm-am").beginElement(); } catch(e){}
  }
  function disegnaFerma(s){
    var g = document.getElementById("wm-route"); if(!g) return;
    g.setAttribute("class", "vg-g vg-ferma");
    g.innerHTML = '<g class="wm-ship vg-ancora" transform="translate(' + s.xy[0] + ',' + s.xy[1] + ')"><circle r="24" class="vg-alone"/><g>' + nave(s.xy[0] > M.x) +
      '<animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.2s" repeatCount="indefinite"/></g></g>';
  }
  function etichetta(h){ var lb = document.getElementById("wm-route-lbl"); if(lb) lb.innerHTML = h; }

  /* stato attuale sulla mappa (senza anteprima) */
  function mostra(salpa){
    var s = leggi();
    if(s.v){
      var R = rotta(s.v.da, s.v.a, s.v.c);
      if(R){ disegnaRotta(R, salpa ? "salpa" : "viaggio", s.v.c);
        etichetta('⛵ In viaggio <b>' + VG_LUOGHI[s.v.da].da + '</b> <b>' + VG_LUOGHI[s.v.a].a + '</b> · ' + CIELO[s.v.c].icona + ' ' + CIELO[s.v.c].nome + ' · ' + durata(giorni(s.v.da, s.v.a, s.v.c)));
        if(salpa){ clearTimeout(mostra.t); mostra.t = setTimeout(function(){ var s2 = leggi(); if(s2.v) disegnaRotta(R, "viaggio", s2.v.c); }, 5200); }
        return; }
    }
    disegnaFerma(s);
    etichetta('⚓ La nave è ferma <b>' + VG_LUOGHI[s.pos].a + '</b> · apri <b>⛵ Viaggi</b> per tracciare una rotta');
  }
  /* anteprima: dal pannello o passando sopra una terra */
  function anteprima(da, a, c){
    var R = rotta(da, a, c); if(!R) return mostra();
    disegnaRotta(R, "anteprima", c);
    etichetta('🧭 ' + cap(VG_LUOGHI[da].da) + ' <b>' + VG_LUOGHI[a].a + '</b>: <b>' + durata(giorni(da, a, c)) + '</b> di navigazione · ' + CIELO[c].icona + ' ' + CIELO[c].nome.toLowerCase());
  }

  /* la vecchia rotta fissa viene sostituita: chi chiama wmRoute() ora vede questa nave */
  window.wmRoute = function(hov){
    var s = leggi();
    if(hov && VG_LUOGHI[hov] && !s.v && !panAperto()){ var da = s.pos; if(hov !== da) return anteprima(da, hov, s.c); }
    if(panAperto()) return aggiornaPannello();
    mostra();
  };
  window.wmSetRoute = function(){ mostra(); };

  /* ---------------- pannello ---------------- */
  var box = null, pan = null, tog = null, sel = { da: null, a: "", c: null };
  function panAperto(){ return pan && !pan.hidden; }
  function costruisci(){
    var wrap = document.querySelector("#mappa .map-wrap"), svg = document.getElementById("world-map");
    if(!wrap || !svg || box) return;
    box = document.createElement("div"); box.className = "vg"; box.id = "vg";
    box.innerHTML = '<button type="button" class="vg-tog" id="vg-tog" aria-expanded="false" aria-controls="vg-pan"><span class="vg-ti">⛵</span> Viaggi<span class="vg-tdove" id="vg-tdove"></span></button>' +
      '<div class="vg-pan" id="vg-pan" hidden role="region" aria-label="Viaggi in nave"></div>';
    svg.insertAdjacentElement("afterend", box);
    pan = box.querySelector("#vg-pan"); tog = box.querySelector("#vg-tog");
    tog.addEventListener("click", function(){ apri(pan.hidden); });
    pan.addEventListener("change", function(e){
      if(e.target.id === "vg-da"){ sel.da = e.target.value; if(sel.a === sel.da) sel.a = ""; }
      if(e.target.id === "vg-a") sel.a = e.target.value;
      aggiornaPannello();
    });
    pan.addEventListener("click", function(e){
      var b = e.target.closest("[data-vg]"); if(!b) return;
      var az = b.getAttribute("data-vg"), s = leggi();
      if(az === "chiudi") return apri(false);
      if(az === "cielo"){ sel.c = b.getAttribute("data-c"); s.c = sel.c; scrivi(s); suono("wave"); return aggiornaPannello(); }
      if(az === "salpa"){
        if(!sel.a || sel.a === sel.da) return;
        var R = rotta(sel.da, sel.a, sel.c);
        s.v = { da: sel.da, a: sel.a, c: sel.c }; s.c = sel.c; if(s.pos !== sel.da){ s.pos = sel.da; s.xy = R ? R.a.slice() : VG_LUOGHI[sel.da].nave.slice(); }
        scrivi(s); suono("wave"); disegnaPannello(); mostra(true); return;
      }
      if(az === "arrivati"){
        if(!s.v) return;
        var R2 = rotta(s.v.da, s.v.a, s.v.c);
        s.pos = s.v.a; s.xy = R2 ? R2.b.slice() : VG_LUOGHI[s.v.a].nave.slice(); s.v = null;
        scrivi(s); suono("paper"); sel = { da: s.pos, a: "", c: s.c }; disegnaPannello(); mostra(); return;
      }
      if(az === "annulla"){
        if(!s.v) return; s.v = null; scrivi(s); suono("paper"); sel = { da: s.pos, a: "", c: s.c }; disegnaPannello(); mostra(); return;
      }
    });
    disegnaTog();
  }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function apri(si){
    if(!box) return;
    pan.hidden = !si; tog.setAttribute("aria-expanded", String(!!si)); box.classList.toggle("aperto", !!si);
    if(si){ var s = leggi(); sel = { da: s.pos, a: "", c: s.c }; disegnaPannello(); suono("paper"); aggiornaPannello(); }
    else mostra();
  }
  function opzioni(scelto, escludi, vuota){
    return (vuota ? '<option value="">' + vuota + '</option>' : '') + ORDINE.filter(function(k){ return k !== escludi; }).map(function(k){
      return '<option value="' + k + '"' + (k === scelto ? ' selected' : '') + '>' + VG_LUOGHI[k].icona + ' ' + VG_LUOGHI[k].nome + '</option>'; }).join("");
  }
  function disegnaTog(){ var s = leggi(), t = document.getElementById("vg-tdove"); if(t) t.textContent = s.v ? " · in viaggio" : " · " + VG_LUOGHI[s.pos].nome.replace("Continente ", ""); }
  function disegnaPannello(){
    if(!pan) return;
    var s = leggi(), h = '<div class="vg-head"><span class="vg-tit">⛵ Viaggi in nave</span><button type="button" class="vg-x" data-vg="chiudi" aria-label="Chiudi il pannello dei viaggi">✕</button></div>';
    if(s.v){
      var c = CIELO[s.v.c];
      h += '<div class="vg-stato vg-incorso"><span class="vg-k">In viaggio</span><div class="vg-tratta"><b>' + VG_LUOGHI[s.v.da].icona + ' ' + VG_LUOGHI[s.v.da].nome + '</b><span class="vg-freccia">↓</span><b>' + VG_LUOGHI[s.v.a].icona + ' ' + VG_LUOGHI[s.v.a].nome + '</b></div></div>' +
        '<div class="vg-ris"><div class="vg-gg">' + durata(giorni(s.v.da, s.v.a, s.v.c)) + '</div><div class="vg-sub">di navigazione · ' + c.icona + ' ' + c.nome + '</div><div class="vg-nota">' + c.rotta + '</div></div>' +
        '<div class="vg-btns"><button type="button" class="vg-b vg-prim" data-vg="arrivati">⚓ Siamo arrivati</button><button type="button" class="vg-b" data-vg="annulla">↩ Annulla viaggio</button></div>';
    } else {
      if(!VG_LUOGHI[sel.da]) sel.da = s.pos;
      if(!CIELO[sel.c]) sel.c = s.c;
      h += '<div class="vg-stato"><span class="vg-k">Ora la nave è</span> <b>' + VG_LUOGHI[s.pos].a + '</b></div>' +
        '<label class="vg-f"><span>Partenza</span><select id="vg-da">' + opzioni(sel.da) + '</select></label>' +
        '<label class="vg-f"><span>Arrivo</span><select id="vg-a">' + opzioni(sel.a, sel.da, "— scegli la meta —") + '</select></label>' +
        '<div class="vg-f"><span>Condizioni del cielo</span><div class="vg-cieli" role="radiogroup" aria-label="Condizioni del cielo">' +
        VG_CIELO.map(function(c){ return '<button type="button" role="radio" aria-checked="' + (c.k === sel.c) + '" class="vg-cielo' + (c.k === sel.c ? ' on' : '') + '" data-vg="cielo" data-c="' + c.k + '"><span class="vg-ci">' + c.icona + '</span>' + c.nome + '</button>'; }).join("") + '</div></div>' +
        '<div class="vg-ris" id="vg-ris"></div>' +
        '<div class="vg-btns"><button type="button" class="vg-b vg-prim" data-vg="salpa" id="vg-salpa">⛵ Salpa</button></div>';
    }
    pan.innerHTML = h;
    disegnaTog();
  }
  function aggiornaPannello(){
    if(!pan) return;
    var s = leggi();
    if(s.v){ if(!pan.querySelector(".vg-incorso")) disegnaPannello(); return mostra(); }
    if(!pan.querySelector("#vg-da")) disegnaPannello();
    var dsel = pan.querySelector("#vg-da"), asel = pan.querySelector("#vg-a");
    if(dsel.value !== sel.da || asel.querySelector('option[value="' + sel.da + '"]')) disegnaPannello();
    pan.querySelectorAll(".vg-cielo").forEach(function(b){ var on = b.getAttribute("data-c") === sel.c; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); });
    var ris = pan.querySelector("#vg-ris"), salpa = pan.querySelector("#vg-salpa");
    if(sel.a && sel.a !== sel.da){
      var g = giorni(sel.da, sel.a, sel.c), g0 = giorni(sel.da, sel.a, "sereno"), c = CIELO[sel.c];
      ris.innerHTML = '<div class="vg-gg">' + durata(g) + '</div><div class="vg-sub">di navigazione</div><div class="vg-nota">' + c.icona + ' ' + c.rotta + (sel.c !== "sereno" ? ' · con cielo sereno: ' + durata(g0) : '') + '</div>';
      ris.classList.add("on"); salpa.disabled = false;
      anteprima(sel.da, sel.a, sel.c);
    } else {
      ris.innerHTML = '<div class="vg-vuoto">Scegli la meta per vedere quanto dura il viaggio.</div>';
      ris.classList.remove("on"); salpa.disabled = true;
      var s2 = leggi(); disegnaFerma(s2);
      etichetta('⚓ La nave è ferma <b>' + VG_LUOGHI[s2.pos].a + '</b>');
    }
  }

  /* quando cambia il personaggio attivo (o arriva un salvataggio online) la nave cambia con lui */
  var ultima = null;
  function controlla(){
    var k = chiave(), v = null; try { v = localStorage.getItem(k); } catch(e){}
    var firma = k + "|" + v; if(firma === ultima) return; ultima = firma;
    disegnaTog();
    if(panAperto()){ var s = leggi(); sel = { da: s.pos, a: "", c: s.c }; disegnaPannello(); aggiornaPannello(); }
    else mostra();
  }
  ["slRender", "scBuild"].forEach(function(nome){
    if(typeof window[nome] !== "function") return;
    var orig = window[nome];
    window[nome] = function(){ var r = orig.apply(this, arguments); try { controlla(); } catch(e){} return r; };
  });

  function avvio(){ try { costruisci(); controlla(); } catch(e){ if(window.console) console.error(e); } }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvio); else avvio();
})();
