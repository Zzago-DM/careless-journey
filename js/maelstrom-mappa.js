/* Il Maelstrom sulla mappa del mondo (prima del clic).
   Una clessidra di correnti vista di lato, come la scena che si apre al clic: due bocche larghe che ruotano,
   un collo stretto al centro con un cuore di luce, correnti risucchiate verso il centro, detriti e lampi.
   Disegnato dentro l'SVG della mappa, quindi si ridimensiona con lei.
   Si muove solo quando la mappa è sullo schermo; con "riduci movimento" resta un'immagine ferma.
   Le misure sono qui sotto, in CFG. */
(function(){
  var CFG = {
    x: 1050, y: 740,      /* centro (coordinate della mappa) */
    alto: 195,            /* distanza dal centro alle due bocche */
    bocca: 105,           /* raggio delle bocche */
    collo: 7,             /* raggio del collo al centro */
    curva: 1.75,          /* quanto si allarga la clessidra verso le bocche */
    incl: 0.25,           /* schiacciamento delle bocche (prospettiva) */
    correnti: 170,        /* quante scie di corrente dentro la clessidra */
    disco: 120,           /* quante scie girano attorno alle bocche prima di essere risucchiate */
    detriti: 9,
    giro: 0.55,           /* velocità di rotazione alle bocche (giri al secondo × 2π) */
    risucchio: 34,        /* velocità con cui le correnti scendono verso il collo */
    lampi: [3.5, 8]       /* ogni quanti secondi (da–a) cade un lampo */
  };
  var NS = "http://www.w3.org/2000/svg";
  var host = document.getElementById("pulsar-vortices"), mappa = document.getElementById("world-map");
  if(!host || !mappa) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CX = CFG.x, CY = CFG.y, H = CFG.alto, R = CFG.bocca, R0 = CFG.collo, T = CFG.incl;

  var corpo = null;   /* gruppo con la sfumatura verso le bocche: ci finisce tutto il disegno */
  function el(tag, attr, padre){ var e = document.createElementNS(NS, tag); for(var k in attr) e.setAttribute(k, attr[k]); (padre || corpo || host).appendChild(e); return e; }
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function raggio(h){ return R0 + (R - R0) * Math.pow(Math.min(1, Math.abs(h) / H), CFG.curva); }
  function f(n){ return n.toFixed(1); }

  /* ---------- sfumature ---------- */
  var defs = el("defs", {});
  defs.innerHTML =
    '<radialGradient id="mlm-nebbia" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0e3a48" stop-opacity=".55"/><stop offset=".55" stop-color="#0a2430" stop-opacity=".28"/><stop offset="1" stop-color="#060c12" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mlm-gola" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#02070b" stop-opacity=".95"/><stop offset=".6" stop-color="#05141c" stop-opacity=".75"/><stop offset=".9" stop-color="#0b3644" stop-opacity=".35"/><stop offset="1" stop-color="#5fe8e0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mlm-cuore" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset=".18" stop-color="#d8fbff" stop-opacity=".9"/><stop offset=".45" stop-color="#5fe8e0" stop-opacity=".35"/><stop offset="1" stop-color="#2a8fb0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mlm-alone" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5fe8e0" stop-opacity=".22"/><stop offset=".5" stop-color="#2a7f9a" stop-opacity=".08"/><stop offset="1" stop-color="#2a7f9a" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="mlm-fianco" gradientUnits="userSpaceOnUse" x1="0" y1="' + (CY - H) + '" x2="0" y2="' + (CY + H) + '"><stop offset="0" stop-color="#5fe8e0" stop-opacity=".55"/><stop offset=".5" stop-color="#d8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#5fe8e0" stop-opacity=".55"/></linearGradient>';

  /* trasparenza lieve verso le due bocche: pieno al centro, circa 60% alle bocche, meno ancora oltre */
  var sf = document.createElementNS(NS, "linearGradient");
  [["id","mlm-sfuma-g"],["gradientUnits","userSpaceOnUse"],["x1",0],["x2",0],["y1",CY - H - 40],["y2",CY + H + 40]].forEach(function(a){ sf.setAttribute(a[0], a[1]); });
  [[0,.45],[.085,.6],[.3,.86],[.5,1],[.7,.86],[.915,.6],[1,.45]].forEach(function(st){ var e = document.createElementNS(NS, "stop"); e.setAttribute("offset", st[0]); e.setAttribute("stop-color", "#fff"); e.setAttribute("stop-opacity", st[1]); sf.appendChild(e); });
  defs.appendChild(sf);
  var mk = el("mask", { id: "mlm-sfuma", maskUnits: "userSpaceOnUse", x: CX - R * 2.2, y: CY - H * 1.6, width: R * 4.4, height: H * 3.2 }, defs);
  el("rect", { x: CX - R * 2.2, y: CY - H * 1.6, width: R * 4.4, height: H * 3.2, fill: "url(#mlm-sfuma-g)" }, mk);
  corpo = el("g", { mask: "url(#mlm-sfuma)" }, host);

  /* ---------- livelli, dal fondo al davanti ---------- */
  el("ellipse", { cx: CX, cy: CY, rx: R * 1.75, ry: H * 1.25, fill: "url(#mlm-nebbia)" });               /* foschia scura attorno */
  var alone = el("ellipse", { cx: CX, cy: CY, rx: R * 1.1, ry: H * 0.75, fill: "url(#mlm-alone)" });
  /* bocche: il fondo scuro (si guarda "dentro" il vortice) */
  [-1, 1].forEach(function(s){ el("ellipse", { cx: CX, cy: CY + s * H, rx: R, ry: R * T, fill: "url(#mlm-gola)" }); });
  /* fianchi della clessidra */
  var fianchi = "";
  [-1, 1].forEach(function(lato){
    var d = "";
    for(var i = 0; i <= 40; i++){ var h = -H + 2 * H * i / 40; d += (i ? " L " : "M ") + f(CX + lato * raggio(h)) + " " + f(CY + h); }
    fianchi += d + " ";
  });
  el("path", { d: fianchi, fill: "none", stroke: "url(#mlm-fianco)", "stroke-width": 7, opacity: .12, "stroke-linecap": "round" });
  el("path", { d: fianchi, fill: "none", stroke: "url(#mlm-fianco)", "stroke-width": 1.4, opacity: .5 });
  /* metà posteriore degli anelli delle bocche */
  function arco(cy, rx, ry, davanti){ /* mezza ellisse: davanti = metà in basso */
    return "M " + f(CX - rx) + " " + f(cy) + " A " + f(rx) + " " + f(ry) + " 0 0 " + (davanti ? 0 : 1) + " " + f(CX + rx) + " " + f(cy);
  }
  var anelli = [];
  function anello(cy, rx, larg, col, op, dash, davanti){
    var p = el("path", { d: arco(cy, rx, rx * T, davanti), fill: "none", stroke: col, "stroke-width": larg, opacity: op, "stroke-linecap": "round" });
    if(dash){ p.setAttribute("stroke-dasharray", dash); anelli.push(p); }
    return p;
  }
  function anelliBocche(davanti){
    [-1, 1].forEach(function(s){
      var cy = CY + s * H;
      anello(cy, R * 1.04, 6, "#5fe8e0", davanti ? .16 : .08, null, davanti);
      anello(cy, R, 1.8, "#bff6ff", davanti ? .85 : .35, null, davanti);
      anello(cy, R * 1.16, 1.3, "#5fe8e0", davanti ? .5 : .22, "14 18", davanti);
      anello(cy, R * 1.3, 1, "#2a8fb0", davanti ? .45 : .2, "5 22", davanti);
    });
  }
  anelliBocche(false);
  /* correnti dietro il collo */
  var dietro = [el("path", { fill: "none", stroke: "#2f8fb0", "stroke-width": 1.4, "stroke-linecap": "round", opacity: .45 }),
                el("path", { fill: "none", stroke: "#5fd0e0", "stroke-width": 1.6, "stroke-linecap": "round", opacity: .55 })];
  var disco = el("path", { fill: "none", stroke: "#3fa8c4", "stroke-width": 1.2, "stroke-linecap": "round", opacity: .5 });
  /* cuore di luce al collo */
  var cuoreAlone = el("ellipse", { cx: CX, cy: CY, rx: 58, ry: 88, fill: "url(#mlm-cuore)", opacity: .55 });
  var cuore = el("circle", { cx: CX, cy: CY, r: 15, fill: "url(#mlm-cuore)" });
  el("circle", { cx: CX, cy: CY, r: 4.2, fill: "#03090d" });
  var cuoreAnello = el("ellipse", { cx: CX, cy: CY, rx: 11, ry: 11 * T * 1.6, fill: "none", stroke: "#e8fdff", "stroke-width": 1.2, opacity: .8 });
  /* correnti davanti */
  var davanti = [el("path", { fill: "none", stroke: "#5fe8e0", "stroke-width": 5, "stroke-linecap": "round", opacity: .1 }),
                 el("path", { fill: "none", stroke: "#7fe6f0", "stroke-width": 1.7, "stroke-linecap": "round", opacity: .75 }),
                 el("path", { fill: "none", stroke: "#e6fcff", "stroke-width": 2, "stroke-linecap": "round", opacity: .95 }),
                 el("path", { fill: "none", stroke: "#a8f0c8", "stroke-width": 1.5, "stroke-linecap": "round", opacity: .6 })];
  /* detriti */
  var gDet = el("g", {}), DET = [];
  for(var i = 0; i < CFG.detriti; i++){
    var n = 5 + (Math.random() * 3 | 0), pts = [];
    for(var k = 0; k < n; k++){ var a = k / n * 6.283 + rnd(-.3, .3), rr = rnd(.6, 1); pts.push(f(Math.cos(a) * rr) + "," + f(Math.sin(a) * rr)); }
    var roccia = el("polygon", { points: pts.join(" "), fill: "#1c262c", stroke: "#6fb4c4", "stroke-width": .3 }, gDet);
    DET.push({ e: roccia, th: rnd(0, 6.283), h: rnd(-H, H), g: rnd(5, 9), rot: rnd(0, 360), vr: rnd(-90, 90) });
  }
  /* anelli anteriori delle bocche, sopra le correnti */
  anelliBocche(true);
  /* lampo */
  var lampo = el("path", { fill: "none", stroke: "#e6f8ff", "stroke-width": 2.2, "stroke-linejoin": "bevel", opacity: 0 });
  var lampoAlone = el("path", { fill: "none", stroke: "#7fe6f0", "stroke-width": 8, opacity: 0 });
  /* area cliccabile (invisibile) che copre tutta la clessidra */
  el("ellipse", { cx: CX, cy: CY, rx: R * 1.3, ry: H + R * T * 1.4, fill: "#000", opacity: 0, "pointer-events": "all" }, host);

  /* ---------- correnti ---------- */
  var P = [];
  function nuova(ovunque){
    var s = Math.random() < .5 ? -1 : 1;
    return { th: rnd(0, 6.283), h: s * (ovunque ? rnd(R0 * 2, H) : H * rnd(.92, 1.05)), v: rnd(.6, 1.4), lun: rnd(.25, .6), tipo: Math.random() < .12 ? 3 : (Math.random() < .3 ? 2 : 1) };
  }
  for(var j = 0; j < CFG.correnti; j++) P.push(nuova(true));
  function punto(th, h){ var r = raggio(h); return [CX + r * Math.cos(th), CY + h + r * T * Math.sin(th)]; }
  var D = [];
  function nuovaD(ovunque){ return { s: Math.random() < .5 ? -1 : 1, th: rnd(0, 6.283), rho: R * (ovunque ? rnd(1.02, 1.95) : rnd(1.6, 1.95)), v: rnd(.6, 1.3), lun: rnd(.15, .35) }; }
  for(var jd = 0; jd < CFG.disco; jd++) D.push(nuovaD(true));
  function puntoD(s, th, rho){ return [CX + rho * Math.cos(th), CY + s * H + rho * T * Math.sin(th)]; }
  function omega(h){ return CFG.giro * Math.min(5, Math.pow(R / raggio(h), .75)); }

  var vel = 1, velMeta = 1, ultimo = 0, prossimoLampo = 2, lampoT = -1, t = 0;
  function passo(dt){
    t += dt; vel += (velMeta - vel) * Math.min(1, dt * 3);
    var dz = ["", ""], dv = ["", "", "", ""];
    for(var i = 0; i < P.length; i++){
      var p = P[i], s = p.h < 0 ? -1 : 1, w = omega(p.h);
      p.th += w * dt * vel * p.v;
      var vicino = 1 - Math.abs(p.h) / H;
      p.h -= s * CFG.risucchio * dt * vel * p.v * (0.6 + 2.2 * vicino * vicino);
      if(Math.abs(p.h) < R0 * 1.2){ P[i] = nuova(false); continue; }
      var a = punto(p.th, p.h), m = punto(p.th - p.lun * .5, p.h + s * 4), b = punto(p.th - p.lun, p.h + s * 8);
      var seg = "M" + f(a[0]) + " " + f(a[1]) + "Q" + f(m[0]) + " " + f(m[1]) + " " + f(b[0]) + " " + f(b[1]);
      var front = Math.sin(p.th - p.lun * .3) > 0;
      if(!front) dz[vicino > .55 ? 1 : 0] += seg;
      else if(p.tipo === 3) dv[3] += seg;
      else { dv[0] += seg; dv[p.tipo === 2 || vicino > .6 ? 2 : 1] += seg; }
    }
    var dd = "";
    for(var e = 0; e < D.length; e++){
      var c = D[e], w2 = CFG.giro * 1.15 * Math.pow(R / c.rho, 1.5);
      c.th += w2 * dt * vel * c.v; c.rho -= 10 * dt * vel * c.v;
      if(c.rho < R){ var pn = nuova(false); pn.h = c.s * H; pn.th = c.th; P.push(pn); if(P.length > CFG.correnti * 1.4) P.shift(); D[e] = nuovaD(false); continue; }
      var a2 = puntoD(c.s, c.th, c.rho), m2 = puntoD(c.s, c.th - c.lun * .5, c.rho + 2), b2 = puntoD(c.s, c.th - c.lun, c.rho + 4);
      var sg = "M" + f(a2[0]) + " " + f(a2[1]) + "Q" + f(m2[0]) + " " + f(m2[1]) + " " + f(b2[0]) + " " + f(b2[1]);
      if(Math.sin(c.th) > 0 && c.rho < R * 1.4) dv[1] += sg; else dd += sg;
    }
    disco.setAttribute("d", dd);
    dietro[0].setAttribute("d", dz[0]); dietro[1].setAttribute("d", dz[1]);
    for(var q = 0; q < 4; q++) davanti[q].setAttribute("d", dv[q]);
    /* detriti: girano lenti e scendono a spirale */
    for(var k = 0; k < DET.length; k++){
      var d = DET[k], sd = d.h < 0 ? -1 : 1;
      d.th += omega(d.h) * dt * vel * .45; d.h -= sd * CFG.risucchio * .35 * dt * vel; d.rot += d.vr * dt;
      if(Math.abs(d.h) < R0 * 2){ d.h = (Math.random() < .5 ? -1 : 1) * H; d.th = rnd(0, 6.283); }
      var pp = punto(d.th, d.h), fr = Math.sin(d.th) > 0, sc = d.g * (fr ? 1 : .75) * (.45 + .55 * Math.abs(d.h) / H);
      d.e.setAttribute("transform", "translate(" + f(pp[0]) + " " + f(pp[1]) + ") rotate(" + f(d.rot) + ") scale(" + sc.toFixed(2) + ")");
      d.e.setAttribute("opacity", fr ? .95 : .45);
    }
    /* anelli tratteggiati che ruotano */
    for(var r = 0; r < anelli.length; r++) anelli[r].setAttribute("stroke-dashoffset", f(-t * (r % 2 ? 14 : 26) * vel));
    /* cuore che pulsa */
    var pul = .5 + .5 * Math.pow(.5 + .5 * Math.sin(t * 2.6), 3);
    cuore.setAttribute("r", f(13 + 5 * pul)); cuoreAlone.setAttribute("opacity", (.4 + .35 * pul).toFixed(2));
    cuoreAnello.setAttribute("rx", f(10 + 4 * pul)); alone.setAttribute("opacity", (.7 + .3 * pul).toFixed(2));
    /* lampi */
    if(t > prossimoLampo){ fulmine(); prossimoLampo = t + rnd(CFG.lampi[0], CFG.lampi[1]); }
    if(lampoT >= 0){
      lampoT += dt; var al = lampoT < .08 ? 1 : (lampoT < .16 ? .25 : (lampoT < .26 ? .85 : Math.max(0, .85 - (lampoT - .26) * 3)));
      lampo.setAttribute("opacity", al.toFixed(2)); lampoAlone.setAttribute("opacity", (al * .35).toFixed(2));
      if(al <= 0) lampoT = -1;
    }
  }
  function fulmine(){
    var s = Math.random() < .5 ? -1 : 1, th = rnd(.3, 2.8), h0 = s * H * rnd(.9, 1.05), h1 = s * H * rnd(.25, .5);
    var a = punto(th, h0), b = punto(th + rnd(-.5, .5), h1), d = "M" + f(a[0]) + " " + f(a[1]), n = 7;
    for(var i = 1; i <= n; i++){
      var u = i / n, x = a[0] + (b[0] - a[0]) * u + (i < n ? rnd(-9, 9) : 0), y = a[1] + (b[1] - a[1]) * u + (i < n ? rnd(-4, 4) : 0);
      d += " L" + f(x) + " " + f(y);
    }
    lampo.setAttribute("d", d); lampoAlone.setAttribute("d", d); lampoT = 0;
    try{ if(window.__mlmTuono) window.__mlmTuono(); }catch(_){}
  }

  /* ---------- quando muoversi ---------- */
  var raf = 0, visibile = true;
  function giro(ora){
    raf = requestAnimationFrame(giro);
    var dt = Math.min(.05, (ora - ultimo) / 1000 || 0); ultimo = ora;
    passo(dt);
  }
  function aggiorna(){
    var deve = !reduce && visibile && !document.hidden && !document.querySelector(".cj-overlay.open");
    if(deve && !raf){ ultimo = performance.now(); raf = requestAnimationFrame(giro); }
    else if(!deve && raf){ cancelAnimationFrame(raf); raf = 0; }
  }
  passo(0.016); for(var w = 0; w < 30; w++) passo(0.05);   /* prima immagine già "a regime" */
  lampo.setAttribute("opacity", 0); lampoAlone.setAttribute("opacity", 0); lampoT = -1;
  if("IntersectionObserver" in window) new IntersectionObserver(function(v){ visibile = v[0].isIntersecting; aggiorna(); }, { rootMargin: "100px" }).observe(mappa);
  document.addEventListener("visibilitychange", aggiorna);
  setInterval(aggiorna, 1000);   /* si ferma anche quando una mappa ingrandita copre la pagina */
  /* passandoci sopra il vortice accelera */
  var g = document.getElementById("maelstrom") || host;
  g.addEventListener("pointerenter", function(){ velMeta = 2.4; });
  g.addEventListener("pointerleave", function(){ velMeta = 1; });
  aggiorna();
})();
