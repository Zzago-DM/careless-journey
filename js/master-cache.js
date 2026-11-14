/* Zona Master privata: i contenuti stanno nel repository privato Zzago-DM/tcj-master e NON nel sito pubblico.
   Sui dispositivi con il token del Master, l'ultima copia scaricata è tenuta in questo browser e viene inserita
   subito nella pagina, al posto giusto, così tutto il resto del sito la trova come prima.
   Senza token la Zona Master è solo un guscio vuoto. */
var MD = [], AD = [], MND = [], TCJ_MASTER = null;
(function(){
  try {
    var c = JSON.parse(localStorage.getItem("tcjgh_mcache") || "null");
    var t = JSON.parse(localStorage.getItem("tcjgh_master") || "null");
    if(c && c.html && t && t.token){
      TCJ_MASTER = c;
      var s = c.schede || {};
      MD = s.MD || []; AD = s.AD || []; MND = s.MND || [];
    }
  } catch(e){}
})();
/* chiamata nel punto della pagina dove stava la Zona Master */
function tcjMasterSezione(){
  tcjSezione(TCJ_MASTER ? TCJ_MASTER.html : '<div id="ms" style="display:none"></div>');
}

/* I programmi e gli stili della Zona Master si scaricano SOLO sui dispositivi con il token del Master:
   in index.html sono scritti dentro tcjSoloMaster('…'). Per tutti gli altri non partono nemmeno.
   Restano per tutti solo questo file, l'accesso (master-accesso.js) e l'animazione del sigillo (sezioni/sblocco-master.js). */
function tcjSoloMaster(tag){ if(TCJ_MASTER) document.write(tag); }
