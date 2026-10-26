import { readFileSync } from "node:fs";
import { join } from "node:path";

// Kleines Inline-Skript für die interaktiven Teile des Entwurfs. Bewusst ohne React-Hydration,
// damit es auch in den eigenständigen Exporten (Vorschau-Dateien, Artifacts) funktioniert.
const script = `(function(){
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var root=document.documentElement;
if(!reduce&&"IntersectionObserver" in window){root.classList.add("anim");}
document.querySelectorAll("[data-stagger]").forEach(function(g){[].slice.call(g.children).forEach(function(c,i){if(!c.hasAttribute("data-reveal"))c.setAttribute("data-reveal","");c.style.setProperty("--d",(i*0.09)+"s");});});
function countUp(el){var raw=el.getAttribute("data-count-raw")||el.textContent;el.setAttribute("data-count-raw",raw);
  var m=raw.match(/^(\\D*)(\\d+(?:,\\d+)?)(.*)$/);if(!m||reduce)return;var dec=(m[2].split(",")[1]||"").length,target=parseFloat(m[2].replace(",",".")),t0=null;
  function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3),v=(target*e).toFixed(dec).replace(".",",");el.textContent=m[1]+v+m[3];if(k<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);}
if(root.classList.contains("anim")){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add("is-in");io.unobserve(el);
    el.querySelectorAll("[data-count]").forEach(countUp);if(el.hasAttribute("data-count"))countUp(el);
    var ba=el.matches("[data-ba]")?el:el.querySelector("[data-ba]");if(ba&&!ba.touched)hint(ba);});},{threshold:0.12,rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll("[data-reveal],[data-count],[data-ba],[data-observe]").forEach(function(el){io.observe(el);});
}
function hint(w){var r=w.querySelector("input[type=range]");if(!r||reduce)return;var seq=[50,28,72,50],i=0;
  r.addEventListener("pointerdown",function(){w.touched=true;},{once:true});
  (function go(){if(w.touched||i>=seq.length-1)return;var a=seq[i],b=seq[i+1],t0=null;
    function st(t){if(w.touched)return;if(!t0)t0=t;var k=Math.min(1,(t-t0)/700),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;r.value=a+(b-a)*e;r.dispatchEvent(new Event("input"));if(k<1)requestAnimationFrame(st);else{i++;setTimeout(go,120);}}
    requestAnimationFrame(st);})();}
var hdr=document.querySelector("header.sticky"),bar=document.querySelector(".scroll-progress"),par=[].slice.call(document.querySelectorAll("[data-parallax]")),tick=false;
function onScroll(){tick=false;var y=window.scrollY,h=document.documentElement.scrollHeight-window.innerHeight;
  if(hdr)hdr.classList.toggle("is-scrolled",y>12);if(bar)bar.style.setProperty("--p",h>0?(y/h).toFixed(4):0);
  if(!reduce)par.forEach(function(el){var f=parseFloat(el.getAttribute("data-parallax"))||0.2;el.style.transform="translate3d(0,"+(y*f).toFixed(1)+"px,0) scale(1.08)";});}
window.addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(onScroll);}},{passive:true});onScroll();
document.querySelectorAll("[data-ba]").forEach(function(w){
  var r=w.querySelector("input[type=range]"),a=w.querySelector("[data-ba-after]"),h=w.querySelector("[data-ba-handle]");
  function u(){a.style.clipPath="inset(0 0 0 "+r.value+"%)";h.style.left=r.value+"%";}
  r.addEventListener("input",u);u();
});
document.querySelectorAll("[data-qr]").forEach(function(w){
  var steps=[].slice.call(w.querySelectorAll("[data-qr-step]")),bars=w.querySelectorAll("[data-qr-bar]"),
      count=w.querySelector("[data-qr-count]"),done=w.querySelector("[data-qr-done]"),sum=w.querySelector("[data-qr-summary]"),
      names=["Leistung","Umfang","Zeitraum"],ans=[],cur=0;
  function show(i){cur=i;steps.forEach(function(s,j){s.hidden=j!==i;});done.hidden=true;
    bars.forEach(function(b,j){b.className=b.className.replace(/bg-t-(accent\\/50|accent|line)/g,"")+(j<i?" bg-t-accent":j===i?" bg-t-accent/50":" bg-t-line");});
    count.textContent="Schritt "+(i+1)+" von 4";}
  w.querySelectorAll("[data-qr-choice]").forEach(function(b){b.addEventListener("click",function(){ans[cur]=b.getAttribute("data-qr-choice");show(cur+1);});});
  w.querySelectorAll("[data-qr-back]").forEach(function(b){b.addEventListener("click",function(){show(cur-1);});});
  w.querySelector("form").addEventListener("submit",function(e){e.preventDefault();if(!e.target.reportValidity())return;
    steps.forEach(function(s){s.hidden=true;});done.hidden=false;count.textContent="Fertig";
    bars.forEach(function(b){b.className=b.className.replace(/bg-t-(accent\\/50|accent|line)/g,"")+" bg-t-accent";});
    sum.innerHTML="";ans.forEach(function(a,i){var li=document.createElement("li");li.innerHTML="<b>"+names[i]+":</b> ";li.appendChild(document.createTextNode(a));sum.appendChild(li);});});
  w.querySelector("[data-qr-reset]").addEventListener("click",function(){ans=[];w.querySelector("form").reset();show(0);});
});
document.querySelectorAll("form[data-contact]").forEach(function(f){
  f.addEventListener("submit",function(e){e.preventDefault();if(!f.reportValidity())return;f.hidden=true;f.parentNode.querySelector("[data-contact-done]").hidden=false;});
});

/* Motion (motion.dev, MIT): weiche Feder-Animationen, falls die Bibliothek geladen ist. */
var M=window.Motion,fine=window.matchMedia&&window.matchMedia("(pointer: fine)").matches;
if(M&&!reduce){
  function split(el){var out=[];[].slice.call(el.childNodes).forEach(function(n){
    if(n.nodeType===3){var parts=n.textContent.split(/(\\s+)/),frag=document.createDocumentFragment();
      parts.forEach(function(p){if(!p)return;if(/^\\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return;}var s=document.createElement("span");s.className="w";s.textContent=p;frag.appendChild(s);out.push(s);});
      el.replaceChild(frag,n);}
    else if(n.nodeType===1){out=out.concat(split(n));}});return out;}
  document.querySelectorAll("h1[data-split]").forEach(function(h){var w=split(h);if(!w.length)return;
    w.forEach(function(s){s.style.opacity="0";});
    M.animate(w,{opacity:[0,1],y:[26,0],filter:["blur(6px)","blur(0px)"]},{duration:0.8,ease:[0.22,1,0.36,1],delay:M.stagger(0.06,{startDelay:2.2})});});
  document.querySelectorAll("main h2").forEach(function(h){if(h.closest("[data-no-split]"))return;var w=split(h);if(!w.length)return;
    w.forEach(function(s){s.style.opacity="0";});
    M.inView(h,function(){M.animate(w,{opacity:[0,1],y:[18,0]},{duration:0.6,ease:[0.22,1,0.36,1],delay:M.stagger(0.04,{startDelay:0.1})});},{amount:0.4});});
  M.inView(".svc-badge",function(info){var el=info.target||info;M.animate(el,{scale:[0.4,1],rotate:[-25,0]},{type:"spring",bounce:0.5,duration:0.9,delay:0.15});},{amount:0.6});
  if(fine){
    document.querySelectorAll(".btn-shine").forEach(function(b){
      b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
        M.animate(b,{x:dx*0.22,y:dy*0.35},{type:"spring",stiffness:320,damping:18});});
      b.addEventListener("pointerleave",function(){M.animate(b,{x:0,y:0},{type:"spring",stiffness:260,damping:14});});});
    document.querySelectorAll(".card-fx").forEach(function(c){
      c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;
        M.animate(c,{rotateY:px*6,rotateX:-py*6,transformPerspective:900},{type:"spring",stiffness:220,damping:20});});
      c.addEventListener("pointerleave",function(){M.animate(c,{rotateY:0,rotateX:0},{type:"spring",stiffness:180,damping:16});});});
  }
}
})();`;

// Motion wird als Datei im Projekt mitgeliefert (vendor/, MIT-Lizenz) und inline eingebettet,
// damit die Animationen auch in exportierten Seiten ohne fremden Server laufen.
const motion = readFileSync(join(process.cwd(), "vendor/motion-11.11.17.min.js"), "utf8");
// Mitmach-Spiel je Gewerk (eigener Code, ohne Abhängigkeiten)
const game = readFileSync(join(process.cwd(), "assets/trade-game.js"), "utf8");

export default function Enhance() {
  return (
    <>
      <script id="demo-motion" dangerouslySetInnerHTML={{ __html: motion }} />
      <script id="demo-enhance" dangerouslySetInnerHTML={{ __html: script }} />
      <script id="demo-game" dangerouslySetInnerHTML={{ __html: game }} />
    </>
  );
}
