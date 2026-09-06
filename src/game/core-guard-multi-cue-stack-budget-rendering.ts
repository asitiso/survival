const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export interface CoreGuardMultiCueStackInput{id:number;ttl:number;maxTtl:number;}
export function coreGuardMultiCueStackBudget(input:readonly CoreGuardMultiCueStackInput[],reducedFlash=false){
  const stackLoadCap=reducedFlash?1.18:1.55;
  const ordered=input.map(c=>({id:c.id,life:clamp01(Math.max(0,c.ttl)/Math.max(.001,c.maxTtl))})).sort((a,b)=>b.life-a.life||a.id-b.id);
  let remaining=stackLoadCap,combinedLoad=0;
  const entries=ordered.map(c=>{const alphaScale=c.life<=0?0:Math.min(1,remaining/Math.max(.001,c.life));const load=c.life*alphaScale;remaining=Math.max(0,remaining-load);combinedLoad+=load;return{id:c.id,life:c.life,alphaScale,presentationOnly:true as const};});
  return{entries,combinedLoad,stackLoadCap,presentationOnly:true as const};
}
