/* Slices the physics core out of index.html so these numbers come from the
   code that ships. Quasi-static tensile test: hold one edge, ramp a known
   force per unit width onto the opposite edge, hold, measure.
   Mass is scaled up (areal 15) purely as a numerical conditioner — gravity is
   off, so it changes the route to equilibrium, not the equilibrium. */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'),src.indexOf('/*PHYSICS-END*/')));

const PAR=o=>Object.assign({substeps:8,iters:20,grav:0,damp:10,
  cStretch:1e-7,cBend:2e-2,cPin:1e-7,cContact:1e-8,cShear:1e-2,cLock:1e-8},o);

function tensile(topo,P,thetaDeg,stress,secs){
  secs=secs||1.4;
  const sim=new Sim(topo), n=topo.n;
  const th=thetaDeg*Math.PI/180, dx=Math.sin(th), dy=Math.cos(th);
  const run=s=>{ const k=Math.round(s*60); for(let i=0;i<k;i++) sim.step(1/60,P); };
  run(secs);
  const before=sim.crimp();
  const u=i=>sim.pos[i*3]*dx+sim.pos[i*3+1]*dy;
  const v=i=>-sim.pos[i*3]*dy+sim.pos[i*3+1]*dx;
  let umin=1e9,umax=-1e9,vmin=1e9,vmax=-1e9;
  for(let i=0;i<n;i++){ const a=u(i),b=v(i);
    if(a<umin)umin=a; if(a>umax)umax=a; if(b<vmin)vmin=b; if(b>vmax)vmax=b; }
  const band=topo.s*1.6, lo=[], hi=[];
  for(let i=0;i<n;i++){ const a=u(i); if(a<umin+band) lo.push(i); else if(a>umax-band) hi.push(i); }
  const mean=set=>set.reduce((t,i)=>t+u(i),0)/set.length;
  const gauge=mean(hi)-mean(lo), width=vmax-vmin;
  for(const i of lo) sim.clamped[i]=1;
  sim.applyClamps();
  const full=stress*width/hi.length, steps=Math.round(secs*60);
  for(let k=0;k<steps;k++){
    const f=full*(k+1)/steps;
    for(const i of hi){ sim.fext[i*3]=f*dx; sim.fext[i*3+1]=f*dy; }
    sim.step(1/60,P);
  }
  run(secs);
  return {strain:(mean(hi)-mean(lo))/gauge-1, before, sim};
}

const E=14,Pk=14, OPT={areal:15};
console.log('-- stress sweep, plain weave --');
console.log('  N/m      0 warp    45 bias   bias/grain');
const tp=buildWeave('plain',E,Pk,OPT), par=PAR();
for(const st of [2,5,10,20,40]){
  const g=tensile(tp,par,0,st).strain, b=tensile(tp,par,45,st).strain;
  console.log(`  ${String(st).padStart(3)}  ${(g*100).toFixed(3).padStart(9)}%  ${(b*100).toFixed(3).padStart(9)}%  ${(b/g).toFixed(1).padStart(9)}x`);
}
console.log('\n-- by weave at 10 N/m --');
console.log('  weave        crimp w/f      0 warp    45 bias   90 weft  bias/grain  yarn strain');
for(const nm of DRAFT_NAMES){
  const t=buildWeave(nm,E,Pk,OPT), pr=PAR();
  const g=tensile(t,pr,0,10), b=tensile(t,pr,45,10), c=tensile(t,pr,90,10);
  console.log(`  ${t.draft.label.padEnd(12)} ${(g.before.warp*100).toFixed(2)}/${(g.before.weft*100).toFixed(2)}%  `
    +`${(g.strain*100).toFixed(3).padStart(8)}%  ${(b.strain*100).toFixed(3).padStart(8)}%  ${(c.strain*100).toFixed(3).padStart(7)}%  `
    +`${(b.strain/g.strain).toFixed(1).padStart(8)}x  ${(b.sim.yarnStrain().mean*100).toFixed(4)}%`);
}
console.log('\n-- bias: what actually moved? plain weave, 10 N/m --');
for(const ang of [0,15,30,45,60,75,90]){
  const t=buildWeave('plain',E,Pk,OPT), pr=PAR();
  const r=tensile(t,pr,ang,10);
  const sh=r.sim.shear(), ys=r.sim.yarnStrain(), cr=r.sim.crimp();
  console.log(`  ${String(ang).padStart(2)}deg  strain ${(r.strain*100).toFixed(3).padStart(7)}%   shear ${sh.mean.toFixed(2).padStart(5)}deg   yarn ${(ys.mean*100).toFixed(4)}%   crimp ${(cr.warp*100).toFixed(2)}/${(cr.weft*100).toFixed(2)}%`);
}
