const { chromium } = require("playwright");const path=require("path");
(async()=>{const b=await chromium.launch();const f=process.argv[2],out=process.argv[3];
for(const [w,h,t] of [[1366,900,"d"],[390,844,"m"]]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.goto("file://"+path.resolve(f));
 if(t==="d"){await p.waitForTimeout(1200);await p.screenshot({path:out+"-intro.png"});}
 await p.waitForTimeout(3300);
 const g=p.locator("[data-auto-game]");await g.scrollIntoViewIfNeeded();await p.waitForTimeout(600);
 await g.screenshot({path:`${out}-${t}0.png`});
 await p.click('[data-k="body"] .ag-b >> nth=2');await p.click('[data-k="color"] .ag-b >> nth=3');await p.click('[data-k="rim"] .ag-b >> nth=1');
 await p.click("[data-drive]");await p.waitForTimeout(900);await g.screenshot({path:`${out}-${t}1.png`});await p.waitForTimeout(2200);
 await p.click("[data-send]");await p.waitForTimeout(800);
 const info=await p.evaluate(()=>({ow:document.documentElement.scrollWidth>innerWidth,txt:(document.querySelector("textarea")||{}).value,sum:document.querySelector("[data-sum]").textContent,small:[...document.querySelectorAll("[data-auto-game] button,[data-auto-game] a")].filter(e=>{const r=e.getBoundingClientRect();return r.height<44||r.width<44}).length}));
 console.log(t,JSON.stringify(info),errs.join("|"));await p.close();}
await b.close();})();
