/* ============================================================
   Animazioni di sblocco delle aree degli Slayer (8 s, saltabili)
   - Asonnes: edera e rovi che crescono dai bordi (stesso disegno del sito degli
     alberi genealogici: foglie vere, spine, fiori di rovo, more) e poi si scostano
     ai lati come i rami all'ingresso della biblioteca.
   - Athena: ghiaccio che si propaga a strattoni, con cristalli ramificati a 60°,
     brina, scricchiolii e piccoli scossoni a ogni avanzata.
   - Pan Lan: catrame denso che dilaga dai bordi fino al centro e poi si ritira
     dal centro verso i bordi.
   Il resto (tempi, arma, salto) resta in js/area-giocatori.js: qui ci sono solo
   pgGeo (geometria preparata una volta) e pgDraw (disegno di ogni fotogramma).
============================================================ */
(function(){
"use strict";
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a);
const cl01=x=>x<0?0:x>1?1:x;
const easeOut=x=>1-Math.pow(1-cl01(x),3);
const easeIO=x=>{x=cl01(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
function dprOf(){return Math.min(window.devicePixelRatio||1,1.25);}
function layer(W,H){const d=dprOf(),c=document.createElement("canvas");c.width=Math.max(1,Math.round(W*d));c.height=Math.max(1,Math.round(H*d));const x=c.getContext("2d");x.setTransform(d,0,0,d,0,0);return {c:c,x:x};}
function resample(pts,step){const out=[];let carry=0;
 for(let i=0;i<pts.length-1;i++){const x1=pts[i][0],y1=pts[i][1],x2=pts[i+1][0],y2=pts[i+1][1],L=Math.hypot(x2-x1,y2-y1);if(L<1e-6)continue;
  const tx=(x2-x1)/L,ty=(y2-y1)/L;let d=carry;while(d<=L){out.push({x:x1+tx*d,y:y1+ty*d,tx:tx,ty:ty});d+=step;}carry=d-L;}
 return out;}

/* ============================================================
   ASONNES — edera e rovi
============================================================ */
function serratedLeaf(){const n=24,Lp=[],Rp=[];
 for(let i=0;i<=n;i++){const t=i/n,w=.36*Math.sin(Math.PI*Math.pow(t,.72)),tooth=(i%2===1&&w>.06)?.045:0;Lp.push([-(w+tooth),-t+(tooth?.02:0)]);Rp.push([w+tooth,-t+(tooth?.02:0)]);}
 const f=p=>p[0].toFixed(3)+","+p[1].toFixed(3);return "M"+Lp.map(f).join(" L")+" L"+Rp.reverse().map(f).join(" L")+"Z";}
let SH=null;
function shapes(){if(SH)return SH;SH={
 ivy3:new Path2D("M0,0 C-.15,-.1 -.5,-.15 -.55,-.4 C-.45,-.45 -.3,-.42 -.25,-.5 C-.3,-.75 -.1,-.95 0,-1 C.1,-.95 .3,-.75 .25,-.5 C.3,-.42 .45,-.45 .55,-.4 C.5,-.15 .15,-.1 0,0Z"),
 ivy5:new Path2D("M0,0 C-.12,-.06 -.36,-.02 -.5,-.12 C-.62,-.2 -.66,-.3 -.6,-.38 C-.5,-.36 -.42,-.36 -.36,-.42 C-.46,-.56 -.42,-.66 -.3,-.68 C-.22,-.62 -.16,-.62 -.12,-.66 C-.1,-.84 -.04,-.96 0,-1 C.04,-.96 .1,-.84 .12,-.66 C.16,-.62 .22,-.62 .3,-.68 C.42,-.66 .46,-.56 .36,-.42 C.42,-.36 .5,-.36 .6,-.38 C.66,-.3 .62,-.2 .5,-.12 C.36,-.02 .12,-.06 0,0Z"),
 ivyHeart:new Path2D("M0,-.02 C-.1,.04 -.42,.02 -.46,-.22 C-.5,-.48 -.26,-.78 0,-1 C.26,-.78 .5,-.48 .46,-.22 C.42,.02 .1,.04 0,-.02Z"),
 ivyVein:new Path2D("M0,-.04 L0,-.86 M0,-.28 L-.4,-.36 M0,-.28 L.4,-.36 M0,-.46 L-.2,-.62 M0,-.46 L.2,-.62"),
 brLeaf:new Path2D(serratedLeaf()),
 brVein:new Path2D("M0,0 L0,-.92 M0,-.25 L-.22,-.4 M0,-.25 L.22,-.4 M0,-.45 L-.2,-.6 M0,-.45 L.2,-.6 M0,-.65 L-.14,-.78 M0,-.65 L.14,-.78"),
 petal:new Path2D("M0,0 C-.55,-.35 -.6,-1.05 0,-1.1 C.6,-1.05 .55,-.35 0,0Z")};return SH;}
/* sfumature delle foglie, definite nello spazio della foglia (si deformano con lei) */
const GRC=new WeakMap();
function grads(c){let g=GRC.get(c);if(g)return g;
 const rad=(a,b,d)=>{const r=c.createRadialGradient(0,-.45,0,0,-.45,.72);r.addColorStop(0,a);r.addColorStop(.6,b);r.addColorStop(1,d);return r;};
 const lin=(a,b)=>{const l=c.createLinearGradient(-.4,0,.4,0);l.addColorStop(0,a);l.addColorStop(.5,b);l.addColorStop(1,a);return l;};
 const pt=c.createRadialGradient(0,-.1,0,0,-.1,1);pt.addColorStop(0,"#f0d8dc");pt.addColorStop(.5,"#f4eeee");pt.addColorStop(1,"#e8e2e0");
 g={dark:rad("#4f7240","#2f4a26","#1c2d16"),mid:rad("#6a8e4c","#436733","#29411f"),young:rad("#9cb86c","#6f964a","#4a6d33"),old:rad("#8e7c40","#6a5a2c","#4a3c1e"),
    br:lin("#2e4622","#557a3c"),brRed:lin("#4a2a1c","#7a4a2c"),petal:pt};
 GRC.set(c,g);return g;}
function ivyFill(){const v=Math.random();return v<.42?"dark":v<.8?"mid":v<.94?"young":"old";}
function ivyShape(small){const v=Math.random();return small?(v<.75?"ivy3":"ivyHeart"):(v<.5?"ivy3":v<.75?"ivy5":"ivyHeart");}

function asoGeo(W,H){
 const cx=W/2,cy=H/2,M=Math.min(W,H),k=Math.max(.62,Math.min(1.15,M/820)),mob=M<620;
 const lay={l:layer(W,H),r:layer(W,H),t:layer(W,H)};
 const vines=[],items=[];let maxD=0;
 /* un rampicante: costruisce il gambo ondulato e le sue foglie, come nel sito degli alberi */
 const vine=function(base,o){
  const step=3,S=resample(base,step);if(S.length<4)return null;
  const ph=rnd(0,6.28),amp=(o.amp||6)*k,wl=(o.wl||90)*k;
  const P=S.map((p,i)=>{const s=i*step,nx=-p.ty,ny=p.tx,fade=Math.min(1,i/(o.tendril?12:8));
   const w=fade*(amp*Math.sin(s/wl*TAU+ph)+amp*.35*Math.sin(s/(wl*.37)*TAU+ph*1.7));return {x:p.x+nx*w,y:p.y+ny*w,nx:nx,ny:ny,tx:p.tx,ty:p.ty};});
  const bram=o.type==="bramble",th=o.thin||1;
  const v={P:P,d0:o.d0,side:o.side,done:0,step:step,
   w0:(bram?3.4:o.tendril?1.6:4.2)*k*th,w1:(bram?1.4:o.tendril?.6:1.2)*k*th,
   col:bram?"#5a2a26":o.tendril?"#55602f":"#4e3f2c",hi:bram?"#b0706a":o.tendril?null:"#8f7a58",thorns:[]};
  if(bram)for(let i=2;i<P.length-1;i+=3){const p=P[i],sd=(i/3)%2?1:-1,b=1.4*k;
   v.thorns.push([i,p.x-p.tx*b,p.y-p.ty*b,p.x+p.nx*sd*4.2*k-p.tx*2.4*k,p.y+p.ny*sd*4.2*k-p.ty*2.4*k,p.x+p.tx*b,p.y+p.ty*b]);}
  const every=Math.max(3,Math.round((o.leafEvery||(bram?34:14))*k/step));
  const fp=o.flowers==null?(bram?.08:0):o.flowers;let side=1;
  for(let i=Math.floor(every*Math.random());i<P.length;i+=every+Math.floor(Math.random()*every*.6)){
   if(o.tendril&&i<4)continue;const p=P[i];side=-side;
   const ang=Math.atan2(p.ny*side+p.ty*.35,p.nx*side+p.tx*.35)+Math.PI/2+rnd(-.3,.3);
   const rad=ang-Math.PI/2,pl=(bram?7:5)*k,bx=p.x+Math.cos(rad)*pl,by=p.y+Math.sin(rad)*pl;
   const it={d:o.d0+i*step,side:o.side,px:p.x,py:p.y,bx:bx,by:by,back:Math.random()<.38,pc:bram?"#5a3a28":"#5c5a30",lw:.9*k,L:[]};
   if(bram){const fill=Math.random()<.85?"br":"brRed";[[0,15],[-.84,12],[.84,12]].forEach(q=>{const s2=q[1]*k*(.8+Math.random()*.4);it.L.push({sh:"brLeaf",vn:"brVein",f:fill,a:ang+q[0],sx:s2*(.85+Math.random()*.15),sy:s2});});}
   else{const sz=(o.small?13:19)*k*(.75+Math.random()*.6);it.L.push({sh:ivyShape(o.small),vn:"ivyVein",f:ivyFill(),a:ang,sx:sz*(.82+Math.random()*.18),sy:sz});}
   items.push(it);
   if(Math.random()<fp){const fx=p.x-p.nx*side*5*k,fy=p.y-p.ny*side*5*k;
    items.push(Math.random()<.5?{d:o.d0+i*step+6,side:o.side,fl:1,x:fx,y:fy,r:6*k*rnd(.85,1.15),rot:rnd(0,1.26)}
                               :{d:o.d0+i*step+6,side:o.side,bb:1,x:fx,y:fy,k:k,ripe:Math.random()<.6});}}
  vines.push(v);maxD=Math.max(maxD,o.d0+P.length*step);return v;};
 /* cespuglietti di foglie per infittire la coltre */
 const clump=function(x,y,R,n,d,side){for(let i=0;i<n;i++){const a=rnd(0,TAU),r=Math.sqrt(Math.random())*R*k,sz=rnd(12,20)*k;
  items.push({d:d+rnd(0,30),side:side,px:x,py:y,bx:x+Math.cos(a)*r,by:y+Math.sin(a)*r,nostem:1,back:Math.random()<.5,L:[{sh:ivyShape(false),vn:"ivyVein",f:ivyFill(),a:rnd(0,TAU),sx:sz*rnd(.82,1),sy:sz}]});}};
 /* punti di partenza lungo i quattro bordi: sinistra/destra/alto si scostano come nella biblioteca */
 const per=[],st=(mob?96:80)*Math.max(.6,Math.min(1,M/850));
 for(let x=st/2;x<W;x+=st){per.push([x,-4,"t"]);per.push([x,H+4,x<cx?"l":"r"]);}
 for(let y=st/2;y<H;y+=st){per.push([-4,y,"l"]);per.push([W+4,y,"r"]);}
 per.forEach(q=>{
  const a0=Math.atan2(cy-q[1],cx-q[0])+rnd(-.45,.45),dist=Math.hypot(cx-q[0],cy-q[1]),len=dist*rnd(.6,1.05);
  const base=[[q[0],q[1]]];let a=a0,cur=rnd(-.03,.03),x=q[0],y=q[1];const n=14,sl=len/n;
  for(let i=0;i<n;i++){cur+=rnd(-.03,.03);cur=Math.max(-.08,Math.min(.08,cur));a+=cur;x+=Math.cos(a)*sl;y+=Math.sin(a)*sl;base.push([x,y]);}
  const bram=Math.random()<.3,d0=rnd(0,70);
  const v=vine(base,{type:bram?"bramble":"ivy",amp:bram?9:7,wl:bram?120:96,d0:d0,side:q[2]});if(!v)return;
  /* rametti laterali */
  const nb=Math.random()<.6?2:1;
  for(let j=0;j<nb;j++){const i=Math.floor(v.P.length*rnd(.25,.7)),p=v.P[i],ba=Math.atan2(p.ty,p.tx)+(j?1:-1)*rnd(.5,1.1),bl=len*rnd(.3,.5);
   const bb=[[p.x,p.y]];let bx=p.x,by=p.y,aa=ba;for(let s=0;s<8;s++){aa+=rnd(-.08,.08);bx+=Math.cos(aa)*bl/8;by+=Math.sin(aa)*bl/8;bb.push([bx,by]);}
   vine(bb,{type:"ivy",amp:5,wl:70,d0:d0+i*3,side:q[2],small:true,thin:.7,leafEvery:12});}
  if(Math.random()<.45){const i=Math.floor(v.P.length*rnd(.15,.6)),p=v.P[i];clump(p.x,p.y,rnd(18,30),Math.round(rnd(6,11)),d0+i*3,q[2]);}
 });
 /* tralci che pendono dall'alto */
 for(let x=-10;x<W+20;x+=(mob?36:46)*rnd(.7,1.3)){
  vine([[x,-6],[x+rnd(-14,14),H*rnd(.12,.42)]],{type:"ivy",amp:3,wl:50,d0:rnd(0,60),side:"t",tendril:true,small:true,leafEvery:10});}
 /* angoli più fitti */
 [[0,0,"l"],[W,0,"r"],[0,H,"l"],[W,H,"r"]].forEach(q=>clump(q[0],q[1],46,24,0,q[2]));
 items.sort((a,b)=>a.d-b.d);
 const ff=[];for(let i=0;i<(mob?12:22);i++)ff.push([Math.random()*W,Math.random()*H,rnd(2.4,4.2),rnd(0,6.28),rnd(.6,1.4),rnd(-1,1),rnd(-1,1)]);
 return {aso:1,lay:lay,vines:vines,items:items,ic:0,grow:[],maxD:maxD,k:k,ff:ff};}

function drawStem(c,v,i0,i1){const P=v.P,n=P.length;if(i1<=i0)return;
 const w=v.w0+(v.w1-v.w0)*((i0+i1)/2/(n-1));
 c.lineCap="round";c.lineJoin="round";
 c.beginPath();c.moveTo(P[i0].x,P[i0].y);for(let i=i0+1;i<=i1;i++)c.lineTo(P[i].x,P[i].y);c.strokeStyle=v.col;c.lineWidth=w;c.stroke();
 if(v.hi&&w>1.8){c.save();c.translate(-w*.2,-w*.2);c.globalAlpha=.4;c.strokeStyle=v.hi;c.lineWidth=w*.3;c.stroke();c.restore();}
 v.thorns.forEach(t=>{if(t[0]>i0&&t[0]<=i1){c.beginPath();c.moveTo(t[1],t[2]);c.lineTo(t[3],t[4]);c.lineTo(t[5],t[6]);c.closePath();c.fillStyle="#7a3a2c";c.fill();}});}
function drawItem(c,it,s){const S=shapes(),g=grads(c);if(s<=0)return;
 if(it.fl){c.save();c.translate(it.x,it.y);c.rotate(it.rot);const r=it.r*s;c.scale(r,r);
  for(let i=0;i<5;i++){c.save();c.rotate(i*1.2566+(i%2?.07:-.05));c.fillStyle=g.petal;c.fill(S.petal);c.restore();}
  c.fillStyle="#e2d6a0";for(let i=0;i<14;i++){const a=i/14*TAU;c.beginPath();c.arc(Math.cos(a)*.32,Math.sin(a)*.32,.06,0,TAU);c.fill();}
  c.fillStyle="#a9b26a";c.beginPath();c.arc(0,0,.22,0,TAU);c.fill();c.restore();return;}
 if(it.bb){const k=it.k*s,pts=[[0,0],[-1.6,-1],[1.6,-1],[0,-2],[-1.7,1],[1.7,1],[0,2],[-.9,-2.8],[.9,-2.8],[0,3.4],[-2.4,0],[2.4,0]];
  pts.forEach((q,i)=>{c.fillStyle=it.ripe?(i%3?"#1d0d1c":"#2c1530"):(i%3?"#8a2424":"#a8382e");c.beginPath();c.arc(it.x+q[0]*k,it.y+q[1]*k,1.25*k,0,TAU);c.fill();});
  c.fillStyle="rgba(255,255,255,.44)";c.beginPath();c.arc(it.x-.8*k,it.y-1.4*k,.5*k,0,TAU);c.fill();return;}
 const bx=it.px+(it.bx-it.px)*s,by=it.py+(it.by-it.py)*s;
 if(!it.nostem){c.beginPath();c.moveTo(it.px,it.py);c.lineTo(bx,by);c.strokeStyle=it.pc;c.lineWidth=it.lw;c.lineCap="round";c.stroke();}
 it.L.forEach(l=>{c.save();c.translate(bx,by);c.rotate(l.a);c.scale(l.sx*s,l.sy*s);c.fillStyle=g[l.f];c.fill(S[l.sh]);
  c.strokeStyle="rgba(210,224,176,.42)";c.lineWidth=.035;c.stroke(S[l.vn]);c.restore();});}

function asoDraw(G,p,t){
 const c=G.ctx,W=G.W,H=G.H,g=G.geo,cx=W/2,cy=H/2,R=Math.hypot(cx,cy);
 const u=cl01((t-.8)/2.4),gp=easeIO(u),q=t>5?easeIO((t-5)/1.8):0;
 /* 1) crescita: si fissa sui livelli quello che il fronte ha superato */
 const GW=26*g.k,P=u>=1?Infinity:gp*g.maxD*1.02;
 g.vines.forEach(v=>{const n=Math.min(v.P.length-1,Math.floor((P-v.d0)/v.step));if(n>v.done){drawStem(g.lay[v.side].x,v,Math.max(0,v.done),n);v.done=n;}});
 while(g.ic<g.items.length&&g.items[g.ic].d<=P){g.grow.push(g.items[g.ic]);g.ic++;}
 g.grow=g.grow.filter(it=>{if(P-it.d>=GW){const L=g.lay[it.side].x;if(it.back){L.save();L.globalCompositeOperation="destination-over";drawItem(L,it,1);L.restore();}else drawItem(L,it,1);return false;}return true;});
 /* 2) fondo scuro di bosco, che si dirada mentre i rami si scostano */
 c.clearRect(0,0,W,H);
 const bg=(t<5?gp:1-q)*.9;
 c.fillStyle="rgba(5,12,6,"+bg.toFixed(3)+")";c.fillRect(0,0,W,H);
 const vg=c.createRadialGradient(cx,cy,R*.25,cx,cy,R);vg.addColorStop(0,"rgba(40,80,40,0)");vg.addColorStop(1,"rgba(4,10,4,"+(bg*.6).toFixed(3)+")");c.fillStyle=vg;c.fillRect(0,0,W,H);
 /* 3) i tre livelli: oscillano piano mentre sono fermi, poi si aprono come tende */
 const sw=t>3.2&&t<5?Math.sin((t-3.2)*1.6):0,fadeA=1-cl01((q-.55)/.45);
 c.save();c.globalAlpha=fadeA;
 [["t",0,-q*H*.75,0,0],["l",-q*W*.72,0,-q*.05+sw*.006,H/2],["r",q*W*.72,0,q*.05-sw*.006,H/2]].forEach(d=>{
  c.save();const ox=d[0]==="r"?W:0;c.translate(d[1],d[2]);c.translate(ox,d[4]);c.rotate(d[3]);if(d[0]!=="t"&&q>0){const s=1+q*.06;c.scale(s,s);}c.translate(-ox,-d[4]);
  c.drawImage(g.lay[d[0]].c,0,0,W,H);c.restore();});
 c.restore();
 /* foglie che stanno spuntando proprio ora */
 g.grow.forEach(it=>drawItem(c,it,easeOut((P-it.d)/GW)));
 /* 4) lucciole */
 const fa=cl01((t-1.6)/1)*(1-q);
 if(fa>0)g.ff.forEach(f=>{const x=f[0]+Math.sin(t*.5*f[4]+f[3])*40*f[5],y=f[1]+Math.cos(t*.4*f[4]+f[3])*30*f[6],bl=.15+.85*Math.max(0,Math.sin(t*f[4]*2+f[3]));
  const gr=c.createRadialGradient(x,y,0,x,y,f[2]*5);gr.addColorStop(0,"rgba(248,242,176,"+(fa*bl).toFixed(3)+")");gr.addColorStop(.25,"rgba(225,235,130,"+(fa*bl*.45).toFixed(3)+")");gr.addColorStop(1,"rgba(170,220,110,0)");
  c.fillStyle=gr;c.beginPath();c.arc(x,y,f[2]*5,0,TAU);c.fill();});}

/* ============================================================
   ATHENA — lastra di lago ghiacciato che si crepa a strattoni
============================================================ */
function athGeo(W,H){
 const cx=W/2,cy=H/2,M=Math.min(W,H),k=Math.max(.6,Math.min(1.1,M/850)),dens=Math.max(.7,Math.min(1,W*H/(1366*850)));
 const segs=[];let maxD=0;
 /* una frattura: tratti dritti con piccole deviazioni e ogni tanto una svolta secca; si dirama di rado, come il ghiaccio vero */
 const crack=function(x,y,ang,len,w,d,lvl){let a=ang,run=0;
  while(run<len){const st=rnd(18,58)*k;
   a+=Math.random()<.16?rnd(-.6,.6):rnd(-.035,.035);              // quasi dritta, ogni tanto uno spigolo netto
   const x2=x+Math.cos(a)*st,y2=y+Math.sin(a)*st;
   segs.push([x,y,x2,y2,d,d+st,w*(1-run/len*.55),lvl]);
   if(lvl<2){const nt=lvl?1:3;for(let j=0;j<nt;j++)if(Math.random()<.22){const f=Math.random(),px=x+(x2-x)*f,py=y+(y2-y)*f,ta=a+(Math.random()<.5?1:-1)*rnd(1.1,1.9),tl=rnd(2,lvl?5:8)*k;
     segs.push([px,py,px+Math.cos(ta)*tl,py+Math.sin(ta)*tl,d+st*f,d+st*f+tl,.5,3]);}}  // scaglie laterali della frattura
   if(lvl<2&&run>30*k&&Math.random()<(lvl?.06:.12)){const s=Math.random()<.5?1:-1;crack(x2,y2,a+s*rnd(.3,.75),(len-run)*rnd(.3,.65),w*.6,d+st,lvl+1);}
   x=x2;y=y2;d+=st;run+=st;
   if(x<-40||y<-40||x>W+40||y>H+40)break;}
  if(d>maxD)maxD=d;};
 /* grandi spaccature che attraversano il lago da una riva all'altra */
 const edgePt=()=>{const e=Math.floor(Math.random()*4);return e===0?[rnd(0,W),-2]:e===1?[rnd(0,W),H+2]:e===2?[-2,rnd(0,H)]:[W+2,rnd(0,H)];};
 for(let i=0;i<Math.round(3*dens);i++){const q=edgePt(),a=Math.atan2(cy-q[1],cx-q[0])+rnd(-.5,.5);crack(q[0],q[1],a,Math.hypot(W,H)*rnd(.7,1.1),rnd(2.2,2.8),rnd(0,30),0);}
 /* crepe più corte che partono dalle rive */
 for(let i=0;i<Math.round(7*dens);i++){const q=edgePt(),a=Math.atan2(cy-q[1],cx-q[0])+rnd(-.7,.7);crack(q[0],q[1],a,Math.hypot(cx-q[0],cy-q[1])*rnd(.4,.9),rnd(1.6,2.3),rnd(20,140),1);}
 /* punti d'urto: raggiera di crepe e anelli che le collegano */
 const ni=Math.random()<.5?1:2;for(let i=0;i<ni;i++){const x=rnd(.18,.82)*W,y=rnd(.2,.8)*H,d0=rnd(40,M*.5),nr=Math.round(rnd(4,6)),a0=rnd(0,TAU),ang=[];
  for(let j=0;j<nr;j++){const a=a0+j*TAU/nr+rnd(-.25,.25);ang.push(a);crack(x,y,a,M*rnd(.25,.6),rnd(1.8,2.4),d0,j%3===0?0:1);}
  [rnd(.05,.09),rnd(.13,.2)].forEach((rr,ri)=>{const r=rr*M;ang.forEach((a,j)=>{if(Math.random()<(ri?.45:.7)){const b=ang[(j+1)%nr]+(j===nr-1?TAU:0),x1=x+Math.cos(a)*r,y1=y+Math.sin(a)*r,x2=x+Math.cos(b)*r,y2=y+Math.sin(b)*r;
   crack(x1,y1,Math.atan2(y2-y1,x2-x1),Math.hypot(x2-x1,y2-y1)*rnd(.8,1),1.1,d0+r,2);}});});}
 /* la lastra di ghiaccio, preparata una volta: blu profondo, venature, bolle d'aria intrappolate */
 const sh=layer(W,H),x=sh.x;
 const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#123049");bg.addColorStop(.55,"#0c2438");bg.addColorStop(1,"#0a1d2e");x.fillStyle=bg;x.fillRect(0,0,W,H);
 try{x.filter="blur(14px)";}catch(e){}
 for(let i=0;i<34*dens;i++){const px=rnd(0,W),py=rnd(0,H),r=rnd(60,260),gr=x.createRadialGradient(px,py,0,px,py,r),col=Math.random()<.6?"110,170,210":"20,50,80";
  gr.addColorStop(0,"rgba("+col+","+rnd(.06,.16).toFixed(3)+")");gr.addColorStop(1,"rgba("+col+",0)");x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2);}
 try{x.filter="blur(1.2px)";}catch(e){}
 const a0=rnd(-.4,.4);
 for(let i=0;i<50*dens;i++){const px=rnd(-100,W),py=rnd(0,H),L=rnd(120,460),a=a0+rnd(-.12,.12);
  x.strokeStyle="rgba(200,230,250,"+rnd(.025,.07).toFixed(3)+")";x.lineWidth=rnd(.6,2);x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*L,py+Math.sin(a)*L);x.stroke();}
 try{x.filter="none";}catch(e){}
 const bubble=(px,py,r)=>{x.fillStyle="rgba(215,238,255,"+rnd(.18,.4).toFixed(3)+")";x.beginPath();x.ellipse(px,py,r,r*rnd(.7,1),rnd(0,3),0,TAU);x.fill();
  x.fillStyle="rgba(255,255,255,.55)";x.beginPath();x.arc(px-r*.3,py-r*.3,r*.3,0,TAU);x.fill();};
 for(let i=0;i<14*dens;i++){let px=rnd(0,W),py=rnd(0,H);const a=rnd(-1.9,-1.2),n=Math.round(rnd(6,15));let r=rnd(2,4);
  for(let j=0;j<n;j++){bubble(px,py,r);px+=Math.cos(a)*r*2.6+rnd(-2,2);py+=Math.sin(a)*r*2.6;r*=rnd(.82,.97);if(r<.6)break;}}
 for(let i=0;i<170*dens;i++)bubble(rnd(0,W),rnd(0,H),rnd(.6,2.6));
 const fr=x.createRadialGradient(cx,cy,Math.min(W,H)*.35,cx,cy,Math.hypot(cx,cy));fr.addColorStop(0,"rgba(220,240,255,0)");fr.addColorStop(1,"rgba(220,240,255,.16)");x.fillStyle=fr;x.fillRect(0,0,W,H);
 /* calendario degli strattoni: scatti fulminei separati da pause irregolari */
 const n=Math.round(rnd(6,9)),tw=[],am=[];for(let i=0;i<n;i++){tw.push(rnd(.6,1.6));am.push(i===0?rnd(.4,.7):rnd(.4,1.8));}
 const sT=tw.reduce((a,b)=>a+b,0),sA=am.reduce((a,b)=>a+b,0),T=[0],A=[0];
 for(let i=0;i<n;i++){T.push(T[i]+tw[i]/sT);A.push(A[i]+am[i]/sA);}
 const mp=[[3,rnd(0,TAU),.07],[5,rnd(0,TAU),.05],[9,rnd(0,TAU),.03],[14,rnd(0,TAU),.015]];
 return {segs:segs,maxD:maxD,sheet:sh,T:T,A:A,n:n,last:-1,k:k,chips:[],lt:null,mp:mp};}
function athJerk(g,u){if(u<=0)return {v:0,fl:0,i:-1,band:0};if(u>=1)return {v:1,fl:0,i:g.n,band:0};
 let i=0;while(i<g.n-1&&u>=g.T[i+1])i++;
 const f=(u-g.T[i])/(g.T[i+1]-g.T[i]),a=g.A[i+1]-g.A[i],SN=.13,qq=Math.min(1,f/SN);
 const v=g.A[i]+a*(.98*(1-Math.pow(1-qq,4))+.02*f);            // la crepa corre di colpo, poi quasi si ferma
 const fl=f<SN?1:Math.max(0,1-(f-SN)/.22);
 return {v:v,fl:fl,i:i,band:a};}
function athDraw(G,p,t){
 const c=G.ctx,W=G.W,H=G.H,g=G.geo,cx=W/2,cy=H/2,R=Math.hypot(cx,cy);
 const growing=t<5,u=cl01((t-.8)/2.4),dt=g.lt==null?0:Math.max(0,Math.min(.05,t-g.lt));g.lt=t;
 const sp=growing?easeOut(u/.4):1;                               // il lago gela dalle rive verso il centro
 const cu=cl01((u-.3)/.7);
 let P,fl=0,band=0;
 if(growing){const J=athJerk(g,cu);P=J.v*g.maxD*1.02;fl=cu>0?J.fl:0;band=J.band*g.maxD*1.02;
  if(cu>0&&J.i!==g.last&&J.i>=0&&J.i<g.n){g.last=J.i;if(J.band>.08)try{sfxPlay("crack");}catch(e){}
   let m=0;for(let i=0;i<g.segs.length&&m<14;i++){const s=g.segs[i];if(s[7]<3&&s[4]<P&&s[5]>=P&&Math.random()<.5){m++;
    for(let j=0;j<3;j++)g.chips.push({x:s[2],y:s[3],vx:rnd(-90,90),vy:rnd(-140,-30),l:1,s:rnd(.8,2.2),r:rnd(0,3)});}}}}
 else P=g.maxD*1.1;
 c.clearRect(0,0,W,H);
 c.save();if(growing&&fl>0){const a=3*fl*fl;c.translate(rnd(-a,a),rnd(-a,a));}
 /* la lastra */
 c.drawImage(g.sheet.c,-4,-4,W+8,H+8);
 if(sp<1){c.save();c.globalCompositeOperation="destination-out";const rh=R*(1-sp)*1.15,gr=c.createRadialGradient(cx,cy,Math.max(0,rh-90),cx,cy,rh+1);
  gr.addColorStop(0,"rgba(0,0,0,1)");gr.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gr;c.fillRect(-10,-10,W+20,H+20);c.restore();}
 const bx=((t*.11)%1.5-.25)*(W+H),gl=c.createLinearGradient(bx-300,0,bx+300,H*.7);
 gl.addColorStop(0,"rgba(220,240,255,0)");gl.addColorStop(.5,"rgba(220,240,255,"+(.06*sp).toFixed(3)+")");gl.addColorStop(1,"rgba(220,240,255,0)");c.fillStyle=gl;c.fillRect(0,0,W,H);
 /* le crepe: ombra nello spessore, alone azzurro, piano di frattura e filo bianco */
 c.lineCap="round";c.lineJoin="round";
 const pass=function(w,col,filt,ox,oy){c.strokeStyle=col;c.lineWidth=w;c.beginPath();
  g.segs.forEach(s=>{if(s[4]>=P||(filt&&!filt(s)))return;const f=Math.min(1,(P-s[4])/(s[5]-s[4]));c.moveTo(s[0]+ox,s[1]+oy);c.lineTo(s[0]+(s[2]-s[0])*f+ox,s[1]+(s[3]-s[1])*f+oy);});c.stroke();};
 pass(2.4,"rgba(2,10,22,.6)",null,1.3,1.6);
 pass(9,"rgba(215,238,255,.06)",s=>s[7]===0,3,3.5);
 pass(3,"rgba(225,242,255,.16)",s=>s[7]===0,2.2,2.8);              // il piano della frattura visto attraverso il ghiaccio
 pass(.7,"rgba(225,242,255,.55)",s=>s[7]===3,0,0);
 pass(4,"rgba(140,205,250,.18)",s=>s[7]<2,0,0);
 pass(1.7,"rgba(240,250,255,.95)",s=>s[7]===0,0,0);
 pass(1.1,"rgba(232,247,255,.9)",s=>s[7]===1,0,0);
 pass(.6,"rgba(225,242,255,.75)",s=>s[7]===2,0,0);
 if(fl>.02&&band>0){const lo=P-band;pass(2.6,"rgba(255,255,255,"+(fl*.9).toFixed(3)+")",s=>s[5]>lo,0,0);}
 if(growing&&cu>0&&cu<1){c.fillStyle="rgba(255,255,255,"+(.9*fl).toFixed(3)+")";
  if(fl>.05)g.segs.forEach(s=>{if(s[7]<3&&s[4]<P&&s[5]>=P){const f=(P-s[4])/(s[5]-s[4]),x=s[0]+(s[2]-s[0])*f,y=s[1]+(s[3]-s[1])*f;c.beginPath();c.arc(x,y,.8+1.2*fl,0,TAU);c.fill();}});}
 /* schegge che saltano a ogni strattone */
 g.chips=g.chips.filter(q=>{q.l-=dt*2.2;if(q.l<=0)return false;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=420*dt;q.r+=dt*8;
  c.save();c.translate(q.x,q.y);c.rotate(q.r);c.fillStyle="rgba(235,248,255,"+q.l.toFixed(3)+")";c.fillRect(-q.s,-q.s*.6,q.s*2,q.s*1.2);c.restore();return true;});
 c.restore();
 /* alla fine il ghiaccio si scioglie dal centro verso le rive */
 if(t>=5){const q=easeIO((t-5)/1.8),rq=q*R*1.2,N=160,hole=new Path2D();
  for(let i=0;i<=N;i++){const a=i/N*TAU;let w=1;g.mp.forEach(m=>{w+=m[2]*Math.sin(m[0]*a+m[1]+t*.8);});const r=rq*w;const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;if(i)hole.lineTo(px,py);else hole.moveTo(px,py);}
  hole.closePath();
  c.save();c.globalCompositeOperation="destination-out";c.fill(hole);c.globalAlpha=.5;c.lineWidth=26;c.stroke(hole);c.restore();
  if(rq>2){c.strokeStyle="rgba(150,210,250,"+(.18*(1-q)).toFixed(3)+")";c.lineWidth=10;c.stroke(hole);c.strokeStyle="rgba(225,245,255,"+(.45*(1-q)).toFixed(3)+")";c.lineWidth=1.6;c.stroke(hole);}}}

/* ============================================================
   PAN LAN — catrame che dilaga e si ritira
============================================================ */
function panGeo(W,H){
 const N=220,M=Math.min(W,H),dens=Math.max(.75,Math.min(1,W*H/(1366*850)));
 const har=[[3,.5],[5,.32],[7,.24],[11,.16],[17,.1]].map(h=>({k:h[0],a:h[1]*rnd(.7,1.2),ph:rnd(0,TAU),w:rnd(.25,.6)*(Math.random()<.5?-1:1)}));
 const fin=[];const nf=Math.round(rnd(7,11));for(let i=0;i<nf;i++)fin.push({th:rnd(0,TAU),w:rnd(.1,.26),lead:rnd(.08,.2)*(Math.random()<.25?-1:1)});
 /* superficie del catrame preparata una volta: nero violaceo con riflessi oleosi */
 const pad=40,tx=layer(W+pad*2,H+pad*2),x=tx.x;
 x.fillStyle="#1a0a2b";x.fillRect(0,0,W+pad*2,H+pad*2);
 try{x.filter="blur(10px)";}catch(e){}
 for(let i=0;i<70*dens;i++){const cx=rnd(0,W+pad*2),cy=rnd(0,H+pad*2),r=rnd(50,240),col=[["70,30,115",.2],["32,12,58",.26],["120,70,175",.1],["58,44,130",.14],["130,60,140",.08]][Math.floor(Math.random()*5)];
  const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,"rgba("+col[0]+","+(col[1]*rnd(.5,1)).toFixed(3)+")");gr.addColorStop(1,"rgba("+col[0]+",0)");x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2);}
 try{x.filter="blur(2px)";}catch(e){}
 for(let i=0;i<26*dens;i++){const x0=rnd(0,W+pad*2),y0=rnd(0,H+pad*2),L=rnd(60,220),a=rnd(-.6,.6);
  x.strokeStyle="hsla("+Math.round(rnd(250,320))+",70%,86%,"+rnd(.05,.13).toFixed(3)+")";x.lineWidth=rnd(1,3.2);x.lineCap="round";x.beginPath();x.moveTo(x0,y0);
  x.quadraticCurveTo(x0+Math.cos(a)*L*.5+rnd(-30,30),y0+Math.sin(a)*L*.5+rnd(-30,30),x0+Math.cos(a)*L,y0+Math.sin(a)*L);x.stroke();}
 try{x.filter="blur(5px)";}catch(e){}
 for(let i=0;i<160*dens;i++){const px=rnd(0,W+pad*2),py=rnd(0,H+pad*2);x.fillStyle="hsla("+Math.round(rnd(240,330))+",65%,78%,"+rnd(.03,.07).toFixed(3)+")";x.beginPath();x.ellipse(px,py,rnd(10,46),rnd(4,16),rnd(0,3),0,TAU);x.fill();}   // madreperla
 try{x.filter="none";}catch(e){}
 const bub=[];for(let i=0;i<34*dens;i++)bub.push({x:rnd(.04,.96)*W,y:rnd(.04,.96)*H,r:rnd(4,13)*Math.max(.7,M/850),per:rnd(1.6,3.4),ph:rnd(0,4)});
 return {N:N,har:har,fin:fin,tex:tx,pad:pad,bub:bub,h:new Float32Array(N),tmp:new Float32Array(N)};}
function panDraw(G,p,t){
 const c=G.ctx,W=G.W,H=G.H,g=G.geo,cx=W/2,cy=H/2,N=g.N,h=g.h,tm=g.tmp;
 const env=4*p*(1-p),retr=t>=5,ax=W/2+70,by=H/2+70;
 /* forma del bordo: si restringe verso il centro (o si riapre dal centro) con lingue e rigonfiamenti */
 for(let i=0;i<N;i++){const th=i/N*TAU,cs=Math.cos(th),sn=Math.sin(th);
  let nz=0;g.har.forEach(q=>{nz+=q.a*Math.sin(q.k*th+q.ph+q.w*t);});
  let fg=0;g.fin.forEach(f=>{let d=Math.abs(th-f.th)%TAU;if(d>Math.PI)d=TAU-d;fg+=f.lead*Math.exp(-(d/f.w)*(d/f.w));});
  const sc=Math.sqrt(1-cl01(p*1.06)),a=ax*sc,b=by*sc;         // radice: l'area coperta cresce in modo regolare
  if(a<=.5||b<=.5){h[i]=0;continue;}
  const n=2+5*sc*sc;                                            // da quasi rettangolo (bordi) a ovale (centro)
  const r=1/Math.pow(Math.pow(Math.abs(cs)/a,n)+Math.pow(Math.abs(sn)/b,n),1/n);
  h[i]=Math.max(0,r*(1+env*(.06*nz+(retr?.6:-1)*fg)));}       // lingue di catrame che avanzano (o il vuoto che si riapre)
 for(let r=0;r<3;r++){for(let i=0;i<N;i++)tm[i]=(h[(i+N-1)%N]+2*h[i]+h[(i+1)%N])/4;h.set(tm);}
 const hole=new Path2D(),pt=i=>{const th=i/N*TAU;return [cx+Math.cos(th)*h[i%N],cy+Math.sin(th)*h[i%N]];};
 let m=pt(0),m1=pt(1);hole.moveTo((m[0]+m1[0])/2,(m[1]+m1[1])/2);
 for(let i=1;i<=N;i++){const a=pt(i),b=pt(i+1);hole.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}
 hole.closePath();
 const tar=new Path2D();tar.rect(-2,-2,W+4,H+4);tar.addPath(hole);
 const maxH=Math.max.apply(null,h);
 c.clearRect(0,0,W,H);
 c.fillStyle="rgba(14,5,24,"+(p*.3).toFixed(3)+")";c.fillRect(0,0,W,H);          // la pagina si oscura un poco
 /* ombra che il catrame getta sulla superficie davanti a sé */
 if(maxH>1){[[48,.08],[28,.1],[14,.14]].forEach(s=>{c.strokeStyle="rgba(0,0,0,"+s[1]+")";c.lineWidth=s[0];c.stroke(hole);});}
 c.save();c.clip(tar,"evenodd");
 c.drawImage(g.tex.c,-g.pad+Math.sin(t*.23)*14,-g.pad+Math.cos(t*.19)*10,W+g.pad*2,H+g.pad*2);
 /* riflesso lucido che scorre lento sulla superficie */
 const bx=((t*.09)%1.6-.3)*(W+H),gl=c.createLinearGradient(bx-260,0,bx+260,H*.6);
 gl.addColorStop(0,"hsla(275,70%,80%,0)");gl.addColorStop(.35,"hsla(300,65%,84%,.1)");gl.addColorStop(.6,"hsla(225,70%,84%,.08)");gl.addColorStop(1,"hsla(275,70%,80%,0)");c.fillStyle=gl;c.fillRect(0,0,W,H);
 const b2=((t*.06+.7)%1.7-.35)*(W+H),g2=c.createLinearGradient(W,b2-200,W-b2*.4,b2+240);
 g2.addColorStop(0,"hsla(320,60%,82%,0)");g2.addColorStop(.5,"hsla(265,70%,86%,.07)");g2.addColorStop(1,"hsla(190,60%,82%,0)");c.fillStyle=g2;c.fillRect(0,0,W,H);
 /* bolle che si gonfiano e scoppiano */
 g.bub.forEach(b=>{const dx=b.x-cx,dy=b.y-cy,th=(Math.atan2(dy,dx)+TAU)%TAU,hi=h[Math.floor(th/TAU*N)%N];if(Math.hypot(dx,dy)<hi+b.r*2+8)return;
  const life=((t+b.ph)/b.per)%1;
  if(life<.82){const r=b.r*easeOut(life/.82);if(r<.6)return;
   const gr=c.createRadialGradient(b.x-r*.35,b.y-r*.45,r*.05,b.x,b.y,r);gr.addColorStop(0,"rgba(240,220,255,.65)");gr.addColorStop(.3,"rgba(95,50,140,.92)");gr.addColorStop(1,"rgba(30,10,50,.96)");
   c.fillStyle=gr;c.beginPath();c.arc(b.x,b.y,r,0,TAU);c.fill();c.strokeStyle="rgba(0,0,0,.55)";c.lineWidth=1.2;c.stroke();}
  else{const q=(life-.82)/.18;c.strokeStyle="rgba(215,190,255,"+(.45*(1-q)).toFixed(3)+")";c.lineWidth=1.4*(1-q)+.3;c.beginPath();c.arc(b.x,b.y,b.r*(1+q*.9),0,TAU);c.stroke();}});
 /* labbro arrotondato sul fronte: alone violaceo e filo di luce dall'alto a sinistra */
 if(maxH>1){c.strokeStyle="rgba(170,120,230,.22)";c.lineWidth=12;c.stroke(hole);
  c.strokeStyle="rgba(0,0,0,.55)";c.lineWidth=3;c.stroke(hole);
  c.save();c.translate(-1.6,-2.2);c.strokeStyle="rgba(244,232,255,.7)";c.lineWidth=1.6;c.stroke(hole);c.restore();
  c.save();c.translate(-3.5,-4.5);c.strokeStyle="rgba(210,190,255,.2)";c.lineWidth=3;c.stroke(hole);c.restore();}
 c.restore();}

/* ============================================================
   Punti d'ingresso usati da js/area-giocatori.js
============================================================ */
window.pgGeo=function(k,W,H){if(k==="athena")return athGeo(W,H);if(k==="panlan")return panGeo(W,H);return asoGeo(W,H);};
window.pgDraw=function(G,p,t){const g=G.geo;
 if(g&&g.aso){if(p<=0&&t<1){G.ctx.clearRect(0,0,G.W,G.H);return;}asoDraw(G,p,t);return;}
 if(p<=0){G.ctx.clearRect(0,0,G.W,G.H);return;}
 if(G.k==="athena")athDraw(G,p,t);else if(G.k==="panlan")panDraw(G,p,t);};
})();
