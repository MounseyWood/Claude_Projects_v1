const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'),src.indexOf('/*PHYSICS-END*/')));
const PAR=o=>Object.assign({substeps:10,iters:6,grav:0,damp:8,
  cStretch:1e-7,cBend:2e-2,cPin:1e-7,cContact:1e-8,cShear:1e-2,cLock:1e-8},o);
const E=14,P=14;
// predicted crimp straight from the drawdown: count the z-flips along a yarn
function predicted(t,axis){
  const {E,P,s,d,up}=t; let tot=0,cnt=0;
  const at=(i,j)=> up[j*E+i];
  if(axis==='warp'){ for(let i=0;i<E;i++){ let path=0;
    for(let j=0;j<P-1;j++) path += at(i,j)!==at(i,j+1) ? Math.hypot(s,d) : s;
    tot += path/((P-1)*s)-1; cnt++; } }
  else { for(let j=0;j<P;j++){ let path=0;
    for(let i=0;i<E-1;i++) path += at(i,j)!==at(i+1,j) ? Math.hypot(s,d) : s;
    tot += path/((E-1)*s)-1; cnt++; } }
  return tot/cnt;
}
console.log('crimp: geometric prediction from the drawdown vs relaxed simulation\n');
console.log('  weave        iters   warp pred / sim      weft pred / sim');
for(const nm of DRAFT_NAMES){
  const t=buildWeave(nm,E,P);
  const pw=predicted(t,'warp'), pf=predicted(t,'weft');
  for(const it of [6]){
    const sim=new Sim(t), par=PAR({iters:it});
    for(let k=0;k<150;k++) sim.step(1/60,par);
    const c=sim.crimp();
    console.log(`  ${(it===6?t.draft.label:'').padEnd(12)} ${String(it).padStart(4)}  `
      +`${(pw*100).toFixed(2).padStart(6)}% /${(c.warp*100).toFixed(2).padStart(6)}%      `
      +`${(pf*100).toFixed(2).padStart(6)}% /${(c.weft*100).toFixed(2).padStart(6)}%`);
  }
}
