/* Tema «Oro del Master» — scelta esclusiva del Master (menu ⚔ Slayer › Zona Master › Colore del sito / Effetti laterali).

   Il protagonista è il Golden Sun, il simbolo accanto a «The Careless Journey» (#gsun in sezioni/simboli-svg.js).
   - Colore del sito «☀ Oro del Master»: html[data-el=oro]. Sfondo, menu, Zona Master, libreria e strumenti diventano
     oro intenso (css/30-tema-oro.css a mano, css/29-tema-oro-auto.css generato da strumenti/tema-oro.js).
     Nella Zona Master il Golden Sun prende il posto dell'anello runico dietro il titolo: respira, e una scia di luce
     ne ripercorre i contorni.
   - Effetti laterali «☀ Oro del Master», il «Sigillo Aureo»: ai due bordi dello schermo il Golden Sun d'oro, con aloni
     che girano attorno alla spirale, fasci di luce, onde che partono dalla spirale, un riflesso che lo attraversa,
     una scia luminosa che corre lungo i contorni, scintille che si staccano dalle punte, pulviscolo d'oro e scaglie
     di foglia d'oro. Il motore degli effetti laterali è in js/area-giocatori.js (FX): qui ci sono solo i pezzi (OFX). */
(function(){
  "use strict";
  var VB_W = 1739, VB_H = 3364, SPIRALE = [.47, .40];   /* centro della spirale, in frazioni del simbolo */

  /* ---------- il Golden Sun in SVG ---------- */
  if(!document.getElementById("so-oro-defs")){
    document.body.insertAdjacentHTML("afterbegin", '<svg id="so-oro-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>'
      + '<linearGradient id="soOroGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".3" stop-color="#ffd25e"/><stop offset=".65" stop-color="#e5a21c"/><stop offset="1" stop-color="#a86a08"/></linearGradient></defs></svg>');
  }
  function sigillo(cls){
    var d = document.createElement("span");
    d.className = cls; d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<span class="so-alone"></span><span class="so-anelli"><i></i><i></i></span>'
      + '<svg class="so-pieno" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" focusable="false"><use href="#gsun"/></svg>'
      + '<svg class="so-scia" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" focusable="false"><use href="#gsun"/></svg>';
    return d;
  }
  var hdr = document.querySelector("#ms .mshdr");
  if(hdr && !hdr.querySelector(".ms-sole")) hdr.insertBefore(sigillo("ms-sole"), hdr.firstChild);
  var cresta = document.querySelector("#ms .lb-cresta");
  if(cresta && !cresta.querySelector(".lb-sole")) cresta.insertBefore(sigillo("lb-sole"), cresta.querySelector(".lb-cresta-t"));

  /* ---------- il simbolo per il canvas: forme, lunghezze e punti dei contorni ---------- */
  var SIG = null;
  function prendiSigillo(){
    if(SIG) return SIG;
    var ps = [].slice.call(document.querySelectorAll("#gsun path"));
    if(!ps.length || typeof Path2D === "undefined") return null;
    var forme = [], lun = [], punti = [], tot = 0;
    ps.forEach(function(p){ var d = p.getAttribute("d"); forme.push(new Path2D(d)); var L = 0; try { L = p.getTotalLength(); } catch(e){} lun.push(L); tot += L; });
    /* punti lungo i contorni, nello spazio del simbolo (0…1739, 0…3364): da lì partono le scintille */
    ps.forEach(function(p, i){
      var n = Math.max(3, Math.round(140 * lun[i] / (tot || 1)));
      for(var k = 0; k < n; k++){ try { var q = p.getPointAtLength(lun[i] * k / n); punti.push([q.x * .1, VB_H - q.y * .1]); } catch(e){} }
    });
    SIG = { forme: forme, lun: lun, punti: punti };
    return SIG;
  }
  /* dove sta il simbolo nella striscia: largo quasi quanto la striscia, a metà altezza */
  function posto(bw, H, mob){
    var w = mob ? bw * .95 : Math.min(bw * .86, 170), h = w * VB_H / VB_W;
    if(h > H * .62){ h = H * .62; w = h * VB_W / VB_H; }
    return { x: (mob ? bw * .5 : bw * .47) - w / 2, y: H * .5 - h / 2, w: w, h: h, s: w / VB_W };
  }
  function nelSimbolo(c, P, specchio){
    c.translate(P.x, P.y);
    if(specchio){ c.translate(P.w, 0); c.scale(-1, 1); }   /* sul lato destro il canvas è specchiato: il simbolo no */
    c.scale(P.s, P.s);
    c.translate(0, VB_H); c.scale(.1, -.1);
  }

  /* ---------- effetto laterale «Sigillo Aureo» (chiamato dal motore FX di js/area-giocatori.js) ---------- */
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function edge(c, bw, H, rgb, a){ var g = c.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, "rgba(" + rgb + "," + a + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)"); c.fillStyle = g; c.fillRect(0, 0, bw, H); }
  var OFX = {
    deco: function(c, bw, H, mob){
      edge(c, bw, H, "120,78,6", mob ? .5 : .38);
      edge(c, bw, H, "255,200,70", mob ? .18 : .1);
      if(mob) return;
      /* filigrana: due fili d'oro verticali con piccoli rombi, come quelli del simbolo */
      c.strokeStyle = "rgba(255,206,100,.2)"; c.lineWidth = 1;
      [.08, .13].forEach(function(f){ c.beginPath(); c.moveTo(bw * f, 0); c.lineTo(bw * f, H); c.stroke(); });
      for(var y = 30; y < H; y += 64){ if(Math.abs(y - H / 2) < H * .34) continue; c.fillStyle = "rgba(255,214,120,.32)"; c.beginPath(); c.moveTo(bw * .105, y - 6); c.lineTo(bw * .105 + 3.5, y); c.lineTo(bw * .105, y + 6); c.lineTo(bw * .105 - 3.5, y); c.closePath(); c.fill(); }
    },
    parts: function(bw, H, mob){
      var a = [], i;
      for(i = 0; i < (mob ? 8 : 28); i++) a.push({ t: "omote", x0: Math.pow(Math.random(), 1.3) * bw * .9, y: Math.random() * H, r: rnd(.6, mob ? 1.5 : 2.2), vy: -rnd(8, 22), amp: rnd(2, mob ? 3 : 9), ph: rnd(0, 6.28), fl: rnd(2, 6), a: rnd(.45, 1), stella: Math.random() < .22 });
      for(i = 0; i < (mob ? 2 : 8); i++) a.push({ t: "ofoglia", x0: rnd(bw * .1, bw * .8), y: Math.random() * H, w: rnd(mob ? 2 : 3, mob ? 3.5 : 6), vy: rnd(10, 22), amp: rnd(4, mob ? 3 : 12), ph: rnd(0, 6.28), sp: rnd(1.5, 3.5), a: rnd(.55, .95) });
      return a;
    },
    pre: function(c, S, t, bw, H, mob){
      var resp = .5 + .5 * Math.sin(t * 1.1);
      var g = c.createLinearGradient(0, 0, bw, 0);
      g.addColorStop(0, "rgba(255,190,50," + (.12 + .1 * resp) + ")"); g.addColorStop(1, "rgba(255,190,50,0)");
      c.fillStyle = g; c.fillRect(0, 0, bw, H);
      var P = posto(bw, H, mob), cx = P.x + P.w * (S.mir ? 1 - SPIRALE[0] : SPIRALE[0]), cy = P.y + P.h * SPIRALE[1];
      /* fasci di luce che partono dalla spirale */
      c.save(); c.translate(cx, cy); c.globalCompositeOperation = "lighter";
      var nf = mob ? 3 : 8;
      for(var k = 0; k < nf; k++){
        var an = k / nf * 6.283 + t * .06, L = Math.max(H * .5, 360), w = .05 + .025 * Math.sin(t * .7 + k);
        var gr = c.createRadialGradient(0, 0, 0, 0, 0, L);
        gr.addColorStop(0, "rgba(255,214,110," + (mob ? .14 : .1) * (.55 + .45 * Math.sin(t * .9 + k * 2.1)) + ")"); gr.addColorStop(1, "rgba(255,214,110,0)");
        c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, L, an - w, an + w); c.closePath(); c.fill();
      }
      c.restore();
      /* alone che respira dietro il simbolo */
      var R = P.w * (.9 + .15 * resp);
      var co = c.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      co.addColorStop(0, "rgba(255,226,140," + (.38 + .14 * resp) + ")"); co.addColorStop(.4, "rgba(255,180,40," + (.16 + .07 * resp) + ")"); co.addColorStop(1, "rgba(255,160,20,0)");
      c.fillStyle = co; c.beginPath(); c.arc(cx, cy, R * 1.6, 0, 6.283); c.fill();
      var SG = prendiSigillo();
      if(!mob){
        /* due aloni tratteggiati che girano in senso opposto attorno alla spirale */
        c.save(); c.translate(cx, cy); c.shadowColor = "rgba(255,190,50,.8)"; c.shadowBlur = 6;
        c.strokeStyle = "rgba(255,214,110," + (.38 + .2 * resp) + ")"; c.lineWidth = 1;
        c.save(); c.rotate(t * .25); c.setLineDash([P.w * .09, P.w * .05]); c.beginPath(); c.arc(0, 0, P.w * .44, 0, 6.283); c.stroke(); c.restore();
        c.save(); c.rotate(-t * .16); c.setLineDash([2, P.w * .07]); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, P.w * .62, 0, 6.283); c.stroke(); c.restore();
        c.restore();
      }
      if(!SG) return;
      /* il simbolo: oro pieno con bagliore che respira */
      c.save(); nelSimbolo(c, P, S.mir);
      var oro = c.createLinearGradient(0, VB_H * 10, 0, 0);
      oro.addColorStop(0, "#fff2b8"); oro.addColorStop(.3, "#ffd25e"); oro.addColorStop(.65, "#e5a21c"); oro.addColorStop(1, "#a86a08");
      c.shadowColor = "rgba(255,190,50," + (.6 + .35 * resp) + ")"; c.shadowBlur = (mob ? 6 : 14) + 10 * resp;
      c.fillStyle = oro;
      SG.forme.forEach(function(f){ c.fill(f); });
      c.shadowBlur = 0;
      /* riflesso che attraversa il simbolo dall'alto in basso, ogni pochi secondi */
      var ciclo = (t % 6.5) / 6.5;
      if(ciclo < .4){
        var yy = VB_H * 10 * (1 - ciclo / .4 * 1.3 + .15), bande = c.createLinearGradient(0, yy + 2600, 0, yy - 2600);
        bande.addColorStop(0, "rgba(255,255,240,0)"); bande.addColorStop(.5, "rgba(255,255,240,.75)"); bande.addColorStop(1, "rgba(255,255,240,0)");
        c.fillStyle = bande; SG.forme.forEach(function(f){ c.fill(f); });
      }
      /* bordo inciso e scia di luce che corre lungo i contorni */
      if(!mob){
        var px = 1 / (P.s * .1);
        c.strokeStyle = "rgba(120,74,4,.55)"; c.lineWidth = px; c.setLineDash([]);
        SG.forme.forEach(function(f){ c.stroke(f); });
        c.lineCap = "round"; c.shadowColor = "rgba(255,240,190,1)"; c.shadowBlur = 8;
        SG.forme.forEach(function(f, i){
          var L = SG.lun[i]; if(!L) return;
          var tratto = Math.min(L * .18, 9000);
          c.setLineDash([tratto, L]); c.lineDashOffset = -((t * 9000 + i * 9000) % (L + tratto));
          c.strokeStyle = "rgba(255,250,225,.95)"; c.lineWidth = px * 2.2; c.stroke(f);
        });
      }
      c.restore();
    },
    post: function(c, S, t, dt, bw, H, mob){
      var P = posto(bw, H, mob), cx = P.x + P.w * (S.mir ? 1 - SPIRALE[0] : SPIRALE[0]), cy = P.y + P.h * SPIRALE[1];
      /* onde di luce che partono dalla spirale ogni pochi secondi */
      S.onde = S.onde || []; S.prossima = S.prossima === undefined ? 1.2 : S.prossima;
      S.prossima -= dt;
      if(S.prossima <= 0){ S.onde.push({ r: P.w * .2, v: 1 }); S.prossima = rnd(3.2, 5.5); }
      S.onde = S.onde.filter(function(o){ o.r += dt * (mob ? 40 : 95); o.v -= dt * .3; return o.v > 0; });
      S.onde.forEach(function(o){ c.strokeStyle = "rgba(255,214,110," + (o.v * .5) + ")"; c.lineWidth = mob ? 1 : 1.8 * o.v + .4; c.beginPath(); c.arc(cx, cy, o.r, 0, 6.283); c.stroke(); });
      /* scintille che si staccano dai contorni del simbolo */
      var SG = prendiSigillo();
      if(SG && SG.punti.length && !mob){
        S.sc = S.sc || [];
        if(Math.random() < dt * 9){
          var q = SG.punti[Math.floor(Math.random() * SG.punti.length)];
          var x = P.x + (S.mir ? P.w - q[0] * P.s : q[0] * P.s), y = P.y + q[1] * P.s, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
          S.sc.push({ x: x, y: y, vx: dx / d * rnd(8, 22), vy: dy / d * rnd(8, 22) - 6, v: 1, r: rnd(.7, 1.6) });
        }
        S.sc = S.sc.filter(function(s){ s.x += s.vx * dt; s.y += s.vy * dt; s.v -= dt * .9; return s.v > 0; });
        S.sc.forEach(function(s){
          c.fillStyle = "rgba(255,226,140," + (s.v * .35) + ")"; c.beginPath(); c.arc(s.x, s.y, s.r * 3.5, 0, 6.283); c.fill();
          c.fillStyle = "rgba(255,250,225," + s.v + ")"; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.283); c.fill();
        });
      }
      /* sfuma tutto verso il centro dello schermo: niente bordo netto dove finisce la striscia */
      c.save(); c.globalCompositeOperation = "destination-in";
      var m = c.createLinearGradient(0, 0, bw, 0); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(mob ? .8 : .78, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)");
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
  window.OFX = OFX;
  /* se gli effetti dorati erano già accesi prima che questo file arrivasse, riparte il disegno con il simbolo */
  try { if(typeof FX !== "undefined" && FX.k === "oro" && typeof fxSet === "function") fxSet("oro"); } catch(e){}
})();
