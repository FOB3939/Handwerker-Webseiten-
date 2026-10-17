// Kleines Inline-Skript für die interaktiven Teile des Entwurfs. Bewusst ohne React-Hydration,
// damit es auch in den eigenständigen Exporten (Vorschau-Dateien, Artifacts) funktioniert.
const script = `(function(){
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
