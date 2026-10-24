/* Tema «Oro del Master» — scelta esclusiva del Master (menu ⚔ Slayer › Zona Master › Colore del sito / Effetti laterali).

   - Colore del sito «☀ Oro del Master»: html[data-el=oro]. Sfondo, menu, Zona Master, libreria e strumenti diventano
     oro intenso (css/30-tema-oro.css a mano, css/29-tema-oro-auto.css generato da strumenti/tema-oro.js).
     Nella Zona Master il sole dorato prende il posto dell'anello runico dietro il titolo.
   - Effetti laterali «☀ Oro del Master»: il «Sole Aureo». Ai due bordi dello schermo un sole per metà nascosto
     oltre il bordo, con raggi diritti e raggi a fiamma che girano piano, una corona che respira, fasci di luce,
     onde di luce che partono dal sole, pulviscolo d'oro che sale e scaglie di foglia d'oro che cadono girando.
     Il motore degli effetti laterali è in js/area-giocatori.js (FX): qui ci sono solo i pezzi del sole (OFX). */
(function(){
  "use strict";

  /* ---------- il sole dorato in SVG (titolo della Zona Master, cresta della libreria) ---------- */
  function soleSVG(cls){
    var NS = "http://www.w3.org/2000/svg", C = 200, h = "", i, a;
    h += '<defs><radialGradient id="soDisco" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#fff6cf"/><stop offset=".38" stop-color="#ffd25e"/><stop offset=".78" stop-color="#e09a14"/><stop offset="1" stop-color="#8a5a08"/></radialGradient>'
      + '<radialGradient id="soAlone"><stop offset="0" stop-color="#ffc94a" stop-opacity=".55"/><stop offset=".55" stop-color="#ffb020" stop-opacity=".16"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="soRaggio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset="1" stop-color="#d48a0c"/></linearGradient></defs>';
    h += '<circle class="so-alone" cx="200" cy="200" r="196" fill="url(#soAlone)"/>';
    /* anello esterno con tacche */
    h += '<g class="so-anello" fill="none" stroke="#e8b440" stroke-opacity=".55"><circle cx="200" cy="200" r="190" stroke-width="1"/><circle cx="200" cy="200" r="182" stroke-width="5" stroke-dasharray="1.5 8"/>';
    for(i = 0; i < 48; i++){ a = i / 48 * Math.PI * 2; var l = i % 4 ? 6 : 12; h += '<line x1="' + (C + Math.cos(a) * 172).toFixed(1) + '" y1="' + (C + Math.sin(a) * 172).toFixed(1) + '" x2="' + (C + Math.cos(a) * (172 - l)).toFixed(1) + '" y2="' + (C + Math.sin(a) * (172 - l)).toFixed(1) + '" stroke-width="1.2"/>'; }
    h += '</g>';
    /* raggi: 12 lunghi e diritti, 12 corti a fiamma */
    h += '<g class="so-raggi">';
    for(i = 0; i < 12; i++){
      a = i / 12 * 360;
      h += '<polygon transform="rotate(' + a + ' 200 200)" points="200,38 211,104 200,96 189,104" fill="url(#soRaggio)"/>';
      h += '<path transform="rotate(' + (a + 15) + ' 200 200)" d="M200,96 C188,84 210,74 197,62 C206,70 214,58 205,48 C220,64 208,80 214,90 Z" fill="#ffc23a" fill-opacity=".85"/>';
    }
    h += '</g>';
    h += '<g class="so-raggi2" fill="none" stroke="#ffd36a" stroke-opacity=".45" stroke-width="1"><circle cx="200" cy="200" r="150" stroke-dasharray="30 10 4 10"/></g>';
    /* disco con stella a otto punte e occhio inciso */
    h += '<circle cx="200" cy="200" r="94" fill="url(#soDisco)" class="so-disco"/>';
    h += '<circle cx="200" cy="200" r="84" fill="none" stroke="#8a5a08" stroke-opacity=".55" stroke-width="1.4"/>';
    h += '<circle cx="200" cy="200" r="78" fill="none" stroke="#fff3c4" stroke-opacity=".35" stroke-width=".8"/>';
    var st = "";
    for(i = 0; i < 16; i++){ a = i / 16 * Math.PI * 2 - Math.PI / 2; var r = i % 2 ? 30 : 66; st += (i ? "L" : "M") + (C + Math.cos(a) * r).toFixed(1) + "," + (C + Math.sin(a) * r).toFixed(1); }
    h += '<path class="so-stella" d="' + st + 'Z" fill="#ffe28a" fill-opacity=".35" stroke="#9a6608" stroke-opacity=".6" stroke-width="1.2"/>';
    h += '<path d="M150,200 Q200,160 250,200 Q200,240 150,200 Z" fill="#fff6d8" fill-opacity=".55" stroke="#8a5a08" stroke-opacity=".75" stroke-width="1.6"/>';
    h += '<circle class="so-pupilla" cx="200" cy="200" r="15" fill="#9a6408"/><circle cx="200" cy="200" r="6" fill="#2a1802"/><circle cx="195" cy="195" r="3" fill="#fff8e0" fill-opacity=".9"/>';
    var sv = document.createElementNS(NS, "svg");
    sv.setAttribute("viewBox", "0 0 400 400"); sv.setAttribute("aria-hidden", "true"); sv.setAttribute("class", cls);
    sv.innerHTML = h;
    return sv;
  }
  window.tcjSoleSVG = soleSVG;
  var hdr = document.querySelector("#ms .mshdr");
  if(hdr && !hdr.querySelector(".ms-sole")) hdr.insertBefore(soleSVG("ms-sole"), hdr.firstChild);
  var cresta = document.querySelector("#ms .lb-cresta");
  if(cresta){ var s1 = soleSVG("lb-sole"); cresta.insertBefore(s1, cresta.querySelector(".lb-cresta-t")); }

  /* ---------- effetto laterale «Sole Aureo» (chiamato dal motore FX di js/area-giocatori.js) ---------- */
  function rnd(a, b){ return a + Math.random() * (b - a); }
  var OFX = {
    deco: function(c, bw, H, mob){
      edge(c, bw, H, "120,78,6", mob ? .5 : .4);
      edge(c, bw, H, "255,200,70", mob ? .18 : .12);
      if(mob) return;
      /* filigrana: due fili d'oro verticali con piccoli nodi */
      c.strokeStyle = "rgba(255,206,100,.22)"; c.lineWidth = 1;
      [.22, .3].forEach(function(f){ c.beginPath(); c.moveTo(bw * f, 0); c.lineTo(bw * f, H); c.stroke(); });
      for(var y = 30; y < H; y += 64){ c.fillStyle = "rgba(255,214,120,.35)"; c.beginPath(); c.moveTo(bw * .26, y - 5); c.lineTo(bw * .26 + 4, y); c.lineTo(bw * .26, y + 5); c.lineTo(bw * .26 - 4, y); c.closePath(); c.fill(); }
    },
    parts: function(bw, H, mob){
      var a = [], i;
      for(i = 0; i < (mob ? 8 : 30); i++) a.push({ t: "omote", x0: Math.pow(Math.random(), 1.3) * bw * .9, y: Math.random() * H, r: rnd(.6, mob ? 1.5 : 2.2), vy: -rnd(8, 22), amp: rnd(2, mob ? 3 : 9), ph: rnd(0, 6.28), fl: rnd(2, 6), a: rnd(.45, 1), stella: Math.random() < .22 });
      for(i = 0; i < (mob ? 2 : 9); i++) a.push({ t: "ofoglia", x0: rnd(bw * .1, bw * .8), y: Math.random() * H, w: rnd(mob ? 2 : 3, mob ? 3.5 : 6), vy: rnd(10, 22), amp: rnd(4, mob ? 3 : 12), ph: rnd(0, 6.28), sp: rnd(1.5, 3.5), a: rnd(.55, .95) });
      return a;
    },
    pre: function(c, S, t, bw, H, mob){
      var resp = .5 + .5 * Math.sin(t * 1.2);
      var g = c.createLinearGradient(0, 0, bw, 0);
      g.addColorStop(0, "rgba(255,190,50," + (.14 + .1 * resp) + ")"); g.addColorStop(1, "rgba(255,190,50,0)");
      c.fillStyle = g; c.fillRect(0, 0, bw, H);
      var cx = mob ? -bw * .2 : -bw * .12, cy = H * .5, R = mob ? bw * 1.3 : bw * .62;
      /* fasci di luce che partono dal sole */
      c.save(); c.translate(cx, cy); c.globalCompositeOperation = "lighter";
      for(var k = 0; k < (mob ? 4 : 7); k++){
        var an = -1.25 + k * (2.5 / ((mob ? 4 : 7) - 1)) + Math.sin(t * .23 + k * 1.7) * .08, L = Math.max(H * .55, 380), w = .045 + .02 * Math.sin(t * .6 + k);
        var gr = c.createLinearGradient(0, 0, Math.cos(an) * L, Math.sin(an) * L);
        gr.addColorStop(0, "rgba(255,214,110," + (mob ? .16 : .13) * (.6 + .4 * Math.sin(t * .9 + k * 2.1)) + ")"); gr.addColorStop(1, "rgba(255,214,110,0)");
        c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an - w) * L, Math.sin(an - w) * L); c.lineTo(Math.cos(an + w) * L, Math.sin(an + w) * L); c.closePath(); c.fill();
      }
      c.restore();
      /* corona che respira */
      var co = c.createRadialGradient(cx, cy, R * .3, cx, cy, R * (2.1 + .25 * resp));
      co.addColorStop(0, "rgba(255,226,140," + (.5 + .15 * resp) + ")"); co.addColorStop(.35, "rgba(255,180,40," + (.22 + .08 * resp) + ")"); co.addColorStop(1, "rgba(255,160,20,0)");
      c.fillStyle = co; c.beginPath(); c.arc(cx, cy, R * (2.1 + .25 * resp), 0, 6.283); c.fill();
      if(mob){ c.fillStyle = "rgba(255,226,140,.55)"; c.beginPath(); c.arc(cx, cy, R * .62, 0, 6.283); c.fill(); return; }
      c.save(); c.translate(cx, cy);
      /* raggi diritti (girano piano) e raggi a fiamma (al contrario) */
      c.save(); c.rotate(t * .07);
      for(var i = 0; i < 12; i++){
        c.rotate(Math.PI / 6);
        var lr = R * (1.95 + .12 * Math.sin(t * 1.4 + i));
        var rg = c.createLinearGradient(R * .9, 0, lr, 0); rg.addColorStop(0, "rgba(255,226,140,.95)"); rg.addColorStop(1, "rgba(255,170,30,0)");
        c.fillStyle = rg; c.beginPath(); c.moveTo(R * .92, -R * .09); c.lineTo(lr, 0); c.lineTo(R * .92, R * .09); c.closePath(); c.fill();
      }
      c.restore();
      c.save(); c.rotate(-t * .11 + .26);
      c.fillStyle = "rgba(255,196,60,.7)";
      for(var j = 0; j < 12; j++){
        c.rotate(Math.PI / 6);
        var f = R * (1.38 + .08 * Math.sin(t * 2.3 + j * 1.3)), o = Math.sin(t * 3 + j) * R * .05;
        c.beginPath(); c.moveTo(R * .95, -R * .07);
        c.quadraticCurveTo(R * 1.15, -R * .12 + o, R * 1.2, o * .5);
        c.quadraticCurveTo(R * 1.28, R * .06 + o, f, o);
        c.quadraticCurveTo(R * 1.18, R * .1, R * .95, R * .07); c.closePath(); c.fill();
      }
      c.restore();
      /* anelli e tacche */
      c.shadowColor = "rgba(255,190,50,.9)"; c.shadowBlur = 8;
      c.strokeStyle = "rgba(255,214,110," + (.5 + .2 * resp) + ")"; c.lineWidth = 1.2;
      c.beginPath(); c.arc(0, 0, R * 2.25, 0, 6.283); c.stroke();
      c.save(); c.rotate(-t * .05); c.lineWidth = .9; c.beginPath();
      for(var q = 0; q < 60; q++){ var aa = q / 60 * 6.283, ll = q % 5 ? R * .06 : R * .14; c.moveTo(Math.cos(aa) * R * 2.25, Math.sin(aa) * R * 2.25); c.lineTo(Math.cos(aa) * (R * 2.25 - ll), Math.sin(aa) * (R * 2.25 - ll)); }
      c.stroke(); c.restore();
      c.shadowBlur = 0;
      /* disco */
      var dg = c.createRadialGradient(-R * .25, -R * .3, R * .1, 0, 0, R);
      dg.addColorStop(0, "#fff6cf"); dg.addColorStop(.4, "#ffd25e"); dg.addColorStop(.8, "#e09a14"); dg.addColorStop(1, "#8a5a08");
      c.fillStyle = dg; c.beginPath(); c.arc(0, 0, R * .92, 0, 6.283); c.fill();
      c.strokeStyle = "rgba(120,74,4,.6)"; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, R * .8, 0, 6.283); c.stroke();
      /* stella a otto punte incisa, gira piano */
      c.save(); c.rotate(t * .15); c.strokeStyle = "rgba(130,80,6,.55)"; c.fillStyle = "rgba(255,236,160,.28)"; c.beginPath();
      for(var p = 0; p < 16; p++){ var ap = p / 16 * 6.283, rp = p % 2 ? R * .3 : R * .66; if(p) c.lineTo(Math.cos(ap) * rp, Math.sin(ap) * rp); else c.moveTo(Math.cos(ap) * rp, Math.sin(ap) * rp); }
      c.closePath(); c.fill(); c.stroke(); c.restore();
      /* l'occhio al centro: si apre e si chiude lentamente */
      var ap2 = .55 + .45 * Math.pow(Math.max(0, Math.sin(t * .35)), .3);
      c.fillStyle = "rgba(255,248,220,.7)"; c.strokeStyle = "rgba(110,66,4,.8)"; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-R * .48, 0); c.quadraticCurveTo(0, -R * .42 * ap2, R * .48, 0); c.quadraticCurveTo(0, R * .42 * ap2, -R * .48, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = "#9a6408"; c.beginPath(); c.arc(R * .06, 0, R * .15 * Math.min(1, ap2 * 1.3), 0, 6.283); c.fill();
      c.fillStyle = "#2a1802"; c.beginPath(); c.arc(R * .06, 0, R * .06, 0, 6.283); c.fill();
      c.restore();
    },
    post: function(c, S, t, dt, bw, H, mob){
      /* onde di luce che partono dal sole ogni pochi secondi */
      S.onde = S.onde || []; S.prossima = S.prossima || 1.5;
      S.prossima -= dt;
      if(S.prossima <= 0){ S.onde.push({ r: 0, v: 1 }); S.prossima = rnd(3.2, 5.5); }
      var cx = mob ? -bw * .2 : -bw * .12, cy = H * .5, R = mob ? bw * 1.3 : bw * .62;
      S.onde = S.onde.filter(function(o){ o.r += dt * (mob ? 60 : 110); o.v -= dt * .32; return o.v > 0; });
      S.onde.forEach(function(o){
        c.strokeStyle = "rgba(255,214,110," + (o.v * .55) + ")"; c.lineWidth = mob ? 1 : 2 * o.v + .5;
        c.beginPath(); c.arc(cx, cy, R + o.r, -1.4, 1.4); c.stroke();
      });
      /* sfuma tutto verso il centro dello schermo: niente bordo netto dove finisce la striscia */
      c.save(); c.globalCompositeOperation = "destination-in";
      var m = c.createLinearGradient(0, 0, bw, 0); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(mob ? .7 : .55, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = m; c.fillRect(-2, 0, bw + 4, H); c.restore();
    },
    disegna: function(c, p, x, fade, t){
      if(p.t === "omote"){
        var fl = .55 + .45 * Math.sin(t * p.fl + p.ph), a = p.a * fl * fade;
        var g = c.createRadialGradient(x, p.y, 0, x, p.y, p.r * 4); g.addColorStop(0, "rgba(255,200,70," + (a * .5) + ")"); g.addColorStop(1, "rgba(255,170,30,0)");
        c.fillStyle = g; c.beginPath(); c.arc(x, p.y, p.r * 4, 0, 6.283); c.fill();
        c.fillStyle = "rgba(255,240,190," + a + ")"; c.beginPath(); c.arc(x, p.y, p.r, 0, 6.283); c.fill();
        if(p.stella && fl > .8){ c.strokeStyle = "rgba(255,244,200," + a + ")"; c.lineWidth = .8; var L = p.r * 4.5 * (fl - .6) * 2.5; c.beginPath(); c.moveTo(x - L, p.y); c.lineTo(x + L, p.y); c.moveTo(x, p.y - L); c.lineTo(x, p.y + L); c.stroke(); }
        return true;
      }
      if(p.t === "ofoglia"){
        var gira = Math.sin(t * p.sp + p.ph), lato = Math.abs(gira);
        c.save(); c.translate(x, p.y); c.rotate(t * p.sp * .4 + p.ph);
        c.fillStyle = gira > 0 ? "rgba(255,214,100," + (p.a * fade) + ")" : "rgba(214,150,30," + (p.a * fade) + ")";
        c.beginPath(); c.ellipse(0, 0, p.w * Math.max(.15, lato), p.w * .62, 0, 0, 6.283); c.fill();
        if(lato > .85){ c.fillStyle = "rgba(255,250,220," + (p.a * fade * .8) + ")"; c.beginPath(); c.arc(-p.w * .25, -p.w * .2, p.w * .18, 0, 6.283); c.fill(); }
        c.restore();
        return true;
      }
      return false;
    }
  };
  function edge(c, bw, H, rgb, a){ var g = c.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, "rgba(" + rgb + "," + a + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)"); c.fillStyle = g; c.fillRect(0, 0, bw, H); }
  window.OFX = OFX;
  /* se gli effetti dorati erano già accesi prima che questo file arrivasse, riparte il disegno con il sole */
  try { if(typeof FX !== "undefined" && FX.k === "oro" && typeof fxSet === "function") fxSet("oro"); } catch(e){}
})();
