/* Apertura della vista del Maelstrom */

(function(){
  function openMael(){var o=document.getElementById('cj-maelstrom');if(o){var f=o.querySelector('iframe[data-src]');if(f){var src=(typeof maelScena==='function')?maelScena(f):f.getAttribute('data-src');if(f.getAttribute('src')!==src)f.setAttribute('src',src);}/* la scena si accende solo all'apertura, nella qualità scelta nel menu (js/maelstrom-qualita.js) */o.classList.add('open');o.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';try{sfxPlay('map','maelstrom')}catch(_){}}}
  ['maelstrom','pulsar-vortices'].forEach(function(id){var el=document.getElementById(id);if(el){el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openMael();});}});
})();
