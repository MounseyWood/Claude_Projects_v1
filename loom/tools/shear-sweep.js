/* Shear rigidity is the one number this model takes on faith rather than
   deriving. Find the value that puts bias extensibility where a real woven
   sits, an order of magnitude above the grain. */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'),src.indexOf('/*PHYSICS-END*/')));
const PAR=o=>Object.assign({substeps:8,iters:20,grav:0,damp:10,
  cStretch:1e-7,cBend:2e-2,cPin:1e-7,cContact:1e-8,cShear:1e-2,cLock:1e-8},o);
function tensile(topo,P,deg,stress,secs){
  secs=secs||1.4;
  const sim=new Sim(topo), n=topo.n, th=deg*Math.PI/180, dx=Math.cos(th), dy=Math.sin(th);
  const run=s=>{ const k=Math.round(s*60); for(let i=0;i<k;i++) sim.step(1/60,P); };
  run(secs);
  const u=i=>sim.pos[i*3]*dx+sim.pos[i*3+1]*dy, v=i=>-sim.pos[i*3]*dy+sim.pos[i*3+1]*dx;
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
  for(let k=0;k<steps;k++){ const f=full*(k+1)/steps;
    for(const i of hi){ sim.fext[i*3]=f*dx; sim.fext[i*3+1]=f*dy; } sim.step(1/60,P); }
  run(secs);
  return {strain:(mean(hi)-mean(lo))/gauge-1, sim};
}
const t=buildWeave('plain',14,14,{areal:15});
console.log('plain weave, 2 N/m — shear compliance sweep\n');
console.log('  cShear    rest shear   0 warp     45 bias   bias/grain   shear@45   yarn@45');
for(const cs of [1e-2,1e-1,1,5,20]){
  const par=PAR({cShear:cs});
  const rest=new Sim(t); for(let i=0;i<90;i++) rest.step(1/60,par);
  const g=tensile(t,par,0,2), b=tensile(t,par,45,2);
  console.log(`  ${cs.toExponential(0).padStart(7)}   ${rest.shear().mean.toFixed(2).padStart(6)}deg  `
    +`${(g.strain*100).toFixed(3).padStart(7)}%  ${(b.strain*100).toFixed(3).padStart(8)}%  `
    +`${(b.strain/g.strain).toFixed(1).padStart(9)}x   ${b.sim.shear().mean.toFixed(1).padStart(5)}deg   ${(b.sim.yarnStrain().mean*100).toFixed(4)}%`);
}
