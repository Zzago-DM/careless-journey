/* Zona Master — i capitoli sono volumi su una libreria a scaffali.
   Ogni capitolo è un libro con il titolo sul dorso: passando sopra il libro esce un poco dallo scaffale e la targa
   sotto la libreria mostra titolo e sottotitolo; toccandolo il libro viene estratto, si gira, si apre e compare
   solo quel capitolo. «◂ Torna alla libreria» rimette tutto a posto.
   Colori: cuoio cremisi con fregi d'oro; con il tema «Oro del Master» (html[data-el=oro]) cuoio scuro e foglia d'oro.
   Qui c'è anche la finestra delle Schede dei Mael: le pagine stanno nel repository privato tcj-master
   (cartella mael/) e si scaricano con il token del Master, come il resto della Zona. */
(function(){
  var ms = document.getElementById("ms");
  if(!ms) return;
  var secs = [].slice.call(ms.querySelectorAll(".msec"));
  if(!secs.length) return;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function suono(n){ try{ sfxPlay(n); }catch(_){} }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var ROMANI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV"];
  var FREGI = ["◆","✦","❖","✧","◈","❂","✠","⚜"];

  /* ---------- la libreria ---------- */
  ms.classList.add("lb-on");
  var box = document.createElement("div");
  box.className = "lb-box";
  box.innerHTML = '<div class="lb-cresta" aria-hidden="true"><span class="lb-cresta-l"></span><span class="lb-cresta-t">Biblioteca del Master</span><span class="lb-cresta-l"></span></div>'
    + '<div class="lb-mobile" role="list" aria-label="Capitoli della Zona Master"></div>'
    + '<div class="lb-targa" aria-hidden="true"><small></small><b>Scegli un volume</b></div>';
  var mobile = box.querySelector(".lb-mobile"), targa = box.querySelector(".lb-targa");
  var nav = ms.querySelector(".msnav"), hdr = ms.querySelector(".mshdr");
  var dopo = nav || hdr;
  if(dopo) dopo.insertAdjacentElement("afterend", box); else ms.insertBefore(box, secs[0]);

  /* altezze e colori «a caso» ma sempre uguali per lo stesso capitolo */
  function seme(t){ var h = 7; for(var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 100003; return h; }
  var libri = secs.map(function(sec, i){
    var tit = sec.querySelector(".msect"), sub = sec.querySelector(".msecsub");
    var t = (tit ? tit.textContent : "Capitolo").trim();
    var parti = t.split(/\s+[—–]\s+/), principale = parti[0], secondo = parti.slice(1).join(" — ");
    var sottotitolo = sub ? sub.textContent.trim() : "";
    var r = seme(t);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lb-libro c" + (r % 6) + (r % 5 === 0 ? " lb-stretto" : "");
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", "Apri il capitolo: " + t);
    b.style.setProperty("--i", i);
    b._alt = (r % 1000) / 1000;                     /* 0…1: quanto è alto il volume */
    b._righe = 1;
    b.innerHTML = '<span class="lb-dorso" aria-hidden="true">'
      + '<span class="lb-fascia su"></span><span class="lb-num">' + (ROMANI[i] || (i + 1)) + '</span><span class="lb-fregio">' + FREGI[r % FREGI.length] + '</span>'
      + '<span class="lb-tit"><b>' + esc(principale) + '</b>' + (secondo ? '<small>' + esc(secondo) + '</small>' : '') + '</span>'
      + '<span class="lb-fascia giu"></span></span><span class="lb-luce" aria-hidden="true"></span>';
    b._t = t; b._sub = sottotitolo; b._princ = principale; b._sec = secondo; b._fregio = FREGI[r % FREGI.length];
    b.addEventListener("click", function(){ apri(sec, b); });
    b.addEventListener("pointerenter", function(){ mostraTarga(b); });
    b.addEventListener("focus", function(){ mostraTarga(b); });
    return b;
  });
  function mostraTarga(b){
    targa.querySelector("small").textContent = b ? b._sub : "";
    targa.querySelector("b").textContent = b ? b._t : "Scegli un volume";
    targa.classList.toggle("on", !!b);
  }
  mobile.addEventListener("pointerleave", function(){ mostraTarga(null); });

  /* misura dei volumi e divisione negli scaffali, in base alla larghezza */
  var ultimaL = 0;
  function disponi(){
    var L = mobile.clientWidth; if(!L || Math.abs(L - ultimaL) < 2) return;
    ultimaL = L;
    var tel = L < 560, H0 = tel ? 158 : 212, H1 = tel ? 196 : 262, fs = tel ? 10.5 : 13.5;
    mobile.style.setProperty("--fs", fs + "px");
    libri.forEach(function(b){
      var h = Math.round(H0 + b._alt * (H1 - H0)), spazio = h - (tel ? 64 : 76);
      var perRiga = Math.max(6, Math.floor(spazio / (fs * 0.74)));
      var righe = Math.ceil(b._princ.length / perRiga) + (b._sec ? Math.ceil(b._sec.length / (perRiga * 1.25)) : 0);
      righe = Math.min(4, Math.max(1, righe));
      var w = Math.round((tel ? 15 : 21) * righe + (tel ? 18 : 30) + (b.classList.contains("lb-stretto") ? 0 : (tel ? 4 : 8)));
      b.style.setProperty("--h", h + "px"); b.style.setProperty("--w", w + "px");
      b._w = w;
    });
    mobile.innerHTML = "";
    var gap = tel ? 3 : 4, margine = tel ? 14 : 30, fila = [], usata = 0;
    function chiudiFila(ultima){
      if(!fila.length) return;
      var sc = document.createElement("div"); sc.className = "lb-ripiano";
      var libriBox = document.createElement("div"); libriBox.className = "lb-libri";
      fila.forEach(function(b){ libriBox.appendChild(b); });
      sc.appendChild(libriBox);
      var resto = L - margine - usata, nr = mobile.children.length;
      function oggetto(tipo, lato){
        var o = document.createElement("span"); o.setAttribute("aria-hidden", "true");
        o.className = tipo + " " + lato;
        o.innerHTML = tipo === "lb-pila" ? "<i></i><i></i><i></i>" : "<i></i><b></b>";
        if(lato === "sx") sc.insertBefore(o, libriBox); else sc.appendChild(o);
      }
      /* spazio libero ai lati: candela e pila di libri coricati, alternate tra i ripiani */
      if(resto > (tel ? 70 : 120)) oggetto(nr % 2 ? "lb-candela" : "lb-pila", "dx");
      if(resto > (tel ? 150 : 260)) oggetto(nr % 2 ? "lb-pila" : "lb-candela", "sx");
      if(resto > (tel ? 120 : 200) && fila.length > 1) fila[fila.length - 1].classList.add("lb-inclinato");
      sc.insertAdjacentHTML("beforeend", '<span class="lb-asse" aria-hidden="true"></span>');
      mobile.appendChild(sc);
      fila = []; usata = 0;
    }
    /* scaffali bilanciati: al massimo 8 volumi per ripiano sul computer, larghezze simili tra un ripiano e l'altro */
    var tot = 0; libri.forEach(function(b){ tot += b._w + gap; });
    var nRip = Math.max(Math.ceil(tot / (L - margine)), tel ? 1 : Math.ceil(libri.length / 8));
    var obiettivo = tot / nRip;
    libri.forEach(function(b){
      b.classList.remove("lb-inclinato");
      if(fila.length && (usata + b._w + gap > L - margine || (usata + b._w / 2 > obiettivo && mobile.children.length < nRip - 1))) chiudiFila();
      fila.push(b); usata += b._w + gap;
    });
    chiudiFila(true);
  }
  disponi();
  window.addEventListener("resize", function(){ clearTimeout(disponi._t); disponi._t = setTimeout(disponi, 120); });
  /* la Zona Master può comparire dopo (prima è nascosta): misura quando diventa visibile */
  if("ResizeObserver" in window) new ResizeObserver(function(){ disponi(); }).observe(mobile);

  /* barra «Torna alla libreria», spostata dentro il capitolo aperto */
  var torna = document.createElement("div");
  torna.className = "mb-torna";
  torna.innerHTML = '<button type="button" class="mb-torna-b">◂ Torna alla libreria</button>';
  torna.querySelector("button").addEventListener("click", function(){ chiudi(true); });

  var aperta = null, inVolo = false;
  function mostra(sec){
    box.hidden = true;
    secs.forEach(function(s){ s.classList.toggle("lb-vis", s === sec); });
    sec.insertBefore(torna, sec.firstChild);
    if(sec._open) sec._open(); else sec.classList.add("open");
    aperta = sec;
    setTimeout(function(){ window.dispatchEvent(new Event("resize")); }, 60);
    var y = sec.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
    var bt = torna.querySelector("button"); try{ bt.focus({ preventScroll: true }); }catch(_){}
  }
  /* il volo del libro: dal dorso alla copertina, poi la copertina si apre */
  function vola(b, fine){
    var r = b.getBoundingClientRect(), rb = mobile.getBoundingClientRect();
    var W = Math.min(210, window.innerWidth * .46), H = Math.round(W * 1.36);
    var cx = rb.left + rb.width / 2, cy = Math.min(window.innerHeight / 2, rb.top + rb.height / 2);
    var v = document.createElement("div");
    v.className = "lb-volo " + b.className.replace(/lb-libro|lb-inclinato|lb-stretto/g, "");
    v.setAttribute("aria-hidden", "true");
    v.style.width = W + "px"; v.style.height = H + "px"; v.style.left = (cx - W / 2) + "px"; v.style.top = (cy - H / 2) + "px";
    v.innerHTML = '<div class="lb-pagine"><span></span></div><div class="lb-copertina"><div class="lb-cop-fronte"><span class="lb-cop-cornice"></span><span class="lb-cop-fregio">' + b._fregio + '</span>'
      + '<span class="lb-cop-tit">' + esc(b._princ) + (b._sec ? '<small>' + esc(b._sec) + '</small>' : '') + '</span><span class="lb-cop-num">' + esc(b._sub) + '</span></div><div class="lb-cop-retro"></div></div>';
    document.body.appendChild(v);
    var dx = (r.left + r.width / 2) - cx, dy = (r.top + r.height / 2) - cy, sx = r.width / W, sy = r.height / H;
    var a1 = v.animate([
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ") rotateY(78deg)", opacity: .2 },
      { transform: "translate(" + dx * .35 + "px," + (dy * .35 - 30) + "px) scale(.8) rotateY(30deg)", opacity: 1, offset: .45 },
      { transform: "translate(0,0) scale(1) rotateY(0deg)", opacity: 1 }
    ], { duration: 560, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" });
    a1.onfinish = function(){
      var cop = v.querySelector(".lb-copertina");
      var a2 = cop.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-168deg)" }], { duration: 520, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" });
      v.classList.add("aperto");
      a2.onfinish = function(){
        v.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.25)" }], { duration: 260, easing: "ease-in", fill: "forwards" }).onfinish = function(){ v.remove(); };
        fine();
      };
    };
  }
  function apri(sec, b){
    if(inVolo) return;
    if(b && !RM && b.animate){
      inVolo = true;
      suono("paper");
      b.classList.add("estratto");
      setTimeout(function(){
        vola(b, function(){ inVolo = false; b.classList.remove("estratto"); mostra(sec); });
      }, 200);
    } else mostra(sec);
  }
  function chiudi(scorri){
    if(aperta) aperta.classList.remove("lb-vis");
    var era = aperta; aperta = null;
    box.hidden = false;
    suono("swish");
    ultimaL = 0; disponi();
    if(scorri){
      var y = box.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
    }
    if(era){ var i = secs.indexOf(era); if(libri[i]){ try{ libri[i].focus({ preventScroll: true }); }catch(_){} libri[i].classList.add("rimesso"); setTimeout(function(){ libri[i].classList.remove("rimesso"); }, 700); } }
  }

  /* i collegamenti interni (#m-…) aprono il capitolo giusto */
  ms.addEventListener("click", function(e){
    var a = e.target.closest('a[href^="#m-"]');
    if(!a) return;
    var sec = document.getElementById(a.getAttribute("href").slice(1));
    if(sec && secs.indexOf(sec) >= 0){ e.preventDefault(); apri(sec, null); }
  });

  /* ---------- Schede dei Mael ---------- */
  var API = "https://api.github.com/repos/Zzago-DM/tcj-master/contents/mael/";
  var MAEL = [
    { id: "symael", nome: "Symael", c: "#7fe0ff" },
    { id: "raphael", nome: "Raphael", c: "#ff9a4d" },
    { id: "mykael", nome: "Mykael", c: "#f2d84a" },
    { id: "azrael", nome: "Azrael", c: "#b48cff" },
    { id: "estarossa", nome: "Estarossa", c: "#6fe08a" },
    { id: "gabrael", nome: "Gabrael", c: "#f5e6b8" }
  ];
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function scarica(percorso){
    return fetch(API + percorso, { headers: { "Authorization": "Bearer " + token(), "Accept": "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" })
      .then(function(r){ if(!r.ok) throw r.status; return r; });
  }
  var pagine = {}, immagini = {};
  function pagina(n){ return pagine[n] || (pagine[n] = scarica(n + ".html").then(function(r){ return r.text(); }).catch(function(e){ delete pagine[n]; throw e; })); }
  function immagine(f){ return immagini[f] || (immagini[f] = scarica("img/" + f).then(function(r){ return r.blob(); }).then(function(b){ return URL.createObjectURL(b); }).catch(function(e){ delete immagini[f]; throw e; })); }
  function errore(e){
    if(e === 401) return "Il token del Master non è valido o è stato revocato.";
    if(e === 403 || e === 404) return "Non trovo le schede nel repository tcj-master (cartella mael/).";
    return "Non riesco a raggiungere GitHub: controlla la connessione e riprova.";
  }

  var ov = null, corpo = null, attuale = null, prima = null;
  function costruisciFinestra(){
    ov = document.createElement("div");
    ov.className = "mv-ov";
    ov.hidden = true;
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Schede dei Mael");
    var bar = '<div class="mv-bar">';
    MAEL.forEach(function(m){ bar += '<button type="button" class="mv-tab" data-mv="' + m.id + '" style="--c:' + m.c + '">' + m.nome + '</button>'; });
    bar += '<button type="button" class="mv-x" aria-label="Chiudi le schede">✕</button></div>';
    ov.innerHTML = bar + '<div class="mv-corpo"></div>';
    corpo = ov.querySelector(".mv-corpo");
    ov.addEventListener("click", function(e){
      var t = e.target.closest("[data-mv]");
      if(t){ carica(t.getAttribute("data-mv")); return; }
      if(e.target.closest(".mv-x")) chiudiFinestra();
    });
    ov.addEventListener("keydown", function(e){
      if(e.key === "Escape"){ e.preventDefault(); chiudiFinestra(); }
      if(e.key === "ArrowRight" || e.key === "ArrowLeft"){
        if(e.target.closest("input,textarea")) return;
        var i = MAEL.findIndex(function(m){ return m.id === attuale; });
        if(i < 0) return;
        i = (i + (e.key === "ArrowRight" ? 1 : MAEL.length - 1)) % MAEL.length;
        carica(MAEL[i].id);
      }
    });
    document.body.appendChild(ov);
    window.addEventListener("resize", function(){ if(ov && !ov.hidden) scala(); });
  }
  function scala(){
    var W = corpo.clientWidth - 32, due = W >= 1700;
    var s = Math.min(1, due ? (W - 20) / 1680 : W / 840);
    corpo.querySelectorAll(".mv-pag").forEach(function(p){
      p.style.width = Math.floor(840 * s) + "px";
      p.style.height = Math.floor(1188 * s) + "px";
      p.firstChild.style.transform = "scale(" + s + ")";
    });
  }
  function carica(id){
    var m = MAEL.filter(function(x){ return x.id === id; })[0];
    if(!m) return;
    attuale = id;
    ov.querySelectorAll(".mv-tab").forEach(function(t){ t.setAttribute("aria-current", t.getAttribute("data-mv") === id ? "true" : "false"); });
    corpo.innerHTML = '<div class="mv-stato">Apro le schede di ' + m.nome + '…</div>';
    corpo.scrollTop = 0;
    Promise.all([pagina(id + "-1"), pagina(id + "-2")]).then(function(html){
      if(attuale !== id) return;
      corpo.innerHTML = "";
      html.forEach(function(h, k){
        var p = document.createElement("div");
        p.className = "mv-pag";
        p.setAttribute("aria-label", m.nome + ", pagina " + (k + 1));
        var sc = document.createElement("div");
        sc.className = "mv-scala";
        sc.innerHTML = h;
        p.appendChild(sc);
        corpo.appendChild(p);
      });
      corpo.querySelectorAll("img[src^='img/']").forEach(function(img){
        var f = img.getAttribute("src").slice(4);
        img.removeAttribute("src");
        immagine(f).then(function(u){ img.src = u; }).catch(function(){});
      });
      scala();
    }).catch(function(e){
      if(attuale !== id) return;
      corpo.innerHTML = '<div class="mv-stato"></div>';
      corpo.firstChild.textContent = errore(e);
    });
  }
  function apriFinestra(id){
    if(!ov) costruisciFinestra();
    prima = document.activeElement;
    ov.hidden = false;
    document.documentElement.style.overflow = "hidden";
    suono("paper");
    carica(id || attuale || MAEL[0].id);
    var t = ov.querySelector('[data-mv="' + attuale + '"]');
    try{ (t || ov.querySelector(".mv-x")).focus(); }catch(_){}
  }
  function chiudiFinestra(){
    ov.hidden = true;
    document.documentElement.style.overflow = "";
    suono("swish");
    if(prima) try{ prima.focus({ preventScroll: true }); }catch(_){}
  }
  window.tcjSchedeMael = apriFinestra;
  ms.addEventListener("click", function(e){
    var b = e.target.closest("[data-mael]");
    if(b) apriFinestra(b.getAttribute("data-mael"));
  });
})();
