/* Aree dei giocatori: salvataggio online separato per ogni personaggio.
   Ogni giocatore ha un piccolo repository GitHub privato (es. Zzago-DM/tcj-athena) e un token che vale solo lì.
   All'apertura dell'area il sito scarica l'ultima versione; con "Salva online" la carica.
   Il token si incolla una volta per dispositivo e resta salvato SOLO in quel browser: non è mai scritto nel codice del sito.

   Cosa c'è nel "pacchetto" di ogni personaggio (chiavi del browser):
     tcj-sc4-<pg>  scheda, licenza, ritratto, sigillo, note personali
     tcj-al-<pg>   alloggio sulla nave
     tcj_bg_<pg>   tema e sfondo scelti
     tcj-n-<pg>    vecchie note (sezione Note)
     tcj-inc-<pg>  note personali sui personaggi incontrati (sezione Incontri)
     tcj-rel-<pg>  note personali sulle reliquie (Nave › Stanza delle Reliquie)
     tcj-lay-<pg>  disposizione dei riquadri dell'Area dello Slayer (✎ Modifica area)
     tcj-vg-<pg>   la nave sulla Mappa del Mondo: dove si trova e il viaggio in corso (⛵ Viaggi)
     tcj-asp-<pg>  aspetto dell'Area dello Slayer: libri, ampolle, cassettiera… e le ampolle personalizzate (js/area-aspetto.js)
   Restano invece in comune o solo locali: nave, note sui Mael, note del Master, preferenze del sito. */
(function(){
  var OWNER = "Zzago-DM";                 // proprietario dei repository dei giocatori
  var FILE = "dati.json";                 // nome del file nel repository di ogni giocatore
  var API = "https://api.github.com/repos/";
  var CH = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []).map(function(c){ return c.k; });
  if(!CH.length) return;
  var NOMI = {}; SC_CHARS.forEach(function(c){ NOMI[c.k] = (typeof PA_FULL !== "undefined" && PA_FULL[c.k]) || c.n; });

  /* ---------- chiavi di ogni personaggio ---------- */
  function chiavi(k){ var l = ["tcj-sc4-"+k, "tcj-al-"+k, "tcj_bg_"+k, "tcj-n-"+k, "tcj-inc-"+k, "tcj-rel-"+k, "tcj-lay-"+k, "tcj-vg-"+k, "tcj-asp-"+k]; if(k === CH[0]) l.push("tcj-sc4"); return l; }
  function diChi(key){
    if(key === "tcj-sc4") return CH[0];
    var m = /^(?:tcj-sc4-|tcj-al-|tcj_bg_|tcj-n-|tcj-inc-|tcj-rel-|tcj-lay-|tcj-vg-|tcj-asp-)(.+)$/.exec(key);
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
    annuncia(k, "modifica");
  }
  /* avvisa gli altri script (es. js/diretta-schede.js) che l'area di un personaggio è cambiata */
  function annuncia(k, motivo){ try { document.dispatchEvent(new CustomEvent("tcj-area", { detail: { k: k, motivo: motivo } })); } catch(e){} }
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
    if(haDati(k)){ try { _orig.setItem.call(localStorage, "tcjgh_prev_"+k, JSON.stringify({ at: new Date().toISOString(), loc: stato(k).loc || null, data: pacchetto(k).data })); } catch(e){} }   /* copia di sicurezza: «Annulla l'ultimo scaricamento» */
    muto = true;
    try {
      chiavi(k).forEach(function(key){ if(rem.data && Object.prototype.hasOwnProperty.call(rem.data, key)) _orig.setItem.call(localStorage, key, rem.data[key]); else _orig.removeItem.call(localStorage, key); });
    } finally { muto = false; }
    var s = stato(k); s.at = rem.salvato; s.sha = sha; s.dirty = false; salvaStato(k, s);
    try { if(k === scCur && typeof scBuild === "function") scBuild(); } catch(e){}
    try { if(typeof alCur !== "undefined" && alCur === k && typeof alRender === "function") alRender(); } catch(e){}
    try { if(k === scCur && typeof paTheme === "function") paTheme(); } catch(e){}
    disegna();
    annuncia(k, "scaricata");
  }

  /* ---------- confronto tra due versioni di un'area ---------- */
  var LIC = [["nome","Nome completo"],["titolo","Soprannome / Titolo"],["eta","Età"],["giorno","Giorno di nascita"],["triade","Triade"],["aether","Aether di affinità"],["continente","Continente d'origine"],["terra","Terra natale"],["casata","Casata / Affiliazione"],["segni","Segni particolari"],["motto","Motto"]];
  var CAMPI = [["lvl","Livello"],["rango","Rango"],["pv","PV"],["pvmax","PV massimi"],["arma","Arma"],["wcat","Categoria dell'arma"],["abil","Abilità"],["arma2","Seconda arma"],["arma2t","Tipo della seconda arma"],["proiettili","Proiettili"],["equip","Equipaggiamento"],["natt","Nucleo d'attacco"],["ndef","Nucleo di difesa"],["malus","Malus"],["benny","Benny"],["ispirazione","Ispirazione"]];
  function js(v){ try { return JSON.parse(v); } catch(e){ return null; } }
  function txt(v){ if(v === undefined || v === null) return ""; if(typeof v === "boolean") return v ? "Sì" : ""; return String(v).trim(); }
  function riassunto(map, k){
    var R = [], sc = js(map["tcj-sc4-"+k] || (k === CH[0] ? map["tcj-sc4"] : null)) || {}, id = sc.id || {};
    function add(sez, et, v, mostra){ R.push({ sez: sez, et: et, v: txt(v), m: mostra !== undefined ? mostra : txt(v) }); }
    LIC.forEach(function(f){ add("Licenza", f[1], id[f[0]]); });
    add("Licenza", "Ritratto", id.ritratto || "", id.ritratto ? "Presente" : "");
    CAMPI.forEach(function(f){ add("Scheda", f[1], sc[f[0]]); });
    add("Scheda", "Stati alterati", typeof grStatiTesto === "function" ? grStatiTesto(sc.stati) : sc.stati);
    (typeof SC_STATS !== "undefined" ? SC_STATS : []).forEach(function(s){ var o = (sc.stats || {})[s.id] || {}; add("Statistiche", s.nm, txt(o.v) + (txt(o.m) ? " (" + txt(o.m) + ")" : "")); });
    var comp = (typeof SC_COMPS !== "undefined" ? SC_COMPS : []).filter(function(c){ return (sc.comps || {})[c.id]; }).map(function(c){ return c.nm; });
    add("Competenze", "Competenze attive", comp.join(", "));
    (typeof eqTesto === "function" ? eqTesto(sc) : []).forEach(function(e, i){ add("Equipaggiamento", "Riga " + (i+1), e); });
    (sc.celle || []).forEach(function(c, i){ if(txt(c)) add("Equipaggiamento", "Cella " + (i+1), c); });
    var cr = (typeof CROWNS !== "undefined" ? CROWNS : []).filter(function(_, i){ return (sc.crowns || [])[i]; }).map(function(c){ return c.n; });
    add("Corone", "Corone ottenute", cr.join(", "));
    (sc.notes || []).forEach(function(n, i){ add("Note personali", txt(n.t) || ("Sezione " + (i+1)), n.b); });
    var al = js(map["tcj-al-"+k]);
    if(al){ add("Alloggio", "Nome", al.t); (al.notes || []).forEach(function(n, i){ add("Alloggio", txt(n.t) || ("Sezione " + (i+1)), n.b); }); }
    var rn = js(map["tcj-rel-"+k]) || {}; Object.keys(rn).forEach(function(id, i){ add("Note sulle reliquie", "Nota " + (i+1), rn[id]); });
    add("Tema", "Tema e sfondo", map["tcj_bg_"+k] || "", map["tcj_bg_"+k] ? "Personalizzato" : "Predefinito");
    var vg = js(map["tcj-vg-"+k]); if(vg){ var VL = (typeof VG_LUOGHI !== "undefined") ? VG_LUOGHI : {}; var nm = function(x){ return (VL[x] && VL[x].nome) || x || ""; };
      add("Viaggi", "Posizione della nave", nm(vg.pos)); add("Viaggi", "Viaggio in corso", vg.v ? nm(vg.v.da) + " → " + nm(vg.v.a) : ""); }
    add("Tema", "Disposizione dei riquadri", map["tcj-lay-"+k] || "", map["tcj-lay-"+k] ? "Personalizzata" : "Originale");
    var asp = js(map["tcj-asp-"+k]); add("Tema", "Aspetto dell'area", map["tcj-asp-"+k] || "", asp && asp.s && asp.s !== "scheda" ? asp.s : "Scheda classica");
    return R;
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function corto(s){ s = String(s || ""); return s.length > 220 ? s.slice(0, 220) + "…" : s; }
  function differenze(mapA, mapB, k){
    var A = riassunto(mapA, k), B = riassunto(mapB, k), idx = {}, out = [];
    B.forEach(function(r){ idx[r.sez + "|" + r.et] = r; });
    A.forEach(function(r){ var b = idx[r.sez + "|" + r.et] || { v: "", m: "" }; delete idx[r.sez + "|" + r.et]; out.push({ sez: r.sez, et: r.et, a: r, b: b, diversa: r.v !== b.v }); });
    Object.keys(idx).forEach(function(key){ var b = idx[key]; out.push({ sez: b.sez, et: b.et, a: { v: "", m: "" }, b: b, diversa: b.v !== "" }); });
    return out;
  }
  /* modo: "conflitto" | "salva" | "scarica" */
  function confronto(k, modo, rem, sha, nota){
    var s = stato(k), righe = differenze(pacchetto(k).data, rem.data || {}, k), nd = righe.filter(function(r){ return r.diversa; }).length;
    var tit = { conflitto: "Due versioni dell'area di " + NOMI[k], salva: "Salvare online e sostituire?", scarica: "Scaricare la versione online?" }[modo];
    var spieg = { conflitto: "Online c'è una versione diversa da quella di questo dispositivo. Confrontale e scegli quale tenere: l'altra verrà sostituita.",
                  salva: "Stai per <b>sostituire la versione online</b> con quella di questo dispositivo. Ecco cosa cambia.",
                  scarica: "Stai per <b>sostituire la versione di questo dispositivo</b> con quella online. Ecco cosa cambia." }[modo];
    var h = '<div class="gh-box2 gh-cmp"><div class="gh-t">' + tit + '</div><p class="gh-p">' + spieg + '</p>' + (nota ? '<p class="gh-p gh-note">' + nota + '</p>' : '')
      + '<div class="cmp-head"><div class="cmp-col cmp-a"><b>📱 Su questo dispositivo</b><small>' + (s.loc ? 'modificata il ' + quando(s.loc) : 'nel browser') + '</small></div>'
      + '<div class="cmp-col cmp-b"><b>☁ Online</b><small>salvata il ' + quando(rem.salvato) + '</small></div></div>'
      + '<label class="cmp-solo"><input type="checkbox" id="cmp-solo" checked> Mostra solo le differenze <span class="cmp-n">(' + (nd ? nd + (nd === 1 ? " differenza" : " differenze") : "nessuna differenza") + ')</span></label>'
      + '<div class="cmp-list" id="cmp-list">';
    var sez = "";
    righe.forEach(function(r){
      if(r.sez !== sez){ sez = r.sez; h += '<div class="cmp-sez" data-s="' + esc(sez) + '">' + esc(sez) + '</div>'; }
      h += '<div class="cmp-r' + (r.diversa ? ' diff' : ' same') + '" data-s="' + esc(r.sez) + '"><div class="cmp-et">' + esc(r.et) + '</div>'
        + '<div class="cmp-v cmp-a">' + (r.a.m ? esc(corto(r.a.m)) : '<i>vuoto</i>') + '</div><div class="cmp-v cmp-b">' + (r.b.m ? esc(corto(r.b.m)) : '<i>vuoto</i>') + '</div></div>';
    });
    if(!nd) h += '<div class="cmp-uguali">Le due versioni sono uguali.</div>';
    h += '</div><div class="gh-row gh-col">';
    if(modo === "conflitto") h += '<button type="button" class="bk-btn gh-save" data-c="mia">⬆ Tieni quella di questo dispositivo e salvala online</button><button type="button" class="bk-btn" data-c="online">⬇ Tieni quella online</button><button type="button" class="bk-btn" data-c="no">Decido dopo</button>';
    if(modo === "salva") h += '<button type="button" class="bk-btn gh-save" data-c="mia">⬆ Salva online e sostituisci</button><button type="button" class="bk-btn" data-c="no">Annulla</button>';
    if(modo === "scarica") h += '<button type="button" class="bk-btn gh-save" data-c="online">⬇ Scarica e sostituisci questa</button><button type="button" class="bk-btn" data-c="mia">⬆ No, salva online la mia</button><button type="button" class="bk-btn" data-c="no">Annulla</button>';
    h += '</div><p class="gh-p gh-small">Prima di sostituire l\'area di questo dispositivo il sito ne tiene una copia: potrai tornare indietro con «↩ Annulla l\'ultimo scaricamento».</p></div>';
    ov.innerHTML = h; ov.hidden = false;
    var list = document.getElementById("cmp-list"), solo = document.getElementById("cmp-solo");
    function filtra(){ list.classList.toggle("solo", solo.checked); list.querySelectorAll(".cmp-sez").forEach(function(sx){ var any = list.querySelector('.cmp-r.diff[data-s="' + sx.getAttribute("data-s") + '"]'); sx.classList.toggle("vuota", !any); }); }
    solo.onchange = filtra; filtra();
    ov.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(){
      var c = b.getAttribute("data-c"); chiudi();
      if(c === "mia"){ var s2 = stato(k); s2.sha = sha; salvaStato(k, s2); caricaOnline(k, true); }
      else if(c === "online"){ applica(k, rem, sha); avviso("Tenuta la versione online del " + quando(rem.salvato) + ". ✓"); try{ sfxPlay("paper"); }catch(e){} }
      else disegna();
    }; });
  }
  function annullaScaricamento(k){
    var p = js(localStorage.getItem("tcjgh_prev_"+k) || "null"); if(!p || !p.data) return;
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    chiavi(k).forEach(function(key){ if(Object.prototype.hasOwnProperty.call(p.data, key)) localStorage.setItem(key, p.data[key]); else localStorage.removeItem(key); });
    _orig.removeItem.call(localStorage, "tcjgh_prev_"+k);
    var s = stato(k); s.dirty = true; s.loc = p.loc || new Date().toISOString(); salvaStato(k, s);
    try { if(k === scCur && typeof scBuild === "function") scBuild(); } catch(e){}
    try { if(typeof alCur !== "undefined" && alCur === k && typeof alRender === "function") alRender(); } catch(e){}
    try { if(k === scCur && typeof paTheme === "function") paTheme(); } catch(e){}
    disegna(); avviso("Ripristinata la versione che c'era prima dello scaricamento. Se è quella giusta, premi «Salva online».");
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
      confronto(k, "conflitto", rem, res.sha);                                                           // modifiche da entrambe le parti
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
      if(!haDati(k)){ applica(k, rem, res.sha); avviso("Scaricata la versione online del " + quando(rem.salvato) + ". ✓"); return; }
      var nd = differenze(pacchetto(k).data, rem.data || {}, k).filter(function(r){ return r.diversa; }).length;
      if(!nd){ s2.sha = res.sha; s2.at = rem.salvato; s2.dirty = false; salvaStato(k, s2); disegna(); avviso("Hai già la versione online (" + quando(rem.salvato) + "): sono uguali."); return; }
      confronto(k, "scarica", rem, res.sha, s2.dirty ? "⚠ Su questo dispositivo ci sono modifiche <b>non ancora salvate online</b>." : "");
    });
  }
  function caricaOnline(k, forza){
    var s = stato(k), c = cred(k); if(!c || occupato[k]) return;
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    if(!forza){   /* prima di sostituire la versione online, mostra il confronto */
      occupato[k] = 1; disegna();
      scarica(c).then(function(res){
        occupato[k] = 0; disegna();
        if(res.stato === "errore"){ avviso(res.msg, true); return; }
        if(res.stato === "vuoto"){ var s0 = stato(k); s0.sha = null; salvaStato(k, s0); caricaOnline(k, true); return; }
        var rem = res.dati, s2 = stato(k), nd = differenze(pacchetto(k).data, rem.data || {}, k).filter(function(r){ return r.diversa; }).length;
        if(!nd){ s2.sha = res.sha; s2.at = rem.salvato; s2.dirty = false; salvaStato(k, s2); disegna(); avviso("Online c'è già questa stessa versione: niente da salvare. ✓"); return; }
        confronto(k, "salva", rem, res.sha, rem.salvato !== s2.at ? "⚠ La versione online è stata salvata <b>da un altro dispositivo</b> dopo l'ultima volta che questo l'ha scaricata." : "");
      });
      return;
    }
    occupato[k] = 1; disegna();
    var p = pacchetto(k), corpo = { message: "Area di "+NOMI[k]+" — "+quando(p.salvato)+(c.chi === "master" ? " (dal Master)" : ""), content: b64e(JSON.stringify(p)) };
    if(s.sha) corpo.sha = s.sha;
    var invia = forza ? scarica(c).then(function(res){ if(res.sha) corpo.sha = res.sha; }) : Promise.resolve();
    invia.then(function(){ return gh(c, "PUT", "/contents/"+FILE, corpo); }).then(function(r){
      occupato[k] = 0;
      if(r.status === 409 || r.status === 422){             // online c'è una versione che questo dispositivo non conosce
        return scarica(c).then(function(res){ if(res.stato === "ok") confronto(k, "conflitto", res.dati, res.sha); else avviso(res.msg || errore(r), true); disegna(); });
      }
      if(!r.ok){ avviso(errore(r), true); disegna(); return; }
      return r.json().then(function(j){ var s2 = stato(k); s2.sha = j.content && j.content.sha; s2.at = p.salvato; s2.dirty = false; salvaStato(k, s2); disegna(); annuncia(k, "salvata"); avviso(c.chi === "master" ? "Area di "+NOMI[k]+" salvata online (Master) ✓" : "Salvato online ✓"); try{ sfxPlay("seal"); }catch(e){} });
    }).catch(function(){ occupato[k] = 0; avviso(errore(null), true); disegna(); });
  }

  /* ---------- interfaccia ---------- */
  function quando(iso){ try { return new Date(iso).toLocaleString("it-IT", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"}); } catch(e){ return iso; } }
  var bar = document.querySelector("#pa-body .pa-bar"), box;
  if(bar){
    box = document.createElement("span"); box.className = "gh-box";
    var lock = document.getElementById("am-btn") || document.getElementById("pa-lockbtn"); bar.insertBefore(box, lock);
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
        var pv = js(localStorage.getItem("tcjgh_prev_"+k) || "null");
        if(pv && pv.at) h += '<div class="sv-btns sv-undo"><button class="bk-btn" type="button" data-gh="annulla">↩ Annulla l\'ultimo scaricamento <small>(' + quando(pv.at) + ')</small></button></div>';
      }
      sez.innerHTML = h;
    }
  }
  function clic(e){
    var b = e.target.closest("[data-gh]"); if(!b || b.disabled) return;
    var a = b.getAttribute("data-gh");
    if(a === "salva") caricaOnline(scCur);
    else if(a === "scarica") scaricaManuale(scCur);
    else if(a === "annulla") annullaScaricamento(scCur);
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
    if(s.token) document.getElementById("gh-off").onclick = function(){
      tcjConferma({titolo:"Scollegare questo dispositivo?",testo:"Da questo dispositivo verrà tolto il <b>token di "+NOMI[k]+"</b>: l'area non si salverà più online da qui.<br><br>L'area resta salvata in questo browser e online non viene cancellato niente. Per ricollegarti dovrai incollare di nuovo il token.",si:"Sì, scollega"}).then(function(ok){
        if(!ok) return; _orig.removeItem.call(localStorage, "tcjgh_"+k); chiudi(); disegna(); avviso("Scollegato: l'area resta salvata in questo browser."); });
    };
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
  /* salva online subito (per esempio dopo «✎ Modifica area»), ma solo se la versione online è quella che questo
     dispositivo conosce già: se un altro dispositivo ha salvato nel frattempo, mostra il confronto invece di sovrascrivere.
     Restituisce "nessuno" (nessun token collegato), "occupato", "errore", "conflitto" oppure "ok". */
  function salvaSeLibero(k){
    var c = cred(k); if(!c) return Promise.resolve("nessuno"); if(occupato[k]) return Promise.resolve("occupato");
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    occupato[k] = 1; disegna();
    return scarica(c).then(function(res){
      occupato[k] = 0; disegna();
      if(res.stato === "errore"){ avviso(res.msg, true); return "errore"; }
      var s2 = stato(k);
      if(res.stato === "vuoto" || (res.dati && res.dati.salvato === s2.at)){ caricaOnline(k, true); return "ok"; }
      confronto(k, "salva", res.dati, res.sha, "⚠ La versione online è stata salvata <b>da un altro dispositivo</b> dopo l'ultima volta che questo l'ha scaricata. Scegli quale tenere.");
      return "conflitto";
    });
  }
  window.ghSync = { scarica: scaricaAll, scaricaOra: scaricaManuale, salva: caricaOnline, salvaSeLibero: salvaSeLibero, stato: stato, collegato: function(k){ return !!cred(k); },
    credenziali: function(k){ var c = cred(k); return c ? { token: c.token, repo: c.repo, chi: c.chi } : null; }, quando: quando };
  /* ---------- Zona Master: token del Master e quadro delle tre aree ---------- */
  var mb = document.getElementById("mgh-body");
  function disegnaMaster(){
    if(!mb) return;
    var m = master();
    if(!m.token){
      mb.classList.remove("mgh-on");
      mb.innerHTML = '<div class="mgh-set"><p class="sv-p">Incolla il token del Master: un token fine-grained valido per <b>tcj-athena</b>, <b>tcj-panlan</b> e <b>tcj-asonnes</b>, con <b>Contents: Read and write</b>. Resta solo su questo dispositivo.</p>'
        + '<div class="mgh-row"><input type="password" id="mgh-tok" autocomplete="off" spellcheck="false" placeholder="github_pat_…"><button type="button" class="bk-btn" data-mg="collega">☁ Collega</button></div><div class="gh-err" id="mgh-err"></div></div>';
      return;
    }
    /* tre colonne, una per Slayer: in cima lo stato del salvataggio online, sotto la scheda in diretta (js/diretta-schede.js).
       La struttura si crea una volta sola: dopo si aggiornano solo le righe dello stato, così la scheda in diretta non si ridisegna. */
    if(!mb.classList.contains("mgh-on")){
      var h0 = '<div class="mgh-top" id="mgh-top"></div><div class="mgh-cols" id="mgh-cols">';
      CH.forEach(function(k){ h0 += '<div class="mgh-col" role="group" data-k="'+k+'" aria-label="'+NOMI[k]+'"><div class="mgh-it"></div><div class="dv-slot" data-dv="'+k+'"></div></div>'; });
      h0 += '</div><div class="mgh-row mgh-foot"><button type="button" class="bk-btn" data-mg="tutte">⬇ Scarica tutte</button><button type="button" class="bk-btn" data-mg="scollega">Scollega il token del Master</button></div>';
      mb.innerHTML = h0; mb.classList.add("mgh-on");
      try { document.dispatchEvent(new CustomEvent("tcj-mgh-pronto")); } catch(e){}
    }
    CH.forEach(function(k){
      var it = mb.querySelector('.mgh-col[data-k="'+k+'"] .mgh-it'); if(!it) return;
      var s = stato(k), dis = occupato[k] ? ' disabled' : '', proprio = !!(s.token && s.repo);
      it.innerHTML = '<div class="mgh-n">'+NOMI[k]+'<small>'+OWNER+'/tcj-'+k+(proprio?' · su questo dispositivo usa il token del giocatore':'')+'</small></div>'
        + '<div class="mgh-s"><span class="mgh-sl">Su questo dispositivo</span>'+statoTesto(k, s)+'</div>'
        + '<div class="mgh-b"><button type="button" class="bk-btn" data-mg="apri" data-k="'+k+'">Apri l\'area</button>'
        + '<button type="button" class="bk-btn" data-mg="scarica" data-k="'+k+'"'+dis+'>⬇ Scarica</button>'
        + '<button type="button" class="bk-btn gh-save" data-mg="salva" data-k="'+k+'"'+dis+'>⬆ Salva online</button></div>';
    });
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
    else if(a === "scollega"){ tcjConferma({titolo:"Scollegare questo dispositivo?",testo:"Da questo dispositivo verranno tolti il <b>token del Master</b> e i contenuti della <b>Zona Master</b>.<br><br>Niente viene cancellato online: i dati restano su GitHub. Per riaprire la Zona Master qui dovrai però incollare di nuovo il token.",si:"Sì, scollega"}).then(function(ok){ if(!ok) return; ["tcjgh_master","tcjgh_mcache","tcjgh_mlock","tcjgh_mfirst"].forEach(function(x){ _orig.removeItem.call(localStorage, x); }); location.reload(); }); }
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
