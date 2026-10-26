/* Tema del sito: Attuale (di base), Cieli Tersi, Manuale classico, Cacciatore, Gastrocomiche o Reami Dimenticati — scelto nel menu in alto a destra (⚔ Slayer ▾).

   - Cambia l'aspetto generale di tutto il sito (sfondo, cornici, pulsanti, caratteri) e segue il colore Aether già scelto.
   - Non tocca la Zona Master, l'animazione iniziale e la mappa (vedi i file css/31…36-tema-*.css e css/37-caratteri-*.css).
   - Si scaricano solo gli stili del tema scelto; sul telefono gli effetti più pesanti si spengono da soli (css/38-temi-telefono.css).
   - La scelta resta in questo browser (chiave tcj-tema). Se un personaggio è attivo viene salvata anche nel suo
     pacchetto (campo t di tcj_bg_<pg>), così lo segue su ogni dispositivo dove apre la sua area.
   - Il primo script in <head> la applica subito, prima che la pagina compaia, per non vedere il tema sbagliato per un attimo. */
(function(){
  /* [chiave salvata, nome nel menu] — le chiavi restano quelle di prima, così chi aveva già scelto un tema lo ritrova */
  var TEMI = [["attuale","Attuale"],["dauntless","Cieli Tersi"],["pergamena","Manuale classico"],["mh","Cacciatore"],["osteria","Gastrocomiche"],["reami","Reami Dimenticati"]];
  function valido(v){ return TEMI.some(function(t){ return t[0] === v; }); }
  function attivo(){ try { return typeof paActive === "function" ? paActive() : null; } catch(e){ return null; } }
  window.temaSito = function(){
    var k = attivo(), v = null;
    if(k){ try { var o = JSON.parse(localStorage.getItem("tcj_bg_" + k) || "{}"); if(o && valido(o.t)) v = o.t; } catch(e){} }
    if(!v){ try { v = localStorage.getItem("tcj-tema"); } catch(e){} }
    return valido(v) ? v : "attuale";
  };
  /* scarica gli stili del tema solo quando serve (elenco in TCJ_TEMI_CSS, dentro index.html) */
  function caricaCss(v){
    var l = (window.TCJ_TEMI_CSS || {})[v]; if(!l || document.querySelector('link[data-tema-css="' + v + '"]')) return;
    l.forEach(function(u){ var k = document.createElement("link"); k.rel = "stylesheet"; k.href = u; k.setAttribute("data-tema-css", v); document.body.appendChild(k); });
  }
  window.temaApplica = function(){
    var v = temaSito(), h = document.documentElement;
    if(window.TCJ_LEGGERO){ h.removeAttribute("data-tema"); return; }   /* versione leggera: niente temi */
    caricaCss(v);
    if(v === "attuale") h.removeAttribute("data-tema"); else h.setAttribute("data-tema", v);
  };
  window.temaSet = function(v){
    if(!valido(v)) return;
    try { localStorage.setItem("tcj-tema", v); } catch(e){}
    var k = attivo();
    if(k){ try { var o = JSON.parse(localStorage.getItem("tcj_bg_" + k) || "{}"); if(!o || typeof o !== "object") o = {}; o.t = v; localStorage.setItem("tcj_bg_" + k, JSON.stringify(o)); } catch(e){} }
    temaApplica();
    try { if(typeof slRender === "function") slRender(); } catch(e){}
  };
  /* riga del menu (la inserisce slRender in js/area-giocatori.js) */
  window.temaRiga = function(){
    var v = temaSito();
    return '<div class="sl-row sl-mq"><div><span>Tema del sito</span><small>Cambia l\'aspetto di tutto il sito</small></div>' +
      '<select class="sl-mqsel" aria-label="Tema del sito" onchange="temaSet(this.value)">' +
      TEMI.map(function(t){ return '<option value="' + t[0] + '"' + (t[0] === v ? ' selected' : '') + '>' + t[1] + '</option>'; }).join("") + '</select></div>';
  };
  /* quando cambia il personaggio attivo (o il suo pacchetto arriva da online) il tema lo segue */
  if(typeof window.paTheme === "function"){
    var orig = window.paTheme;
    window.paTheme = function(){ var r = orig.apply(this, arguments); try { temaApplica(); } catch(e){} return r; };
  }
  window.addEventListener("storage", function(e){ if(!e.key || e.key === "tcj-tema" || e.key.indexOf("tcj_bg_") === 0) temaApplica(); });
  temaApplica();
})();
