/* Il Gruppo: Punti Vita e stati alterati di tutti gli Slayer, visibili a tutti e aggiornati in diretta.

   Dove stanno i dati: nel repository privato Zzago-DM/tcj-gruppo, file stato.json (uno per tutto il gruppo).
   - Ogni volta che un giocatore cambia PV o stati nella propria scheda, il sito invia la sua riga a stato.json
     (dopo un paio di secondi, così più tocchi di fila diventano un solo invio).
   - Ogni dispositivo con un token (di un giocatore o del Master) rilegge stato.json ogni pochi secondi
     mentre la pagina è aperta: se nulla è cambiato GitHub risponde «uguale» e non costa niente.
   - Per scrivere si usa il token del personaggio; se manca, quello del Master; se manca anche quello,
     un altro token presente sul dispositivo. Tutti i token devono includere tcj-gruppo.

   Nella scheda: PV attuali / massimi con barra e pulsanti ±, e la scelta degli stati alterati
   (salvati nella scheda come «pvmax» e «stati», quindi seguono anche il salvataggio online dell'area). */
(function(){
  "use strict";
  var OWNER = "Zzago-DM", REPO = OWNER + "/tcj-gruppo", FILE = "stato.json";
  var API = "https://api.github.com/repos/";
  if(typeof SC_CHARS === "undefined") return;
  var CH = SC_CHARS.map(function(c){ return c.k; });
  var EMO = {}; SC_CHARS.forEach(function(c){ EMO[c.k] = c.e; });
  var NOME = {}; CH.forEach(function(k){ NOME[k] = (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k; });
  var EL_C = { glaciale:"#7ec8e3", ardente:"#e05a20", folgorante:"#f0d020", terrestre:"#5fae50", radiante:"#d4a8ff", oscuro:"#9a72e0", neutro:"#a8a8b8" };
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- stati alterati (dal Manuale dello Slayer) ---------- */
  var AE = [
    { f:"fuoco",    n:"Fuoco",       i:"🔥", c:"#ff6a2a", forme:[{id:"scottato", n:"Scottato", fx:"−2 PV a turno", t:3}, {id:"bruciato", n:"Bruciato", fx:"−5 PV a turno", t:3}] },
    { f:"ghiaccio", n:"Ghiaccio",    i:"❄️", c:"#7ec8e3", forme:[{id:"ghiacciato", n:"Ghiacciato", fx:"−3 DES", t:3}, {id:"ibernato", n:"Ibernato", fx:"−5 DES", t:3}] },
    { f:"fulmine",  n:"Elettricità", i:"⚡", c:"#f0d020", forme:[{id:"elettrificato", n:"Elettrificato", fx:"−1 PV a turno · niente azioni bonus", t:3}, {id:"fulminato", n:"Fulminato", fx:"−3 PV a turno · niente azioni bonus", t:3}] },
    { f:"terra",    n:"Terra",       i:"🌍", c:"#5fae50", forme:[{id:"interrato", n:"Interrato", fx:"Movimento dimezzato", t:3}, {id:"drenato", n:"Drenato", fx:"Non puoi muoverti", t:3}] },
    { f:"oscurita", n:"Oscurità",    i:"🌑", c:"#a57cf0", forme:[{id:"corrotto", n:"Corrotto", fx:"−5 PV a turno · svantaggio ai tiri di COST", t:5}] },
    { f:"luce",     n:"Luce",        i:"✨", c:"#e2c2ff", forme:[{id:"abbagliato", n:"Abbagliato", fx:"−5 PV a turno · svantaggio ai tiri di DES", t:5}] }
  ];
  var DI = [
    { f:"sanguinante", n:"Sanguinante", i:"🩸", c:"#e0533f", forme:[{id:"sanguinante", n:"Sanguinante", fx:"−2 PV quando ti muovi o agisci · si toglie rinunciando al turno", t:3}] },
    { f:"emorragia",   n:"Emorragia",   i:"🩸", c:"#b3203a", forme:[{id:"emorragia", n:"Emorragia", fx:"−5 PV quando ti muovi o agisci · si toglie rinunciando al turno", t:5}] },
    { f:"stordito",    n:"Stordito",    i:"💫", c:"#e8c870", forme:[{id:"stordito", n:"Stordito", fx:"Perdi il primo turno; nel secondo non puoi muoverti", t:2}] },
    { f:"frenesia",    n:"Frenesia",    i:"💢", c:"#ff7a4a", forme:[{id:"frenesia", n:"Frenesia", fx:"+8 FOR · nel turno dopo non puoi agire", t:1}] }
  ];
  var FAM = AE.concat(DI), FORMA = {}, FAMI = {};
  FAM.forEach(function(fa){ FAMI[fa.f] = fa; fa.forme.forEach(function(fo, i){ FORMA[fo.id] = { fa: fa, fo: fo, grave: i > 0 }; }); });

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function num(v){ var m = String(v == null ? "" : v).match(/-?\d+/); return m ? parseInt(m[0], 10) : null; }
  function pvDi(pv, max){
    var cur = num(pv), mx = num(max);
    if(mx === null){ var m = String(pv || "").match(/\/\s*(\d+)/); if(m) mx = parseInt(m[1], 10); }
    if(mx !== null && mx <= 0) mx = null;
    return { pv: cur, max: mx };
  }
  function statiDi(v){
    var a; try { a = typeof v === "string" ? JSON.parse(v || "[]") : v; } catch(e){ a = []; }
    if(!Array.isArray(a)) return [];
    var visti = {};
    return a.filter(function(x){
      if(!x || !FORMA[x.id]) return false;
      var f = FORMA[x.id].fa.f; if(visti[f]) return false; visti[f] = 1; return true;
    }).map(function(x){ var t = num(x.t); return { id: x.id, t: t === null ? FORMA[x.id].fo.t : Math.max(0, Math.min(99, t)) }; });
  }
  window.grStatiTesto = function(v){
    return statiDi(v).map(function(x){ return FORMA[x.id].fo.n + (x.t ? " (" + x.t + (x.t === 1 ? " turno" : " turni") + ")" : ""); }).join(", ");
  };
  function elDi(k){ try { if(typeof paPref === "function") return paPref(k).c; } catch(e){} return (typeof PA_DEF !== "undefined" && PA_DEF[k]) || "neutro"; }
  function colore(pct){ return "hsl(" + Math.round(4 + pct * 122) + ",72%," + Math.round(50 + pct * 4) + "%)"; }
  function fa(iso){
    if(!iso) return "";
    var d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if(isNaN(s)) return "";
    if(s < 45) return "adesso";
    if(s < 3600) return Math.max(1, Math.round(s / 60)) + " min fa";
    var hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if(s < 20 * 3600) return "alle " + hm;
    return d.getDate() + "/" + (d.getMonth() + 1) + " alle " + hm;
  }

  /* ---------- dati locali della scheda ---------- */
  function scheda(k){
    try { var s = localStorage.getItem("tcj-sc4-" + k); if(s === null && k === CH[0]) s = localStorage.getItem("tcj-sc4"); return s ? JSON.parse(s) : null; } catch(e){ return null; }
  }
  function daScheda(k){
    var d = scheda(k); if(!d) return null;
    var p = pvDi(d.pv, d.pvmax);
    return { pv: p.pv, max: p.max, st: statiDi(d.stati), el: elDi(k), rit: (d.id && d.id.ritratto) || "" };
  }
  function daDom(){
    var p = pvDi(($("sc-pv") || {}).value, ($("sc-pvmax") || {}).value);
    return { pv: p.pv, max: p.max, st: statiDi(($("sc-stati") || {}).value), el: elDi(scCur), rit: null };
  }
  function firma(r){ if(!r) return ""; var s = r.rit || ""; return JSON.stringify([r.pv, r.max, r.st, r.el, s ? s.length + ":" + s.slice(-48) : ""]); }

  /* ---------- miniatura del ritratto (piccola, per stato.json) ---------- */
  var mini = {};
  function miniatura(src){
    if(!src) return Promise.resolve("");
    var key = src.length + ":" + src.slice(-64);
    if(mini[key] !== undefined) return Promise.resolve(mini[key]);
    return new Promise(function(fine){
      var im = new Image();
      im.onload = function(){
        try {
          var S = 120, c = document.createElement("canvas"); c.width = c.height = S;
          var g = c.getContext("2d"), w = im.naturalWidth, h = im.naturalHeight, m = Math.min(w, h);
          g.drawImage(im, (w - m) / 2, Math.max(0, (h - m) * 0.18), m, m, 0, 0, S, S);
          mini[key] = c.toDataURL("image/jpeg", 0.74);
        } catch(e){ mini[key] = ""; }
        fine(mini[key]);
      };
      im.onerror = function(){ mini[key] = ""; fine(""); };
      im.src = src;
    });
  }

  /* ---------- GitHub ---------- */
  function tokMaster(){ return leggiJ("tcjgh_master").token || ""; }
  function tokPg(k){ var s = leggiJ("tcjgh_" + k); return (s.token && s.repo) ? s.token : ""; }
  function tokLettura(){ var m = tokMaster(); if(m) return m; for(var i = 0; i < CH.length; i++){ var t = tokPg(CH[i]); if(t) return t; } return ""; }
  function tokScrittura(k){ return tokPg(k) || tokMaster() || tokLettura(); }
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(tok, metodo, perc, corpo, extra){
    var h = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(tok) h.Authorization = "Bearer " + tok;
    if(corpo) h["Content-Type"] = "application/json";
    if(extra) Object.keys(extra).forEach(function(x){ h[x] = extra[x]; });
    /* GitHub tiene in memoria le risposte fino a 60 secondi: un parametro sempre diverso obbliga a leggere la versione appena salvata */
    if(metodo === "GET") perc += (perc.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return fetch(API + REPO + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function aspetta(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  /* ---------- stato condiviso ---------- */
  var doc = leggiJ("tcjgr_cache"); if(!doc.pg) doc = { pg: {} };
  var etag = null, accesso = "?", locali = {}, base = {};
  function salvaCache(){ try { localStorage.setItem("tcjgr_cache", JSON.stringify(doc)); } catch(e){} }
  function ricevi(d){
    if(!d || typeof d !== "object") return;
    d.pg = d.pg && typeof d.pg === "object" ? d.pg : {};
    doc = d; salvaCache(); rendiBoard();
  }

  /* ---------- lettura periodica ---------- */
  var leggendo = false, timer = null, inVista = false, ultimoOk = 0;
  function leggi(){
    if(leggendo) return Promise.resolve(); leggendo = true;
    var tok = tokLettura(), ex = { "Accept": "application/vnd.github.raw+json" };
    if(etag) ex["If-None-Match"] = etag;
    return gh(tok, "GET", "/contents/" + FILE, null, ex).then(function(r){
      if(r.status === 304){ segnala("ok"); return; }
      if(r.ok){ etag = r.headers.get("ETag"); return r.text().then(function(t){ var j = null; try { j = JSON.parse(t); } catch(e){} if(j) ricevi(j); segnala("ok"); }); }
      if(r.status === 404) return gh(tok, "GET", "").then(function(r2){ if(r2.ok){ segnala("ok"); } else segnala(tok ? "noaccesso" : "notoken"); });
      if(r.status === 401) return segnala("tokenko");
      if(r.status === 403 || r.status === 429) return segnala(tok ? "limite" : "notoken");
      segnala("errore");
    }).catch(function(){ segnala("rete"); }).then(function(){ leggendo = false; });
  }
  function prossimo(){
    clearTimeout(timer);
    if(document.hidden) return;
    var ms = !tokLettura() ? 120000 : (accesso === "noaccesso" || accesso === "tokenko") ? 90000 : inVista ? 3000 : 12000;
    timer = setTimeout(function(){ leggi().then(prossimo); }, ms);
  }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden){ leggi().then(prossimo); } else clearTimeout(timer); });
  window.addEventListener("online", function(){ leggi().then(prossimo); });

  /* ---------- invio ---------- */
  var coda = {}, invioT = null, inviando = false;
  function accoda(k){ coda[k] = 1; clearTimeout(invioT); invioT = setTimeout(invia, 500); condivisione("attesa"); }
  function voce(k){
    var r = daScheda(k); if(!r) return Promise.resolve(null);
    return miniatura(r.rit).then(function(img){
      return { n: NOME[k], pv: r.pv, max: r.max, st: r.st, el: r.el, img: img, t: new Date().toISOString() };
    });
  }
  function scrivi(tok, voci, tent){
    return gh(tok, "GET", "/contents/" + FILE).then(function(r){
      if(r.status === 404) return { d: { app: "the-careless-journey", tipo: "stato-del-gruppo", v: 1, pg: {} }, sha: null };
      if(!r.ok) throw r;
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(tok, "GET", "/git/blobs/" + j.sha).then(function(x){ return x.json(); }).then(function(b){ return b.content; });
        return c.then(function(b64){ var d = {}; try { d = JSON.parse(b64d(b64)); } catch(e){} return { d: d, sha: j.sha }; });
      });
    }).then(function(o){
      var d = o.d && typeof o.d === "object" ? o.d : {}; d.pg = d.pg && typeof d.pg === "object" ? d.pg : {};
      var nomi = [];
      Object.keys(voci).forEach(function(k){ d.pg[k] = voci[k]; nomi.push(NOME[k].split(" ")[0] + " " + (voci[k].pv == null ? "—" : voci[k].pv) + (voci[k].max ? "/" + voci[k].max : "") + " PV"); });
      d.agg = new Date().toISOString();
      var corpo = { message: "Gruppo · " + nomi.join(" · "), content: b64e(JSON.stringify(d)) };
      if(o.sha) corpo.sha = o.sha;
      return gh(tok, "PUT", "/contents/" + FILE, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && tent < 4) return aspetta(400 + tent * 500).then(function(){ return scrivi(tok, voci, tent + 1); });
        if(!r.ok) throw r;
        etag = null; ricevi(d);
      });
    });
  }
  function invia(){
    if(inviando){ invioT = setTimeout(invia, 900); return; }
    var ks = Object.keys(coda); if(!ks.length) return; coda = {};
    var gruppi = {}, senza = [];
    ks.forEach(function(k){ var t = tokScrittura(k); if(t) (gruppi[t] = gruppi[t] || []).push(k); else senza.push(k); });
    if(senza.length && !Object.keys(gruppi).length){ condivisione("notoken"); return; }
    inviando = true; condivisione("invio");
    var catena = Promise.resolve(), errore = null;
    Object.keys(gruppi).forEach(function(tok){
      catena = catena.then(function(){
        return Promise.all(gruppi[tok].map(voce)).then(function(vs){
          var voci = {}; gruppi[tok].forEach(function(k, i){ if(vs[i]) voci[k] = vs[i]; });
          if(!Object.keys(voci).length) return;
          return scrivi(tok, voci, 0);
        }).catch(function(e){ errore = e; gruppi[tok].forEach(function(k){ coda[k] = 1; }); });
      });
    });
    catena.then(function(){
      inviando = false;
      if(!errore){ condivisione("ok"); segnala("ok"); return; }
      var st = errore && errore.status;
      condivisione(st === 404 ? "noaccesso" : st === 401 ? "tokenko" : st === 403 ? "permesso" : "rete");
      if(st !== 404 && st !== 401 && st !== 403){ clearTimeout(invioT); invioT = setTimeout(invia, 5000); }   /* riprova da solo se era solo la rete */
      else coda = {};
    });
  }

  /* prima volta: se il quadro non ha ancora la riga di un personaggio di cui questo dispositivo ha il token, la manda */
  var avviati = {};
  function primoInvio(){
    CH.forEach(function(k){
      if(avviati[k] || !tokPg(k) || (doc.pg && doc.pg[k])) return;
      var r = daScheda(k); if(!r || (r.pv === null && !r.st.length)) return;
      avviati[k] = 1; accoda(k);
    });
  }

  /* ---------- messaggi ---------- */
  var MSG = {
    ok: "In diretta",
    notoken: "Collega il salvataggio online nella tua Area dello Slayer per vedere il gruppo in diretta. Qui sotto c'è solo ciò che è salvato su questo dispositivo.",
    noaccesso: "Il quadro del gruppo non è ancora attivo: manca il repository «tcj-gruppo», oppure il token non lo include ancora.",
    tokenko: "Il token di questo dispositivo non è più valido: chiedine uno nuovo al Master.",
    limite: "GitHub ha chiesto una pausa: il quadro riprende tra poco.",
    rete: "Connessione assente: il quadro riprende appena torna internet.",
    errore: "GitHub non risponde: riprovo tra poco."
  };
  function segnala(s){
    accesso = s; if(s === "ok"){ ultimoOk = Date.now(); primoInvio(); }
    var w = $("gr-live"), t = $("gr-live-t"); if(!w || !t) return;
    w.setAttribute("data-s", s === "ok" ? "ok" : (s === "notoken" ? "loc" : "ko"));
    t.textContent = MSG[s] || MSG.errore;
    if(s === "noaccesso" && (!shareStato || shareStato === "ok")) condivisione("noaccesso");
    rendiBoard();
  }
  var SHARE = {
    attesa: ["att", "Modifica in arrivo al gruppo…"],
    invio: ["att", "Invio al gruppo…"],
    ok: ["ok", "✓ Il gruppo vede questi PV e stati"],
    notoken: ["loc", "Solo su questo dispositivo: collega il salvataggio online qui sotto per mostrarli al gruppo."],
    noaccesso: ["ko", "Non inviato: manca il repository «tcj-gruppo» o il token non lo include."],
    tokenko: ["ko", "Non inviato: il token non è più valido."],
    permesso: ["ko", "Non inviato: il token può solo leggere «tcj-gruppo» (serve «Contents: Read and write»)."],
    rete: ["ko", "Non inviato per ora: riprovo appena torna la connessione."]
  };
  var shareStato = null;
  function condivisione(s){
    shareStato = s; var e = $("gr-share"); if(!e) return;
    if(!s){ e.textContent = ""; e.removeAttribute("data-s"); return; }
    var m = SHARE[s] || SHARE.rete; e.setAttribute("data-s", m[0]); e.textContent = m[1];
  }

  /* =================== Quadro del gruppo =================== */
  function datiDi(k){
    var r = doc.pg && doc.pg[k] ? doc.pg[k] : null, l = locali[k];
    if(l && (!r || !r.t || l.t > r.t)){
      var va = !!tokScrittura(k) && accesso !== "noaccesso" && accesso !== "tokenko";
      return { pv: l.pv, max: l.max, st: l.st, el: l.el, img: r ? r.img : "", t: l.t, attesa: va, solo: !va };
    }
    if(r) return r;
    if(accesso !== "ok"){ var s = daScheda(k); if(s && (s.pv !== null || s.st.length)) return { pv: s.pv, max: s.max, st: s.st, el: s.el, img: "", t: null, solo: true }; }
    return null;
  }
  function creaCard(k){
    var a = document.createElement("article");
    a.className = "gr-card"; a.setAttribute("data-k", k);
    a.innerHTML = '<div class="gr-glow" aria-hidden="true"></div>'
      + '<div class="gr-head"><div class="gr-av"><img alt="" decoding="async"><span class="gr-av-e" aria-hidden="true">' + EMO[k] + '</span></div>'
      + '<div class="gr-who"><div class="gr-nm">' + esc(NOME[k]) + '</div><div class="gr-meta"></div></div>'
      + '<div class="gr-num"><b class="gr-pv">—</b><span class="gr-max"></span><small>PV</small></div></div>'
      + '<div class="gr-bar" aria-hidden="true"><i class="gr-ghost"></i><i class="gr-fill"></i><span class="gr-shine"></span></div>'
      + '<div class="gr-chips"></div><div class="gr-ko" aria-hidden="true">Atterrato</div>';
    a.addEventListener("click", function(){
      try {
        if(typeof paIsOpen !== "function" || !paIsOpen(k)) return;
        if(k !== scCur && typeof scSwitch === "function") scSwitch(k);
        var c = $("gr-stcard"); if(c) setTimeout(function(){ c.scrollIntoView({ behavior: RIDOTTO ? "auto" : "smooth", block: "center" }); }, 60);
      } catch(e){}
    });
    return a;
  }
  function contaA(el, da, a){
    if(RIDOTTO || da === null || a === null || da === a){ el.textContent = a === null ? "—" : a; return; }
    var t0 = performance.now(), dur = 520;
    cancelAnimationFrame(el._raf);
    (function passo(t){ var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(da + (a - da) * e); if(p < 1) el._raf = requestAnimationFrame(passo); })(t0);
  }
  function barra(b, pv, max, prima){
    var pct = (pv !== null && max) ? Math.max(0, Math.min(1, pv / max)) : (pv !== null ? 1 : 0);
    var su = prima !== undefined && prima !== null && pct > prima;
    b.classList.toggle("cura", !!su);
    b.classList.toggle("nomax", pv !== null && !max);
    b.classList.toggle("basso", !!max && pv !== null && pct <= 0.25 && pct > 0);
    b.style.setProperty("--hp", colore(pct));
    b.querySelector(".gr-fill").style.width = (pct * 100) + "%";
    b.querySelector(".gr-ghost").style.width = (pct * 100) + "%";
    return pct;
  }
  function flottante(card, delta){
    if(RIDOTTO || !delta) return;
    var f = document.createElement("span");
    f.className = "gr-float " + (delta < 0 ? "dan" : "cur");
    f.textContent = (delta > 0 ? "+" : "−") + Math.abs(delta);
    f.style.left = (38 + Math.random() * 24) + "%";
    card.appendChild(f);
    setTimeout(function(){ f.remove(); }, 1500);
  }
  function scatta(card, cls){ card.classList.remove(cls); void card.offsetWidth; card.classList.add(cls); clearTimeout(card["_" + cls]); card["_" + cls] = setTimeout(function(){ card.classList.remove(cls); }, 900); }
  function chips(box, st){
    var ora = {}; st.forEach(function(x){ ora[FORMA[x.id].fa.f] = x; });
    [].slice.call(box.querySelectorAll(".gr-chip")).forEach(function(c){
      var f = c.getAttribute("data-f");
      if(!ora[f] && !c.classList.contains("via")){ c.classList.add("via"); setTimeout(function(){ c.remove(); vuoto(box); }, RIDOTTO ? 0 : 420); }
    });
    st.forEach(function(x){
      var F = FORMA[x.id], f = F.fa.f, c = box.querySelector('.gr-chip[data-f="' + f + '"]:not(.via)');
      if(!c){
        c = document.createElement("span"); c.className = "gr-chip nuovo"; c.setAttribute("data-f", f); c.style.setProperty("--c", F.fa.c);
        box.appendChild(c); setTimeout(function(){ c.classList.remove("nuovo"); }, 700);
      } else if(c.getAttribute("data-id") !== x.id){ c.classList.remove("cambia"); void c.offsetWidth; c.classList.add("cambia"); }
      c.setAttribute("data-id", x.id);
      c.classList.toggle("grave", F.grave);
      c.title = F.fo.n + ": " + F.fo.fx;
      c.innerHTML = '<span class="gr-ci" aria-hidden="true">' + F.fa.i + '</span>' + esc(F.fo.n) + (x.t ? '<small title="Turni rimasti">' + x.t + '</small>' : "");
    });
    vuoto(box);
  }
  function vuoto(box){
    var n = box.querySelectorAll(".gr-chip:not(.via)").length, e = box.querySelector(".gr-none");
    if(!n && !e){ e = document.createElement("span"); e.className = "gr-none"; e.textContent = "Nessuno stato alterato"; box.appendChild(e); }
    if(n && e) e.remove();
  }
  function aggiornaCard(card, k, d){
    var vuota = !d;
    card.classList.toggle("vuota", vuota);
    card.style.setProperty("--c", EL_C[(d && d.el) || elDi(k)] || EL_C.neutro);
    var img = card.querySelector(".gr-av img"), src = d && d.img ? d.img : "";
    if(img.getAttribute("src") !== src){ if(src) img.setAttribute("src", src); else img.removeAttribute("src"); }
    card.querySelector(".gr-av").classList.toggle("conimg", !!src);
    var meta = card.querySelector(".gr-meta");
    meta.textContent = vuota ? "In attesa del primo aggiornamento" : d.solo ? "Salvato su questo dispositivo" : d.attesa ? "Sta aggiornando…" : ("Aggiornato " + fa(d.t));
    var pv = d ? (d.pv === undefined ? null : d.pv) : null, max = d ? (d.max || null) : null;
    var pvEl = card.querySelector(".gr-pv"), prima = card._pv === undefined ? null : card._pv;
    contaA(pvEl, prima, pv);
    card.querySelector(".gr-max").textContent = max ? "/ " + max : "";
    var pct = barra(card.querySelector(".gr-bar"), pv, max, card._pct);
    if(prima !== null && pv !== null && pv !== prima && card._pronta){ scatta(card, pv < prima ? "colpo" : "cura"); flottante(card, pv - prima); }
    card._pv = pv; card._pct = pct; card._pronta = true;
    card.classList.toggle("ko", pv !== null && pv <= 0 && !vuota);
    chips(card.querySelector(".gr-chips"), d && d.st ? statiDi(d.st) : []);
    var st = d && d.st ? statiDi(d.st).map(function(x){ return FORMA[x.id].fo.n; }).join(", ") : "";
    card.setAttribute("aria-label", NOME[k] + ": " + (pv === null ? "PV sconosciuti" : pv + (max ? " su " + max : "") + " PV") + (st ? ". Stati: " + st : ". Nessuno stato alterato"));
    var apribile = false; try { apribile = typeof paIsOpen === "function" && paIsOpen(k); } catch(e){}
    card.classList.toggle("apri", apribile);
    card.title = apribile ? "Apri la scheda" : "";
  }
  function rendiBoard(){
    var b = $("gr-board"); if(!b) return;
    CH.forEach(function(k){
      var c = b.querySelector('.gr-card[data-k="' + k + '"]');
      if(!c){ c = creaCard(k); b.appendChild(c); }
      aggiornaCard(c, k, datiDi(k));
    });
  }
  setInterval(function(){ if(!document.hidden) rendiBoard(); }, 30000);

  /* =================== Scheda: PV e stati =================== */
  function tocca(el){ if(!el) return; el.dispatchEvent(new Event("input", { bubbles: true })); }
  function leggiStati(){ return statiDi(($("sc-stati") || {}).value); }
  function scriviStati(a){ var h = $("sc-stati"); if(!h) return; h.value = a.length ? JSON.stringify(a) : ""; tocca(h); rendiTiles(); }
  function tile(fa){
    var d = document.createElement("div");
    d.className = "gr-tile"; d.setAttribute("role", "button"); d.tabIndex = 0;
    d.setAttribute("data-f", fa.f); d.style.setProperty("--c", fa.c);
    d.innerHTML = '<span class="gr-tring" aria-hidden="true"></span><span class="gr-ti" aria-hidden="true">' + fa.i + '</span><span class="gr-tn"></span><span class="gr-tfx"></span>'
      + '<span class="gr-tt"><button type="button" data-a="-1" aria-label="Un turno in meno">−</button><b></b><button type="button" data-a="1" aria-label="Un turno in più">+</button></span>';
    d.addEventListener("click", function(e){
      var btn = e.target.closest("button[data-a]");
      if(btn){ e.stopPropagation(); turni(fa.f, parseInt(btn.getAttribute("data-a"), 10)); return; }
      ciclo(fa.f);
    });
    d.addEventListener("keydown", function(e){ if((e.key === "Enter" || e.key === " ") && e.target === d){ e.preventDefault(); ciclo(fa.f); } });
    return d;
  }
  function ciclo(f){
    var a = leggiStati(), fa = FAMI[f], i = -1, pos = -1;
    a.forEach(function(x, j){ if(FORMA[x.id].fa.f === f){ pos = j; i = fa.forme.indexOf(FORMA[x.id].fo); } });
    var nx = i + 1;
    if(nx >= fa.forme.length){ a.splice(pos, 1); suono("off"); }
    else {
      var v = { id: fa.forme[nx].id, t: fa.forme[nx].t };
      if(pos >= 0) a[pos] = v; else a.push(v);
      suono(nx > 0 ? "crack" : "charge");
      var el = document.querySelector('#gr-stcard .gr-tile[data-f="' + f + '"]');
      if(el){ el.classList.remove("burst"); void el.offsetWidth; el.classList.add("burst"); }
    }
    scriviStati(a);
  }
  function turni(f, d){
    var a = leggiStati();
    for(var j = 0; j < a.length; j++){
      if(FORMA[a[j].id].fa.f !== f) continue;
      a[j].t = Math.max(0, Math.min(99, (a[j].t || 0) + d));
      if(a[j].t === 0){ a.splice(j, 1); suono("off"); } else suono("tick");
      break;
    }
    scriviStati(a);
  }
  window.grFineTurno = function(){
    var a = leggiStati(); if(!a.length) return;
    var restano = [];
    a.forEach(function(x){ var t = (x.t || 0) - 1; if(t > 0) restano.push({ id: x.id, t: t }); });
    suono("tick"); scriviStati(restano);
    var c = $("gr-stcard"); if(c){ c.classList.remove("giro"); void c.offsetWidth; c.classList.add("giro"); }
  };
  window.grPulisci = function(){
    if(!leggiStati().length) return;
    var fai = function(){ suono("mend"); scriviStati([]); };
    if(typeof tcjConferma === "function") tcjConferma({ titolo: "Togliere tutti gli stati?", testo: "Spariranno dalla scheda e dal quadro del gruppo.", si: "Sì, togli tutti" }).then(function(ok){ if(ok) fai(); });
    else fai();
  };
  window.grPv = function(d){
    var p = $("sc-pv"), m = $("sc-pvmax"); if(!p) return;
    var v = pvDi(p.value, m ? m.value : ""), cur = v.pv === null ? (v.max || 0) : v.pv;
    var nv = Math.max(0, cur + d); if(v.max) nv = Math.min(v.max, nv);
    if(m && !m.value && v.max) m.value = v.max;
    p.value = nv; tocca(p);
    suono(d < 0 ? "crack" : "mend");
    var c = p.closest(".sc-card"); if(c){ var cls = d < 0 ? "colpo" : "cura"; c.classList.remove("colpo", "cura"); void c.offsetWidth; c.classList.add(cls); }
  };
  function rendiTiles(){
    var ae = $("gr-ae"), di = $("gr-di"); if(!ae || !di) return;
    if(!ae.children.length){ AE.forEach(function(fa){ ae.appendChild(tile(fa)); }); DI.forEach(function(fa){ di.appendChild(tile(fa)); }); }
    var a = leggiStati(), per = {};
    a.forEach(function(x){ per[FORMA[x.id].fa.f] = x; });
    FAM.forEach(function(fa){
      var el = document.querySelector('#gr-stcard .gr-tile[data-f="' + fa.f + '"]'); if(!el) return;
      var x = per[fa.f], F = x ? FORMA[x.id] : null;
      el.classList.toggle("on", !!x); el.classList.toggle("grave", !!(F && F.grave));
      el.setAttribute("aria-pressed", x ? "true" : "false");
      el.querySelector(".gr-tn").textContent = F ? F.fo.n : fa.n;
      el.querySelector(".gr-tfx").textContent = F ? F.fo.fx : (fa.forme.length > 1 ? fa.forme.map(function(fo){ return fo.n; }).join(" → ") : fa.forme[0].fx);
      el.querySelector(".gr-tt b").textContent = x ? (x.t + (x.t === 1 ? " turno" : " turni")) : "";
      el.setAttribute("aria-label", (F ? F.fo.n + " attivo, " + x.t + " turni. Tocca per " + (F.grave || fa.forme.length === 1 ? "toglierlo" : "passare alla forma grave") : fa.n + ": tocca per attivare " + fa.forme[0].n));
    });
  }
  function rendiPv(){
    var p = $("sc-pv"), m = $("sc-pvmax"), b = $("sc-pvbar"); if(!p || !b) return;
    if(m && !m.value && /\//.test(p.value)){ var v0 = pvDi(p.value, ""); if(v0.max){ m.value = v0.max; p.value = v0.pv === null ? "" : v0.pv; } }
    var v = pvDi(p.value, m ? m.value : "");
    b._pct = barra(b, v.pv, v.max, b._pct);
    var c = p.closest(".sc-card"); if(c) c.classList.toggle("ko", v.pv !== null && v.pv <= 0);
  }
  function rendiScheda(){
    rendiPv(); rendiTiles();
    var s = shareStato;
    if(!s || s === "notoken" || s === "ok") s = !tokScrittura(scCur) ? "notoken" : (accesso === "noaccesso" ? "noaccesso" : (s === "ok" ? "ok" : null));
    condivisione(s);
  }

  /* modifica in corso nella scheda → il quadro si aggiorna subito, l'invio parte dopo il salvataggio */
  var ritLoc = null;
  document.addEventListener("input", function(e){
    var id = e.target && e.target.id;
    if(id !== "sc-pv" && id !== "sc-pvmax" && id !== "sc-stati") return;
    if(id !== "sc-stati") rendiPv();
    try { if(!paIsOpen(scCur)) return; } catch(err){ return; }
    var r = daDom(); r.t = new Date().toISOString(); locali[scCur] = r;
    clearTimeout(ritLoc); ritLoc = setTimeout(rendiBoard, 60);
  });

  /* ---------- aggancio a scheda (costruzione e salvataggio) ---------- */
  if(typeof scBuild === "function"){
    var _build = scBuild;
    scBuild = function(){
      var out = _build.apply(this, arguments);
      try { base[scCur] = firma(daScheda(scCur)); delete locali[scCur]; rendiScheda(); rendiBoard(); } catch(e){ console.error(e); }
      return out;
    };
  }
  if(typeof scSave === "function"){
    var _save = scSave;
    scSave = function(){
      var k = scCur, out = _save.apply(this, arguments);
      try {
        var f = firma(daScheda(k));
        if(f && f !== base[k]){ base[k] = f; accoda(k); }
      } catch(e){ console.error(e); }
      return out;
    };
  }

  /* ---------- avvio ---------- */
  CH.forEach(function(k){ base[k] = firma(daScheda(k)); });
  function avvia(){
    rendiScheda(); rendiBoard();
    var sez = [$("gruppo"), $("scheda")].filter(Boolean);
    if("IntersectionObserver" in window && sez.length){
      var vis = {};
      var io = new IntersectionObserver(function(en){
        en.forEach(function(x){ vis[x.target.id] = x.isIntersecting; });
        var prima = inVista; inVista = Object.keys(vis).some(function(k){ return vis[k]; });
        if(inVista && !prima && Date.now() - ultimoOk > 5000) leggi().then(prossimo); else if(inVista !== prima) prossimo();
      }, { rootMargin: "200px 0px" });
      sez.forEach(function(s){ io.observe(s); });
    }
    leggi().then(prossimo);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia); else avvia();
})();
