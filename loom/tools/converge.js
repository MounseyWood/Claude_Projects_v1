/* A swatch weighs almost nothing, so any real load is a violent acceleration
   and Gauss-Seidel cannot propagate it along a 14-crossing yarn in a few
   passes. Mass only sets the route to equilibrium, not the equilibrium, so
   scaling it up is a legitimate conditioner for a quasi-static measurement.
   This finds where the answer stops moving. */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'),src.indexOf('/*PHYSICS-END*/')));

const PAR=o=>Object.assign({substeps:8,iters:5,grav:0,damp:14,
  cStretch:1e-7,cBend:2e-2,cPin:1e-7,cContact:1e-8,cShear:1e-2,cLock:1e-8},o);

function tensile(topo,P,thetaDeg,stress,secs){
  const sim=new Sim(topo), n=topo.n;
  const th=thetaDeg*Math.PI/180, dx=Math.sin(th), dy=Math.cos(th);
  const run=s=>{ const k=Math.round(s*60); for(let i=0;i<k;i++) sim.step(1/60,P); };
  run(secs);
  const u=i=>sim.pos[i*3]*dx+sim.pos[i*3+1]*dy;
  const v=i=>-sim.pos[i*3]*dy+sim.pos[i*3+1]*dx;
  let umin=1e9,umax=-1e9,vmin=1e9,vmax=-1e9;
  for(let i=0;i<n;i++){ const a=u(i),b=v(i);
    if(a<umin)umin=a; if(a>umax)umax=a; if(b<vmin)vmin=b; if(b>vmax)vmax=b; }
  const band=topo.s*1.5, lo=[], hi=[];
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
  return {strain:(mean(hi)-mean(lo))/gauge-1, yarn:sim.yarnStrain().mean, sim};
}

console.log('plain weave, warp pull, 0.05 N/m — where does the answer settle?\n');
console.log('  areal kg/m2   iters    strain    yarn strain (should be ~0)');
for(const areal of [0.15,15,150]){
  const t=buildWeave('plain',14,14,{areal});
  for(const iters of [5,20,50]){
    const r=tensile(t,PAR({iters}),0,0.05,1.5);
    console.log(`  ${String(areal).padStart(11)}   ${String(iters).padStart(5)}  `
      +`${(r.strain*100).toFixed(3).padStart(8)}%   ${(r.yarn*100).toFixed(5).padStart(10)}%`);
  }
}
