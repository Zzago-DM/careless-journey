/* Apertura e chiusura delle mappe ingrandite dei continenti */

(function(){
  var KEYS=['ardente','terrestre','radiante','folgorante','glaciale','oscuro','ramsgate'];
  function openOv(k){var ov=document.getElementById('cj-'+k);if(!ov)return;
    ov.classList.add('open');ov.setAttribute('aria-hidden','false');ov.scrollTop=0;document.body.style.overflow='hidden';try{sfxPlay('map',k)}catch(_){}}
  function closeOv(ov){try{sfxPlay('mapClose')}catch(_){}ov.classList.remove('open');ov.setAttribute('aria-hidden','true');
    ov.querySelectorAll('.marker.open').forEach(function(x){x.classList.remove('open')});
    if(!document.querySelector('.cj-overlay.open'))document.body.style.overflow='';}
  KEYS.forEach(function(k){
    var g=document.getElementById('isl-'+k),l=document.getElementById('lbl-'+k);
    function go(e){e.preventDefault();e.stopPropagation();openOv(k);}
    if(g)g.addEventListener('click',go);
    if(l)l.addEventListener('click',go);
  });
  document.querySelectorAll('.cj-overlay .back').forEach(function(b){
    function c(e){e.preventDefault();closeOv(b.closest('.cj-overlay'));}
    b.addEventListener('click',c);
    b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')c(e);});
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){var o=document.querySelector('.cj-overlay.open');if(o)closeOv(o);}});
  // tap sui marker (solo dentro gli overlay)
  document.addEventListener('click',function(e){
    var hit=e.target.closest?e.target.closest('.cj-overlay .hit'):null;
    if(hit){e.stopPropagation();var m=hit.closest('.marker'),ov=hit.closest('.cj-overlay');
      var was=m.classList.contains('open');
      ov.querySelectorAll('.marker').forEach(function(x){x.classList.remove('open')});
      if(!was){m.classList.add('open');try{sfxPlay('ping')}catch(_){}}return;}
    document.querySelectorAll('.cj-overlay.open .marker.open').forEach(function(x){x.classList.remove('open')});
  });
})();
