// Mitmach-Spiel für Autohändler-Seiten: „Wunschauto zusammenstellen“ – Karosserie, Lack und Felgen wählen,
// dann Probefahrt starten. Die Auswahl landet als Text im Kontaktformular. Baut sich selbst in
// <section data-auto-game data-cta="#kontakt" data-accent="#c8a45e"> auf, ohne Abhängigkeiten.
(function(){
var host=document.querySelector("[data-auto-game]");if(!host||host.dataset.ready)return;host.dataset.ready="1";
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var acc=host.getAttribute("data-accent")||"#c8a45e",cta=host.getAttribute("data-cta")||"#kontakt";
var rgb=acc.replace("#","").match(/../g).map(function(h){return parseInt(h,16)/255;}),lum=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2],ink=lum>.45?"#111":"#fff";
var css=".ag{--ag:"+acc+";--ag-ink:"+ink+";background:#0c0c10;color:#eee8db;padding:88px 0;font-family:inherit;position:relative;overflow:hidden;isolation:isolate}"+
".ag *{box-sizing:border-box}.ag-w{max-width:1220px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-left,0px));display:grid;grid-template-columns:.85fr 1.15fr;grid-template-areas:\"h s\" \"c s\";column-gap:48px;align-items:center}.ag-h{grid-area:h;align-self:end}.ag-c{grid-area:c;align-self:start}.ag-s{grid-area:s}"+
".ag-k{font-size:12.5px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--ag);display:flex;align-items:center;gap:12px}.ag-k:before{content:'';width:30px;height:1px;background:currentColor}"+
".ag h2{font-size:clamp(32px,4.4vw,52px);line-height:1.05;margin:16px 0 12px;color:#fff}.ag-p{color:#b4ad9f;max-width:44ch;margin:0 0 26px}"+
".ag-g{margin:0 0 18px;border:0;padding:0}.ag-g legend{font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#a39c8e;margin-bottom:8px;padding:0}"+
".ag-o{display:flex;flex-wrap:wrap;gap:8px}.ag-b{min-height:44px;min-width:44px;padding:0 16px;border-radius:999px;border:1px solid #3a3a44;background:#17171d;color:#eee8db;font:inherit;font-size:15px;cursor:pointer;transition:border-color .2s,background .2s,transform .15s}"+
".ag-b:hover{border-color:var(--ag)}.ag-b[aria-pressed=true]{border-color:var(--ag);background:color-mix(in srgb,var(--ag) 22%,#17171d);font-weight:600}.ag-b:active{transform:scale(.96)}"+
".ag-sw{width:44px;padding:0;border:2px solid #3a3a44}.ag-sw[aria-pressed=true]{box-shadow:0 0 0 3px #0c0c10,0 0 0 5px var(--ag)}"+
".ag-st{position:relative;border-radius:14px;background:radial-gradient(110% 90% at 50% 0%,#24242c,#0b0b0e 70%);border:1px solid #26262e;overflow:hidden;aspect-ratio:16/10}"+
".ag-st svg{position:absolute;inset:0;width:100%;height:100%}.ag-road{stroke-dasharray:40 30}.ag.drive .ag-road{animation:agRoad .5s linear infinite}@keyframes agRoad{to{stroke-dashoffset:-70}}"+
".ag-car{transition:transform 1.1s cubic-bezier(.6,0,.4,1)}.ag.drive .ag-car{animation:agDrive 2.6s cubic-bezier(.5,0,.5,1)}@keyframes agDrive{0%{transform:translateX(0)}35%{transform:translateX(600px)}36%{transform:translateX(-600px)}62%{transform:translateX(30px)}70%,100%{transform:translateX(0)}}"+
".ag-wh{transform-box:fill-box;transform-origin:center}.ag.drive .ag-wh{animation:agSpin .35s linear infinite}@keyframes agSpin{to{transform:rotate(360deg)}}"+
".ag-hl{opacity:.25;transition:opacity .3s}.ag.lights .ag-hl{opacity:1}.ag-beam{opacity:0;transition:opacity .4s}.ag.lights .ag-beam{opacity:.8}"+
".ag-body{transition:fill .5s}.ag-tag{position:absolute;left:14px;top:14px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;background:rgba(0,0,0,.55);border:1px dashed rgba(255,255,255,.35);padding:4px 9px;border-radius:4px;color:#ddd}"+
".ag-sum{margin-top:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}.ag-sum p{margin:0;color:#cfc7b6;font-size:15px}.ag-pr{height:4px;border-radius:2px;background:#2a2a32;margin:6px 0 20px;overflow:hidden}.ag-pr i{display:block;height:100%;width:0;background:var(--ag);transition:width .4s}"+
".ag-a{display:flex;flex-wrap:wrap;gap:10px}.ag-go{min-height:48px;padding:0 22px;border-radius:999px;border:0;background:var(--ag);color:var(--ag-ink);font:inherit;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}.ag-go[disabled]{opacity:.45;cursor:not-allowed}"+
".ag-ln{min-height:48px;padding:0 22px;border-radius:999px;border:1px solid #55555f;color:#eee8db;text-decoration:none;display:inline-flex;align-items:center;font-weight:600}.ag-ln:hover{border-color:var(--ag)}"+
"@media(max-width:900px){.ag{padding:64px 0}.ag-w{grid-template-columns:1fr;grid-template-areas:\"h\" \"s\" \"c\";row-gap:20px}.ag-p{margin-bottom:0}}"+
"@media(prefers-reduced-motion:reduce){.ag *{animation:none!important;transition:none!important}}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var BODIES={
 Kompakt:"M70 250 L70 222 C70 210 80 202 96 199 L150 192 L196 148 C204 141 214 138 226 138 L360 138 C376 138 386 144 394 156 L424 196 C446 200 462 210 462 226 L462 250 Z",
 Kombi:"M48 250 L48 224 C48 212 58 205 74 202 L140 194 L190 152 C198 146 208 143 222 143 L452 146 C466 146 474 152 478 162 L486 196 C504 200 516 210 516 226 L516 250 Z",
 SUV:"M54 252 L54 212 C54 198 64 190 82 187 L146 180 L186 124 C194 115 204 111 218 111 L424 111 C440 111 450 118 458 130 L490 180 C510 184 524 194 524 212 L524 252 Z"};
var WIN={Kompakt:"M206 156 L292 156 L292 192 L168 192 Z M302 156 L374 156 L404 192 L302 192 Z",
 Kombi:"M200 160 L300 160 L300 194 L160 194 Z M310 160 L448 161 L460 194 L310 194 Z",
 SUV:"M198 130 L306 130 L306 180 L160 180 Z M316 130 L420 130 L452 180 L316 180 Z"};
var WX={Kompakt:[150,392],Kombi:[140,440],SUV:[146,438]};
var COLORS=[["Perlweiß","#eceae4"],["Obsidian","#1b1c22"],["Silber","#a7abb3"],["Rot","#b3192b"],["Blau","#1f4fa3"],["Grün","#2f5d46"]];
var RIMS=["Sport","Classic","Aero"];
var sel={body:null,color:null,rim:null};
var lit=host.getAttribute("data-company")||"";
host.classList.add("ag");host.setAttribute("aria-label","Zum Ausprobieren: Wunschauto zusammenstellen");
host.innerHTML='<div class="ag-w"><div class="ag-h"><div class="ag-k">Zum Ausprobieren</div><h2>Stellen Sie Ihr Wunschauto zusammen</h2>'+
 '<p class="ag-p">Karosserie, Farbe und Felgen wählen, dann zur Probefahrt starten. Ihre Auswahl übernehmen wir auf Wunsch direkt in die Anfrage'+(lit?" an "+lit:"")+'.</p></div><div class="ag-c">'+
 '<fieldset class="ag-g"><legend>1 · Karosserie</legend><div class="ag-o" data-k="body"></div></fieldset>'+
 '<fieldset class="ag-g"><legend>2 · Lackfarbe</legend><div class="ag-o" data-k="color"></div></fieldset>'+
 '<fieldset class="ag-g"><legend>3 · Felgen</legend><div class="ag-o" data-k="rim"></div></fieldset>'+
 '<div class="ag-pr" aria-hidden="true"><i></i></div><div class="ag-a"><button type="button" class="ag-go" data-drive disabled>Probefahrt starten</button><a class="ag-ln" data-send href="'+cta+'">Mit dieser Auswahl anfragen</a></div></div>'+
 '<div class="ag-s"><div class="ag-st"><span class="ag-tag">Illustration</span><svg viewBox="0 0 580 330" role="img" aria-label="Ihr zusammengestelltes Auto"><defs><linearGradient id="agShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient><linearGradient id="agBeam" x1="0" x2="1"><stop offset="0" stop-color="#fff3d0" stop-opacity=".7"/><stop offset="1" stop-color="#fff3d0" stop-opacity="0"/></linearGradient></defs>'+
 '<rect x="0" y="268" width="580" height="62" fill="#111116"/><line class="ag-road" x1="-40" y1="300" x2="620" y2="300" stroke="#5a5a64" stroke-width="4"/>'+
 '<g class="ag-car"><ellipse cx="290" cy="270" rx="250" ry="12" fill="#000" opacity=".6"/><polygon class="ag-beam" points="520,210 640,170 640,260" fill="url(#agBeam)"/>'+
 '<path class="ag-body" fill="#3a3a44"/><path class="ag-shade" fill="url(#agShade)"/><path class="ag-win" fill="#0d0e13" stroke="#000" stroke-width="2"/>'+
 '<circle class="ag-hl" r="9" fill="#fff6dc"/><g class="ag-w1"></g><g class="ag-w2"></g></g></svg></div>'+
 '<div class="ag-sum"><p data-sum aria-live="polite">Noch nichts gewählt.</p></div></div></div>';
function q(s){return host.querySelector(s);}
function btn(k,label,val,color){var b=document.createElement("button");b.type="button";b.className="ag-b"+(color?" ag-sw":"");b.setAttribute("aria-pressed","false");
 if(color){b.style.background=color;b.setAttribute("aria-label",label);b.title=label;}else b.textContent=label;
 b.addEventListener("click",function(){sel[k]=val;host.querySelectorAll('[data-k="'+k+'"] .ag-b').forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});draw();});
 q('[data-k="'+k+'"]').appendChild(b);}
Object.keys(BODIES).forEach(function(k){btn("body",k,k);});COLORS.forEach(function(c){btn("color",c[0],c,c[1]);});RIMS.forEach(function(r){btn("rim",r,r);});
function wheel(cx,rim){var sp="";var n=rim==="Sport"?5:rim==="Classic"?8:3;
 for(var i=0;i<n;i++){var a=i*360/n;sp+='<path d="M-3 -6 L-'+(rim==="Aero"?12:4)+' -26 L'+(rim==="Aero"?12:4)+' -26 L3 -6 Z" fill="#c9ccd3" transform="rotate('+a+')"/>';}
 return '<g transform="translate('+cx+',252)"><circle r="36" fill="#0a0a0c"/><g class="ag-wh"><circle r="27" fill="#2b2c31" stroke="'+acc+'" stroke-width="1.6"/>'+sp+'<circle r="6" fill="'+acc+'"/></g></g>';}
function draw(){var b=sel.body||"Kombi",p=BODIES[b];
 q(".ag-body").setAttribute("d",p);q(".ag-shade").setAttribute("d",p);q(".ag-win").setAttribute("d",WIN[b]);
 q(".ag-body").setAttribute("fill",sel.color?sel.color[1]:"#3a3a44");
 var hx=b==="Kompakt"?452:b==="Kombi"?506:514;q(".ag-hl").setAttribute("cx",hx);q(".ag-hl").setAttribute("cy",b==="SUV"?196:212);
 q(".ag-w1").innerHTML=wheel(WX[b][0],sel.rim||"Sport");q(".ag-w2").innerHTML=wheel(WX[b][1],sel.rim||"Sport");
 var n=(sel.body?1:0)+(sel.color?1:0)+(sel.rim?1:0);q(".ag-pr i").style.width=(n/3*100)+"%";
 q("[data-drive]").disabled=n<3;
 q("[data-sum]").textContent=n?"Ihre Auswahl: "+[sel.body,sel.color&&sel.color[0],sel.rim&&sel.rim+"-Felgen"].filter(Boolean).join(" · ")+(n<3?" – noch "+(3-n)+" Schritt"+(n===2?"":"e"):" – bereit zur Probefahrt."):"Noch nichts gewählt.";}
draw();
q("[data-drive]").addEventListener("click",function(){host.classList.add("lights");if(reduce){q("[data-sum]").textContent="Probefahrt: Scheinwerfer an – gute Fahrt!";return;}
 host.classList.remove("drive");void host.offsetWidth;host.classList.add("drive");setTimeout(function(){host.classList.remove("drive");q("[data-sum]").textContent="Gefällt es Ihnen? Senden Sie die Auswahl als Anfrage.";},2700);});
q("[data-send]").addEventListener("click",function(){var t=document.querySelector(cta+" textarea")||document.querySelector("textarea");
 if(t&&sel.body){var s="Wunschauto: "+[sel.body,sel.color&&sel.color[0],sel.rim&&sel.rim+"-Felgen"].filter(Boolean).join(", ")+". ";if(t.value.indexOf("Wunschauto:")!==0)t.value=s+t.value;}});
})();
