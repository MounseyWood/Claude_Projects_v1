const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch();
  for(const scheme of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:1200,height:1100},colorScheme:scheme});
    const pg=await ctx.newPage();
    const errs=[];
    pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
    pg.on('console',m=>{ if(m.type()==='error' && !/ERR_|net::/.test(m.text())) errs.push('console: '+m.text()); });
    await pg.goto('file://'+path.resolve(__dirname,'../index.html'));
    await pg.waitForTimeout(3500);
    const m=await pg.evaluate(()=>({
      cw:document.getElementById('g-cw').textContent, cf:document.getElementById('g-cf').textContent,
      sh:document.getElementById('g-sh').textContent, ex:document.getElementById('g-ex').textContent,
      ys:document.getElementById('g-ys').textContent,
      stats:document.getElementById('lv-stats').textContent,
      label:document.getElementById('draft-label').textContent,
      overflow:document.body.scrollWidth>window.innerWidth,
      draftPx:(()=>{const c=document.getElementById('cv-draft');
        const d=c.getContext('2d').getImageData(20,20,1,1).data; return `${d[0]},${d[1]},${d[2]}`;})(),
      clothPx:(()=>{const c=document.getElementById('cv-cloth');
        const d=c.getContext('2d').getImageData(c.width>>1,c.height>>1,1,1).data; return `${d[0]},${d[1]},${d[2]}`;})()
    }));
    console.log(`${scheme}: crimp ${m.cw}/${m.cf}  shear ${m.sh}  ext ${m.ex}  yarn ${m.ys}`);
    console.log(`   ${m.stats} | ${m.label} | overflow ${m.overflow} | draft px ${m.draftPx} | cloth px ${m.clothPx}`);
    await pg.screenshot({path:`/tmp/loom-${scheme}.png`,clip:{x:0,y:0,width:1200,height:1050}});
    // exercise it
    await pg.click('[data-preset="twill31"]'); await pg.waitForTimeout(1200);
    await pg.evaluate(()=>{const r=document.getElementById('r-ten');r.value=14;r.dispatchEvent(new Event('input'));});
    await pg.evaluate(()=>{const r=document.getElementById('r-ang');r.value=45;r.dispatchEvent(new Event('input'));});
    await pg.waitForTimeout(3000);
    const after=await pg.evaluate(()=>({ex:document.getElementById('g-ex').textContent,
      sh:document.getElementById('g-sh').textContent, ys:document.getElementById('g-ys').textContent}));
    console.log(`   3/1 twill, 14 N/m at 45°: ext ${after.ex} shear ${after.sh} yarn ${after.ys}`);
    await pg.screenshot({path:`/tmp/loom-${scheme}-bias.png`,clip:{x:0,y:0,width:1200,height:1050}});
    console.log(errs.length?'   ERRORS: '+errs.join(' | '):'   no errors');
    await ctx.close();
  }
  await b.close();
})();
