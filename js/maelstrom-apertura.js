/* Apertura della vista del Maelstrom */

(function(){
  function openMael(){var o=document.getElementById('cj-maelstrom');if(o){var f=o.querySelector('iframe[data-src]');if(f&&!f.getAttribute('src'))f.setAttribute('src',f.getAttribute('data-src'));/* la scena del Maelstrom si accende solo alla prima apertura */o.classList.add('open');o.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';try{sfxPlay('map','maelstrom')}catch(_){}}}
  ['maelstrom','pulsar-vortices'].forEach(function(id){var el=document.getElementById(id);if(el){el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openMael();});}});
})();
