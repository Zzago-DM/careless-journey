/* Zona Master — i capitoli diventano bolle piene di sangue, in file alternate (4 e 3, sul telefono 3 e 2).
   Toccando una bolla, la bolla scoppia e si apre solo quel capitolo; «Tutti i capitoli» riporta alle bolle.
   Qui c'è anche la finestra delle Schede dei Mael: le pagine stanno nel repository privato tcj-master
   (cartella mael/) e si scaricano con il token del Master, come il resto della Zona. */
(function(){
  var ms = document.getElementById("ms");
  if(!ms) return;
  var secs = [].slice.call(ms.querySelectorAll(".msec"));
  if(!secs.length) return;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function suono(n){ try{ sfxPlay(n); }catch(_){} }

  /* ---------- bolle ---------- */
  ms.classList.add("mb-on");
  var box = document.createElement("div");
  box.className = "mb-bolle";
  box.setAttribute("role", "list");
  box.setAttribute("aria-label", "Capitoli della Zona Master");
  var nav = ms.querySelector(".msnav"), hdr = ms.querySelector(".mshdr");
  var dopo = nav || hdr;
  if(dopo) dopo.insertAdjacentElement("afterend", box); else ms.insertBefore(box, secs[0]);

  var bolle = secs.map(function(sec, i){
    var tit = sec.querySelector(".msect"), sub = sec.querySelector(".msecsub");
    var t = (tit ? tit.textContent : "Capitolo").trim();
    var b = document.createElement("button");
    b.type = "button";
    b.className = "mb-bolla" + (t.length > 24 ? " lunga" : "");
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", "Apri il capitolo: " + t);
    b.style.setProperty("--i", i);
    b.style.setProperty("--liv", (46 + Math.round(Math.random() * 16)) + "%");
    b.innerHTML = '<span class="mb-sangue" aria-hidden="true"><i></i><i></i></span><span class="mb-luce" aria-hidden="true"></span>'
      + '<span class="mb-tit">' + (sub ? '<small></small>' : '') + '<span></span></span>';
    if(sub){
      var st = sub.textContent.trim().split(/\s+[—–-]\s+/)[0];
      if(st.length > 24) b.querySelector("small").remove(); else b.querySelector("small").textContent = st;
    }
    b.querySelector(".mb-tit > span").textContent = t;
    b.addEventListener("click", function(){ apri(sec, b); });
    return b;
  });

  var intro = document.createElement("div");
  intro.className = "mb-intro";
  intro.textContent = "Scegli un capitolo";

  var ultimaDisp = "";
  function disponi(){
    var stretto = window.innerWidth < 640, disp = stretto ? "3-2" : "4-3";
    if(disp === ultimaDisp) return;
    ultimaDisp = disp;
    var per = stretto ? [3, 2] : [4, 3];
    box.innerHTML = "";
    box.appendChild(intro);
    var k = 0, r = 0;
    while(k < bolle.length){
      var fila = document.createElement("div");
      fila.className = "mb-fila" + (r % 2 ? " inv" : "");
      var n = per[r % 2];
      for(var j = 0; j < n && k < bolle.length; j++, k++) fila.appendChild(bolle[k]);
      box.appendChild(fila);
      r++;
    }
  }
  disponi();
  window.addEventListener("resize", disponi);

  /* barra «Tutti i capitoli», spostata dentro il capitolo aperto */
  var torna = document.createElement("div");
  torna.className = "mb-torna";
  torna.innerHTML = '<button type="button" class="mb-torna-b">◂ Tutti i capitoli</button>';
  torna.querySelector("button").addEventListener("click", function(){ chiudi(true); });

  var aperta = null;
  function schizzi(b){
    if(RM) return;
    var r1 = b.getBoundingClientRect(), r0 = box.getBoundingClientRect();
    var cx = r1.left - r0.left + r1.width / 2, cy = r1.top - r0.top + r1.height / 2;
    for(var i = 0; i < 14; i++){
      var g = document.createElement("i"), a = Math.random() * Math.PI * 2, d = r1.width * (.45 + Math.random() * .7);
      g.className = "mb-goccia";
      g.style.left = cx + "px"; g.style.top = cy + "px";
      g.style.setProperty("--dx", (Math.cos(a) * d).toFixed(0) + "px");
      g.style.setProperty("--dy", (Math.sin(a) * d + 30).toFixed(0) + "px");
      g.style.setProperty("--s", (5 + Math.random() * 9).toFixed(0) + "px");
      g.style.setProperty("--r", (Math.random() * 360).toFixed(0) + "deg");
      box.appendChild(g);
      setTimeout(function(x){ return function(){ x.remove(); }; }(g), 800);
    }
  }
  function mostra(sec){
    box.hidden = true;
    secs.forEach(function(s){ s.classList.toggle("mb-vis", s === sec); });
    sec.insertBefore(torna, sec.firstChild);
    if(sec._open) sec._open(); else sec.classList.add("open");
    aperta = sec;
    setTimeout(function(){ window.dispatchEvent(new Event("resize")); }, 60);
    var y = sec.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
    var bt = torna.querySelector("button"); try{ bt.focus({ preventScroll: true }); }catch(_){}
  }
  function apri(sec, b){
    if(b && !RM){
      suono("paper");
      schizzi(b);
      b.classList.add("scoppia");
      setTimeout(function(){ mostra(sec); b.classList.remove("scoppia"); }, 420);
    } else mostra(sec);
  }
  function chiudi(scorri){
    if(aperta) aperta.classList.remove("mb-vis");
    var era = aperta; aperta = null;
    box.hidden = false;
    suono("swish");
    if(scorri){
      var y = box.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
    }
    if(era){ var i = secs.indexOf(era); if(bolle[i]) try{ bolle[i].focus({ preventScroll: true }); }catch(_){} }
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
