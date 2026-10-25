// Gewerk-Effekte im Stil von Magic UI (MIT, nachgebaut ohne React): Border Beam, Ripple, Grid-Pattern,
// Highlighter, Particles, Sparkles/Shine, Flickering Grid, Striped Pattern, Meteors, Dot-Pattern.
// Dazu ein generatives Flow-Field im Aufruf-Banner, mit Seed und Farben des Betriebs (algorithmic-art).
// Alle Ebenen: aria-hidden, pointer-events:none, hinter dem Inhalt; prefers-reduced-motion = Standbild.
(function(){
var host=document.querySelector("[data-mfx]");if(!host)return;
var kind=host.getAttribute("data-mfx"),seed=(parseInt(host.getAttribute("data-seed")||"7",10)>>>0)||7;
var pal=(host.getAttribute("data-pal")||"").split(",").filter(Boolean);
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var cs=getComputedStyle(host);function col(n,a){return "rgb("+cs.getPropertyValue("--"+n).trim()+" / "+a+")";}
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
var hero=document.querySelector("main#inhalt > section"),cta=document.querySelector("[data-mfx-cta]");
function layer(sec,cls,tag){if(!sec)return null;var el=document.createElement(tag||"div");el.className="mfx-layer "+(cls||"");el.setAttribute("aria-hidden","true");
  sec.classList.add("mfx-host");var kids=[].slice.call(sec.children),ref=null;
  for(var i=0;i<kids.length;i++){if(getComputedStyle(kids[i]).position!=="absolute"){ref=kids[i];break;}}
  if(ref&&getComputedStyle(ref).position==="static")ref.style.position="relative";
  sec.insertBefore(el,ref);return el;}
function vis(el,fn){if(!("IntersectionObserver" in window)){fn(true);return;}new IntersectionObserver(function(es){fn(es[0].isIntersecting);}).observe(el);}
function loop(sec,cls,init,draw){var cv=layer(sec,cls,"canvas");if(!cv)return;var g=cv.getContext("2d"),w=0,h=0,st,on=false,raf=0,dpr=Math.min(2,window.devicePixelRatio||1);
  function size(){var r=sec.getBoundingClientRect();w=r.width;h=r.height;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);g.setTransform(dpr,0,0,dpr,0,0);st=init(g,w,h);if(reduce)draw(g,w,h,st,0,true);}
  size();var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(size,250);});
  if(reduce)return;function f(t){if(!on)return;if(draw(g,w,h,st,t)===false)return;raf=requestAnimationFrame(f);}
  vis(sec,function(v){on=v;cancelAnimationFrame(raf);if(v)raf=requestAnimationFrame(f);});}
function spans(el,n,cls,setup){for(var i=0;i<n;i++){var s=document.createElement("span");s.className=cls;setup(s,i);el.appendChild(s);}}
var A=function(a){return col("accent",a);};

var fx={
beam:function(){ // Border Beam am Banner + Lichtimpulse auf Leiterbahnen im Hero
  if(cta)cta.classList.add("mfx-beam");
  var l=layer(hero,"mfx-traces");if(!l)return;
  spans(l,6,"mfx-trace",function(s,i){s.style.top=(12+i*15+rnd()*6)+"%";s.style.setProperty("--d",(rnd()*6).toFixed(2)+"s");s.style.setProperty("--t",(5+rnd()*4).toFixed(2)+"s");});
},
ripple:function(){var l=layer(hero,"mfx-ripple");if(!l)return;spans(l,6,"mfx-ring",function(s,i){var d=180+i*130;s.style.width=s.style.height=d+"px";s.style.opacity=(0.34-i*0.05).toFixed(2);s.style.animationDelay=(i*0.12)+"s";});},
grid:function(){var l=layer(hero,"mfx-grid");if(!l)return;var cells=[];
  spans(l,22,"mfx-cell",function(s){cells.push(s);});
  function shuffle(){cells.forEach(function(s){s.style.left=(Math.floor(rnd()*30)*48)+"px";s.style.top=(Math.floor(rnd()*16)*48)+"px";s.style.animationDelay=(rnd()*3).toFixed(2)+"s";});}
  shuffle();if(!reduce)setInterval(shuffle,6000);},
highlight:function(){var h1=hero&&hero.querySelector("h1");if(h1){var m=document.createElement("span");m.className="mfx-mark";while(h1.firstChild)m.appendChild(h1.firstChild);h1.appendChild(m);
    vis(h1,function(v){if(v)m.classList.add("is-on");});}
  var l=layer(hero,"mfx-aurora");if(l)spans(l,3,"mfx-blob",function(s,i){s.style.background=pal[i%pal.length]||A(.3);s.style.left=(10+i*30)+"%";s.style.animationDelay=(-i*4)+"s";});},
particles:function(){var mx=-999,my=-999;if(hero)hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
  loop(hero,"",function(g,w,h){var ps=[];for(var i=0;i<Math.min(90,w/12);i++)ps.push({x:rnd()*w,y:rnd()*h,r:1+rnd()*2.6,vx:(rnd()-.5)*.3,vy:-.15-rnd()*.35,c:pal[i%pal.length]||"#7a9a3e"});return ps;},
  function(g,w,h,ps){g.clearRect(0,0,w,h);ps.forEach(function(p){var dx=mx-p.x,dy=my-p.y,d=Math.hypot(dx,dy);if(d<140){p.x-=dx/d*.8;p.y-=dy/d*.8;}
    p.x+=p.vx;p.y+=p.vy;if(p.y<-5){p.y=h+5;p.x=rnd()*w;}if(p.x<-5)p.x=w+5;if(p.x>w+5)p.x=-5;g.globalAlpha=.45;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r,0,6.283);g.fill();});g.globalAlpha=1;});},
sparkles:function(){if(cta)cta.classList.add("mfx-shine");var l=layer(hero,"mfx-sparkles");if(!l)return;
  spans(l,9,"mfx-spark",function(s){s.innerHTML='<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>';
    var z=10+rnd()*14;s.style.width=s.style.height=z+"px";s.style.left=(5+rnd()*90)+"%";s.style.top=(8+rnd()*80)+"%";s.style.animationDelay=(rnd()*3).toFixed(2)+"s";s.style.color=rnd()>.5?A(.7):"rgb(255 255 255 / .75)";});},
flicker:function(){loop(hero,"",function(g,w,h){var n=Math.ceil(w/14)*Math.ceil(h/14),a=new Float32Array(n);for(var i=0;i<n;i++)a[i]=rnd();return {a:a,cols:Math.ceil(w/14),last:0};},
  function(g,w,h,s,t,still){if(!still&&t-s.last<90)return;s.last=t;g.clearRect(0,0,w,h);g.fillStyle=A(1);
    for(var i=0;i<s.a.length;i++){if(!still&&rnd()<.04)s.a[i]=rnd();var x=(i%s.cols)*14,y=Math.floor(i/s.cols)*14;g.globalAlpha=s.a[i]*.22*(1-y/h*.6);g.fillRect(x,y,4,4);}g.globalAlpha=1;});},
stripes:function(){layer(hero,"mfx-stripes");var st=document.querySelector("section[aria-label=Zahlen]");if(st){st.classList.add("mfx-host");layer(st,"mfx-stripes mfx-stripes-light");}},
meteors:function(){var l=layer(hero,"mfx-meteors");if(!l)return;spans(l,14,"mfx-meteor",function(s){s.style.left=(rnd()*110-5)+"%";s.style.animationDelay=(rnd()*8).toFixed(2)+"s";s.style.animationDuration=(3+rnd()*5).toFixed(2)+"s";});},
dots:function(){var l=layer(hero,"mfx-dots");if(l&&hero&&!reduce)hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect();l.style.setProperty("--mx",(e.clientX-r.left)+"px");l.style.setProperty("--my",(e.clientY-r.top)+"px");});}
};
try{(fx[kind]||function(){})();}catch(e){}

// Generatives Flow-Field im Aufruf-Banner: Partikel folgen einem geseedeten Rauschfeld und hinterlassen Spuren
if(cta){var S=seed;var perm=[];for(var i=0;i<256;i++)perm[i]=rnd();
  function vn(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;function p(a,b){return perm[((a*57+b*131)%256+256)%256];}
    var u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (p(xi,yi)*(1-u)+p(xi+1,yi)*u)*(1-v)+(p(xi,yi+1)*(1-u)+p(xi+1,yi+1)*u)*v;}
  var sc=.0028+(S%7)*.0004,turn=2+(S%5)*.6;
  loop(cta,"mfx-flow",function(g,w,h){g.clearRect(0,0,w,h);var ps=[];for(var i=0;i<160;i++)ps.push({x:rnd()*w,y:rnd()*h,c:pal[i%pal.length]||"#fff",age:0});return {ps:ps,n:0};},
    function(g,w,h,s,t,still){var steps=still?260:2;for(var k=0;k<steps;k++){s.n++;s.ps.forEach(function(p){var a=vn(p.x*sc,p.y*sc)*6.283*turn,nx=p.x+Math.cos(a)*1.4,ny=p.y+Math.sin(a)*1.4;
      g.strokeStyle=p.c;g.globalAlpha=.07;g.lineWidth=1.2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(nx,ny);g.stroke();p.x=nx;p.y=ny;p.age++;
      if(p.x<0||p.x>w||p.y<0||p.y>h||p.age>400){p.x=rnd()*w;p.y=rnd()*h;p.age=0;}});}
      g.globalAlpha=1;return s.n<900;});}
})();
