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
  var STARS=[];for(var k=0;k<110;k++){STARS.push([Math.random(),Math.random(),Math.random()*0.5+0.2]);}
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
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(8,10,15,'+(!triggered?0.5:0.3)+')';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(208,200,184,0.5)';
    for(var s=0;s<STARS.length;s++){var stx=STARS[s],tw=0.4+0.6*Math.abs(Math.sin(t*1.2+s));ctx.globalAlpha=stx[2]*tw*0.6;ctx.fillRect(stx[0]*W,stx[1]*H,1.3,1.3);}
    ctx.globalAlpha=1;
    if(triggered){pulsarGlow(te);}
    var ang=triggered?aFreeze:t*ROT,ca=Math.cos(ang),sa=Math.sin(ang);
    var planetA=!triggered?1:(te<tExpEnd?1-easeOut(te/T.exp):0);
    if(planetA>0.02){drawPlanet(planetA);}
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
      ctx.beginPath();
      for(var v=0;v<ff.shape.length;v++){var sx=ff.shape[v][0],sy=ff.shape[v][1];var px=ff._X+ssz*(sx*ff._ux+sy*ff._vx),py=ff._Y+ssz*(sx*ff._uy+sy*ff._vy);if(v===0){ctx.moveTo(px,py);}else{ctx.lineTo(px,py);}}
      ctx.closePath();ctx.fill();
    }
    if(planetA>0.02){drawAtmosphere(planetA);}
    if(triggered){pulsarJets(te);}
    if(triggered&&te>=tTitle&&ttl&&!ttl.classList.contains('show')){ttl.classList.add('show');}
    if(triggered&&!hintBack&&te>=tTitle+0.8){hintBack=true;if(hint){hint.style.animation='';hint.style.opacity='';}}
    raf=requestAnimationFrame(frame);
  }
  function finish(){if(done){return;}done=true;cancelAnimationFrame(raf);document.body.style.overflow='';if(intro&&intro.parentNode){intro.parentNode.removeChild(intro);}window.removeEventListener('resize',resize);}
  function exitIntro(){if(done){return;}if(intro){intro.classList.add('hide');}setTimeout(finish,1150);}
  function trigger(){if(triggered||done){return;}triggered=true;if(hint){hint.style.animation='none';hint.style.opacity='0';}if(window.__sfxBoom){try{window.__sfxBoom(0.6);}catch(e){}}setTimeout(function(){if(!done&&window.__sfxVortex){try{window.__sfxVortex();}catch(e){}}},T.exp*1000);}
  intro.addEventListener('click',function(){if(done){return;}if(!triggered){trigger();}else{exitIntro();}});
  if(skip){skip.addEventListener('click',function(e){e.stopPropagation();exitIntro();});}
  if(reduce){if(ttl){ttl.classList.add('show');}intro.classList.add('hide');setTimeout(finish,900);}
  else{raf=requestAnimationFrame(frame);}
})();
