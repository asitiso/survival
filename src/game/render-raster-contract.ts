import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import type { RenderContract, RenderPrimitive } from './render-contract.js';

export interface RasterContractFrame { id:string; width:number; height:number; cells:number[]; }
export interface RasterRenderContract { viewport:{width:number;height:number}; frames:RasterContractFrame[]; }
const GRID_W=64,GRID_H=36;
const ROLE_WEIGHT={ 'critical-hud':5, interactive:4, telegraph:3, label:2, decorative:1 } as const;
function covers(p:RenderPrimitive,x:number,y:number):boolean{
  if(p.kind==='circle')return Math.hypot(x-p.x,y-p.y)<=p.radius;
  return x>=p.x&&x<=p.x+p.width&&y>=p.y&&y<=p.y+p.height;
}
export function rasterizeRenderContract(contract:RenderContract):RasterRenderContract{
  const frames=contract.frames.map((frame)=>{
    const cells=Array<number>(GRID_W*GRID_H).fill(0);
    for(let gy=0;gy<GRID_H;gy++)for(let gx=0;gx<GRID_W;gx++){
      const x=(gx+.5)*LOGICAL_WIDTH/GRID_W,y=(gy+.5)*LOGICAL_HEIGHT/GRID_H;
      let weight=0;
      for(const p of frame.primitives)if(covers(p,x,y))weight=Math.max(weight,ROLE_WEIGHT[p.role]);
      cells[gy*GRID_W+gx]=weight;
    }
    return{id:frame.id,width:GRID_W,height:GRID_H,cells};
  });
  return{viewport:{...contract.viewport},frames};
}
function fnv(text:string):string{let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return(hash>>>0).toString(16).padStart(8,'0').toUpperCase();}
export function rasterContractSignature(contract:RasterRenderContract):string{
  return`RR-${fnv([contract.viewport.width,contract.viewport.height,...contract.frames.flatMap((f)=>[f.id,...f.cells])].join('|'))}`;
}
export function rasterSimilarity(a:RasterRenderContract,b:RasterRenderContract):number{
  const byId=new Map(b.frames.map((f)=>[f.id,f]));let same=0,total=0;
  for(const fa of a.frames){const fb=byId.get(fa.id);if(!fb){total+=fa.cells.reduce((s,v)=>s+Math.max(1,v),0);continue;}const n=Math.max(fa.cells.length,fb.cells.length);for(let i=0;i<n;i++){const av=fa.cells[i]??0,bv=fb.cells[i]??0;const weight=Math.max(1,av,bv);total+=weight;same+=Math.max(0,weight-Math.abs(av-bv));}}
  return total<=0?1:Math.max(0,Math.min(1,same/total));
}
