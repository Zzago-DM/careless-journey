/* Animazione di apertura del sito (schermata introduttiva) */

(function(){
  var intro=document.getElementById('intro'),cv=document.getElementById('introCanvas'),ttl=document.getElementById('introTitle'),hint=document.getElementById('introHint'),skip=document.getElementById('introSkip');
  if(!intro||!cv){return;}
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ctx=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),W=0,H=0,cx=0,cy=0;
  function resize(){W=cv.clientWidth||window.innerWidth;H=cv.clientHeight||window.innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);cx=W/2;cy=H/2;}
  resize();window.addEventListener('resize',resize);
  document.body.style.overflow='hidden';
  var ROT=0.32;
  var T={exp:2.4,settle:3.4,orbit:12.0,fade:3.0};
  var tExpEnd=T.exp,tSetEnd=tExpEnd+T.settle,tOrbEnd=tSetEnd+T.orbit,tTitle=tSetEnd+0.6,tFade=tOrbEnd,tEnd=tFade+T.fade;
  var GLOBE=Math.min(W,H)*0.18;if(GLOBE<100){GLOBE=100;}if(GLOBE>170){GLOBE=170;}
  var maxR=Math.max(220,Math.min(W,H)*0.62);
  var VFLAT=0.55;
  var AETHER=[[126,200,227],[224,90,32],[240,208,32],[139,104,64],[212,168,255],[136,96,208]];
  var DEG=Math.PI/180;
  var CC=[[8,20,0.55],[48,95,0.55],[50,-100,0.5],[-18,-62,0.48],[-28,134,0.4],[-82,8,0.5]];
  function hsl2rgb(h,s,l){var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
  function angDist(la1,lo1,la2,lo2){return Math.acos(Math.max(-1,Math.min(1,Math.sin(la1)*Math.sin(la2)+Math.cos(la1)*Math.cos(la2)*Math.cos(lo1-lo2))));}
  var CONT=reduce?0:6;
  var N=reduce?0:480,F=[];
  for(var i=0;i<N;i++){
    var cont=i<CONT;
    var x0,y0,z0,lat,lon;
    if(cont){lat=CC[i][0]*DEG;lon=CC[i][1]*DEG;x0=Math.cos(lat)*Math.cos(lon);y0=Math.sin(lat);z0=Math.cos(lat)*Math.sin(lon);}
    else{var u=Math.random()*2-1,ph=Math.random()*Math.PI*2,si=Math.sqrt(1-u*u);x0=si*Math.cos(ph);y0=u;z0=si*Math.sin(ph);lat=Math.asin(y0);lon=Math.atan2(z0,x0);}
    var ec,isLand=false;
    if(Math.abs(y0)>0.9){ec=[(205+Math.random()*30)|0,(218+Math.random()*28)|0,(232+Math.random()*23)|0];isLand=true;}
    else{
      var landNear=cont;
      if(!cont){for(var c=0;c<CC.length;c++){if(angDist(lat,lon,CC[c][0]*DEG,CC[c][1]*DEG)<CC[c][2]){landNear=true;break;}}}
      if(landNear){isLand=true;if(Math.random()<0.24){ec=[(110+Math.random()*40)|0,(92+Math.random()*30)|0,(58+Math.random()*25)|0];}else{ec=[(55+Math.random()*45)|0,(100+Math.random()*55)|0,(48+Math.random()*35)|0];}}
      else{ec=[(22+Math.random()*28)|0,(70+Math.random()*45)|0,(120+Math.random()*55)|0];}
    }
    var tc;
    if(cont){tc=[AETHER[i][0],AETHER[i][1],AETHER[i][2]];}
    else{tc=hsl2rgb(Math.random()*360,0.55+Math.random()*0.25,0.5+Math.random()*0.12);}
    var er=maxR*(0.5+Math.random()*0.55);
    var br=cont?maxR*(0.42+i/CONT*0.4):maxR*(0.3+Math.pow(Math.random(),0.6)*0.64);
    var a0=cont?(i/CONT*Math.PI*2):Math.random()*Math.PI*2;
    var spd=0.34*(0.45+(maxR*0.16)/Math.sqrt(br));
    var sz=cont?(16.5+Math.random()*6):(2.8+Math.random()*1.4);
    var verts=cont?(6+(Math.random()*3|0)):(4+(Math.random()*3|0)),shape=[];
    for(var v=0;v<verts;v++){var an=v/verts*Math.PI*2+Math.random()*0.5,rr0=0.74+Math.random()*0.5;shape.push([Math.cos(an)*rr0,Math.sin(an)*rr0]);}
    var upx=0,upy=1,upz=0;if(Math.abs(y0)>0.92){upx=1;upy=0;upz=0;}
    var ux=upy*z0-upz*y0,uy=upz*x0-upx*z0,uz=upx*y0-upy*x0,ul=Math.sqrt(ux*ux+uy*uy+uz*uz)||1;ux/=ul;uy/=ul;uz/=ul;
    var vx=y0*uz-z0*uy,vy=z0*ux-x0*uz,vz=x0*uy-y0*ux;
    F.push({x0:x0,y0:y0,z0:z0,cont:cont,ec:ec,tc:tc,er:er,br:br,a0:a0,spd:spd,sz:sz,shape:shape,vy:(Math.random()*2-1)*18,
      u0x:ux,u0y:uy,u0z:uz,v0x:vx,v0y:vy,v0z:vz,tby:(Math.random()*2-1)*0.4,tbx:(Math.random()*2-1)*0.3});
  }
  var order=[];
  function clamp01(t){return t<0?0:t>1?1:t;}
  function ease(t){t=clamp01(t);return t*t*(3-2*t);}
  function easeOut(t){t=clamp01(t);return 1-Math.pow(1-t,3);}
  function lerp(a,b,t){return a+(b-a)*t;}
  var STARS=[];for(var k=0;k<170;k++){var tint=Math.random();STARS.push([Math.random(),Math.random(),Math.random()*0.5+0.2,tint<0.15?'190,215,255':tint<0.25?'255,226,170':'208,200,184',Math.random()<0.12?2:1.3,0.6+Math.random()*1.6]);}STARS.sort(function(a,b){return a[3]<b[3]?-1:a[3]>b[3]?1:0;});
  /* --- Effetti aggiunti: nebulose, stelle cadenti, onda d'urto, scintille, risucchio nel vortice, archi di energia --- */
  var NEB=[[126,200,227],[136,96,208],[224,90,32],[143,191,106]].map(function(c){return {c:c,x:0.15+Math.random()*0.7,y:0.15+Math.random()*0.7,r:0.32+Math.random()*0.22,ph:Math.random()*6.28};});
  var NEBC=null,NEBW=0,NEBH=0;
  function buildNebula(){  /* sfondo scuro con nebulose, disegnato una volta in piccolo e poi ingrandito */
    NEBW=W;NEBH=H;NEBC=document.createElement('canvas');var q=0.25,w=Math.max(2,(W*q)|0),h=Math.max(2,(H*q)|0);NEBC.width=w;NEBC.height=h;var c=NEBC.getContext('2d');
    c.fillStyle='rgb(8,10,15)';c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';
    for(var i=0;i<NEB.length;i++){var n=NEB[i],x=n.x*w,y=n.y*h,r=n.r*Math.max(w,h);var g=c.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba('+n.c+',0.07)');g.addColorStop(1,'rgba('+n.c+',0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
  }
  function fadeBg(t,a){
    if(!NEBC||NEBW!==W||NEBH!==H){buildNebula();}
    ctx.globalAlpha=a;ctx.drawImage(NEBC,Math.sin(t*0.05)*W*0.03-W*0.04,Math.cos(t*0.04)*H*0.03-H*0.04,W*1.08,H*1.08);ctx.globalAlpha=1;
  }
  var SHOOT=null,nextShoot=1.5+Math.random()*2.5;
  function drawShootingStar(t,dt){
    if(!SHOOT&&t>nextShoot){var fromL=Math.random()<0.5;SHOOT={x:fromL?Math.random()*W*0.5:W*(0.5+Math.random()*0.5),y:Math.random()*H*0.35,vx:(fromL?1:-1)*(420+Math.random()*260),vy:160+Math.random()*120,l:0,L:0.9};}
    if(!SHOOT){return;}
    SHOOT.l+=dt;SHOOT.x+=SHOOT.vx*dt;SHOOT.y+=SHOOT.vy*dt;
    var a=Math.sin(Math.PI*clamp01(SHOOT.l/SHOOT.L)),tx=SHOOT.x-SHOOT.vx*0.16,ty=SHOOT.y-SHOOT.vy*0.16;
    var g=ctx.createLinearGradient(SHOOT.x,SHOOT.y,tx,ty);g.addColorStop(0,'rgba(255,240,205,'+(0.85*a)+')');g.addColorStop(1,'rgba(255,240,205,0)');
    ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(SHOOT.x,SHOOT.y);ctx.lineTo(tx,ty);ctx.stroke();
    if(SHOOT.l>=SHOOT.L){SHOOT=null;nextShoot=t+3+Math.random()*5;}
  }
  function drawInvite(t){
    var ph=(t%2.6)/2.6,r=GLOBE*(1.08+ph*0.55);
    ctx.strokeStyle='rgba(150,205,255,'+(0.22*(1-ph)*(1-ph))+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,r,0,6.2832);ctx.stroke();
  }
  var SP=[];
  function burst(){
    var S=GLOBE/120;
    for(var i=0;i<170;i++){var a=Math.random()*6.2832,v=(140+Math.random()*560)*S,c=Math.random()<0.25?[235,245,255]:AETHER[(Math.random()*6)|0];
      SP.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.8,l:0,L:0.8+Math.random()*1.1,c:c,w:0.8+Math.random()*1.6});}
  }
  function drawSparks(dt){
    if(!SP.length){return;}
    ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    var drag=Math.pow(0.12,dt);
    for(var i=SP.length-1;i>=0;i--){var p=SP[i];p.l+=dt;if(p.l>=p.L){SP.splice(i,1);continue;}
      p.vx*=drag;p.vy*=drag;p.vy+=14*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      var a=1-p.l/p.L;ctx.strokeStyle='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+(a*0.9)+')';ctx.lineWidth=p.w;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*0.035,p.y-p.vy*0.035);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
  }
  function drawBlast(te){
    ctx.globalCompositeOperation='lighter';
    if(te<0.4){var fa=Math.pow(1-te/0.4,2);var fg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.75);
      fg.addColorStop(0,'rgba(235,245,255,'+(0.5*fa)+')');fg.addColorStop(0.3,'rgba(160,205,255,'+(0.12*fa)+')');fg.addColorStop(1,'rgba(120,160,255,0)');
      ctx.fillStyle=fg;ctx.fillRect(0,0,W,H);}
    var rings=[[0,'232,200,112'],[0.16,'150,215,255'],[0.34,'212,168,255']];
    for(var k=0;k<rings.length;k++){var q=(te-rings[k][0])/1.5;if(q<=0||q>=1){continue;}var e=easeOut(q),r=e*maxR*1.55;
      ctx.strokeStyle='rgba('+rings[k][1]+','+(0.4*(1-q)*(1-q))+')';ctx.lineWidth=(1-q)*4+0.5;
      ctx.beginPath();ctx.ellipse(cx,cy,r,r*0.72,0,0,6.2832);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
  }
  var shaking=false;
  function shake(te){
    if(te<0.75){var k=(1-te/0.75)*8;cv.style.transform='translate('+((Math.random()-0.5)*k).toFixed(1)+'px,'+((Math.random()-0.5)*k).toFixed(1)+'px)';shaking=true;}
    else if(shaking){cv.style.transform='';shaking=false;}
  }
  var IN=[];
  function infall(te,dt){
    var want=te<tExpEnd*0.7?0:Math.min(90,((te-tExpEnd*0.7)*40)|0),S=GLOBE/120;
    while(IN.length<want){var cc=Math.random()<0.6?[185,225,255]:AETHER[(Math.random()*6)|0];IN.push({a:Math.random()*6.2832,r:maxR*(0.75+Math.random()*0.45),c:cc,s:0.6+Math.random()*1.2,v:0.6+Math.random()*0.8});}
    var B={};
    for(var i=0;i<IN.length;i++){var p=IN[i],x0=cx+Math.cos(p.a)*p.r,y0=cy+Math.sin(p.a)*p.r*VFLAT;
      p.r-=(26+maxR*14/(p.r+20))*p.v*dt;p.a+=(0.5+46/(p.r+14))*p.v*dt;
      if(p.r<8*S){p.r=maxR*(0.8+Math.random()*0.4);p.a=Math.random()*6.2832;continue;}
      var x1=cx+Math.cos(p.a)*p.r,y1=cy+Math.sin(p.a)*p.r*VFLAT;
      var a=Math.min(1,(maxR*1.2-p.r)/(maxR*0.35))*Math.min(1,p.r/(30*S));if(a<=0.05){continue;}
      var key=p.c.join(',')+'|'+Math.ceil(a*3)+'|'+(p.s>1.2?1:0);(B[key]||(B[key]=[])).push(x0,y0,x1,y1);}
    ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(var k in B){var parts=k.split('|'),L=B[k];ctx.strokeStyle='rgba('+parts[0]+','+(0.55*parts[1]/3)+')';ctx.lineWidth=parts[2]==='1'?1.6:0.9;
      ctx.beginPath();for(var j=0;j<L.length;j+=4){ctx.moveTo(L[j],L[j+1]);ctx.lineTo(L[j+2],L[j+3]);}ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
  }
  var ARCS=[],nextArc=0;
  function bolt(x1,y1,x2,y2,c,w,al){
    var n=9,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/len,ny=dx/len;
    ctx.beginPath();ctx.moveTo(x1,y1);
    for(var i=1;i<n;i++){var s=i/n,o=(Math.random()-0.5)*len*0.16*Math.sin(s*Math.PI);ctx.lineTo(x1+dx*s+nx*o,y1+dy*s+ny*o);}
    ctx.lineTo(x2,y2);ctx.strokeStyle='rgba('+c+','+al+')';ctx.lineWidth=w;ctx.stroke();
  }
  function drawArcs(t,te){
    if(te<tSetEnd-1){return;}
    if(t>nextArc){var i=(Math.random()*CONT)|0,toCore=Math.random()<0.4,j=toCore?-1:(i+1+((Math.random()*(CONT-1))|0))%CONT;
      ARCS.push({i:i,j:j,b:t});nextArc=t+0.9+Math.random()*1.8;}
    ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
    for(var k=ARCS.length-1;k>=0;k--){var A=ARCS[k],age=t-A.b;if(age>0.32){ARCS.splice(k,1);continue;}
      var fi=F[A.i],x2=A.j<0?cx:F[A.j]._X,y2=A.j<0?cy:F[A.j]._Y;if(fi._X===undefined||x2===undefined){continue;}
      var c=fi.tc[0]+','+fi.tc[1]+','+fi.tc[2],al=(1-age/0.32);
      bolt(fi._X,fi._Y,x2,y2,c,4,0.18*al);bolt(fi._X,fi._Y,x2,y2,'235,245,255',1.2,0.75*al);}
    ctx.globalCompositeOperation='source-over';
  }
  var lastT=0;
  var start=null,raf=0,done=false,triggered=false,tTrig=null,aFreeze=0,hintBack=false;
  function bhAlpha(te){return ease(te/1.6);}
  function pulsarGlow(te){
    var a=bhAlpha(te);if(a<=0){return;}
    var S=GLOBE/120,pulse=0.55+0.45*Math.pow(0.5+0.5*Math.sin(te*4.2),3),spin=te*1.9;
    ctx.globalCompositeOperation='lighter';
    var rG=(20+9*a)*(1+0.12*Math.sin(te*2))*S;
    var g=ctx.createRadialGradient(cx,cy,2*S,cx,cy,rG*2.8);
    g.addColorStop(0,'rgba(150,200,255,'+(0.17*a*pulse)+')');g.addColorStop(0.4,'rgba(120,150,230,'+(0.07*a)+')');g.addColorStop(1,'rgba(90,120,200,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,rG*2.8,0,6.2832);ctx.fill();
    ctx.save();ctx.translate(cx,cy);ctx.scale(1,0.32);ctx.rotate(spin*0.5);
    for(var r=0;r<2;r++){ctx.beginPath();ctx.arc(0,0,rG*(0.85+r*0.3),0,6.2832);ctx.strokeStyle='rgba('+(170-r*30)+','+(205-r*20)+',255,'+(0.14*a)+')';ctx.lineWidth=(2-r)*1.2+0.8;ctx.stroke();}
    ctx.restore();ctx.globalCompositeOperation='source-over';
  }
  function pulsarJets(te){
    var a=bhAlpha(te);if(a<=0){return;}
    var S=GLOBE/120,pulse=0.55+0.45*Math.pow(0.5+0.5*Math.sin(te*4.2),3),spin=te*1.9;
    ctx.globalCompositeOperation='lighter';
    var jet=(82+30*pulse)*a*S,nS=5,steps=22;
    for(var d=0;d<2;d++){
      var dir=d===0?-1:1;
      for(var k=0;k<nS;k++){
        for(var st=1;st<=steps;st++){
          var s=st/steps;
          var phi=k*(6.2832/nS)+s*7.6+spin*dir;
          var fw=(1.1+s*12)*S;
          var px=cx+Math.cos(phi)*fw;
          var py=cy+dir*s*jet-dir*Math.sin(s*Math.PI)*3*S;
          var front=(Math.sin(phi)+1)/2;
          var ds=(0.7+1.5*s)*(0.45+0.55*front)*S;
          var al=a*pulse*(0.5+0.5*front)*(1-s*0.35)*0.5;
          if(al<=0.01){continue;}
          var cr=lerp(200,120,s)|0,cgc=lerp(228,178,s)|0;
          ctx.fillStyle='rgba('+cr+','+cgc+',255,'+al+')';
          ctx.beginPath();ctx.arc(px,py,ds,0,6.2832);ctx.fill();
        }
      }
    }
    ctx.globalCompositeOperation='source-over';
    var rCore=(3+2.5*a)*S;
    var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,rCore+3*S);
    cg.addColorStop(0,'#000');cg.addColorStop(0.66,'#03060c');cg.addColorStop(0.9,'rgba(180,214,255,'+(0.62*a*pulse)+')');cg.addColorStop(1,'rgba(150,190,255,0)');
    ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,rCore+3*S,0,6.2832);ctx.fill();
  }
  function drawPlanet(planetA){
    var pg=ctx.createRadialGradient(cx-GLOBE*0.34,cy-GLOBE*0.36,GLOBE*0.08,cx,cy,GLOBE*1.04);
    pg.addColorStop(0,'rgba(70,130,200,'+(0.96*planetA)+')');
    pg.addColorStop(0.5,'rgba(34,80,150,'+(0.95*planetA)+')');
    pg.addColorStop(0.85,'rgba(14,40,90,'+(0.9*planetA)+')');
    pg.addColorStop(1,'rgba(8,20,50,0)');
    ctx.fillStyle=pg;ctx.beginPath();ctx.arc(cx,cy,GLOBE*1.04,0,6.2832);ctx.fill();
  }
  function drawAtmosphere(planetA){
    ctx.globalCompositeOperation='lighter';
    var ag=ctx.createRadialGradient(cx,cy,GLOBE*0.86,cx,cy,GLOBE*1.2);
    ag.addColorStop(0,'rgba(90,160,235,0)');
    ag.addColorStop(0.62,'rgba(120,185,255,'+(0.16*planetA)+')');
    ag.addColorStop(0.83,'rgba(150,205,255,'+(0.3*planetA)+')');
    ag.addColorStop(1,'rgba(150,205,255,0)');
    ctx.fillStyle=ag;ctx.beginPath();ctx.arc(cx,cy,GLOBE*1.2,0,6.2832);ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }
  function frame(ts){
    if(start===null){start=ts;}
    var t=(ts-start)/1000;
    if(triggered&&tTrig===null){tTrig=t;aFreeze=t*ROT;}
    var te=triggered?(t-tTrig):-1;
    var dt=Math.min(0.05,Math.max(0,t-lastT));lastT=t;
    ctx.globalCompositeOperation='source-over';
    fadeBg(t,!triggered?0.5:0.3);
    var lastC='';for(var s=0;s<STARS.length;s++){var stx=STARS[s],tw=0.35+0.65*Math.abs(Math.sin(t*stx[5]+s));if(stx[3]!==lastC){lastC=stx[3];ctx.fillStyle='rgb('+lastC+')';}ctx.globalAlpha=stx[2]*tw*0.7;ctx.fillRect(stx[0]*W+Math.sin(t*0.04+s)*3,stx[1]*H,stx[4],stx[4]);}
    ctx.globalAlpha=1;
    drawShootingStar(t,dt);
    if(triggered){shake(te);}
    if(triggered){pulsarGlow(te);}
    var ang=triggered?aFreeze:t*ROT,ca=Math.cos(ang),sa=Math.sin(ang);
    var planetA=!triggered?1:(te<tExpEnd?1-easeOut(te/T.exp):0);
    if(!triggered){drawInvite(t);}
    if(planetA>0.02){drawPlanet(planetA);}
    if(triggered){infall(te,dt);}
    var morph=triggered?ease((te-T.exp*0.25)/(T.exp*0.75+T.settle*0.7)):0;
    var pY0=triggered?aFreeze:ang;
    var on=0;
    for(var i=0;i<F.length;i++){
      var f=F[i];
      var rx=f.x0*ca+f.z0*sa,rz=-f.x0*sa+f.z0*ca,ry=f.y0;
      var gx=cx+rx*GLOBE,gy=cy+ry*GLOBE,dGlobe=(rz+1)/2;
      var X,Y,depth,al,scale;
      if(!triggered){X=gx;Y=gy;depth=dGlobe;al=0.74+0.26*dGlobe;scale=0.55+0.62*dGlobe;}
      else if(te<tExpEnd){var p=easeOut(te/T.exp);var ex=cx+rx*f.er,ey=cy+ry*f.er*0.7;X=lerp(gx,ex,p);Y=lerp(gy,ey,p);depth=dGlobe;al=0.92;scale=0.6+0.62*dGlobe+0.35*p;}
      else{
        var to=te-tExpEnd;
        var rr=f.br;
        var ang2=f.a0+f.spd*to;
        var ox=cx+Math.cos(ang2)*rr,oy=cy+Math.sin(ang2)*rr*VFLAT+f.vy*0.3,od=(Math.sin(ang2)+1)/2;
        if(te<tSetEnd){var q=ease((te-tExpEnd)/T.settle);var ex2=cx+rx*f.er,ey2=cy+ry*f.er*0.7;X=lerp(ex2,ox,q);Y=lerp(ey2,oy,q);depth=od;al=0.9;scale=0.7+0.5*od;}
        else{X=ox;Y=oy;depth=od;al=0.6+0.4*od;scale=0.55+0.6*od;}
      }
      if(!triggered&&rz<-0.04){continue;}
      var pY=triggered?(pY0+te*f.tby):pY0,pX=triggered?(te*f.tbx):0;
      var cY=Math.cos(pY),sY=Math.sin(pY),cX=Math.cos(pX),sX=Math.sin(pX);
      var ux1=f.u0x*cY+f.u0z*sY,uz1=-f.u0x*sY+f.u0z*cY,uy2=f.u0y*cX-uz1*sX;
      var vx1=f.v0x*cY+f.v0z*sY,vz1=-f.v0x*sY+f.v0z*cY,vy2=f.v0y*cX-vz1*sX;
      var face=Math.abs(ux1*vy2-uy2*vx1);if(face>1){face=1;}
      f._X=X;f._Y=Y;f._d=depth;f._a=al;f._s=scale;f._ux=ux1;f._uy=uy2;f._vx=vx1;f._vy=vy2;f._f=face;
      f._r=f.ec[0]+(f.tc[0]-f.ec[0])*morph;f._g=f.ec[1]+(f.tc[1]-f.ec[1])*morph;f._b=f.ec[2]+(f.tc[2]-f.ec[2])*morph;
      order[on++]=i;
    }
    order.length=on;
    order.sort(function(a,b){return F[a]._d-F[b]._d;});
    for(var oi=0;oi<on;oi++){
      var ff=F[order[oi]],dep=ff._d;
      var dsh=(ff.cont?(0.66+0.34*dep):(0.45+0.55*dep))*(0.74+0.26*ff._f);
      ctx.fillStyle='rgba('+((ff._r*dsh)|0)+','+((ff._g*dsh)|0)+','+((ff._b*dsh)|0)+','+ff._a+')';
      var ssz=ff.sz*ff._s*1.7;
      if(ff.cont&&morph>0.05){var gl=ctx.createRadialGradient(ff._X,ff._Y,0,ff._X,ff._Y,ssz*2.1),ga=0.16*morph*(0.7+0.3*Math.sin(t*2.2+order[oi]));
        gl.addColorStop(0,'rgba('+ff.tc[0]+','+ff.tc[1]+','+ff.tc[2]+','+ga+')');gl.addColorStop(1,'rgba('+ff.tc[0]+','+ff.tc[1]+','+ff.tc[2]+',0)');
        ctx.globalCompositeOperation='lighter';ctx.fillStyle=gl;ctx.beginPath();ctx.arc(ff._X,ff._Y,ssz*2.1,0,6.2832);ctx.fill();ctx.globalCompositeOperation='source-over';
        ctx.fillStyle='rgba('+((ff._r*dsh)|0)+','+((ff._g*dsh)|0)+','+((ff._b*dsh)|0)+','+ff._a+')';}
      ctx.beginPath();
      for(var v=0;v<ff.shape.length;v++){var sx=ff.shape[v][0],sy=ff.shape[v][1];var px=ff._X+ssz*(sx*ff._ux+sy*ff._vx),py=ff._Y+ssz*(sx*ff._uy+sy*ff._vy);if(v===0){ctx.moveTo(px,py);}else{ctx.lineTo(px,py);}}
      ctx.closePath();ctx.fill();
    }
    if(planetA>0.02){drawAtmosphere(planetA*(triggered?1:0.85+0.3*Math.sin(t*1.7)));}
    if(triggered){drawArcs(t,te);pulsarJets(te);drawSparks(dt);drawBlast(te);}
    if(triggered&&te>=tTitle&&ttl&&!ttl.classList.contains('show')){ttl.classList.add('show');}
    if(triggered&&!hintBack&&te>=tTitle+0.8){hintBack=true;if(hint){hint.style.animation='';hint.style.opacity='';}}
    raf=requestAnimationFrame(frame);
  }
  function finish(){if(done){return;}done=true;cancelAnimationFrame(raf);document.body.style.overflow='';if(intro&&intro.parentNode){intro.parentNode.removeChild(intro);}window.removeEventListener('resize',resize);}
  function exitIntro(){if(done){return;}if(intro){intro.classList.add('hide');}setTimeout(finish,1150);}
  function trigger(){if(triggered||done){return;}triggered=true;burst();if(hint){hint.style.animation='none';hint.style.opacity='0';}if(window.__sfxBoom){try{window.__sfxBoom(0.6);}catch(e){}}setTimeout(function(){if(!done&&window.__sfxVortex){try{window.__sfxVortex();}catch(e){}}},T.exp*1000);}
  intro.addEventListener('click',function(){if(done){return;}if(!triggered){trigger();}else{exitIntro();}});
  if(skip){skip.addEventListener('click',function(e){e.stopPropagation();exitIntro();});}
  if(reduce){if(ttl){ttl.classList.add('show');}intro.classList.add('hide');setTimeout(finish,900);}
  else{raf=requestAnimationFrame(frame);}
})();
