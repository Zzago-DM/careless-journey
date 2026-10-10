/* Mappe ingrandite: particelle d'atmosfera diverse per ogni terra (braci, neve, scintille, spore, luci, lucciole)
   e un'entrata "a fuoco" quando la mappa si apre. Le particelle girano solo mentre la mappa è aperta. */
(function(){
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TIPI = {
    ardente:   {c:["255,140,60","255,96,40","255,206,120"], n:46, moto:"sale",   v:[16,42], r:[0.9,2.4], alone:1},
    glaciale:  {c:["236,246,255","200,228,255"],            n:60, moto:"scende", v:[10,24], r:[1,2.6],   alone:0},
    folgorante:{c:["255,232,96","255,250,210"],             n:22, moto:"scintille", v:[0,0], r:[0.8,1.8], alone:1},
    terrestre: {c:["196,224,124","232,212,124"],            n:34, moto:"vaga",   v:[5,12],  r:[0.9,2.1], alone:0},
    radiante:  {c:["228,198,255","255,255,255"],            n:42, moto:"sale",   v:[5,14],  r:[0.7,1.9], alone:1},
    oscuro:    {c:["170,126,255","124,204,255"],            n:28, moto:"lucciole", v:[8,18], r:[1.1,2.3], alone:1},
    ramsgate:  {c:["232,200,112","255,236,180"],            n:30, moto:"vaga",   v:[5,12],  r:[0.8,1.8], alone:1},
    vecchia:   {c:["200,160,255","232,200,150"],            n:30, moto:"vaga",   v:[5,12],  r:[0.8,1.8], alone:1}
  };
  function rnd(a,b){return a+Math.random()*(b-a);}

  function Scena(ov, tipo){
    var stage = ov.querySelector(".stage"); if(!stage) return null;
    var cv = document.createElement("canvas"); cv.className = "fx-amb"; cv.setAttribute("aria-hidden","true");
    var svg = stage.querySelector("svg");
    if(svg && svg.nextSibling) stage.insertBefore(cv, svg.nextSibling); else stage.appendChild(cv);   /* sopra la mappa, sotto titolo e indicazioni */
    var ctx = cv.getContext("2d"), W = 0, H = 0, P = [], raf = 0, last = 0, T = TIPI[tipo];
    function nuova(ovunque){
      var p = {x:rnd(0,W), y:ovunque?rnd(0,H):(T.moto==="sale"?H+6:-6), v:rnd(T.v[0],T.v[1]), r:rnd(T.r[0],T.r[1]),
               c:T.c[(Math.random()*T.c.length)|0], f:rnd(0,6.28), fs:rnd(0.6,1.8), a:rnd(0.35,0.9), dir:rnd(0,6.28), vita:rnd(0.15,0.5), eta:0};
      if(T.moto==="scintille"){p.eta=-rnd(0,1.5);}
      return p;
    }
    function misura(){
      var q = Math.min(window.devicePixelRatio||1, 1.5); W = stage.clientWidth; H = stage.clientHeight;
      cv.width = Math.round(W*q); cv.height = Math.round(H*q); ctx.setTransform(q,0,0,q,0,0);
      var quante = Math.round(T.n * Math.max(0.45, Math.min(1.3, W*H/(1000*420))));
      while(P.length < quante) P.push(nuova(true)); P.length = quante;
    }
    function fotogramma(ora){
      raf = requestAnimationFrame(fotogramma);
      var dt = Math.min(0.05, (ora-last)/1000 || 0); last = ora;
      ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation = "lighter";
      for(var i=0;i<P.length;i++){
        var p = P[i], al = p.a; p.f += p.fs*dt;
        if(T.moto==="sale"){ p.y -= p.v*dt; p.x += Math.sin(p.f)*10*dt; al *= Math.min(1, p.y/(H*0.25)); if(p.y < -6) P[i] = p = nuova(false); }
        else if(T.moto==="scende"){ p.y += p.v*dt; p.x += Math.sin(p.f)*14*dt; if(p.y > H+6) P[i] = p = nuova(false); }
        else if(T.moto==="vaga" || T.moto==="lucciole"){
          p.dir += rnd(-1,1)*dt*1.6; p.x += Math.cos(p.dir)*p.v*dt; p.y += Math.sin(p.dir)*p.v*dt;
          if(p.x<-8) p.x=W+8; if(p.x>W+8) p.x=-8; if(p.y<-8) p.y=H+8; if(p.y>H+8) p.y=-8;
          if(T.moto==="lucciole") al *= 0.25 + 0.75*Math.pow(0.5+0.5*Math.sin(p.f*1.7), 2);
          else al *= 0.6 + 0.4*Math.sin(p.f);
        }
        else if(T.moto==="scintille"){
          p.eta += dt; if(p.eta < 0) continue; if(p.eta > p.vita){ P[i] = nuova(true); continue; }
          al *= (Math.random() < 0.7 ? 1 : 0.3) * (1 - p.eta/p.vita);
          if(p.r > 1.4){ /* piccolo arco elettrico */
            ctx.strokeStyle = "rgba("+p.c+","+(al*0.8).toFixed(3)+")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y);
            for(var k=1;k<=3;k++) ctx.lineTo(p.x + Math.cos(p.dir)*6*k + rnd(-3,3), p.y + Math.sin(p.dir)*6*k + rnd(-3,3)); ctx.stroke();
          }
        }
        if(al <= 0.01) continue;
        if(T.alone){ ctx.fillStyle = "rgba("+p.c+","+(al*0.18).toFixed(3)+")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r*4, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = "rgba("+p.c+","+al.toFixed(3)+")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    return {
      avvia: function(){ if(raf || reduce) return; misura(); last = performance.now(); raf = requestAnimationFrame(fotogramma); },
      ferma: function(){ if(raf) cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0,0,W,H); },
      misura: function(){ if(raf) misura(); }
    };
  }

  var scene = [];
  Object.keys(TIPI).forEach(function(k){
    var ov = document.getElementById("cj-"+k); if(!ov) return;
    var s = Scena(ov, k); if(!s) return; scene.push(s);
    new MutationObserver(function(){
      if(ov.classList.contains("open")){
        if(!ov._fx){ ov._fx = 1; ov.classList.remove("fx-in"); void ov.offsetWidth; ov.classList.add("fx-in"); setTimeout(function(){ ov.classList.remove("fx-in"); }, 1800); }
        setTimeout(s.avvia, 60);
      } else { ov._fx = 0; s.ferma(); }
    }).observe(ov, {attributes:true, attributeFilter:["class"]});
  });
  var rt = 0;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ scene.forEach(function(s){ s.misura(); }); }, 150); });
})();
