/* Accesso alla Zona Master con il token del Master (niente più password nel codice).
   - Primo accesso: si incolla il token nella finestra «Accesso Master»; il sito scarica i contenuti
     dal repository privato tcj-master, li tiene in questo browser e ricarica la pagina.
   - Accessi successivi: sui dispositivi con il token la Zona Master si apre da sola.
   - In background controlla se su tcj-master c'è una versione più recente e propone di aggiornare. */
(function(){
  var REPO = "Zzago-DM/tcj-master", API = "https://api.github.com/repos/" + REPO + "/contents/";
  var FILES = { html: "zona-master.html", schede: "schede.json" };
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function salva(k, v){ try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch(e){} }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g,"")), by = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function leggi(tok, nome){
    return fetch(API + nome, { headers: { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" })
      .then(function(r){ if(!r.ok) throw r.status; return r.json(); })
      .then(function(j){ return { testo: b64d(j.content || ""), sha: j.sha }; });
  }
  function scaricaTutto(tok){
    return Promise.all([leggi(tok, FILES.html), leggi(tok, FILES.schede)]).then(function(r){
      return { html: r[0].testo, schede: JSON.parse(r[1].testo), sha: { html: r[0].sha, schede: r[1].sha }, at: new Date().toISOString() };
    });
  }
  function msgErr(e){
    if(e === 401) return "Il token non è valido o è stato revocato.";
    if(e === 403 || e === 404) return "Il token non apre il repository tcj-master: controlla di averlo aggiunto al token.";
    return "Non riesco a raggiungere GitHub: controlla la connessione e riprova.";
  }

  /* ---------- finestra di accesso (riusa quella che prima chiedeva la password) ---------- */
  var pwo = document.getElementById("pwo"), pwi = document.getElementById("pwi"), pwe = document.getElementById("pwe");
  if(pwo){
    var sub = pwo.querySelector(".pwsub"); if(sub) sub.innerHTML = "La Zona Master si apre con il <b>token del Master</b>. Incollalo qui: resterà solo su questo dispositivo, e da qui in poi la Zona si aprirà da sola.";
    if(pwi){ pwi.type = "password"; pwi.placeholder = "github_pat_…"; pwi.setAttribute("autocomplete","off"); pwi.setAttribute("spellcheck","false"); }
    if(pwe) pwe.textContent = "";
  }
  window.tcjMasterProva = function(){
    var tok = (pwi && pwi.value || "").trim();
    if(!tok){ if(pwe){ pwe.textContent = "Incolla il token del Master."; pwe.style.display = "block"; } return; }
    if(pwe){ pwe.textContent = "Controllo…"; pwe.style.display = "block"; }
    scaricaTutto(tok).then(function(c){
      salva("tcjgh_master", { token: tok }); salva("tcjgh_mcache", c); salva("tcjgh_mfirst", "1");
      if(pwe) pwe.textContent = "Fatto: apro la Zona Master…";
      try{ sfxPlay("on"); }catch(_){}
      setTimeout(function(){ location.reload(); }, 500);
    }).catch(function(e){ try{ sfxPlay("deny"); }catch(_){} if(pwe){ pwe.textContent = msgErr(e); pwe.style.display = "block"; } if(pwi) pwi.select(); });
  };
  /* apertura della Zona Master quando i contenuti sono già in questo browser */
  function costruisci(){ try { buildMBeh(); buildMCards(MD,50,"grid-mael"); buildMCards(AD,26,"grid-alti"); buildMCards(MND,26,"grid-minori"); } catch(e){} }
  window.tcjMasterApri = function(animazione){
    if(!TCJ_MASTER || !token()) return false;
    mOpen = true; costruisci();
    if(animazione){ playUnlock(); return true; }
    var ms = document.getElementById("ms");
    if(ms){ ms.scrollIntoView = function(){}; setTimeout(function(){ delete ms.scrollIntoView; }, 2200); }   /* apertura silenziosa: niente salto alla sezione */
    revealMaster();
    return true;
  };

  /* ---------- barra in cima alla Zona Master: chiudi / scollega ---------- */
  var ms = document.getElementById("ms");
  if(ms && TCJ_MASTER){
    var bar = document.createElement("div"); bar.className = "mst-bar";
    bar.innerHTML = '<span class="mst-st">🔑 Aperta con il token del Master su questo dispositivo</span>'
      + '<button type="button" class="bk-btn" data-mt="chiudi">🔒 Chiudi</button>'
      + '<button type="button" class="bk-btn" data-mt="scollega">Scollega questo dispositivo</button>';
    ms.insertBefore(bar, ms.firstChild);
    bar.addEventListener("click", function(e){
      var b = e.target.closest("[data-mt]"); if(!b) return;
      if(b.getAttribute("data-mt") === "chiudi"){
        mOpen = false; ms.style.display = "none"; salva("tcjgh_mlock", "1");
        var mb = document.getElementById("mbtn"); if(mb){ mb.textContent = "🔒 Master"; mb.classList.remove("unlocked"); }
        try{ paRefresh(); paTheme(); slRender(); sfxPlay("off"); }catch(_){}
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if(confirm("Togliere il token del Master e i contenuti della Zona Master da questo dispositivo?")){
        ["tcjgh_master","tcjgh_mcache","tcjgh_mlock","tcjgh_mfirst"].forEach(function(k){ try{ localStorage.removeItem(k); }catch(_){} });
        location.reload();
      }
    });
  }
  /* «🔒 Master» nella barra in alto: riapre senza password se c'è il token */
  if(typeof openpw === "function"){
    var _op = openpw;
    openpw = function(){
      if(!mOpen && TCJ_MASTER && token()){ try{ localStorage.removeItem("tcjgh_mlock"); }catch(_){} tcjMasterApri(true); return; }
      _op();
    };
  }

  /* ---------- all'avvio ---------- */
  if(TCJ_MASTER && token()){
    var primo = localStorage.getItem("tcjgh_mfirst") === "1";
    if(primo){ try{ localStorage.removeItem("tcjgh_mfirst"); }catch(_){} setTimeout(function(){ tcjMasterApri(true); }, 900); }
    else if(localStorage.getItem("tcjgh_mlock") !== "1") tcjMasterApri(false);
    /* c'è una versione più recente su tcj-master? */
    scaricaTutto(token()).then(function(c){
      var v = TCJ_MASTER.sha || {};
      if(c.sha.html === v.html && c.sha.schede === v.schede) return;
      salva("tcjgh_mcache", c);
      var t = document.createElement("div"); t.className = "gh-toast on mst-upd"; t.setAttribute("role","status");
      t.innerHTML = 'La Zona Master è stata aggiornata. <button type="button" class="bk-btn">Ricarica</button>';
      t.querySelector("button").onclick = function(){ location.reload(); };
      document.body.appendChild(t);
    }).catch(function(e){
      if(e === 401 || e === 404){
        var t = document.createElement("div"); t.className = "gh-toast on err"; t.setAttribute("role","status");
        t.textContent = "Il token del Master non apre più tcj-master: " + msgErr(e);
        document.body.appendChild(t); setTimeout(function(){ t.classList.remove("on"); }, 8000);
      }
    });
  }
})();
