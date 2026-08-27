const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch();
  const pg=await (await b.newContext({viewport:{width:1200,height:1100}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+path.resolve(__dirname,'../index.html'));
  await pg.waitForTimeout(3000);
  const set=(id,v)=>pg.evaluate(([i,x])=>{const r=document.getElementById(i);r.value=x;
    r.dispatchEvent(new Event('input'));},[id,v]);
  const read=()=>pg.evaluate(()=>({ex:document.getElementById('g-ex').textContent,
    sh:document.getElementById('g-sh').textContent, ys:document.getElementById('g-ys').textContent,
    cw:document.getElementById('g-cw').textContent, cf:document.getElementById('g-cf').textContent,
    st:document.getElementById('lv-stats').textContent}));
  console.log('live convergence check — yarn stretched should stay near zero\n');
  for(const [ang,ten] of [[0,2],[45,2],[0,6],[45,6],[90,2]]){
    await set('r-ang',ang); await set('r-ten',ten);
    await pg.waitForTimeout(4000);
    const m=await read();
    console.log(`  ${String(ang).padStart(2)}deg @ ${ten} N/m  ext ${m.ex.padStart(7)}  shear ${m.sh.padStart(6)}  yarn ${m.ys.padStart(7)}  crimp ${m.cw}/${m.cf}`);
  }
  console.log('  '+(await read()).st);
  await set('r-ten',0); await set('r-ang',0);
  await pg.waitForTimeout(1500);
  await pg.click('[data-preset="twill31"]'); await pg.waitForTimeout(2500);
  await pg.screenshot({path:'/tmp/loom-twill.png',clip:{x:0,y:300,width:1200,height:740}});
  await pg.click('#b-face'); await pg.waitForTimeout(900);
  await pg.screenshot({path:'/tmp/loom-back.png',clip:{x:540,y:300,width:660,height:700}});
  console.log(errs.length?'ERRORS: '+errs.join('|'):'no errors');
  await b.close();
})();
