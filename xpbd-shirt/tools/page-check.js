const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const errs = [], logs = [];
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport:{width:1280,height:1400}, colorScheme:scheme });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(`[${scheme}] pageerror: ${e.message}`));
    page.on('console', m => { if (m.type()==='error') errs.push(`[${scheme}] console: ${m.text()}`); });

    await page.goto('file://' + path.resolve(__dirname, '../index.html'));
    await page.waitForTimeout(5000);

    const m = await page.evaluate(() => ({
      vMean: document.getElementById('v-mean').textContent,
      xMean: document.getElementById('x-mean').textContent,
      vPeak: document.getElementById('v-peak').textContent,
      xPeak: document.getElementById('x-peak').textContent,
      vDrop: document.getElementById('v-drop').textContent,
      xDrop: document.getElementById('x-drop').textContent,
      stats: document.getElementById('foot-stats').textContent,
      rows:  document.querySelectorAll('#fabtable tr').length,
      bodyW: document.body.scrollWidth,
      winW:  window.innerWidth,
      cvV:   document.getElementById('cv-v').width,
      fabLab: document.getElementById('lv-fab').textContent
    }));
    logs.push(`${scheme}: V ${m.vMean}/${m.vPeak}/${m.vDrop}  X ${m.xMean}/${m.xPeak}/${m.xDrop}`);
    logs.push(`   ${m.stats} | fabric=${m.fabLab} | table rows=${m.rows} | canvas=${m.cvV}px`);
    logs.push(`   body ${m.bodyW}px vs window ${m.winW}px ${m.bodyW>m.winW?'<<< HORIZONTAL OVERFLOW':'(no overflow)'}`);

    // is the cloth actually being drawn? sample the middle of each canvas
    const px = await page.evaluate(() => {
      const out = {};
      for (const id of ['cv-v','cv-x']) {
        const cv = document.getElementById(id);
        const d = cv.getContext('2d').getImageData(cv.width>>1, cv.height>>1, 1, 1).data;
        out[id] = `rgb(${d[0]},${d[1]},${d[2]})`;
      }
      return out;
    });
    logs.push(`   centre pixel: verlet ${px['cv-v']}  xpbd ${px['cv-x']}`);

    await page.screenshot({ path: `/tmp/shirt-${scheme}.png`, clip:{x:0,y:0,width:1280,height:1000} });

    // exercise the controls
    await page.click('#b-mode'); await page.waitForTimeout(2500);
    await page.click('#b-shade'); await page.waitForTimeout(400);
    await page.screenshot({ path:`/tmp/shirt-${scheme}-form-strain.png`, clip:{x:0,y:120,width:1280,height:820} });
    await page.click('#b-wire'); await page.waitForTimeout(300);
    await page.click('#b-gust'); await page.waitForTimeout(1200);
    await page.screenshot({ path:`/tmp/shirt-${scheme}-mesh.png`, clip:{x:0,y:120,width:1280,height:820} });
    const after = await page.evaluate(() => document.getElementById('x-mean').textContent);
    logs.push(`   after form+strain+mesh+gust: X mean ${after}`);
    await ctx.close();
  }
  await browser.close();
  console.log(logs.join('\n'));
  console.log(errs.length ? '\nERRORS:\n' + errs.join('\n') : '\nno console or page errors');
})();
