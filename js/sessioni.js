/* Sessioni di gioco, Diario di bordo e Messaggi privati — la parte che gira su tutti i dispositivi.
   Il capitolo della Zona Master che comanda tutto questo è in js/master-sessioni.js.

   DOVE STANNO I DATI
   - Repository privato Zzago-DM/gruppo, file sessioni.json (lo leggono tutti i token, come la stiva):
       corrente  la sessione in corso: { n, inizio, foto } — «foto» è la situazione di partenza (stiva, cassa,
                 equipaggiamento) che serve per il riepilogo di fine sessione
       diario    le cassette del Diario di bordo: [{ n, titolo, data, riassunto, fine: { blocchi, note, data } }]
       scena     l'ultima cosa mostrata a tutti: { id, tipo: "inizio" | "fine", n, titolo, testo, blocchi, note, t }
   - Messaggi privati: nel repository privato di ogni personaggio (es. Zzago-DM/tcj-athena), file messaggi.json:
       { m: [{ id, da: "master" | <personaggio>, t, x: testo, img: immagine (data URL), mostra: true/false }] }
     Lo aprono solo il token di quel giocatore e quello del Master: gli altri giocatori non possono leggerlo.
     Quello che si è già letto lo ricorda il dispositivo (localStorage), così leggere non costa nessuna scrittura.

   COSA SUCCEDE SUI DISPOSITIVI
   - Ogni pochi secondi, a pagina visibile, il sito rilegge sessioni.json (se nulla è cambiato GitHub risponde «uguale»
     e non costa niente). Se c'è una scena nuova (delle ultime 3 ore) la mostra una volta: lo schermo sfuma nel nero,
     il riassunto sale dal basso verso l'alto, poi il sito torna com'era. A fine sessione compaiono bottino, monete e risorse.
   - Diario di bordo: Area dello Slayer › «📼 Diario di bordo» (e il menu ⚔ Slayer): una cassetta VHS per sessione;
     selezionandola, a destra si accende il display con il riassunto e il riepilogo di fine sessione.
   - Messaggi: la linguetta ✉ sul lato destro apre la chat con il Master (per il Master: una conversazione per Slayer).
     Un'immagine del Master, o un messaggio con «Mostra a schermo», compare anche in grande sullo schermo del giocatore. */
(function(){
  "use strict";
  if(typeof SC_CHARS === "undefined") return;
  var OWNER = "Zzago-DM", API = "https://api.github.com/repos/", GRUPPO = OWNER + "/gruppo", FILE = "sessioni.json", MSGF = "messaggi.json";
  var CH = SC_CHARS.map(function(c){ return c.k; });
  var NOME = {}, EMO = {}; SC_CHARS.forEach(function(c){ NOME[c.k] = (typeof PA_FULL !== "undefined" && PA_FULL[c.k]) || c.n; EMO[c.k] = c.e; });
  var CORTO = {}; SC_CHARS.forEach(function(c){ CORTO[c.k] = c.n; });
  var RIDOTTO = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var ORE3 = 3 * 3600 * 1000;

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function salvaJ(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); } catch(e){} }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function int(v){ var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function dataIt(t){ try { return new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }); } catch(e){ return ""; } }
  function oraIt(t){ try { return new Date(t).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); } catch(e){ return ""; } }
  function master(){ try { return typeof paMaster === "function" && paMaster(); } catch(e){ return false; } }

  /* ---------- token (come js/stiva.js e js/gruppo.js) ---------- */
  function tokMaster(){ return leggiJ("tcjgh_master").token || ""; }
  function tokPg(k){ var s = leggiJ("tcjgh_" + k); return (s.token && s.repo) ? s.token : ""; }
  function tokLettura(){ var m = tokMaster(); if(m) return m; for(var i = 0; i < CH.length; i++){ var t = tokPg(CH[i]); if(t) return t; } return ""; }
  /* chi scrive i messaggi da questo dispositivo: il Master (Zona Master aperta) o il giocatore con l'area aperta */
  function io(){
    if(master() && tokMaster()) return "master";
    var k = typeof scCur !== "undefined" ? scCur : "";
    if(k && typeof paIsOpen === "function" && paIsOpen(k) && tokPg(k)) return k;
    return "";
  }
  function tokPer(k){ return io() === "master" ? tokMaster() : tokPg(k); }

  /* ---------- GitHub ---------- */
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(tok, metodo, repo, perc, corpo, extra){
    var h = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(tok) h.Authorization = "Bearer " + tok;
    if(corpo) h["Content-Type"] = "application/json";
    if(extra) Object.keys(extra).forEach(function(x){ h[x] = extra[x]; });
    if(metodo === "GET") perc += (perc.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return fetch(API + repo + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function aspetta(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  /* legge un file JSON; con etag risponde { uguale: true } se non è cambiato */
  function leggiFile(tok, repo, file, etag){
    var ex = { "Accept": "application/vnd.github.raw+json" }; if(etag) ex["If-None-Match"] = etag;
    return gh(tok, "GET", repo, "/contents/" + file, null, ex).then(function(r){
      if(r.status === 304) return { uguale: true, etag: etag };
      if(r.status === 404) return { vuoto: true, j: null, etag: null };
      if(!r.ok) throw r;
      var et = r.headers.get("ETag");
      return r.text().then(function(t){ var j = null; try { j = JSON.parse(t); } catch(e){} return { j: j, etag: et }; });
    });
  }
  /* legge, cambia con fn(d) e salva; fn restituisce false per non salvare */
  function modificaFile(tok, repo, file, fn, msg, tent){
    tent = tent || 0;
    return gh(tok, "GET", repo, "/contents/" + file).then(function(r){
      if(r.status === 404) return { d: {}, sha: null };
      if(!r.ok) throw r;
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(tok, "GET", repo, "/git/blobs/" + j.sha).then(function(x){ return x.json(); }).then(function(b){ return b.content; });
        return c.then(function(b){ var d = {}; try { d = JSON.parse(b64d(b)); } catch(e){} return { d: d, sha: j.sha }; });
      });
    }).then(function(o){
      var d = o.d && typeof o.d === "object" ? o.d : {};
      if(fn(d) === false) return d;
      d.app = "the-careless-journey"; d.agg = new Date().toISOString();
      var corpo = { message: msg, content: b64e(JSON.stringify(d)) }; if(o.sha) corpo.sha = o.sha;
      return gh(tok, "PUT", repo, "/contents/" + file, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && tent < 5) return aspetta(300 + tent * 450).then(function(){ return modificaFile(tok, repo, file, fn, msg, tent + 1); });
        if(!r.ok) throw r;
        return d;
      });
    });
  }

  /* =================== sessioni.json =================== */
  function norm(d){
    d = d && typeof d === "object" ? d : {};
    d.diario = (Array.isArray(d.diario) ? d.diario : []).filter(function(c){ return c && int(c.n) > 0; });
    d.diario.sort(function(a, b){ return int(a.n) - int(b.n); });
    if(!d.corrente || !int(d.corrente.n)) d.corrente = null;
    if(!d.scena || !d.scena.id) d.scena = null;
    return d;
  }
  var doc = norm(leggiJ("tcjses_cache")), etagS = null, ascS = [], leggendoS = false;
  function ricevi(j){ doc = norm(j); salvaJ("tcjses_cache", doc); ascS.forEach(function(f){ try { f(doc); } catch(e){} }); controllaScena(); }
  function leggiSessioni(){
    var tok = tokLettura(); if(!tok || leggendoS) return Promise.resolve(doc);
    leggendoS = true;
    return leggiFile(tok, GRUPPO, FILE, etagS).then(function(r){
      if(r.uguale || r.vuoto) return;   /* 404: file non ancora creato (o non raggiungibile): tengo la copia salvata */
      etagS = r.etag; ricevi(r.j || {});
    }).catch(function(){}).then(function(){ leggendoS = false; return doc; });
  }
  function modificaSessioni(fn, msg){
    var tok = tokMaster(); if(!tok) return Promise.reject(new Error("token"));
    return modificaFile(tok, GRUPPO, FILE, function(d){ norm(d); return fn(d); }, msg).then(function(d){ etagS = null; ricevi(d); return d; });
  }
  var tS = null;
  function giroS(){ clearTimeout(tS); if(document.hidden || !tokLettura()) return; leggiSessioni().then(function(){ tS = setTimeout(giroS, 8000); }); }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden){ giroS(); giroM(); } else { clearTimeout(tS); clearTimeout(tM); } });

  /* =================== la scena: dissolvenza nel nero =================== */
  function viste(){ var v = leggiJ("tcjses_viste"); return v && typeof v === "object" ? v : {}; }
  function segnaVista(id){ var v = viste(); v[id] = Date.now(); var k = Object.keys(v); if(k.length > 40) k.sort(function(a, b){ return v[a] - v[b]; }).slice(0, k.length - 40).forEach(function(x){ delete v[x]; }); salvaJ("tcjses_viste", v); }
  var primaLettura = true;
  function controllaScena(){
    var s = doc.scena; if(!s) { primaLettura = false; return; }
    var v = viste();
    if(!v[s.id]){
      if(Date.now() - (s.t || 0) > ORE3) segnaVista(s.id);           /* troppo vecchia: non la mostro */
      else { segnaVista(s.id); mostraScena(s); }
    }
    primaLettura = false;
  }
  var ov = null, tFine = null;
  function chiudiScena(){
    if(!ov) return; clearTimeout(tFine);
    var o = ov; ov = null; o.classList.add("via");
    setTimeout(function(){ if(o.parentNode) o.parentNode.removeChild(o); document.documentElement.classList.remove("ses-aperta"); }, RIDOTTO ? 0 : 1100);
  }
  function blocchiHtml(bl){
    return (bl || []).map(function(b, i){
      return '<div class="ses-bl" style="--i:' + i + '"><div class="ses-blt"><span>' + esc(b.i || "◆") + '</span>' + esc(b.t) + '</div>'
        + (b.righe && b.righe.length ? '<ul>' + b.righe.map(function(r){ return '<li>' + esc(r) + '</li>'; }).join("") + '</ul>' : '<p class="ses-vuoto">' + esc(b.vuoto || "Niente da segnalare.") + '</p>') + '</div>';
    }).join("");
  }
  function paragrafi(t){ return String(t || "").split(/\n{2,}/).map(function(p){ p = p.trim(); return p ? "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>" : ""; }).join(""); }
  /* ---------- lingue degli Slayer (js/lingue.js) ----------
     Un testo con «lingue: true» si vede nella lingua madre di chi lo legge (rune, gallifreyano, Terre Oscure);
     con «lingue: "occulti"» (o un'altra lingua) tutti gli Slayer lo vedono in quella lingua. Il Master vede sempre l'italiano.
     sotto c'è «Traduci», a meno che il Master non l'abbia bloccato («blocca»: da decifrare).
     Per Asonnes al posto del disegno automatico può esserci un'immagine fatta con il traduttore ufficiale. */
  function mioPg(){ var k = typeof scCur !== "undefined" ? scCur : ""; return (k && !master() && typeof paIsOpen === "function" && paIsOpen(k)) ? k : ""; }
  var IMG = {};
  function immagine(path){
    if(!path) return Promise.resolve(""); if(/^data:/.test(path)) return Promise.resolve(path);
    if(IMG[path]) return IMG[path];
    var tok = tokLettura(); if(!tok) return Promise.resolve("");
    IMG[path] = gh(tok, "GET", GRUPPO, "/contents/" + path, null, { "Accept": "application/vnd.github.raw+json" })
      .then(function(r){ return r.ok ? r.blob() : null; }).then(function(b){ return b ? URL.createObjectURL(b) : ""; }).catch(function(){ return ""; });
    return IMG[path];
  }
  /* in che lingua lo vede questo Slayer: la sua (lingue: true) o quella scelta dal Master */
  function chiLingua(lingue, pg){ if(!lingue || !pg || !window.LINGUE) return ""; return LINGUE.di(lingue === true ? pg : lingue); }
  function inLingua(testo, o){
    var pg = o.pg != null ? o.pg : mioPg(), it = paragrafi(testo), l = chiLingua(o.lingue, pg);
    if(!l) return { html: it, lingua: false };
    var h = LINGUE.html(testo, l, { img: l === "gallifreyano" ? o.gf : "" }); if(!h) return { html: it, lingua: false };
    var n = esc(LINGUE.nome(l));
    return { lingua: true, nome: n, html: '<div class="lg-box"><div class="lg-or">' + h + '</div><div class="lg-it" hidden>' + it + '</div>'
      + (o.senzaBottone ? "" : (o.blocca ? '<p class="lg-nota">🔒 ' + n + ' · da decifrare</p>' : '<button type="button" class="lg-trad" data-l="' + n + '">Traduci</button>')) + '</div>' };
  }
  function giraLingua(box, b){
    var it = box.querySelector(".lg-it"), or = box.querySelector(".lg-or"), ora = it.hidden;
    it.hidden = !ora; or.hidden = ora;
    if(b) b.textContent = ora ? "Mostra in " + b.getAttribute("data-l") : "Traduci";
    return ora;
  }
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest(".lg-trad"); if(!b) return; var box = b.closest(".lg-box"); if(box) giraLingua(box, b); });
  /* gallifreyano: se il testo ha l'immagine del traduttore ufficiale, la metto al posto del disegno */
  function immagineGf(box, testo, path, l){
    if(!box || !path || l !== "gallifreyano") return;
    immagine(path).then(function(u){ var or = box.querySelector(".lg-or"); if(u && or) or.innerHTML = LINGUE.html(testo, "gallifreyano", { img: u }); });
  }

  function mostraScena(s, come){
    if(ov) chiudiScena();
    ov = document.createElement("div"); ov.className = "ses-ov ses-" + (s.tipo === "fine" ? "fine" : "inizio"); ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", s.tipo === "fine" ? "Fine della sessione" : "Riassunto della sessione precedente");
    var h = '<div class="ses-nero"></div>';
    if(s.tipo === "fine"){
      h += '<div class="ses-fn"><div class="ses-ep">Fine della sessione ' + int(s.n) + '</div><h2 class="ses-tit">' + esc(s.titolo || "Il bottino della caccia") + '</h2>'
        + '<div class="ses-bls">' + blocchiHtml(s.blocchi) + '</div>'
        + (s.note ? '<div class="ses-note" style="--i:' + (s.blocchi || []).length + '">' + paragrafi(s.note) + '</div>' : "")
        + '</div>';
    } else {
      var pgS = come != null ? come : mioPg();
      var L = s.testo ? inLingua(s.testo, { lingue: s.lingue, blocca: s.blocca, pg: pgS, senzaBottone: true }) : { html: "" };
      var corpo = L.html;
      h += '<div class="ses-crawl' + (corpo ? "" : " solo-tit") + '"><div class="ses-sale"><div class="ses-ep">Sessione ' + int(s.n) + '</div>'
        + (s.titolo ? '<h2 class="ses-tit">' + esc(s.titolo) + '</h2>' : '<h2 class="ses-tit">The Careless Journey</h2>')
        + (corpo ? '<div class="ses-prec">Nella sessione precedente…</div><div class="ses-testo">' + corpo + '</div>' : "") + '</div></div>';
    }
    h += '<button type="button" class="ses-salta">' + (s.tipo === "fine" ? "Chiudi" : "Salta ▸") + '</button>';
    if(s.tipo !== "fine" && L.lingua) h += s.blocca ? '<p class="ses-lgnota">🔒 ' + L.nome + ' · da decifrare</p>' : '<button type="button" class="ses-trad" data-l="' + L.nome + '">Traduci</button>';
    ov.innerHTML = h;
    document.body.appendChild(ov); document.documentElement.classList.add("ses-aperta");
    ov.querySelector(".ses-salta").addEventListener("click", chiudiScena);
    ov.addEventListener("keydown", function(e){ if(e.key === "Escape") chiudiScena(); });
    setTimeout(function(){ try { ov.querySelector(".ses-salta").focus({ preventScroll: true }); } catch(e){} }, 50);
    suono(s.tipo === "fine" ? "coin" : "gong");
    if(s.tipo === "fine"){ tFine = setTimeout(chiudiScena, 90000); return; }
    /* il testo sale dal basso verso l'alto; la durata dipende da quanto è lungo */
    var sale = ov.querySelector(".ses-sale"), cr = ov.querySelector(".ses-crawl"), tSale = null;
    if(L.lingua && s.gfImg) immagineGf(ov.querySelector(".lg-box"), s.testo, s.gfImg, chiLingua(s.lingue, pgS));
    var tr = ov.querySelector(".ses-trad");
    if(tr) tr.addEventListener("click", function(){   /* tradotto: il testo riparte dal basso */
      giraLingua(ov.querySelector(".lg-box"), tr);
      clearTimeout(tFine); clearTimeout(tSale); sale.style.transition = "none"; requestAnimationFrame(sali);
    });
    requestAnimationFrame(sali);
    function sali(){
      if(!ov) return;
      var H = cr.clientHeight, alto = sale.offsetHeight;
      if(RIDOTTO){ sale.style.transform = "translateY(" + Math.max(0, (H - alto) / 2) + "px)"; tFine = setTimeout(chiudiScena, 9000 + (s.testo || "").length * 45); return; }
      var dur = corpoDur(s.testo, H + alto);
      sale.style.transform = "translateY(" + H + "px)";
      void sale.offsetWidth;
      sale.style.transition = "transform " + dur + "ms linear";
      tSale = setTimeout(function(){ if(sale) sale.style.transform = "translateY(" + (-alto) + "px)"; }, 1300);
      tFine = setTimeout(chiudiScena, dur + 1900);
    }
  }
  function corpoDur(t, dist){ return Math.max(9000, Math.min(110000, dist / 42 * 1000)); }   /* ~42 pixel al secondo */

  /* =================== Diario di bordo (cassette VHS) =================== */
  var dia = null, diaSel = null;
  function cassetta(c, on){
    return '<button type="button" class="vhs' + (on ? " on" : "") + '" data-n="' + int(c.n) + '" aria-pressed="' + !!on + '">'
      + '<span class="vhs-bobina"></span><span class="vhs-etich"><b>Sessione ' + int(c.n) + '</b><i>' + esc(c.titolo || (c.data ? dataIt(c.data) : "")) + '</i></span><span class="vhs-bobina"></span></button>';
  }
  function display(c){
    if(!c) return '<div class="crt-off"><span>▶ Scegli una cassetta</span></div>';
    var h = '<div class="crt-osd"><span>▶ PLAY</span><span>SESS. ' + String(int(c.n)).padStart(2, "0") + '</span><span>' + esc(c.data ? dataIt(c.data) : "") + '</span></div>';
    h += '<div class="crt-tit">' + esc(c.titolo || ("Sessione " + int(c.n))) + '</div>';
    h += c.riassunto ? '<div class="crt-testo">' + inLingua(c.riassunto, { lingue: c.lingue, blocca: c.blocca }).html + '</div>' : '<p class="crt-nota">Il riassunto di questa sessione arriverà all\'inizio della prossima.</p>';
    if(c.fine && c.fine.blocchi) h += '<div class="crt-sub">A fine sessione</div><div class="crt-bls">' + blocchiHtml(c.fine.blocchi) + '</div>' + (c.fine.note ? '<div class="crt-testo">' + paragrafi(c.fine.note) + '</div>' : "");
    return h;
  }
  function disegnaDiario(){
    if(!dia) return;
    var L = doc.diario.slice().reverse();
    if(diaSel == null && L.length) diaSel = int(L[0].n);
    var sel = L.filter(function(c){ return int(c.n) === diaSel; })[0] || null;
    dia.querySelector(".dia-rack").innerHTML = L.length ? L.map(function(c){ return cassetta(c, sel && int(c.n) === int(sel.n)); }).join("")
      : '<p class="dia-vuoto">Il diario parte dalla prossima sessione: alla fine di ogni sessione qui comparirà una nuova cassetta.</p>';
    dia.querySelector(".crt-in").innerHTML = display(sel);
    if(sel && sel.lingue && sel.gfImg) immagineGf(dia.querySelector(".crt-in .lg-box"), sel.riassunto, sel.gfImg, chiLingua(sel.lingue, mioPg()));
    var st = dia.querySelector(".dia-stato");
    st.textContent = tokLettura() ? "" : "Collega il salvataggio online nella tua Area dello Slayer per vedere le cassette più recenti. Qui c'è l'ultima copia salvata su questo dispositivo.";
  }
  window.sesDiario = function(){
    if(dia){ disegnaDiario(); return; }
    dia = document.createElement("div"); dia.className = "dia-ov"; dia.setAttribute("role", "dialog"); dia.setAttribute("aria-modal", "true"); dia.setAttribute("aria-label", "Diario di bordo");
    dia.innerHTML = '<div class="dia-box"><div class="dia-h"><div><div class="dia-sub">La Careless · registrazioni</div><div class="dia-t">📼 Diario di bordo</div></div><button type="button" class="dia-x" aria-label="Chiudi">✕</button></div>'
      + '<p class="dia-stato"></p><div class="dia-cor"><div class="dia-rack" aria-label="Cassette"></div><div class="crt"><div class="crt-in"></div></div></div></div>';
    document.body.appendChild(dia); document.documentElement.classList.add("ses-aperta");
    dia.addEventListener("click", function(e){
      if(e.target === dia || e.target.closest(".dia-x")){ chiudiDiario(); return; }
      var v = e.target.closest(".vhs"); if(v){ diaSel = int(v.getAttribute("data-n")); suono("tick"); disegnaDiario(); var c = dia.querySelector(".crt"); c.classList.remove("acceso"); void c.offsetWidth; c.classList.add("acceso"); }
    });
    dia.addEventListener("keydown", function(e){ if(e.key === "Escape") chiudiDiario(); });
    disegnaDiario(); leggiSessioni().then(disegnaDiario);
    setTimeout(function(){ try { dia.querySelector(".dia-x").focus({ preventScroll: true }); } catch(e){} }, 30);
    suono("paper");
  };
  function chiudiDiario(){ if(!dia) return; dia.parentNode.removeChild(dia); dia = null; if(!ov) document.documentElement.classList.remove("ses-aperta"); }
  ascS.push(function(){ disegnaDiario(); });
  /* pulsante nella barra dell'Area dello Slayer */
  (function(){
    var bar = document.querySelector("#scheda .pa-bar"); if(!bar) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "bk-btn"; b.id = "ses-diario-btn"; b.textContent = "📼 Diario di bordo";
    b.addEventListener("click", function(){ window.sesDiario(); });
    var am = document.getElementById("am-btn"); bar.insertBefore(b, am || null);
  })();

  /* =================== Messaggi privati Master ↔ Slayer =================== */
  var CONV = {};    /* k -> { m: [...], etag } */
  CH.forEach(function(k){ CONV[k] = { m: (leggiJ("tcjmsg_" + k).m || []), etag: null }; });
  function letti(){ return leggiJ("tcjmsg_letti"); }
  function segnaLetto(k){ var l = letti(), c = CONV[k].m, ul = c.length ? c[c.length - 1].t : 0; l[io() + ">" + k] = ul; salvaJ("tcjmsg_letti", l); }
  function nonLetti(k){ var me = io(); if(!me) return 0; var da = letti()[me + ">" + k] || 0; return CONV[k].m.filter(function(x){ return x.t > da && x.da !== me && (me === "master" ? x.da === k : x.da === "master"); }).length; }
  function conversazioni(){ var me = io(); return me === "master" ? CH.slice() : (me ? [me] : []); }
  var panel = null, tab = null, convSel = null, mostrati = leggiJ("tcjmsg_mostrati");
  function leggiConv(k){
    var tok = tokPer(k); if(!tok) return Promise.resolve();
    return leggiFile(tok, OWNER + "/tcj-" + k, MSGF, CONV[k].etag).then(function(r){
      if(r.uguale || r.vuoto) return;
      CONV[k].etag = r.etag; var prima = CONV[k].m.length;
      CONV[k].m = ((r.j && Array.isArray(r.j.m)) ? r.j.m : []).filter(function(x){ return x && x.id; });
      salvaJ("tcjmsg_" + k, { m: CONV[k].m.slice(-60) });
      if(CONV[k].m.length !== prima) cambiato(k);
    }).catch(function(){});
  }
  function cambiato(k){
    disegnaTab(); if(panel && convSel === k) disegnaPanel(true);
    /* il Master mostra qualcosa a schermo: lo apro in grande al giocatore */
    var me = io(); if(!me || me === "master") return;
    CONV[k].m.forEach(function(x){
      if(x.da !== "master" || mostrati[x.id] || !(x.img || x.mostra)) return;
      mostrati[x.id] = 1; salvaJ("tcjmsg_mostrati", mostrati);
      if(Date.now() - x.t < ORE3) mostraASchermo(x);
    });
  }
  var tM = null;
  function giroM(){
    clearTimeout(tM); if(document.hidden) return;
    var L = conversazioni(); disegnaTab();
    if(!L.length){ tM = setTimeout(giroM, 15000); return; }
    var aperto = !!panel;
    Promise.all((aperto && io() !== "master" ? L : L).map(leggiConv)).then(function(){ tM = setTimeout(giroM, aperto ? 5000 : (io() === "master" ? 25000 : 15000)); });
  }
  function disegnaTab(){
    var L = conversazioni();
    if(!L.length){ if(tab){ tab.hidden = true; } if(panel) chiudiPanel(); return; }
    if(!tab){
      tab = document.createElement("button"); tab.type = "button"; tab.id = "msg-tab"; tab.setAttribute("aria-label", "Messaggi privati");
      tab.addEventListener("click", function(){ if(panel) chiudiPanel(); else apriPanel(); });
      document.body.appendChild(tab);
    }
    tab.hidden = false;
    var n = 0; L.forEach(function(k){ n += nonLetti(k); });
    tab.innerHTML = '<span class="msg-tab-i">✉</span><span class="msg-tab-t">Messaggi</span>' + (n ? '<span class="msg-badge">' + n + '</span>' : "");
    tab.classList.toggle("nuovo", n > 0);
    if(panel) [].forEach.call(panel.querySelectorAll(".msg-ch"), function(b){ var k = b.getAttribute("data-k"), x = nonLetti(k); var s = b.querySelector(".msg-chn"); if(s) s.textContent = x ? x : ""; });
  }
  function apriPanel(k){
    var L = conversazioni(); if(!L.length) return;
    convSel = k && L.indexOf(k) >= 0 ? k : (convSel && L.indexOf(convSel) >= 0 ? convSel : L[0]);
    if(!panel){
      panel = document.createElement("aside"); panel.id = "msg-panel"; panel.setAttribute("aria-label", "Messaggi privati");
      document.body.appendChild(panel);
      panel.addEventListener("click", clicPanel);
      panel.addEventListener("keydown", function(e){ if(e.key === "Escape") chiudiPanel(); if(e.key === "Enter" && !e.shiftKey && e.target.id === "msg-txt"){ e.preventDefault(); invia(); } });
      panel.addEventListener("change", function(e){ if(e.target.id === "msg-file") allega(e.target); });
      requestAnimationFrame(function(){ if(panel) panel.classList.add("aperto"); });
    }
    disegnaPanel(); suono("swish"); giroM();
  }
  function chiudiPanel(){ if(!panel) return; var p = panel; panel = null; p.classList.remove("aperto"); setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); }, 300); giroM(); }
  var allegato = null, inviando = false;
  /* testo di un messaggio: nella lingua del giocatore se il Master l'ha mandato così (per Asonnes l'immagine allegata fa da gallifreyano) */
  function testoMsg(x, me){
    var gfImg = !!(x.lingua && x.img && me !== "master" && chiLingua(x.lingua, me) === "gallifreyano");
    if(x.lingua && me && me !== "master" && x.x) return { html: inLingua(x.x, { lingue: x.lingua, blocca: x.blocca, pg: me, gf: gfImg ? x.img : "" }).html, gfImg: gfImg };
    if(x.lingua && me === "master" && x.x && x.dest && window.LINGUE) return { html: '<div class="msg-x">' + esc(x.x).replace(/\n/g, "<br>") + '</div><span class="msg-lg">✒ ' + esc(LINGUE.nome(x.lingua === true ? x.dest : x.lingua) || "nella sua lingua") + (x.blocca ? " · 🔒 da decifrare" : "") + '</span>', gfImg: false };
    return { html: x.x ? '<div class="msg-x">' + esc(x.x).replace(/\n/g, "<br>") + '</div>' : "", gfImg: false };
  }
  function bolla(x, me){
    var mio = x.da === me, chi = x.da === "master" ? "Master" : (CORTO[x.da] || x.da), T = testoMsg(x, me);
    return '<div class="msg-b' + (mio ? " mio" : "") + '"><div class="msg-bh">' + esc(mio ? "Tu" : chi) + ' · ' + esc(oraIt(x.t)) + (x.mostra ? ' · <span title="Mostrato a schermo">📣</span>' : "") + '</div>'
      + (x.img && !T.gfImg ? '<button type="button" class="msg-img" data-img="' + esc(x.id) + '"><img src="' + x.img + '" alt="Immagine"></button>' : (x.imgVia ? '<p class="msg-via">(immagine non più conservata)</p>' : ""))
      + T.html + '</div>';
  }
  function disegnaPanel(soloLista){
    if(!panel) return;
    var me = io(), L = conversazioni(), k = convSel;
    if(!soloLista){
      var h = '<div class="msg-h"><div><div class="msg-sub">' + (me === "master" ? "Messaggi privati" : "Solo tu e il Master") + '</div><div class="msg-t">' + (me === "master" ? "✉ Messaggi agli Slayer" : "✉ Messaggi con il Master") + '</div></div><button type="button" class="msg-x" aria-label="Chiudi">✕</button></div>';
      if(me === "master") h += '<div class="msg-chs">' + L.map(function(c){ return '<button type="button" class="msg-ch' + (c === k ? " on" : "") + '" data-k="' + c + '">' + EMO[c] + " " + esc(CORTO[c]) + '<span class="msg-chn"></span></button>'; }).join("") + '</div>';
      h += '<div class="msg-lista" aria-live="polite"></div>';
      h += '<div class="msg-scrivi">' + (allegato ? '<div class="msg-alleg"><img src="' + allegato + '" alt=""><button type="button" class="msg-tolgi">✕ Togli immagine</button></div>' : "")
        + '<textarea id="msg-txt" rows="2" placeholder="' + (me === "master" ? "Scrivi a " + esc(CORTO[k]) + "…" : "Scrivi al Master…") + '" aria-label="Messaggio"></textarea>'
        + '<div class="msg-az"><label class="msg-file-b" title="Allega un\'immagine">🖼<input type="file" id="msg-file" accept="image/*" hidden></label>'
        + (me === "master" ? '<label class="msg-opt">✒ <select id="msg-lingua" aria-label="Lingua del messaggio"><option value="">Italiano</option><option value="sua">Nella sua lingua</option>' + (window.LINGUE ? LINGUE.elenco().map(function(l){ return '<option value="' + l.k + '">' + esc(l.n) + '</option>'; }).join("") : "") + '</select></label><label class="msg-opt"><input type="checkbox" id="msg-blocca"> 🔒 Da decifrare</label><label class="msg-opt"><input type="checkbox" id="msg-mostra"> 📣 Mostra a schermo</label><label class="msg-opt"><input type="checkbox" id="msg-tutti"> A tutti</label>' : "")
        + '<button type="button" class="msg-invia">Invia</button></div><div class="msg-err" id="msg-err" hidden></div></div>';
      var txt = panel.querySelector("#msg-txt"), val = txt ? txt.value : "", lgS = panel.querySelector("#msg-lingua"), lgV = lgS ? lgS.value : "";
      panel.innerHTML = h;
      if(val) panel.querySelector("#msg-txt").value = val;
      if(lgV && panel.querySelector("#msg-lingua")) panel.querySelector("#msg-lingua").value = lgV;
    }
    var lista = panel.querySelector(".msg-lista"), M = CONV[k].m;
    lista.innerHTML = M.length ? M.map(function(x){ return bolla(x, me); }).join("") : '<p class="msg-vuoto">' + (me === "master" ? "Nessun messaggio con " + esc(CORTO[k]) + ". Quello che scrivi qui lo vede solo lui." : "Nessun messaggio. Quello che scrivi qui lo legge solo il Master.") + '</p>';
    lista.scrollTop = lista.scrollHeight;
    segnaLetto(k); disegnaTab();
    if(!soloLista) setTimeout(function(){ var t = panel && panel.querySelector("#msg-txt"); if(t) try { t.focus({ preventScroll: true }); } catch(e){} }, 30);
  }
  function clicPanel(e){
    if(e.target.closest(".msg-x")){ chiudiPanel(); return; }
    var c = e.target.closest(".msg-ch"); if(c){ convSel = c.getAttribute("data-k"); allegato = null; disegnaPanel(); leggiConv(convSel); return; }
    if(e.target.closest(".msg-invia")){ invia(); return; }
    if(e.target.closest(".msg-tolgi")){ allegato = null; disegnaPanel(); return; }
    var im = e.target.closest(".msg-img"); if(im){ var id = im.getAttribute("data-img"), x = CONV[convSel].m.filter(function(m){ return m.id === id; })[0]; if(x) mostraASchermo(x, true); }
  }
  /* immagini: ridotte sul dispositivo prima di partire (lato lungo 1280 px, JPEG), per tenere leggero il file */
  function allega(inp){
    var f = inp.files && inp.files[0]; if(!f) return;
    var fr = new FileReader();
    fr.onload = function(){
      var img = new Image();
      img.onload = function(){
        function riduci(lato, q){ var s = Math.min(1, lato / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", q); }
        var d = riduci(1280, .82); if(d.length > 520000) d = riduci(960, .74); if(d.length > 520000) d = riduci(720, .68);
        allegato = d; disegnaPanel();
      };
      img.onerror = function(){ errore("Non riesco ad aprire questa immagine."); };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  }
  function errore(t){ var e = panel && panel.querySelector("#msg-err"); if(e){ e.textContent = t; e.hidden = !t; } }
  function invia(){
    if(inviando || !panel) return;
    var me = io(), t = panel.querySelector("#msg-txt"), x = (t.value || "").trim();
    if(!x && !allegato) return;
    var mostra = !!(panel.querySelector("#msg-mostra") || {}).checked, tutti = !!(panel.querySelector("#msg-tutti") || {}).checked;
    var lgv = (panel.querySelector("#msg-lingua") || {}).value || "", lingua = lgv === "sua" ? true : lgv, blocca = lingua && !!(panel.querySelector("#msg-blocca") || {}).checked;
    var dest = me === "master" ? (tutti ? CH.slice() : [convSel]) : [me];
    var msg = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), da: me, t: Date.now(), x: x.slice(0, 4000) };
    if(allegato) msg.img = allegato; if(mostra && me === "master") msg.mostra = true;
    if(lingua && me === "master" && x){ msg.lingua = lingua; if(blocca) msg.blocca = true; }
    inviando = true; errore(""); panel.querySelector(".msg-invia").disabled = true; panel.querySelector(".msg-invia").textContent = "Invio…";
    Promise.all(dest.map(function(k){
      var tok = tokPer(k);
      return modificaFile(tok, OWNER + "/tcj-" + k, MSGF, function(d){
        var m = Array.isArray(d.m) ? d.m : [];
        var mm = msg; if(msg.lingua){ mm = JSON.parse(JSON.stringify(msg)); mm.dest = k; }
        m.push(mm);
        /* restano gli ultimi 80 messaggi, e le immagini solo negli ultimi 15 */
        if(m.length > 80) m = m.slice(-80);
        var conImg = 0; for(var i = m.length - 1; i >= 0; i--){ if(m[i].img){ conImg++; if(conImg > 15){ delete m[i].img; m[i].imgVia = 1; } } }
        d.m = m; d.tipo = "messaggi";
      }, "Messaggio " + (me === "master" ? "del Master" : "di " + (CORTO[me] || me))).then(function(d){ CONV[k].m = d.m; CONV[k].etag = null; salvaJ("tcjmsg_" + k, { m: d.m.slice(-60) }); });
    })).then(function(){
      inviando = false; allegato = null;
      if(!panel) return;
      t = panel.querySelector("#msg-txt"); if(t) t.value = "";
      disegnaPanel(); suono("ping");
    }).catch(function(e){
      inviando = false;
      var st = e && e.status;
      errore(st === 401 ? "Il token di questo dispositivo non è più valido." : st === 404 || st === 403 ? "Il token di questo dispositivo non può scrivere i messaggi." : st === 413 || st === 422 ? "Immagine troppo grande: prova con una più piccola." : "Messaggio non inviato: controlla la connessione e riprova.");
      var b = panel && panel.querySelector(".msg-invia"); if(b){ b.disabled = false; b.textContent = "Invia"; }
    });
  }
  /* «Il Master ti mostra»: immagine o messaggio in grande, si chiude quando si vuole */
  function mostraASchermo(x, rivedi){
    var o = document.createElement("div"); o.className = "msg-show"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Il Master ti mostra");
    o.innerHTML = '<div class="msg-show-box"><div class="msg-show-h">' + (x.da === "master" ? (rivedi ? "Immagine" : "Il Master ti mostra") : "Da " + esc(CORTO[x.da] || x.da)) + '</div>'
      + (function(){ var me = io(), T = testoMsg(x, me); return (x.img && !T.gfImg ? '<img src="' + x.img + '" alt="Immagine mandata dal Master">' : "") + (T.html ? '<div class="msg-show-x">' + T.html + '</div>' : ""); })()
      + '<button type="button" class="msg-show-c">Chiudi</button></div>';
    document.body.appendChild(o);
    function via(){ if(o.parentNode) o.parentNode.removeChild(o); }
    o.addEventListener("click", function(e){ if(e.target === o || e.target.closest(".msg-show-c")) via(); });
    o.addEventListener("keydown", function(e){ if(e.key === "Escape") via(); });
    setTimeout(function(){ try { o.querySelector(".msg-show-c").focus({ preventScroll: true }); } catch(e){} }, 30);
    if(!rivedi) suono("bell");
  }

  /* =================== quello che serve al capitolo del Master =================== */
  window.SESS = {
    doc: function(){ return doc; }, on: function(f){ ascS.push(f); }, leggi: leggiSessioni, modifica: modificaSessioni,
    leggiFile: leggiFile, tokMaster: tokMaster, OWNER: OWNER, GRUPPO: GRUPPO, CH: CH, NOME: NOME, CORTO: CORTO, EMO: EMO,
    mostra: function(s, come){ segnaVista(s.id); mostraScena(s, come); }, esc: esc, dataIt: dataIt, oraIt: oraIt, int: int,
    /* immagine (data URL) salvata come file nel repository del gruppo: per il gallifreyano ufficiale del riassunto */
    caricaImmagine: function(path, dataUrl){
      var tok = tokMaster(), b64 = String(dataUrl).split(",")[1] || "";
      return gh(tok, "GET", GRUPPO, "/contents/" + path).then(function(r){ return r.ok ? r.json() : {}; }).then(function(j){
        var corpo = { message: "Immagine in gallifreyano · " + path, content: b64 }; if(j && j.sha) corpo.sha = j.sha;
        return gh(tok, "PUT", GRUPPO, "/contents/" + path, corpo).then(function(r){ if(!r.ok) throw r; delete IMG[path]; return path; });
      });
    },
    apriMessaggi: function(k){ apriPanel(k); }
  };

  /* avvio: dopo che il resto della pagina ha preparato aree e token */
  function avvio(){ giroS(); giroM(); }
  if(document.readyState === "complete") setTimeout(avvio, 1200); else window.addEventListener("load", function(){ setTimeout(avvio, 1200); });
  /* aprendo o chiudendo un'area (o la Zona Master) cambia chi può scrivere: ridisegno la linguetta */
  setInterval(function(){ if(!document.hidden) disegnaTab(); }, 4000);
})();
