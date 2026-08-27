const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'), src.indexOf('/*PHYSICS-END*/')));
const t=buildTopology(25,27);

function tensile(s){                       // mean of max(0, strain), stretch links only
  let sum=0, pk=0;
  for(let c=0;c<t.stretchCount;c++){
    const a=t.ca[c]*3,b=t.cb[c]*3;
    const dx=s.pos[b]-s.pos[a],dy=s.pos[b+1]-s.pos[a+1],dz=s.pos[b+2]-s.pos[a+2];
    let e=(Math.hypot(dx,dy,dz)-t.rest[c])/t.rest[c];
    if(e<0)e=0;
    sum+=e; if(e>pk)pk=e;
  }
  return {mean:sum/t.stretchCount, peak:pk};
}
const P=o=>Object.assign({substeps:8,iters:1,grav:9.81,damp:0.6,vk:1.0,
  cs:8e-4,ch:8e-4*15,cb:8e-4*50,windMag:0,wx:0,wy:0,wz:0,form:false,
  grabIndex:-1,gx:0,gy:0,gz:0},o);
function settle(kind,p,sec=8){ const s=new Sim(t,kind); const n=Math.round(sec*60);
  for(let i=0;i<n;i++) s.step(1/60,p); return s; }
const f=x=>(x*100).toFixed(2).padStart(7)+'%';

console.log('── fabric swept, budget fixed at 8 substeps x 1 iteration ──');
console.log('  alpha      |  mean tensile V / X   |  peak tensile V / X');
for(const a of [2e-2,4e-3,8e-4,2e-4,2e-5,1e-6]){
  const p=P({cs:a,ch:a*15,cb:a*50});
  const v=tensile(settle(0,p)), x=tensile(settle(1,p));
  console.log(`  ${a.toExponential(1).padEnd(10)} | ${f(v.mean)} ${f(x.mean)}    | ${f(v.peak)} ${f(x.peak)}`);
}
console.log('\n── budget swept, fabric fixed at poplin (8e-4) ──');
console.log('  sub  it |  mean tensile V / X   |  peak tensile V / X');
for(const [sub,it] of [[2,1],[4,1],[8,1],[16,1],[20,1],[8,4],[8,12],[4,4]]){
  const p=P({substeps:sub,iters:it});
  const v=tensile(settle(0,p)), x=tensile(settle(1,p));
  console.log(`  ${String(sub).padStart(3)} ${String(it).padStart(3)} | ${f(v.mean)} ${f(x.mean)}    | ${f(v.peak)} ${f(x.peak)}`);
}
console.log('\n── budget swept, fabric fixed at JERSEY (2e-2) ──');
console.log('  sub  it |  mean tensile V / X   |  peak tensile V / X');
for(const [sub,it] of [[2,1],[4,1],[8,1],[16,1],[20,1],[8,4],[8,12]]){
  const p=P({substeps:sub,iters:it,cs:2e-2,ch:3e-1,cb:1.0});
  const v=tensile(settle(0,p)), x=tensile(settle(1,p));
  console.log(`  ${String(sub).padStart(3)} ${String(it).padStart(3)} | ${f(v.mean)} ${f(x.mean)}    | ${f(v.peak)} ${f(x.peak)}`);
}
