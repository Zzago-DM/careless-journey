/* Rilievo e biomi delle mappe fisiche */

/* Rilievo e biomi delle carte fisiche: generati nel browser alla prima apertura di ogni continente */
(function(){
var CFG={
 glaciale:{t:["#cfe6f6","#ffffff"],hi:"#ffffff",lo:"#1c3550",tint:.24,rel:.5,con:.12,f:60},
 ardente:{t:["#f0b878","#7a3418"],hi:"#ffe2b0",lo:"#2a0e04",tint:.24,rel:.5,con:.11,f:55},
 terrestre:{t:["#b8dc8a","#163c22"],hi:"#e8ffd0",lo:"#06140a",tint:.26,rel:.48,con:.1,f:50},
 folgorante:{t:["#d8c070","#34342c"],hi:"#fff0c0",lo:"#100e08",tint:.18,rel:.38,con:.07,f:55},
 radiante:{t:["#fff2d6","#a890c0"],hi:"#ffffff",lo:"#34243c",tint:.26,rel:.5,con:.11,f:60},
 oscuro:{t:["#7a68b0","#140f28"],hi:"#c8b8f0",lo:"#04020a",tint:.28,rel:.45,con:.1,f:45},
 ramsgate:{t:["#8cbc58","#2c5426"],hi:"#dff0c0",lo:"#0c1a08",tint:.26,rel:.42,con:.06,f:16}};
function hx(c){return [parseInt(c.substr(1,2),16),parseInt(c.substr(3,2),16),parseInt(c.substr(5,2),16)];}
function hash(x,y,s){var h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,982451653))|0;h=Math.imul(h^h>>>13,1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vn(x,y,s){var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
  var a=hash(ix,iy,s),b=hash(ix+1,iy,s),c=hash(ix,iy+1,s),d=hash(ix+1,iy+1,s);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;}
function fbm(x,y,s){var v=0,amp=.5,n=0;for(var o=0;o<4;o++){v+=amp*vn(x,y,s+o*17);n+=amp;x*=2.03;y*=2.03;amp*=.5;}return v/n;}
function blur(src,w,h,r){
  var a=src;
  for(var pass=0;pass<2;pass++){
    var b=new Float32Array(w*h),c=new Float32Array(w*h),x,y,acc,row,q=2*r+1;
    for(y=0;y<h;y++){row=y*w;acc=0;for(x=-r;x<=r;x++)acc+=a[row+Math.min(w-1,Math.max(0,x))];
      for(x=0;x<w;x++){b[row+x]=acc/q;acc+=a[row+Math.min(w-1,x+r+1)]-a[row+Math.max(0,x-r)];}}
    for(x=0;x<w;x++){acc=0;for(y=-r;y<=r;y++)acc+=b[Math.min(h-1,Math.max(0,y))*w+x];
      for(y=0;y<h;y++){c[y*w+x]=acc/q;acc+=b[Math.min(h-1,y+r+1)*w+x]-b[Math.max(0,y-r)*w+x];}}
    a=c;}
  return a;}
function island(svg,use,cfg,seed,done){
  var id=(use.getAttribute("href")||"").slice(1),p=document.getElementById(id);if(!p)return done();
  var d=p.getAttribute("d"),nums=d.match(/-?\d+\.?\d*/g).map(Number),bx=1e9,by=1e9,ex=-1e9,ey=-1e9,i;
  for(i=0;i+1<nums.length;i+=2){bx=Math.min(bx,nums[i]);ex=Math.max(ex,nums[i]);by=Math.min(by,nums[i+1]);ey=Math.max(ey,nums[i+1]);}
  bx-=2;by-=2;ex+=2;ey+=2;
  var S=2,w=Math.ceil((ex-bx)*S),h=Math.ceil((ey-by)*S),cv=document.createElement("canvas");cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");ctx.setTransform(S,0,0,S,-bx*S,-by*S);ctx.fillStyle="#fff";ctx.fill(new Path2D(d));ctx.setTransform(1,0,0,1,0,0);
  var img=ctx.getImageData(0,0,w,h),D=img.data,N=w*h,m=new Float32Array(N);
  for(i=0;i<N;i++)m[i]=D[i*4+3]/255;
  var inn=blur(m,w,h,Math.round(9*S)),H=new Float32Array(N),G=new Float32Array(N),T=new Float32Array(N),I=new Float32Array(N),f=1/cfg.f,x,y,k;
  for(y=0;y<h;y++)for(x=0;x<w;x++){k=y*w+x;if(m[k]<=0)continue;
    var ux=bx+x/S,uy=by+y/S,ii=Math.min(1,Math.max(0,(inn[k]-.45)/.55));I[k]=ii;
    G[k]=fbm(ux*f,uy*f,seed);H[k]=.3*ii+.7*G[k]*(.35+.65*ii);
    T[k]=fbm(ux*f*.55+50,uy*f*.55+50,seed+9);}
  var tA=hx(cfg.t[0]),tB=hx(cfg.t[1]),HI=hx(cfg.hi),LO=hx(cfg.lo),lev=9,K=26*S;
  for(y=0;y<h;y++)for(x=0;x<w;x++){k=y*w+x;var a0=m[k];
    if(a0<=0||x===0||y===0||x===w-1||y===h-1){D[k*4+3]=0;continue;}
    var pr=0,pg=0,pb=0,pa=0,al,t=T[k],u=t*t*(3-2*t);
    /* biomi: due toni del colore principale */
    al=cfg.tint*(.55+.9*Math.abs(t-.5));
    pr=(tA[0]+(tB[0]-tA[0])*u)*al;pg=(tA[1]+(tB[1]-tA[1])*u)*al;pb=(tA[2]+(tB[2]-tA[2])*u)*al;pa=al;
    /* rilievo con luce da nord-ovest */
    var sh=((H[k+1]-H[k-1])+(H[k+w]-H[k-w]))*K*cfg.rel,C=sh>0?HI:LO;al=Math.min(sh>0?.42:.55,Math.abs(sh));
    if(al>0){pr=C[0]*al+pr*(1-al);pg=C[1]*al+pg*(1-al);pb=C[2]*al+pb*(1-al);pa=al+pa*(1-al);}
    /* isoipse */
    var lv=Math.floor(G[k]*lev);
    if(I[k]>.32&&(lv!==Math.floor(G[k-1]*lev)||lv!==Math.floor(G[k-w]*lev))){al=cfg.con;pr=LO[0]*al+pr*(1-al);pg=LO[1]*al+pg*(1-al);pb=LO[2]*al+pb*(1-al);pa=al+pa*(1-al);}
    /* ombra lungo la costa */
    if(I[k]<.3){al=(.3-I[k])*.9;pr=LO[0]*al+pr*(1-al);pg=LO[1]*al+pg*(1-al);pb=LO[2]*al+pb*(1-al);pa=al+pa*(1-al);}
    pa*=a0;
    if(pa>0){D[k*4]=pr/pa*a0;D[k*4+1]=pg/pa*a0;D[k*4+2]=pb/pa*a0;}
    D[k*4+3]=Math.round(Math.min(1,pa)*255);}
  ctx.putImageData(img,0,0);
  function mk(url,cls,after){
    var im=document.createElementNS("http://www.w3.org/2000/svg","image");
    im.setAttribute("href",url);im.setAttribute("x",bx);im.setAttribute("y",by);im.setAttribute("width",ex-bx);im.setAttribute("height",ey-by);
    im.setAttribute("preserveAspectRatio","none");im.setAttribute("class",cls);im.style.pointerEvents="none";
    after.parentNode.insertBefore(im,after.nextSibling);}
  /* il gruppo di decorazioni dell'isola va trovato prima di inserire il rilievo */
  var dec=use.nextElementSibling;
  while(dec&&dec.tagName.toLowerCase()==="clippath")dec=dec.nextElementSibling;
  mk(cv.toDataURL("image/png"),"relief",use);
  /* secondo strato leggero, solo luci e ombre, sopra le decorazioni dipinte (flora, vulcano, città) */
  if(dec&&dec.tagName.toLowerCase()==="g"&&dec.getAttribute("clip-path")){
    var img2=ctx.createImageData(w,h),E=img2.data;
    for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){k=y*w+x;if(m[k]<=0)continue;
      var s2=((H[k+1]-H[k-1])+(H[k+w]-H[k-w]))*K*cfg.rel,C2=s2>0?HI:LO,a2=Math.min(s2>0?.22:.3,Math.abs(s2)*.55)*m[k];
      E[k*4]=C2[0];E[k*4+1]=C2[1];E[k*4+2]=C2[2];E[k*4+3]=Math.round(a2*255);}
    ctx.putImageData(img2,0,0);mk(cv.toDataURL("image/png"),"relief-top",dec);
  }
  done();
}
function build(key,ov){
  var svg=ov.querySelector(".stage svg");if(!svg||ov._relief)return;ov._relief=1;
  var uses=[].filter.call(svg.children,function(e){return e.tagName.toLowerCase()==="use"&&/^url\(/.test(e.getAttribute("fill")||"");});
  var n=0;(function next(){if(n>=uses.length)return;var u=uses[n++];setTimeout(function(){try{island(svg,u,CFG[key],7+n*31,next);}catch(e){next();}},16);})();
}
Object.keys(CFG).forEach(function(key){
  var ov=document.getElementById("cj-"+key);if(!ov)return;
  if(ov.classList.contains("open"))build(key,ov);
  new MutationObserver(function(){if(ov.classList.contains("open"))build(key,ov);}).observe(ov,{attributes:true,attributeFilter:["class"]});
});
})();
