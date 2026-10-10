/* Easter egg: isola sconosciuta nel Maelstrom */

/* Easter egg: dopo VR_WAIT di immobilità nella vista del Maelstrom compare un'isola sconosciuta */
(function(){
var VR_WAIT=60000,VR_PASS=20000; /* attesa di immobilità (1 minuto) e durata del passaggio (20 secondi) */
var mael=document.getElementById("cj-maelstrom"),isle=document.getElementById("vr-isle"),flash=document.getElementById("vr-flash"),ov=document.getElementById("cj-vecchia");
if(!mael||!isle||!ov)return;
var last=Date.now(),shown=false,done=false,passT=null,timer=null,lock=null,frameHooked=null;
var EV=["pointerdown","touchstart","wheel","keydown"]; /* il cursore che si muove non conta */
function poke(){if(shown||!done)return;done=false;last=Date.now();} /* conta solo il tempo sulla schermata; dopo il passaggio un'interazione riarma l'isola */
EV.forEach(function(e){window.addEventListener(e,poke,{passive:true,capture:true});});
function hookFrame(){try{var f=mael.querySelector("iframe"),w=f&&f.contentWindow;if(w&&w!==frameHooked){EV.forEach(function(e){w.addEventListener(e,poke,{passive:true,capture:true});});frameHooked=w;}}catch(_){}}
function show(){if(done)return;shown=true;isle.classList.add("show");passT=setTimeout(function(){done=true;hide();},VR_PASS);isle.tabIndex=0;flash.classList.remove("go");void flash.offsetWidth;flash.classList.add("go");try{sfxPlay("gong")}catch(_){}}
function hide(){shown=false;if(passT){clearTimeout(passT);passT=null;}isle.classList.remove("show");isle.tabIndex=-1;}
function start(){hookFrame();done=false;last=Date.now();if(!timer)timer=setInterval(function(){if(document.hidden)return;if(!done&&!shown&&Date.now()-last>=VR_WAIT)show();},250);
  try{if(navigator.wakeLock&&!lock)navigator.wakeLock.request("screen").then(function(l){lock=l;l.addEventListener("release",function(){lock=null;});}).catch(function(){});}catch(_){}}
function stop(){if(timer){clearInterval(timer);timer=null;}hide();try{if(lock){lock.release();lock=null;}}catch(_){}}
new MutationObserver(function(){if(mael.classList.contains("open"))start();else stop();}).observe(mael,{attributes:true,attributeFilter:["class"]});
var fr=mael.querySelector("iframe");if(fr)fr.addEventListener("load",hookFrame);
document.addEventListener("visibilitychange",function(){last=Date.now();}); /* uscire dalla scheda fa ripartire il conto */
isle.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();done=true;hide();
  ov.classList.add("open");ov.setAttribute("aria-hidden","false");ov.scrollTop=0;document.body.style.overflow="hidden";
  try{sfxPlay("paper")}catch(_){}
  var b=ov.querySelector(".back");if(b)b.focus();});
})();
