const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch();
  for(const scheme of ['light','dark']){
    const pg=await (await b.newContext({viewport:{width:1200,height:1100},colorScheme:scheme})).newPage();
    const errs=[];
    pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
    pg.on('console',m=>{ if(m.type()==='error' && !/net::|ERR_/.test(m.text())) errs.push('console: '+m.text()); });
    await pg.goto('file://'+path.resolve(__dirname,'../index.html'));
    await pg.waitForTimeout(2500);
    const g=id=>pg.evaluate(i=>document.getElementById(i).textContent,id);
    console.log(`${scheme}: crimp ${await g('g-cw')}/${await g('g-cf')}  shear ${await g('g-sh')}  | ${await g('lv-stats')}`);
    console.log(`   page height ${await pg.evaluate(()=>document.body.scrollHeight)}px, overflow ${await pg.evaluate(()=>document.body.scrollWidth>window.innerWidth)}`);
    await pg.click('#b-sweep');
    await pg.waitForTimeout(25000);
    const sw=await pg.evaluate(()=>{
      const c=document.getElementById('cv-plot');
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let ink=0; for(let i=3;i<d.length;i+=4) if(d[i]>10) ink++;
      return ink;
    });
    console.log(`   sweep finished, plot has ${sw} inked pixels, ext now ${await g('g-ex')}`);
    await pg.screenshot({path:`/tmp/final-${scheme}.png`,clip:{x:0,y:290,width:1200,height:800}});
    console.log(errs.length?'   ERRORS '+errs.join(' | '):'   no errors');
  }
  await b.close();
})();
