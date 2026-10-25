// Logo-Intro für Autohändler-Seiten ohne eigenes Intro: Scheinwerfer flackern auf, Lichtkegel, Name erscheint.
// Daten aus dem Skript-Tag: data-name, data-sub, data-accent. Antippen überspringt, reduzierte Bewegung = kein Intro.
(function(){
var me=document.currentScript;if(!me)return;
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var name=me.getAttribute("data-name")||"",sub=me.getAttribute("data-sub")||"",acc=me.getAttribute("data-accent")||"#d4b675";
var css=".ai{position:fixed;inset:0;z-index:10000;background:#040406;display:grid;place-items:center;cursor:pointer;animation:aiOut .55s ease-in 2.5s forwards;font-family:inherit}"+
".ai-s{position:relative;width:min(520px,90vw);display:grid;justify-items:center}.ai svg{width:100%;height:auto;position:relative;z-index:2}"+
".ai .lit{opacity:0;animation:aiFl .9s linear .3s forwards}.ai .bd{opacity:0;animation:aiIn 1.1s ease-out .55s forwards}"+
".ai-b{position:absolute;top:52%;width:52%;height:150%;z-index:1;transform-origin:50% 0;transform:rotate(var(--r)) scaleY(0);opacity:0;background:linear-gradient(to bottom,rgba(255,240,208,.5),rgba(255,240,208,.12) 55%,transparent 92%);clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);animation:aiBm .7s cubic-bezier(.2,.8,.3,1) .85s forwards;filter:blur(2px)}"+
".ai-b.l{left:-4%;--r:-13deg}.ai-b.r{right:-4%;--r:13deg}"+
".ai-n{position:relative;z-index:3;margin-top:-2%;font-size:clamp(30px,9vw,64px);font-weight:700;letter-spacing:.01em;color:#fff;text-align:center;line-height:1.05;opacity:0;filter:blur(8px);animation:aiIn .8s ease-out 1.15s forwards,aiSh .8s ease-out 1.15s forwards;text-shadow:0 0 30px rgba(255,226,160,.35);padding:0 16px}"+
".ai-r{width:min(260px,60vw);height:1px;margin-top:10px;background:linear-gradient(90deg,transparent,"+acc+",transparent);transform:scaleX(0);animation:aiRu .7s ease-out 1.55s forwards}"+
".ai-u{margin-top:10px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#b9af9c;opacity:0;animation:aiIn .5s ease-out 1.8s forwards;text-align:center;padding:0 16px}"+
".ai-k{position:absolute;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#888}"+
"@keyframes aiFl{0%{opacity:0}8%{opacity:1}14%{opacity:.1}22%{opacity:.9}28%{opacity:.25}40%,100%{opacity:1}}@keyframes aiIn{to{opacity:1}}@keyframes aiSh{to{filter:blur(0)}}"+
"@keyframes aiBm{to{transform:rotate(var(--r)) scaleY(1);opacity:1}}@keyframes aiRu{to{transform:scaleX(1)}}@keyframes aiOut{to{opacity:0;visibility:hidden}}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var el=document.createElement("div");el.className="ai";el.setAttribute("aria-hidden","true");
el.innerHTML='<div class="ai-s"><div class="ai-b l"></div><div class="ai-b r"></div><svg viewBox="0 0 320 130"><g class="bd"><path d="M18 108 C16 80 34 62 66 56 L104 26 C126 14 194 14 216 26 L254 56 C286 62 304 80 302 108 Z" fill="#1d1d23" stroke="#3a3a44"/><path d="M114 32 C140 22 180 22 206 32 L236 54 L84 54 Z" fill="#060608"/><path d="M118 84 H202 L194 100 H126 Z" fill="#060608" stroke="#3a3a44"/></g><path d="M38 66 L104 74 L98 82 L44 77 Z M282 66 L216 74 L222 82 L276 77 Z" fill="#1a1a1f"/><path class="lit" d="M38 66 L104 74 L98 82 L44 77 Z M282 66 L216 74 L222 82 L276 77 Z" fill="#fff7e2"/></svg>'+
 '<div class="ai-n"></div><div class="ai-r"></div><div class="ai-u"></div></div><span class="ai-k">Tippen zum Überspringen</span>';
el.querySelector(".ai-n").textContent=name;el.querySelector(".ai-u").textContent=sub;
function done(){if(el.parentNode)el.parentNode.removeChild(el);}
el.addEventListener("click",done);setTimeout(done,3100);
(document.body||document.documentElement).appendChild(el);
})();
