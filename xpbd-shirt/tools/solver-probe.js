/* Headless probe. Slices the physics core straight out of index.html so these
   numbers come from the code that actually ships in the page. */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../index.html', 'utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'), src.indexOf('/*PHYSICS-END*/')));

const topo = buildTopology(25, 27);
console.log(`mesh  ${topo.n} particles  ${topo.cc} constraints (${topo.stretchCount} stretch)  ${topo.quadCount} quads`);

const A0 = 8e-4;
const P = o => Object.assign({
  substeps:8, iters:1, grav:9.81, damp:0.6, vk:1.0,
  cs:A0, ch:A0*15, cb:A0*50,
  windMag:0, wx:0, wy:0, wz:0, form:false,
  grabIndex:-1, gx:0, gy:0, gz:0
}, o);

function settle(kind, params, seconds){
  const s = new Sim(topo, kind);
  const dt = 1/60, n = Math.round(seconds/dt);
  for (let i=0;i<n;i++) s.step(dt, params);
  return s;
}
const mm  = s => (s.drop*1000).toFixed(0).padStart(5);
const pk  = s => (s.peak*100).toFixed(2).padStart(6)+'%';

console.log('\n── fabric held at cotton poplin (alpha 8e-4), budget swept ──');
console.log('  substeps  iters |  hem drop  V /  X (mm) |  peak strain  V / X');
for (const [sub,it] of [[1,1],[2,1],[4,1],[8,1],[16,1],[20,1],[8,4],[8,16],[2,8],[4,4]]) {
  const p = P({substeps:sub, iters:it});
  const v = settle(0,p,10), x = settle(1,p,10);
  console.log(`  ${String(sub).padStart(8)}  ${String(it).padStart(5)} | ${mm(v)} / ${mm(x)}           | ${pk(v)} / ${pk(x)}`);
}

console.log('\n── budget held at 8 substeps x 1 iteration, fabric swept ──');
console.log('  alpha        |  hem drop  V /  X (mm) |  peak strain  V / X');
for (const a of [2e-2, 4e-3, 8e-4, 2e-4, 2e-5, 1e-6]) {
  const p = P({cs:a, ch:a*15, cb:a*50});
  const v = settle(0,p,10), x = settle(1,p,10);
  console.log(`  ${a.toExponential(1).padEnd(12)} | ${mm(v)} / ${mm(x)}           | ${pk(v)} / ${pk(x)}`);
}

console.log('\n── settling check: XPBD poplin, hem drop over time ──');
{
  const s = new Sim(topo,1), p = P({}), dt=1/60;
  for (let i=1;i<=900;i++){ s.step(dt,p); if(i%150===0) console.log(`   t=${(i*dt).toFixed(1)}s  drop ${(s.drop*1000).toFixed(1)} mm  peak ${(s.peak*100).toFixed(2)}%`); }
}
