// Render the lab as video frames, deterministically: a fixed 30 fps clock, seeded randomness,
// a scripted camera (scroll) and scripted gestures shown by the lab's own pixel hand.
// The thread is the real Verlet simulation, so it moves exactly as it does in the lab.
//
//   node long-chain/tools/render_video.js <out-dir> [seconds]
//   ffmpeg -framerate 30 -i <out-dir>/f%05d.png -c:v libx264 -pix_fmt yuv420p out.mp4
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || 'frames';
const SECS = +(process.argv[3] || 20);
// the phone column is rendered at full video height; compose it into 16:9 afterwards (see compose_video.sh)
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
  document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html{scroll-snap-type:none!important}'; document.head.appendChild(st); });
})();`;

// helpers that run in the page
const HELPERS = `(() => {
  window.__ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  window.__top = i => document.querySelectorAll('.frame')[i].offsetTop;
  // show the pixel hand doing a gesture on frame i; kind 'tap' or 'drag', pts in frame coordinates (fractions of width and height)
  window.__hand = (i, kind, pts, dur) => { const f = window.__frames[i]; f.touched = true; f.demo = { kind, pts: pts.map(p => ({ x: p[0] * f.w, y: p[1] * f.h })), dur, t: f.t }; };
})();`;

// the director: what the camera and the hand do at each moment (t in seconds)
function cue(t) {
  const a = [];
  // camera: [start, end, from frame, to frame]
  const moves = [[3, 5.5, 0, 2], [13, 15, 2, 3]];
  let at = 0;
  for (const [s, e, f0, f1] of moves) { if (t >= e) at = f1; else if (t >= s) { at = [f0, f1, (t - s) / (e - s)]; break; } else break; }
  a.push({ cam: at });
  // oil: four taps link the chain
  [6, 7.6, 9.2, 10.8].forEach(s => { if (Math.abs(t - s) < 1e-6) a.push({ hand: [2, 'tap', [[.55, .62]], 1.5] }); if (Math.abs(t - (s + .6)) < 1e-6) a.push({ tap: 2 }); });
  // spin: the hand drags the thread to stretch it, and the draw ratio follows
  if (Math.abs(t - 15.5) < 1e-6) a.push({ hand: [3, 'drag', [[.5, .5], [.5, .85]], 4] });
  if (t >= 16.1 && t <= 19) a.push({ stretch: 1 + 3.5 * (t - 16.1) / 2.9 });
  return a;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE, isMobile: true, hasTouch: true })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(CLOCK);
  // expose the scene list for the director
  let html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8').replace('requestAnimationFrame(loop);', 'window.__G = G; window.__frames = frames; requestAnimationFrame(loop);');
  await p.route(PAGE, r => r.fulfill({ body: html, contentType: 'text/html' }));
  await p.goto(PAGE); await p.evaluate(HELPERS);
  // let the page settle on the cover before recording
  for (let k = 0; k < 60; k++) await p.evaluate(ms => window.__step(ms), 1000 / FPS);
  const N = Math.round(SECS * FPS);
  for (let n = 0; n < N; n++) {
    const t = +(n / FPS).toFixed(6);
    for (const c of cue(t)) await p.evaluate(c => {
      if (c.cam !== undefined) { const v = c.cam; const y = Array.isArray(v) ? window.__top(v[0]) + (window.__top(v[1]) - window.__top(v[0])) * window.__ease(v[2]) : window.__top(v); window.scrollTo(0, y); }
      if (c.hand) window.__hand(...c.hand);
      if (c.tap !== undefined) { const f = window.__frames[c.tap]; f.sc.tap(f, f.w * .55, f.h * .62); }
      if (c.stretch) { const r = document.getElementById('spin-r'); r.value = c.stretch; r.dispatchEvent(new Event('input')); }
    }, c);
    await p.evaluate(ms => window.__step(ms), 1000 / FPS);
    await p.screenshot({ path: path.join(OUT, 'f' + String(n).padStart(5, '0') + '.png') });
  }
  console.log(JSON.stringify({ frames: N, errs }));
  await b.close();
})();
