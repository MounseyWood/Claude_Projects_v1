/* Shear rigidity is the one number the model takes rather than derives.
   Find the value that puts bias extensibility where a real woven sits. */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'),src.indexOf('/*PHYSICS-END*/')));
const PAR=o=>Object.assign({substeps:8,iters:25,grav:0,damp:10,
  cStretch:1e-7,cBend:2e-2,cPin:1e-7,cContact:1e-8,cShear:1e-2,cLock:1e-8},o);
function tensile(topo,P,deg,stress){
  const secs=1.0, sim=new Sim(topo), n=topo.n;
  const th=deg*Math.PI/180, dx=Math.sin(th), dy=Math.cos(th);
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
  run(secs*2);
  return {strain:(mean(hi)-mean(lo))/gauge-1, sim};
}
const t=buildWeave('plain',12,12,{areal:500});
console.log('plain weave 12x12, 2 N/m, areal 500, 25 iters');
console.log('lock angle from sett: '+(90-t.phiLock*180/Math.PI).toFixed(1)+' deg of shear\n');
console.log('  cShear  |  0deg      45deg    ratio   shear@45   yarn@45');
for(const cs of [0.1,1,5,20,100]){
  const par=PAR({cShear:cs});
  const g=tensile(t,par,0,2), b=tensile(t,par,45,2);
  console.log(`  ${String(cs).padStart(6)}  |${(g.strain*100).toFixed(3).padStart(7)}% ${(b.strain*100).toFixed(3).padStart(9)}% `
    +`${(b.strain/g.strain).toFixed(1).padStart(6)}x  ${b.sim.shear().mean.toFixed(1).padStart(6)}deg  ${(b.sim.yarnStrain().mean*100).toFixed(4)}%`);
}
