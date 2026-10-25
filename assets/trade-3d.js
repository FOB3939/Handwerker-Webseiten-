// 3D-Effekte beim Scrollen (GSAP + ScrollTrigger, inline eingebettet). Echte Tiefe über transformPerspective:
// Hero kippt beim Wegscrollen nach hinten, Leistungs-Karten fliegen aus der Tiefe ein, die Projekt-Bühne
// klappt auf, Ablauf-Schritte drehen sich herein, Zahlen klappen wie ein Fallblatt, Überschriften richten sich auf.
// Stil je Betrieb über data-3d am Root: "kippen" | "schwingen" | "tiefe". Reduzierte Bewegung = keine 3D-Effekte.
(function(){
if(!window.gsap||!window.ScrollTrigger)return;
var root=document.querySelector("[data-3d]");if(!root)return;
var style=root.getAttribute("data-3d")||"kippen";
gsap.registerPlugin(ScrollTrigger);
var main=document.getElementById("inhalt");if(!main)return;
function $$(s,el){return [].slice.call((el||document).querySelectorAll(s));}
// Elemente, die GSAP bewegt, aus dem CSS-Reveal nehmen (sonst kämpfen Übergang und Scrub gegeneinander)
function own(els){els.forEach(function(e){e.removeAttribute("data-reveal");e.classList.add("t3d");});return els;}
var hero=main.querySelector(":scope > section");
var mm=gsap.matchMedia();
mm.add({desk:"(min-width: 768px)",mob:"(max-width: 767px)",reduce:"(prefers-reduced-motion: reduce)"},function(ctx){
  var c=ctx.conditions;if(c.reduce)return;
  var k=c.desk?1:0.55; // Handy: dieselben Bewegungen, nur flacher
  var P=c.desk?1100:800;

  // 1 · Hero kippt beim Wegscrollen nach hinten in den Raum
  if(hero){
    var inner=[].slice.call(hero.children).filter(function(e){return getComputedStyle(e).position!=="absolute"&&!e.classList.contains("mfx-layer");})[0];
    if(inner){own([inner]);
      gsap.to(inner,{rotationX:16*k,z:-220*k,yPercent:6,autoAlpha:0.35,transformPerspective:P,transformOrigin:"50% 100%",ease:"none",
        scrollTrigger:{trigger:hero,start:"top top",end:"bottom top",scrub:0.6}});}
  }

  // 2 · Überschriften richten sich auf
  $$("main > section h2, main > div > section h2").forEach(function(h){
    if(hero&&hero.contains(h))return;own([h]);
    gsap.from(h,{rotationX:-60,y:24,autoAlpha:0,transformPerspective:P*1.4,transformOrigin:"50% 100%",duration:0.9,ease:"power3.out",
      scrollTrigger:{trigger:h,start:"top 88%",toggleActions:"play none none reverse"}});
  });

  // 3 · Leistungs-Karten aus der Tiefe – drei Stile
  var cards=own($$("#leistungen [data-stagger] > *"));
  cards.forEach(function(el,i){
    var from=style==="schwingen"?{rotationY:(i%2?-55:55)*k,x:(i%2?60:-60)*k,z:-160*k,autoAlpha:0}
      :style==="tiefe"?{z:-700*k,scale:0.7,rotationZ:(i%2?4:-4),autoAlpha:0}
      :{rotationX:-65*k,y:90*k,z:-200*k,autoAlpha:0};
    gsap.fromTo(el,Object.assign({transformPerspective:P,transformOrigin:style==="kippen"?"50% 100%":"50% 50%"},from),
      {rotationX:0,rotationY:0,rotationZ:0,x:0,y:0,z:0,scale:1,autoAlpha:1,ease:"power2.out",
       scrollTrigger:{trigger:el,start:"top 96%",end:"top 62%",scrub:0.8}});
  });

  // 4 · Projekt-Bühne klappt auf, Bilder kommen gestaffelt nach vorne
  var stage=$$("#projekte .mt-14")[0];
  if(stage){own([stage]);
    gsap.fromTo(stage,{rotationX:30*k,scale:0.86,y:60,transformPerspective:P*1.4,transformOrigin:"50% 0%"},
      {rotationX:0,scale:1,y:0,ease:"none",scrollTrigger:{trigger:stage,start:"top bottom",end:"top 25%",scrub:0.8}});
    own($$("#projekte figure, #projekte li")).forEach(function(f,i){
      gsap.fromTo(f,{z:-260*k*(1+i%3),transformPerspective:P},{z:0,ease:"none",scrollTrigger:{trigger:stage,start:"top bottom",end:"top 30%",scrub:1}});
    });
  }

  // 5 · Ablauf-Schritte drehen sich wie Seiten herein
  own($$("#ablauf ol > li")).forEach(function(li,i){
    gsap.from(li,{rotationY:-38*k,x:-30*k,z:-120*k,autoAlpha:0,transformPerspective:P*1.6,transformOrigin:"0% 50%",duration:0.8,delay:i*0.1,ease:"power3.out",
      scrollTrigger:{trigger:li,start:"top 90%",toggleActions:"play none none reverse"}});
  });

  // 6 · Zahlen klappen wie ein Fallblatt
  var stats=$$("section[aria-label=Zahlen] dl > *");
  if(stats.length){own(stats);
    gsap.from(stats,{rotationX:-95,autoAlpha:0,transformPerspective:600,transformOrigin:"50% 0%",duration:0.8,stagger:0.12,ease:"back.out(1.6)",
      scrollTrigger:{trigger:stats[0].parentNode,start:"top 85%",toggleActions:"play none none reverse"}});}

  // 7 · Über uns und Kontaktformular schwenken aus der Seite
  own($$("#ueber-uns .lg\\:col-span-5")).forEach(function(el){
    gsap.fromTo(el,{rotationY:32*k,z:-180*k,transformPerspective:P,transformOrigin:"0% 50%"},{rotationY:0,z:0,ease:"none",scrollTrigger:{trigger:el,start:"top bottom",end:"top 35%",scrub:0.8}});});
  own($$("#kontakt .lg\\:col-span-7")).forEach(function(el){
    gsap.fromTo(el,{rotationY:-26*k,z:-160*k,transformPerspective:P,transformOrigin:"100% 50%"},{rotationY:0,z:0,ease:"none",scrollTrigger:{trigger:el,start:"top bottom",end:"top 40%",scrub:0.8}});});

  // 8 · Aufruf-Banner kippt nach vorne
  var cta=document.querySelector("[data-mfx-cta]");
  if(cta){own([cta]);
    gsap.fromTo(cta,{rotationX:38*k,scale:0.9,y:50,transformPerspective:P,transformOrigin:"50% 100%"},{rotationX:0,scale:1,y:0,ease:"none",
      scrollTrigger:{trigger:cta,start:"top bottom",end:"top 45%",scrub:0.8}});}

  // 9 · Karten folgen am Desktop leicht der Maus (3D-Neigung)
  if(c.desk&&matchMedia("(hover: hover)").matches){
    $$(".card-fx").forEach(function(card){
      var rx=gsap.quickTo(card,"rotationX",{duration:0.5,ease:"power3"}),ry=gsap.quickTo(card,"rotationY",{duration:0.5,ease:"power3"});
      function mv(e){var r=card.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-0.5)*10);rx(-((e.clientY-r.top)/r.height-0.5)*10);}
      function lv(){rx(0);ry(0);}
      gsap.set(card,{transformPerspective:900});card.addEventListener("pointermove",mv);card.addEventListener("pointerleave",lv);
    });
  }
});
// Schriften und Bilder verändern die Höhen – danach neu messen
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh();});
window.addEventListener("load",function(){ScrollTrigger.refresh();});
})();
