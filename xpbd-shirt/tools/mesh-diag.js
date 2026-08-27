const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'), src.indexOf('/*PHYSICS-END*/')));
const t=buildTopology(25,27);

// map particle -> grid cell(s) for reporting
const U=t.U,V=t.V;
let minR=1e9,maxR=0, tiny=0;
for(let c=0;c<t.cc;c++){ const r=t.rest[c]; if(r<minR)minR=r; if(r>maxR)maxR=r; if(r<0.004)tiny++; }
console.log(`rest lengths: min ${(minR*1000).toFixed(2)} mm  max ${(maxR*1000).toFixed(2)} mm  under 4mm: ${tiny}`);

const perType=[0,0,0]; for(let c=0;c<t.cc;c++) perType[t.ct[c]]++;
console.log(`constraints by type: stretch ${perType[0]} shear ${perType[1]} bend ${perType[2]}`);

// stretch-only rest lengths
let sMin=1e9,sMax=0,hist={};
for(let c=0;c<t.stretchCount;c++){ const r=t.rest[c];
  if(r<sMin)sMin=r; if(r>sMax)sMax=r;
  const b=(r*1000/2|0)*2; hist[b]=(hist[b]||0)+1; }
console.log(`stretch rest: min ${(sMin*1000).toFixed(2)} mm  max ${(sMax*1000).toFixed(2)} mm`);
console.log('stretch rest histogram (mm bucket : count):',
  Object.keys(hist).sort((a,b)=>a-b).map(k=>`${k}:${hist[k]}`).join('  '));

// connectivity
const deg=new Int32Array(t.n);
for(let c=0;c<t.stretchCount;c++){ deg[t.ca[c]]++; deg[t.cb[c]]++; }
let lonely=0; for(let i=0;i<t.n;i++) if(deg[i]<2) lonely++;
console.log(`particles with <2 stretch neighbours: ${lonely}`);
console.log(`pinned: ${Array.from(t.pinned).reduce((a,b)=>a+b,0)}`);

// where does the peak strain live?
const P={substeps:8,iters:1,grav:9.81,damp:0.6,vk:1.0,
  cs:1e-6,ch:1.5e-5,cb:5e-5,windMag:0,wx:0,wy:0,wz:0,form:false,
  grabIndex:-1,gx:0,gy:0,gz:0};
const s=new Sim(t,1);
for(let i=0;i<600;i++) s.step(1/60,P);
const rows=[];
for(let c=0;c<t.stretchCount;c++){
  const a=t.ca[c]*3,b=t.cb[c]*3;
  const dx=s.pos[b]-s.pos[a],dy=s.pos[b+1]-s.pos[a+1],dz=s.pos[b+2]-s.pos[a+2];
  const L=Math.hypot(dx,dy,dz);
  rows.push({c,e:(L-t.rest[c])/t.rest[c],rest:t.rest[c],
    y0:s.pos[a+1],vertical:Math.abs(dy)>Math.abs(dx)});
}
rows.sort((p,q)=>Math.abs(q.e)-Math.abs(p.e));
console.log('\nnear-rigid fabric (alpha 1e-6), worst 10 stretch constraints:');
for(const r of rows.slice(0,10))
  console.log(`   strain ${(r.e*100).toFixed(1).padStart(7)}%  rest ${(r.rest*1000).toFixed(1).padStart(5)} mm  y ${r.y0.toFixed(3)}  ${r.vertical?'vertical':'horizontal'}`);

const over = rows.filter(r=>Math.abs(r.e)>0.02).length;
console.log(`constraints over 2% strain: ${over} of ${t.stretchCount}`);
let sum=0,vs=0,vn=0;
for(const r of rows){ sum+=Math.abs(r.e); if(r.vertical){vs+=Math.abs(r.e);vn++;} }
console.log(`mean |strain| all ${(sum/rows.length*100).toFixed(3)}%   vertical-only ${(vs/vn*100).toFixed(3)}% over ${vn} links`);
