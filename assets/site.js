(function(){
  var WA='5548999795245';
  document.querySelectorAll('[data-wa]').forEach(function(a){
    a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(a.getAttribute('data-wa'));
    a.target='_blank';a.rel='noopener';
  });
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  // menu
  var t=document.getElementById('menu-toggle'), m=document.getElementById('mobile-menu');
  t.addEventListener('click',function(){var open=m.hidden;m.hidden=!open;t.setAttribute('aria-expanded',String(open));});
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.hidden=true;t.setAttribute('aria-expanded','false');});});

  // tabs
  var tabs=document.querySelectorAll('.tab');
  tabs.forEach(function(tab){tab.addEventListener('click',function(){
    tabs.forEach(function(o){var sel=o===tab;o.setAttribute('aria-selected',String(sel));document.getElementById(o.getAttribute('aria-controls')).hidden=!sel;});
  });});

  // vídeos: prévia sem som quando aparecem na tela; toque = reinicia com som
  var players=[].slice.call(document.querySelectorAll('.vplayer'));
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function srcOf(el){var k=el.getAttribute('data-src');return (window.__VIDS&&window.__VIDS[k])||k;}
  function vid(el){var v=el.querySelector('video');if(!v.getAttribute('src')){v.src=srcOf(el);v.load();}return v;}
  function safePlay(v,el){var p=v.play();if(p&&p.catch)p.catch(function(){el.classList.remove('is-loading');});}
  function preview(el){if(reduce||el.classList.contains('is-active'))return;var v=vid(el);v.muted=true;v.loop=true;safePlay(v,el);}
  function deactivate(el){var v=el.querySelector('video');el.classList.remove('is-active','is-loading');v.controls=false;v.muted=true;v.loop=true;if(!el._visible||reduce)v.pause();}
  players.forEach(function(el){
    var v=el.querySelector('video');
    v.addEventListener('waiting',function(){el.classList.add('is-loading');});
    v.addEventListener('playing',function(){el.classList.remove('is-loading');});
    v.addEventListener('canplay',function(){el.classList.remove('is-loading');});
    v.addEventListener('error',function(){deactivate(el);});
    v.addEventListener('ended',function(){deactivate(el);v.currentTime=0;if(el._visible)preview(el);});
    el.querySelector('.vp-overlay').addEventListener('click',function(){
      players.forEach(function(o){if(o!==el&&o.classList.contains('is-active'))deactivate(o);});
      var v2=vid(el);el.classList.add('is-active','is-loading');
      v2.loop=false;v2.muted=false;v2.controls=true;
      try{v2.currentTime=0;}catch(e){}
      var p=v2.play();
      if(p&&p.catch)p.catch(function(){v2.muted=true;safePlay(v2,el);});
    });
  });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){entries.forEach(function(en){
      var el=en.target;el._visible=en.isIntersecting;
      if(en.isIntersecting)preview(el);
      else if(!el.classList.contains('is-active')){var v=el.querySelector('video');if(!v.paused)v.pause();}
    });},{threshold:.45});
    players.forEach(function(el){io.observe(el);});
  }

  // scrollytelling: a rolagem conduz a sequência de quadros
  var seqs=[].slice.call(document.querySelectorAll('.scrolly'));
  seqs.forEach(function(sec){
    var base=sec.getAttribute('data-seq'),N=+sec.getAttribute('data-frames'),cv=sec.querySelector('canvas'),ctx=cv.getContext('2d');
    var imgs=new Array(N),loaded=new Array(N),cur=0,target=0,raf=0,lastDrawn=-1;
    var caps=[].slice.call(sec.querySelectorAll('.cap')),fill=sec.querySelector('.fill'),cue=sec.querySelector('.scroll-cue'),loader=sec.querySelector('.scrolly-loading');
    function srcOf(i){var k=base+String(i).padStart(3,'0')+'.jpg';return (window.__SEQ&&window.__SEQ[k])||k;}
    function load(i){if(imgs[i])return;var im=new Image();im.decoding='async';im.onload=function(){loaded[i]=true;if(i===0){loader.classList.add('done');draw(true);}else if(Math.abs(i-cur)<4)draw(true);};im.src=srcOf(i);imgs[i]=im;}
    function nearest(i){if(loaded[i])return i;for(var d=1;d<N;d++){if(i-d>=0&&loaded[i-d])return i-d;if(i+d<N&&loaded[i+d])return i+d;}return -1;}
    function size(){var dpr=Math.min(window.devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);draw(true);}
    function draw(force){var i=nearest(Math.round(cur));if(i<0||(!force&&i===lastDrawn))return;lastDrawn=i;var im=imgs[i];
      var cw=cv.width,ch=cv.height,iw=im.naturalWidth,ih=im.naturalHeight,sc=Math.max(cw/iw,ch/ih),fx=.5,fy=.5,portrait=ch>cw*1.05;
      if(portrait){sc*=.72;fy=.36;}else if(cw/ch>1.25){sc*=1.12;fx=.63;}
      var w=iw*sc,h=ih*sc,dx=cw*fx-w/2,dy=ch*fy-h/2;
      if(!portrait){dx=Math.min(0,Math.max(cw-w,dx));dy=Math.min(0,Math.max(ch-h,dy));}
      ctx.fillStyle='#24090F';ctx.fillRect(0,0,cw,ch);ctx.drawImage(im,dx,dy,w,h);
      if(portrait){var e=Math.round(ch*.08),g1=ctx.createLinearGradient(0,dy,0,dy+e);g1.addColorStop(0,'#24090F');g1.addColorStop(1,'rgba(36,9,15,0)');ctx.fillStyle=g1;ctx.fillRect(0,dy-1,cw,e+1);
        var g2=ctx.createLinearGradient(0,dy+h-e,0,dy+h);g2.addColorStop(0,'rgba(36,9,15,0)');g2.addColorStop(1,'#24090F');ctx.fillStyle=g2;ctx.fillRect(0,dy+h-e,cw,e+1);}}
    function progress(){var r=sec.getBoundingClientRect(),vh=window.innerHeight;return Math.min(1,Math.max(0,-r.top/(r.height-vh)));}
    function update(){var p=progress();target=p*(N-1);
      caps.forEach(function(c){var a=+c.getAttribute('data-a'),b=+c.getAttribute('data-b'),f=.06;
        var v=p<a||p>b?0:Math.min(1,(p-a)/f,(b-p)/f);if(a===0&&p<f)v=1;v=Math.max(0,Math.min(1,v));
        c.style.opacity=v;c.style.transform='translateY('+((1-v)*30)+'px)';c.classList.toggle('is-on',v>.5);});
      if(fill)fill.style.transform='scaleY('+p+')';
      if(cue)cue.style.opacity=Math.max(0,1-p*12);
      if(!raf)raf=requestAnimationFrame(tick);}
    function tick(){raf=0;var d=target-cur;cur+=Math.abs(d)<.05?d:d*.34;draw(false);if(Math.abs(target-cur)>.05)raf=requestAnimationFrame(tick);}
    // carrega o 1º quadro, depois a cada 8, depois todos
    load(0);
    var order=[];for(var s=8;s>=1;s=s/2|0){for(var i=0;i<N;i+=s)if(order.indexOf(i)<0)order.push(i);if(s===1)break;}
    var started=false;function startLoading(){if(started)return;started=true;order.forEach(function(i,k){setTimeout(function(){load(i);},k*12);});}
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){if(e[0].isIntersecting)startLoading();},{rootMargin:'800px'}).observe(sec);}else startLoading();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',size);
    size();update();
  });

  // fios dourados que se desenham conforme a rolagem
  var draws=[].slice.call(document.querySelectorAll('.orn-draw')),orns=[].slice.call(document.querySelectorAll('.orn'));
  draws.forEach(function(svg){svg._paths=[].slice.call(svg.querySelectorAll('path'));});
  var dq=0;function drawUpdate(){dq=0;var vh=window.innerHeight;
    draws.forEach(function(svg){var r=svg.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;
      var p=Math.min(1,Math.max(0,(vh*.95-r.top)/(vh*.55+r.height*.5))),n=svg._paths.length;
      svg._paths.forEach(function(path,i){var st=n>1?i/n*.55:0,k=Math.min(1,Math.max(0,(p-st)/.45));path.style.strokeDashoffset=1-k;});});
    orns.forEach(function(o){var r=o.getBoundingClientRect(),p=Math.min(1,Math.max(0,(vh-r.top)/(vh*.6)));o.style.setProperty('--p',p);});}
  window.addEventListener('scroll',function(){if(!dq)dq=requestAnimationFrame(drawUpdate);},{passive:true});
  window.addEventListener('resize',drawUpdate);drawUpdate();

  // reviews scroll
  var tr=document.getElementById('review-track');
  if(tr){
    var step=function(){var c=tr.querySelector('.review');return c?c.getBoundingClientRect().width+22:400;};
    document.getElementById('rev-prev').addEventListener('click',function(){tr.scrollBy({left:-step(),behavior:'smooth'});});
    document.getElementById('rev-next').addEventListener('click',function(){tr.scrollBy({left:step(),behavior:'smooth'});});
  }
})();