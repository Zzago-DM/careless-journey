/* Particelle di sfondo: piccole scintille di Aether che scendono dall'alto verso il basso.
   Prendono il colore del tema attivo (oro di base, il colore dell'elemento quando un personaggio è attivo).
   Si possono spegnere dal menu "Slayer" → "Particelle di sfondo". */
(function(){
  var KEY = "tcj_bgfx";
  var MAX = 90;              // numero massimo di particelle su schermo grande
  var AREA = 16000;          // una particella ogni tanti pixel quadrati di schermo
  var VEL = [12, 50];        // velocità di caduta (pixel al secondo): lontane, vicine

  function on(){ try { return localStorage.getItem(KEY) !== "0"; } catch(e){ return true; } }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cv = document.createElement("canvas");
  cv.id = "bgfx"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);          // in fondo alla pagina: non sposta l'ordine delle sezioni
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, P = [], rgb = "200,168,75", raf = 0, last = 0, n = 0, paused = false;

  function readColor(){
    var v = getComputedStyle(document.documentElement).getPropertyValue("--gold-rgb").trim();
    if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(v)) rgb = v.replace(/\s/g, "");
  }
  function make(anywhere){
    var z = Math.random();                   // profondità: 0 lontana e piccola, 1 vicina e grande
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -8 - Math.random() * 60,
      z: z,
      r: 0.5 + z * 1.6,
      vy: VEL[0] + z * (VEL[1] - VEL[0]),
      sw: Math.random() * 6.28, ss: 0.3 + Math.random() * 0.9, amp: 5 + Math.random() * 18,
      a: 0.18 + z * 0.5, tw: Math.random() * 6.28,
      glow: z > 0.75
    };
  }
  function size(){
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = Math.round(Math.min(MAX, Math.max(22, W * H / AREA)));
    while (P.length < want) P.push(make(true));
    P.length = want;
  }
  function hidden(){
    return document.hidden || !!document.querySelector(".cj-overlay.open");   // mappe a tutto schermo aperte
  }
  function frame(t){
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    if ((n++ % 30) === 0) paused = hidden();          // controllo ogni mezzo secondo circa
    ctx.clearRect(0, 0, W, H);
    if (paused) return;
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < P.length; i++){
      var p = P[i];
      p.y += p.vy * dt; p.sw += p.ss * dt; p.tw += dt * 1.6;
      if (p.y > H + 10) { P[i] = p = make(false); }
      var x = p.x + Math.sin(p.sw) * p.amp;
      var a = p.a * (0.65 + 0.35 * Math.sin(p.tw));
      if (p.glow){
        ctx.fillStyle = "rgba(" + rgb + "," + (a * 0.18).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = "rgba(" + rgb + "," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  function start(){
    if (raf || reduce || !on()) return;
    cv.style.display = ""; readColor(); size(); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop(){
    if (raf) cancelAnimationFrame(raf);
    raf = 0; ctx.clearRect(0, 0, W, H); cv.style.display = "none";
  }

  window.bgfxOn = on;
  window.bgfxToggle = function(){
    try { localStorage.setItem(KEY, on() ? "0" : "1"); } catch(e){}
    on() ? start() : stop();
    if (typeof slRender === "function") slRender();
  };

  var rt = 0;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ if (raf) size(); }, 150); });
  new MutationObserver(readColor).observe(document.documentElement, {attributes: true, attributeFilter: ["data-el", "data-pg", "class", "style"]});
  setInterval(function(){ if (raf) readColor(); }, 2000);

  if (on() && !reduce) start(); else cv.style.display = "none";
})();
