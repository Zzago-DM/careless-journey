/* Pulsante "Schermo intero" dei riquadri scorrevoli */

(function(){
 var CFG=[{id:"bbox",ctl:[".bfilt",".bbox-bar"]},{id:"bbox-manuale",ctl:[".mtabs"]},{id:"bbox-corone",ctl:[]},{id:"bbox-npc",ctl:[]},{id:"bbox-mstat",ctl:[".bfilt"]}];
 var cur=null;
 function openFs(c){
  if(cur)return;cur=c;var box=c.box;
  var ov=document.createElement("div");ov.className="bfs-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  var hd=document.createElement("div");hd.className="bfs-hd";
  var t=document.createElement("span");t.className="bfs-t";t.textContent=c.title;
  var x=document.createElement("button");x.type="button";x.className="bfs-x";x.setAttribute("aria-label","Chiudi schermo intero");x.textContent="\u2715";x.onclick=closeFs;
  hd.appendChild(t);hd.appendChild(x);ov.appendChild(hd);
  c.ph=[];
  if(c.els.length){var ctl=document.createElement("div");ctl.className="bfs-ctl";
   c.els.forEach(function(el){var ph=document.createComment("bfs");el.parentNode.insertBefore(ph,el);c.ph.push(ph);ctl.appendChild(el);});
   ov.appendChild(ctl);}
  var st=box.scrollTop;c.bph=document.createComment("bfs-box");box.parentNode.insertBefore(c.bph,box);
  ov.appendChild(box);document.body.appendChild(ov);box.scrollTop=st;
  document.documentElement.classList.add("bfs-lock");c.ov=ov;
  try{sfxPlay("paper")}catch(e){}
  x.focus();
 }
 function closeFs(){
  var c=cur;if(!c)return;cur=null;var box=c.box,st=box.scrollTop;
  c.els.forEach(function(el,i){var ph=c.ph[i];ph.parentNode.insertBefore(el,ph);ph.parentNode.removeChild(ph);});
  c.bph.parentNode.insertBefore(box,c.bph);c.bph.parentNode.removeChild(c.bph);box.scrollTop=st;
  if(c.ov.parentNode)c.ov.parentNode.removeChild(c.ov);
  document.documentElement.classList.remove("bfs-lock");
  try{sfxPlay("swish")}catch(e){}
  if(c.btn)c.btn.focus();
 }
 CFG.forEach(function(c){
  var box=document.getElementById(c.id);if(!box)return;
  var sec=box.closest(".msec")||box.closest("section"),h=sec&&sec.querySelector(".msect,.st");
  c.box=box;c.title=h?h.textContent.trim():"";
  c.els=c.ctl.map(function(q){return sec.querySelector(q)}).filter(Boolean);
  var b=document.createElement("button");b.type="button";b.className="bfs-open";b.textContent="\u26F6 Schermo intero";b.setAttribute("aria-label","Apri "+c.title+" a schermo intero");
  b.onclick=function(){openFs(c)};c.btn=b;
  var bar=sec.querySelector(".bbox-bar");
  if(c.id==="bbox"&&bar)bar.appendChild(b);
  else{var w=document.createElement("div");w.className="bfs-bar";w.appendChild(b);box.parentNode.insertBefore(w,box);}
 });
 document.addEventListener("keydown",function(e){
  if(e.key!=="Escape"||!cur)return;
  if(document.querySelector(".al-ov.open,.cr-ov.open,.sk-ov.open,.nv-ov.open,.am-ov.open"))return;
  closeFs();
 },true);
})();
