// Render the lab as video frames, deterministically: a fixed 30 fps clock, seeded randomness,
// a scripted camera (scroll) and scripted gestures shown by the lab's own pixel hand.
// The thread is the real Verlet simulation, so it moves exactly as it does in the lab.
// The phone column is rendered at full video height; compose_video.sh places it in 16:9.
//
//   node long-chain/tools/render_video.js <timeline.json> <out-dir>
//
// timeline.json: { "seconds": n, "events": [ { "t": seconds, ...one action } ] }
//   cam: frame index, dur: seconds   glide the camera to the top of that exhibit
//   hand: [frame, selector or [fx, fy], "tap"|"drag", dur, [dx, dy]?]   show the pixel hand
//   click: selector                  press a control
//   ramp: { sel, from, to, dur }     move a range input smoothly
//   demo: frame index              the exhibit's own pixel-hand demonstration
//   js: "code"                       anything else, with F = frames and G = state
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const [TL, OUT] = [process.argv[2], process.argv[3] || 'frames'];
const timeline = JSON.parse(fs.readFileSync(TL, 'utf8'));
const FPS = 30, W = 390, H = 844, SCALE = 1080 / 844;
const PAGE = 'http://lab.local/index.html';

// the virtual clock and seeded randomness, installed before the page's own code runs
const CLOCK = `(() => {
  let T = 0; const q = [];
  performance.now = () => T; const D0 = 1791504000000; Date.now = () => D0 + T;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__step = ms => { T += ms; q.splice(0).forEach(cb => { try { cb(T); } catch (e) { console.error(e); } }); };
  let s = 20261009; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style');
    st.textContent = 'html{scroll-snap-type:none!important} #tally,#snd,.fs,#bar{display:none!important}'; document.head.appendChild(st); });
})();`;

const HELPERS = `(() => {
  const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  const top = i => document.querySelectorAll('.frame')[i].offsetTop;
  let cam = { from: 0, to: 0, t0: 0, dur: 0 };
  window.__cam = (i, t, dur) => { cam = { from: window.scrollY, to: top(i), t0: t, dur: dur || 0.001 }; };
  const ramps = [];
  window.__ramp = (r, t) => ramps.push(Object.assign({ t0: t }, r));
  window.__tick = t => {
    window.scrollTo(0, cam.from + (cam.to - cam.from) * ease((t - cam.t0) / cam.dur));
    ramps.forEach(r => { const u = Math.min(1, Math.max(0, (t - r.t0) / r.dur)); if (u > 0 && !r.done) { const el = document.querySelector(r.sel); el.value = r.from + (r.to - r.from) * u; el.dispatchEvent(new Event('input')); if (u >= 1) r.done = true; } });
  };
  // the pixel hand performs a gesture on exhibit i, at an element or at a point given as fractions of the exhibit
  window.__hand = (i, at, kind, dur, d) => {
    const f = window.__frames[i], fr = f.el.getBoundingClientRect(); let x, y;
    if (typeof at === 'string') { const r = document.querySelector(at).getBoundingClientRect(); x = r.left + r.width / 2 - fr.left; y = r.top + r.height / 2 - fr.top; }
    else { x = at[0] * f.w; y = at[1] * f.h; }
    const pts = [{ x, y }]; if (d) pts.push({ x: x + d[0], y: y + d[1] });
    f.touched = true; f.demo = { kind, pts, dur, t: f.t };
  };
})();`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE, isMobile: true, hasTouch: true })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(CLOCK);
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8').replace('requestAnimationFrame(loop);', 'window.__G = G; window.__frames = frames; requestAnimationFrame(loop);');
  await p.route(PAGE, r => r.fulfill({ body: html, contentType: 'text/html' }));
  await p.goto(PAGE); await p.evaluate(HELPERS);
  for (let k = 0; k < 60; k++) await p.evaluate(ms => window.__step(ms), 1000 / FPS);
  const events = timeline.events.slice().sort((a, b) => a.t - b.t);
  const N = Math.round(timeline.seconds * FPS); let e = 0;
  for (let n = 0; n < N; n++) {
    const t = n / FPS;
    while (e < events.length && events[e].t <= t + 1e-6) {
      const ev = events[e++];
      try {
        await p.evaluate(({ ev, t }) => {
          const F = window.__frames, G = window.__G;
          if (ev.cam !== undefined) window.__cam(ev.cam, t, ev.dur);
          if (ev.hand) window.__hand(...ev.hand);
          if (ev.demo !== undefined) { const f = F[ev.demo], d = f.sc.demo && f.sc.demo(f); if (d) { d.t = f.t; f.demo = d; f.touched = true; } }
          if (ev.click) document.querySelector(ev.click).click();
          if (ev.ramp) window.__ramp(ev.ramp, t);
          if (ev.js) new Function('F', 'G', ev.js)(F, G);
        }, { ev, t });
      } catch (err) { errs.push('t=' + ev.t + ': ' + err.message.split('\n')[0]); }
    }
    await p.evaluate(t => { window.__tick(t); window.__step(1000 / 30); }, t);
    if (process.env.PROBE) { if (n % 60 === 0) console.log(t, await p.evaluate(() => JSON.stringify([Math.round(scrollY), ...[0,1,2,3].map(i => { const e = document.querySelectorAll('.frame')[i]; return [e.offsetTop, e.offsetHeight]; }), innerHeight, document.documentElement.scrollHeight]))); if (t > +process.env.PROBE) break; continue; }
    await p.screenshot({ path: path.join(OUT, 'f' + String(n).padStart(5, '0') + '.png') });
  }
  console.log(JSON.stringify({ frames: N, errs }));
  await b.close();
})();
