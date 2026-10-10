/* Scintille del titolo iniziale */

(function(){var box=document.querySelector(".hero-motes");if(!box||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))return;
var n=window.innerWidth<700?14:26,h="";for(var i=0;i<n;i++){var sz=(2+Math.random()*4).toFixed(1),d=(14+Math.random()*16).toFixed(1);
h+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;width:'+sz+'px;height:'+sz+'px;--dx:'+((Math.random()-.5)*120).toFixed(0)+'px;--o:'+(.25+Math.random()*.5).toFixed(2)+';animation-duration:'+d+'s;animation-delay:-'+(Math.random()*d).toFixed(1)+'s"></i>';}
box.innerHTML=h;})();
