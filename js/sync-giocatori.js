/* Aree dei giocatori: salvataggio online separato per ogni personaggio.
   Ogni giocatore ha un piccolo repository GitHub privato (es. Zzago-DM/tcj-athena) e un token che vale solo lì.
   All'apertura dell'area il sito scarica l'ultima versione; con "Salva online" la carica.
   Il token si incolla una volta per dispositivo e resta salvato SOLO in quel browser: non è mai scritto nel codice del sito.

   Cosa c'è nel "pacchetto" di ogni personaggio (chiavi del browser):
     tcj-sc4-<pg>  scheda, licenza, ritratto, sigillo, note personali
     tcj-al-<pg>   alloggio sulla nave
     tcj_bg_<pg>   tema e sfondo scelti
     tcj-n-<pg>    vecchie note (sezione Note)
   Restano invece in comune o solo locali: nave, note sui Mael, note del Master, preferenze del sito. */
(function(){
  var OWNER = "Zzago-DM";                 // proprietario dei repository dei giocatori
  var FILE = "dati.json";                 // nome del file nel repository di ogni giocatore
  var API = "https://api.github.com/repos/";
  var CH = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []).map(function(c){ return c.k; });
  if(!CH.length) return;
  var NOMI = {}; SC_CHARS.forEach(function(c){ NOMI[c.k] = (typeof PA_FULL !== "undefined" && PA_FULL[c.k]) || c.n; });

  /* ---------- chiavi di ogni personaggio ---------- */
  function chiavi(k){ var l = ["tcj-sc4-"+k, "tcj-al-"+k, "tcj_bg_"+k, "tcj-n-"+k]; if(k === CH[0]) l.push("tcj-sc4"); return l; }
  function diChi(key){
    if(key === "tcj-sc4") return CH[0];
    var m = /^(?:tcj-sc4-|tcj-al-|tcj_bg_|tcj-n-)(.+)$/.exec(key);
    return m && CH.indexOf(m[1]) >= 0 ? m[1] : null;
  }

  /* ---------- stato del collegamento (fuori dal backup: il prefisso non è "tcj-") ---------- */
  function stato(k){ try { return JSON.parse(localStorage.getItem("tcjgh_"+k) || "null") || {}; } catch(e){ return {}; } }
  function salvaStato(k, s){ try { _orig.setItem.call(localStorage, "tcjgh_"+k, JSON.stringify(s)); } catch(e){} }
  function master(){ try { return JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}; } catch(e){ return {}; } }
  function inMaster(){ try { return typeof paMaster === "function" && paMaster(); } catch(e){ return false; } }
  function cred(k){   /* il token del giocatore ha la precedenza; in modalità Master si usa quello del Master */
    var s = stato(k); if(s.token && s.repo) return {token:s.token, repo:s.repo, chi:"giocatore"};
    var m = master(); if(m.token && inMaster()) return {token:m.token, repo:OWNER+"/tcj-"+k, chi:"master"};
    return null;
  }
  function collegato(k){ return !!cred(k); }

  /* ---------- ogni modifica locale di un personaggio collegato lo segna "da salvare online" ---------- */
  var muto = false, _orig = { setItem: Storage.prototype.setItem, removeItem: Storage.prototype.removeItem };
  function segna(key, prima, dopo){
    if(muto || prima === dopo) return;
    var k = diChi(key); if(!k) return;
    var s = stato(k); s.dirty = true; s.loc = new Date().toISOString(); salvaStato(k, s);
    if(k === scCur) disegna();
  }
  Storage.prototype.setItem = function(key, val){
    var prima = (this === localStorage) ? this.getItem(key) : null;
    _orig.setItem.call(this, key, val);
    if(this === localStorage) segna(key, prima, String(val));
  };
  Storage.prototype.removeItem = function(key){
    var prima = (this === localStorage) ? this.getItem(key) : null;
    _orig.removeItem.call(this, key);
    if(this === localStorage && prima !== null) segna(key, prima, null);
  };

  /* ---------- GitHub ---------- */
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i=0;i<by.length;i+=0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i+0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g,"")), by = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(s, metodo, percorso, corpo){
    var h = { "Authorization": "Bearer "+s.token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(corpo) h["Content-Type"] = "application/json";
    return fetch(API + s.repo + percorso, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function errore(r){
    if(!r) return "Connessione assente: controlla internet e riprova.";
    if(r.status === 401) return "Il token non è valido (o è stato revocato). Chiedi al Master un token nuovo.";
    if(r.status === 403) return "Il token non ha il permesso di scrivere: serve «Contents: Read and write».";
    if(r.status === 404) return "Repository non trovato, oppure il token non vale per questo repository.";
    return "GitHub ha risposto con un errore ("+r.status+"). Riprova tra poco.";
  }
  function scarica(s){   // -> {stato:"ok", dati, sha} | {stato:"vuoto"} | {stato:"errore", msg}
    return gh(s, "GET", "/contents/"+FILE).then(function(r){
      if(r.status === 404) return gh(s, "GET", "").then(function(r2){ return r2.ok ? {stato:"vuoto"} : {stato:"errore", msg:errore(r2)}; });
      if(!r.ok) return {stato:"errore", msg:errore(r)};
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(s, "GET", "/git/blobs/"+j.sha).then(function(r3){ return r3.json(); }).then(function(b){ return b.content; });
        return c.then(function(b64){ return {stato:"ok", dati: JSON.parse(b64d(b64)), sha: j.sha}; });
      });
    }).catch(function(){ return {stato:"errore", msg:errore(null)}; });
  }

  /* ---------- pacchetto locale <-> online ---------- */
  function pacchetto(k){
    var d = {}; chiavi(k).forEach(function(key){ var v = localStorage.getItem(key); if(v !== null) d[key] = v; });
    return { app: "the-careless-journey", tipo: "area-giocatore", v: 1, personaggio: k, salvato: new Date().toISOString(), data: d };
  }
  function haDati(k){ return chiavi(k).some(function(key){ return localStorage.getItem(key) !== null; }); }
  function applica(k, rem, sha){
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    muto = true;
    try {
      chiavi(k).forEach(function(key){ if(rem.data && Object.prototype.hasOwnProperty.call(rem.data, key)) _orig.setItem.call(localStorage, key, rem.data[key]); else _orig.removeItem.call(localStorage, key); });
    } finally { muto = false; }
    var s = stato(k); s.at = rem.salvato; s.sha = sha; s.dirty = false; salvaStato(k, s);
    try { if(k === scCur && typeof scBuild === "function") scBuild(); } catch(e){}
    try { if(typeof alCur !== "undefined" && alCur === k && typeof alRender === "function") alRender(); } catch(e){}
    try { if(k === scCur && typeof paTheme === "function") paTheme(); } catch(e){}
    disegna();
  }

  var occupato = {};
  function scaricaAll(k, silenzioso){
    var c = cred(k); if(!c || occupato[k]) return Promise.resolve();
    occupato[k] = 1; disegna();
    return scarica(c).then(function(res){
      occupato[k] = 0;
      if(res.stato === "errore"){ avviso(res.msg, true); disegna(); return; }
      if(res.stato === "vuoto"){ if(!silenzioso) avviso("Online non c'è ancora nulla: premi «Salva online» per caricare l'area di "+NOMI[k]+"."); disegna(); return; }
      var rem = res.dati, s2 = stato(k);
      if(rem.salvato === s2.at){ s2.sha = res.sha; salvaStato(k, s2); disegna(); return; }               // già allineati
      if(!s2.dirty || !haDati(k)){ applica(k, rem, res.sha); avviso("Area di "+NOMI[k]+" aggiornata con la versione online del "+quando(rem.salvato)+"."); return; }
      conflitto(k, rem, res.sha);                                                                          // modifiche da entrambe le parti
    });
  }
  function scaricaManuale(k){
    var c = cred(k); if(!c){ finestraCollega(k); return; } if(occupato[k]) return;
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    occupato[k] = 1; disegna();
    scarica(c).then(function(res){
      occupato[k] = 0; disegna();
      if(res.stato === "errore"){ avviso(res.msg, true); return; }
      if(res.stato === "vuoto"){ avviso("Online non c'è ancora nulla da scaricare: prima premi «Salva online».", true); return; }
      var rem = res.dati, s2 = stato(k);
      if(s2.dirty && haDati(k)){ sostituisci(k, rem, res.sha); return; }
      if(rem.salvato === s2.at){ s2.sha = res.sha; salvaStato(k, s2); avviso("Hai già l'ultima versione online (" + quando(rem.salvato) + ")."); return; }
      applica(k, rem, res.sha); avviso("Scaricata la versione online del " + quando(rem.salvato) + ". ✓"); try{ sfxPlay("paper"); }catch(e){}
    });
  }
  function sostituisci(k, rem, sha){
    var s = stato(k);
    ov.innerHTML = '<div class="gh-box2"><div class="gh-t">Scaricare la versione online?</div>'
      + '<p class="gh-p">Su questo dispositivo ci sono modifiche <b>non ancora salvate online</b>'+(s.loc?' (del <b>'+quando(s.loc)+'</b>)':'')+'. Se scarichi la versione online del <b>'+quando(rem.salvato)+'</b>, quelle modifiche andranno perse.</p>'
      + '<div class="gh-row gh-col"><button type="button" class="bk-btn" id="gh-rem">⬇ Scarica comunque</button>'
      + '<button type="button" class="bk-btn" id="gh-loc">⬆ No, prima salva online le mie</button>'
      + '<button type="button" class="bk-btn" id="gh-dopo">Annulla</button></div></div>';
    ov.hidden = false;
    document.getElementById("gh-rem").onclick = function(){ chiudi(); applica(k, rem, sha); avviso("Scaricata la versione online. ✓"); };
    document.getElementById("gh-loc").onclick = function(){ chiudi(); var s2 = stato(k); s2.sha = sha; salvaStato(k, s2); caricaOnline(k, true); };
    document.getElementById("gh-dopo").onclick = chiudi;
  }
  function caricaOnline(k, forza){
    var s = stato(k), c = cred(k); if(!c || occupato[k]) return;
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    occupato[k] = 1; disegna();
    var p = pacchetto(k), corpo = { message: "Area di "+NOMI[k]+" — "+quando(p.salvato)+(c.chi === "master" ? " (dal Master)" : ""), content: b64e(JSON.stringify(p)) };
    if(s.sha) corpo.sha = s.sha;
    var invia = forza ? scarica(c).then(function(res){ if(res.sha) corpo.sha = res.sha; }) : Promise.resolve();
    invia.then(function(){ return gh(c, "PUT", "/contents/"+FILE, corpo); }).then(function(r){
      occupato[k] = 0;
      if(r.status === 409 || r.status === 422){             // online c'è una versione che questo dispositivo non conosce
        return scarica(c).then(function(res){ if(res.stato === "ok") conflitto(k, res.dati, res.sha); else avviso(res.msg || errore(r), true); disegna(); });
      }
      if(!r.ok){ avviso(errore(r), true); disegna(); return; }
      return r.json().then(function(j){ var s2 = stato(k); s2.sha = j.content && j.content.sha; s2.at = p.salvato; s2.dirty = false; salvaStato(k, s2); disegna(); avviso(c.chi === "master" ? "Area di "+NOMI[k]+" salvata online (Master) ✓" : "Salvato online ✓"); try{ sfxPlay("seal"); }catch(e){} });
    }).catch(function(){ occupato[k] = 0; avviso(errore(null), true); disegna(); });
  }

  /* ---------- interfaccia ---------- */
  function quando(iso){ try { return new Date(iso).toLocaleString("it-IT", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"}); } catch(e){ return iso; } }
  var bar = document.querySelector("#pa-body .pa-bar"), box;
  if(bar){
    box = document.createElement("span"); box.className = "gh-box";
    var lock = document.getElementById("pa-lockbtn"); bar.insertBefore(box, lock);
  }
  var sez = document.getElementById("sv-onl");
  function statoTesto(k, s){
    return occupato[k] ? '<span class="gh-st">⟳ Sincronizzo…</span>'
         : !cred(k) ? '<span class="gh-st">☁ Online non collegato</span>'
         : s.dirty ? '<span class="gh-st gh-warn">● Modifiche da salvare online</span>'
         : s.at ? '<span class="gh-st gh-ok">☁ Salvato online · '+quando(s.at)+'</span>' : '<span class="gh-st">☁ Collegato · niente salvato ancora</span>';
  }
  function disegna(){
    var k = scCur, s = stato(k), dis = occupato[k] ? ' disabled' : '';
    if(box) box.innerHTML = statoTesto(k, s)
      + (cred(k) ? '<button type="button" class="bk-btn gh-btn gh-save" data-gh="salva"'+dis+'>☁ Salva online</button>' : '')
      + '<button type="button" class="bk-btn gh-btn" data-gh="vai">💾 Salvataggi</button>';
    if(sez){
      var h = '<div class="sv-h"><span class="sv-i">☁</span>Online</div>';
      var cc = cred(k);
      if(!cc){
        h += '<p class="sv-p">Salva l\'area su internet per ritrovarla su <b>qualsiasi dispositivo</b>. Ti serve il token che ti ha dato il Master: si incolla una volta sola per dispositivo.</p>'
           + '<div class="sv-btns"><button class="bk-btn gh-save" type="button" data-gh="collega">☁ Collega</button></div>';
      } else {
        h += '<p class="sv-p sv-state">'+statoTesto(k, s)+(cc.chi === "master" ? ' <span class="gh-st gh-m">· con il token del Master</span>' : '')+'</p>'
           + '<p class="sv-p"><b>Salva online</b> carica l\'area su internet. <b>Scarica da online</b> riprende l\'ultima versione salvata e sostituisce quella di questo dispositivo. All\'apertura dell\'area lo scaricamento avviene da solo.</p>'
           + '<div class="sv-btns"><button class="bk-btn gh-save" type="button" data-gh="salva"'+dis+'>⬆ Salva online</button>'
           + '<button class="bk-btn" type="button" data-gh="scarica"'+dis+'>⬇ Scarica da online</button>'
           + '<button class="bk-btn gh-cfg" type="button" data-gh="impostazioni" title="Token e repository" aria-label="Impostazioni del salvataggio online">⚙</button></div>';
      }
      sez.innerHTML = h;
    }
  }
  function clic(e){
    var b = e.target.closest("[data-gh]"); if(!b || b.disabled) return;
    var a = b.getAttribute("data-gh");
    if(a === "salva") caricaOnline(scCur);
    else if(a === "scarica") scaricaManuale(scCur);
    else if(a === "vai"){ var c = document.getElementById("sv-card"); if(c){ c.scrollIntoView({behavior:"smooth", block:"center"}); c.classList.remove("sv-flash"); void c.offsetWidth; c.classList.add("sv-flash"); } }
    else finestraCollega(scCur);
  }
  if(box) box.addEventListener("click", clic);
  if(sez) sez.addEventListener("click", clic);

  var ov = document.createElement("div"); ov.className = "gh-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true"); ov.hidden = true;
  document.body.appendChild(ov);
  function chiudi(){ ov.hidden = true; ov.innerHTML = ""; }
  ov.addEventListener("click", function(e){ if(e.target === ov) chiudi(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !ov.hidden){ e.stopPropagation(); chiudi(); } }, true);

  function finestraCollega(k){
    var s = stato(k), repo = s.repo || (OWNER+"/tcj-"+k);
    ov.innerHTML = '<div class="gh-box2"><div class="gh-t">Salvataggio online · '+NOMI[k]+'</div>'
      + '<p class="gh-p">Incolla il token che ti ha dato il Master. Resta salvato <b>solo su questo dispositivo</b>; sugli altri andrà incollato di nuovo. Il token apre soltanto l\'area di '+NOMI[k]+'.</p>'
      + '<label class="gh-l">Token<input type="password" id="gh-tok" autocomplete="off" spellcheck="false" placeholder="github_pat_…" value="'+(s.token?"••••••••":"")+'"></label>'
      + '<label class="gh-l">Repository<input type="text" id="gh-repo" autocomplete="off" spellcheck="false" value="'+repo+'"></label>'
      + '<div class="gh-err" id="gh-err"></div>'
      + '<div class="gh-row"><button type="button" class="bk-btn" id="gh-ok">Collega</button>'
      + (s.token ? '<button type="button" class="bk-btn" id="gh-off">Scollega questo dispositivo</button>' : '')
      + '<button type="button" class="bk-btn" id="gh-no">Annulla</button></div></div>';
    ov.hidden = false;
    var tok = document.getElementById("gh-tok"); tok.focus(); if(s.token) tok.select();
    document.getElementById("gh-no").onclick = chiudi;
    if(s.token) document.getElementById("gh-off").onclick = function(){ _orig.removeItem.call(localStorage, "tcjgh_"+k); chiudi(); disegna(); avviso("Scollegato: l'area resta salvata in questo browser."); };
    document.getElementById("gh-ok").onclick = function(){
      var t = tok.value.trim(), r = document.getElementById("gh-repo").value.trim().replace(/^https?:\/\/github\.com\//,"").replace(/\/+$/,"");
      if(t === "••••••••") t = s.token;
      var er = document.getElementById("gh-err");
      if(!t || !/^[\w.-]+\/[\w.-]+$/.test(r)){ er.textContent = "Servono il token e il repository nella forma proprietario/nome."; return; }
      er.textContent = "Controllo…";
      gh({token:t, repo:r}, "GET", "").then(function(res){
        if(!res.ok){ er.textContent = errore(res); return; }
        var n = stato(k); if(n.repo !== r){ n.sha = null; n.at = null; } n.token = t; n.repo = r; n.dirty = haDati(k) && !n.at ? true : !!n.dirty; salvaStato(k, n);
        chiudi(); disegna(); try{ sfxPlay("on"); }catch(e){}
        scaricaAll(k, false);
      }).catch(function(){ er.textContent = errore(null); });
    };
  }
  function conflitto(k, rem, sha){
    var s = stato(k);
    ov.innerHTML = '<div class="gh-box2"><div class="gh-t">Due versioni dell\'area di '+NOMI[k]+'</div>'
      + '<p class="gh-p">Online c\'è una versione salvata il <b>'+quando(rem.salvato)+'</b> (forse da un altro dispositivo), ma anche qui ci sono modifiche non salvate'+(s.loc?' del <b>'+quando(s.loc)+'</b>':'')+'. Quale vuoi tenere?</p>'
      + '<div class="gh-row gh-col"><button type="button" class="bk-btn" id="gh-rem">⬇ Tieni quella online</button>'
      + '<button type="button" class="bk-btn" id="gh-loc">⬆ Tieni questa e salvala online</button>'
      + '<button type="button" class="bk-btn" id="gh-dopo">Decido dopo</button></div>'
      + '<p class="gh-p gh-small">Per sicurezza, prima di scegliere puoi scaricare un backup dal riquadro «Backup dei dati».</p></div>';
    ov.hidden = false;
    document.getElementById("gh-rem").onclick = function(){ chiudi(); applica(k, rem, sha); avviso("Tenuta la versione online."); };
    document.getElementById("gh-loc").onclick = function(){ chiudi(); var s2 = stato(k); s2.sha = sha; salvaStato(k, s2); caricaOnline(k, true); };
    document.getElementById("gh-dopo").onclick = function(){ chiudi(); disegna(); };
  }
  var toast = document.createElement("div"); toast.className = "gh-toast"; toast.setAttribute("role","status"); document.body.appendChild(toast);
  function avviso(msg, err){ toast.textContent = msg; toast.classList.toggle("err", !!err); toast.classList.remove("on"); void toast.offsetWidth; toast.classList.add("on"); clearTimeout(avviso._t); avviso._t = setTimeout(function(){ toast.classList.remove("on"); }, err ? 6000 : 3200); }

  /* ---------- quando scaricare ---------- */
  if(typeof paSetOpen === "function"){                       // apertura di un'area (codice giusto, anche dagli alloggi)
    var _pso = paSetOpen;
    paSetOpen = function(k, on){ var era = paOpenList().indexOf(k) >= 0; _pso(k, on); if(on && !era && collegato(k)) setTimeout(function(){ scaricaAll(k, true); }, 50); };
  }
  if(typeof scBuild === "function"){                          // cambio di personaggio: aggiorna il riquadro
    var _scb = scBuild; scBuild = function(){ var r = _scb.apply(this, arguments); disegna(); return r; };
  }
  paOpenList().forEach(function(k){ if(collegato(k)) scaricaAll(k, true); });   // aree già aperte al caricamento della pagina
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) paOpenList().forEach(function(k){ if(collegato(k) && !stato(k).dirty) scaricaAll(k, true); }); });
  window.addEventListener("beforeunload", function(e){                         // promemoria prima di chiudere
    var da = CH.filter(function(k){ var s = stato(k); return cred(k) && s.dirty; });
    if(da.length){ e.preventDefault(); e.returnValue = ""; }
  });
  window.ghSync = { scarica: scaricaAll, scaricaOra: scaricaManuale, salva: caricaOnline, stato: stato };
  /* ---------- Zona Master: token del Master e quadro delle tre aree ---------- */
  var mb = document.getElementById("mgh-body");
  function disegnaMaster(){
    if(!mb) return;
    var m = master();
    if(!m.token){
      mb.innerHTML = '<div class="mgh-set"><p class="sv-p">Incolla il token del Master: un token fine-grained valido per <b>tcj-athena</b>, <b>tcj-panlan</b> e <b>tcj-asonnes</b>, con <b>Contents: Read and write</b>. Resta solo su questo dispositivo.</p>'
        + '<div class="mgh-row"><input type="password" id="mgh-tok" autocomplete="off" spellcheck="false" placeholder="github_pat_…"><button type="button" class="bk-btn" data-mg="collega">☁ Collega</button></div><div class="gh-err" id="mgh-err"></div></div>';
      return;
    }
    var h = '<div class="mgh-list">';
    CH.forEach(function(k){
      var s = stato(k), dis = occupato[k] ? ' disabled' : '', proprio = !!(s.token && s.repo);
      h += '<div class="mgh-it"><div class="mgh-n">'+NOMI[k]+'<small>'+OWNER+'/tcj-'+k+(proprio?' · su questo dispositivo usa il token del giocatore':'')+'</small></div>'
        + '<div class="mgh-s">'+statoTesto(k, s)+'</div>'
        + '<div class="mgh-b"><button type="button" class="bk-btn" data-mg="apri" data-k="'+k+'">Apri l\'area</button>'
        + '<button type="button" class="bk-btn" data-mg="scarica" data-k="'+k+'"'+dis+'>⬇ Scarica</button>'
        + '<button type="button" class="bk-btn gh-save" data-mg="salva" data-k="'+k+'"'+dis+'>⬆ Salva online</button></div></div>';
    });
    h += '</div><div class="mgh-row mgh-foot"><button type="button" class="bk-btn" data-mg="tutte">⬇ Scarica tutte</button><button type="button" class="bk-btn" data-mg="scollega">Scollega il token del Master</button></div>';
    mb.innerHTML = h;
  }
  if(mb) mb.addEventListener("click", function(e){
    var b = e.target.closest("[data-mg]"); if(!b || b.disabled) return;
    var a = b.getAttribute("data-mg"), k = b.getAttribute("data-k");
    if(a === "collega"){
      var t = (document.getElementById("mgh-tok").value || "").trim(), er = document.getElementById("mgh-err");
      if(!t){ er.textContent = "Incolla il token."; return; }
      er.textContent = "Controllo i tre repository…";
      Promise.all(CH.map(function(c){ return gh({token:t, repo:OWNER+"/tcj-"+c}, "GET", "").then(function(r){ return r.ok ? null : NOMI[c]+": "+errore(r); }).catch(function(){ return errore(null); }); })).then(function(errs){
        errs = errs.filter(Boolean);
        if(errs.length){ er.innerHTML = errs.join("<br>"); return; }
        try { _orig.setItem.call(localStorage, "tcjgh_master", JSON.stringify({token:t})); } catch(_){}
        try{ sfxPlay("on"); }catch(_){}
        avviso("Token del Master collegato: scarico le tre aree…");
        disegnaMaster(); disegna(); CH.forEach(function(c){ scaricaAll(c, true); });
      });
    }
    else if(a === "scollega"){ if(!confirm("Togliere il token del Master e i contenuti della Zona Master da questo dispositivo?")) return; ["tcjgh_master","tcjgh_mcache","tcjgh_mlock","tcjgh_mfirst"].forEach(function(x){ _orig.removeItem.call(localStorage, x); }); location.reload(); }
    else if(a === "tutte") CH.forEach(function(c){ scaricaManuale(c); });
    else if(a === "scarica") scaricaManuale(k);
    else if(a === "salva") caricaOnline(k);
    else if(a === "apri"){ try { scSwitch(k); } catch(_){} var sc = document.getElementById("scheda"); if(sc) sc.scrollIntoView({behavior:"smooth"}); }
  });
  var _dis = disegna; disegna = function(){ _dis(); disegnaMaster(); };
  if(typeof revealMaster === "function"){                      // all'ingresso nella Zona Master scarica le tre aree
    var _rm = revealMaster;
    revealMaster = function(){ var r = _rm.apply(this, arguments); if(master().token){ CH.forEach(function(c){ if(!stato(c).dirty) scaricaAll(c, true); }); } disegna(); return r; };
  }
  disegna();
})();
