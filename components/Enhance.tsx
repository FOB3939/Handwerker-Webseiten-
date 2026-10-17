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
})();`;

export default function Enhance() {
  return <script id="demo-enhance" dangerouslySetInnerHTML={{ __html: script }} />;
}
