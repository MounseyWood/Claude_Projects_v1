/* Analytic check: a hanging chain has a closed-form answer under Hooke's law.
   Link i (counting from the top) carries the weight below it, so its tension is
   T_i = (n-i)*m*g and a spring of compliance alpha must sit at extension
   alpha*T_i. XPBD should land on that number and stay there when the timestep
   or the iteration count changes; Verlet cannot. */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../index.html','utf8');
eval(src.slice(src.indexOf('/*PHYSICS-START*/'), src.indexOf('/*PHYSICS-END*/')));

const N=12, L=0.05, M=0.02;        // 12 links, 5 cm each, 20 g per particle
function chainTopo(){
  const n=N+1, pos0=new Float32Array(n*3);
  for(let i=0;i<n;i++) pos0[i*3+1]=-i*L;
  const ca=new Int32Array(N), cb=new Int32Array(N), ct=new Uint8Array(N), rest=new Float32Array(N);
  for(let i=0;i<N;i++){ ca[i]=i; cb[i]=i+1; rest[i]=L; }
  const pinned=new Uint8Array(n); pinned[0]=1;
  return {n,pos0,ca,cb,ct,rest,cc:N,stretchCount:N,pcount:new Float32Array(n).fill(2),
          quads:new Int32Array(0),quadCount:0,seams:new Int32Array(0),pinned,
          lowest0:-N*L,pmass:M};
}
const topo=chainTopo();
const g=9.81, alpha=1e-3;
const params=o=>Object.assign({substeps:8,iters:1,grav:g,damp:6,vk:1.0,
  cs:alpha,ch:alpha,cb:alpha,windMag:0,wx:0,wy:0,wz:0,form:false,
  grabIndex:-1,gx:0,gy:0,gz:0},o);

function run(kind,p,secs){
  const s=new Sim(topo,kind); s.pinsOn=true; s.applyPins();
  const dt=1/60, steps=Math.round(secs/dt);
  for(let i=0;i<steps;i++) s.step(dt,p);
  const ext=[];
  for(let i=0;i<N;i++) ext.push(Math.abs(s.pos[(i+1)*3+1]-s.pos[i*3+1])-L);
  return {ext, total:-s.pos[N*3+1]-N*L};
}
const analytic=[]; for(let i=0;i<N;i++) analytic.push(alpha*(N-i)*M*g);
const aTot=analytic.reduce((a,b)=>a+b,0);

console.log(`chain: ${N} links, alpha = ${alpha} m/N`);
console.log(`analytic total elongation = ${(aTot*1000).toFixed(3)} mm`
  +`   (top link ${(analytic[0]*1000).toFixed(3)} mm, bottom ${(analytic[N-1]*1000).toFixed(3)} mm)\n`);
console.log('                        |   total elongation  |  err vs analytic  | top link');
for(const [sub,it] of [[4,1],[8,1],[16,1],[32,1],[8,4],[8,16],[2,8],[1,20],[16,8]]){
  const p=params({substeps:sub,iters:it});
  const x=run(1,p,10), v=run(0,p,10);
  const e=q=>((q.total-aTot)/aTot*100);
  console.log(
    `  ${String(sub).padStart(3)} substeps x${String(it).padStart(3)} it | `
    + `XPBD ${(x.total*1000).toFixed(3).padStart(7)} mm      | ${e(x).toFixed(1).padStart(7)}%`
    + `        | ${(x.ext[0]*1000).toFixed(3)} mm`);
  console.log(
    `                        | Verlet ${(v.total*1000).toFixed(3).padStart(6)} mm    | ${e(v).toFixed(1).padStart(7)}%`
    + `        | ${(v.ext[0]*1000).toFixed(3)} mm`);
}
