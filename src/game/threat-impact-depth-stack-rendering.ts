const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export interface CriticalDepthLatchInput{critical:boolean;release:number;pressure:number;}
export function criticalDepthLatchPresentation(input:CriticalDepthLatchInput,reducedFlash=false){
  const release=clamp01(input.release),pressure=clamp01(input.pressure);
  const secondaryAlphaScale=input.critical?Math.max(.48,1-pressure*.5*(1-release*.72)):1-pressure*.2;
  return{criticalAlphaScale:1,secondaryAlphaScale:secondaryAlphaScale*(reducedFlash?.9:1),presentationOnly:true as const};
}

export interface BossTelegraphStackOrderInput{activeCount:number;indexFromNewest:number;life:number;critical:boolean;}
export function bossTelegraphStackOrderPresentation(input:BossTelegraphStackOrderInput,reducedFlash=false){
  const count=Math.max(1,Math.floor(input.activeCount)),rank=Math.max(0,Math.floor(input.indexFromNewest)),life=clamp01(input.life),density=clamp01((count-1)/5);
  const primary=rank===0,edgeAlphaScale=input.critical||primary?Math.max(.94,(.96+.04*life)*(reducedFlash?.98:1)):Math.max(.72,(.82+.16*life)*(reducedFlash?.96:1));
  const decorationAlphaScale=input.critical?1:Math.max(.28,1-density*.28-rank*.12)*(reducedFlash?.88:1);
  return{edgeAlphaScale,decorationAlphaScale,primary,presentationOnly:true as const};
}

export interface SafeLaneEdgeClutterProtectionInput{edgeProximity:number;clutter:number;confidence:number;critical:boolean;}
export function safeLaneEdgeClutterProtectionPresentation(input:SafeLaneEdgeClutterProtectionInput,reducedFlash=false){
  const edge=clamp01(input.edgeProximity),clutter=clamp01(input.clutter),confidence=clamp01(input.confidence),focus=clamp01(edge*.42+clutter*.46+(input.critical?.28:0));
  const pathAlphaFloor=Math.max(.92,.92+confidence*.06),safeLaneAlphaScale=1+focus*(.12+.06*confidence)*(reducedFlash?.72:1),secondaryAlphaScale=Math.max(.42,1-focus*.46)*(reducedFlash?.9:1);
  return{focus,pathAlphaFloor,safeLaneAlphaScale,secondaryAlphaScale,presentationOnly:true as const};
}

export interface CanonicalBodyDepthReclaimInput{release:number;pressure:number;owner:'recovery'|'canonical'|'critical';}
export function canonicalBodyDepthReclaimPresentation(input:CanonicalBodyDepthReclaimInput,reducedMotion=false){
  const release=clamp01(input.release),pressure=clamp01(input.pressure);
  if(input.owner==='canonical')return{bodyAlphaScale:1,overlayAlphaScale:1,trailAlphaScale:reducedMotion?.92:1,presentationOnly:true as const};
  const floor=input.owner==='critical'?.82:.52,reclaim=clamp01(release*(1-pressure*.22));
  return{bodyAlphaScale:1,overlayAlphaScale:floor+(1-floor)*reclaim,trailAlphaScale:(.48+.52*reclaim)*(reducedMotion?.88:1),presentationOnly:true as const};
}

export interface ImpactEdgeGhostRetirementInput{life:number;neighborCount:number;critical:boolean;}
export function impactEdgeGhostRetirementPresentation(input:ImpactEdgeGhostRetirementInput,reducedFlash=false){
  const life=clamp01(input.life),density=clamp01((Math.max(1,input.neighborCount)-1)/7),flash=reducedFlash?.86:1;
  const edgeFloor=input.critical?.5:.12,edgeAlphaScale=Math.max(edgeFloor,(.12+.88*life)*(1-density*.18))*flash,fillAlphaScale=Math.min(edgeAlphaScale,Math.max(input.critical?.38:.08,(.08+.76*life)*(1-density*.34))*flash);
  return{edgeAlphaScale,fillAlphaScale,retired:life<=.01,presentationOnly:true as const};
}

export interface UnifiedDepthStackBudgetInput{criticalCount:number;bossTelegraphCount:number;safeLaneVisible:boolean;secondaryCount:number;pressure:number;}
export function unifiedDepthStackBudgetPresentation(input:UnifiedDepthStackBudgetInput,reducedMotion=false,reducedFlash=false){
  const critical=clamp01(Math.max(0,input.criticalCount)/3),telegraph=clamp01(Math.max(0,input.bossTelegraphCount)/4),secondary=clamp01(Math.max(0,input.secondaryCount-2)/12),pressure=clamp01(input.pressure),stress=clamp01(critical*.24+telegraph*.24+secondary*.28+pressure*.38),motion=reducedMotion?.9:1,flash=reducedFlash?.9:1;
  return{stress,criticalAlphaScale:1,canonicalBodyAlphaScale:1,safeLaneAlphaScale:input.safeLaneVisible?1+stress*.12*(reducedFlash?.72:1):1,bossTelegraphEdgeAlphaScale:input.bossTelegraphCount>0?Math.max(.94,.98*(reducedFlash?.98:1)):1,secondaryAlphaScale:(1-stress*.46)*motion*flash,presentationOnly:true as const};
}
