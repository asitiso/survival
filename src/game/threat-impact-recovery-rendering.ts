const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export interface ProjectileDirectionCarryRecoveryInput{owner:'launch'|'travel'|'canonical';speed:number;life:number;}
export function projectileDirectionCarryRecoveryPresentation(input:ProjectileDirectionCarryRecoveryInput,reducedMotion=false,reducedFlash=false){
  const speed=clamp01((Math.max(0,Number.isFinite(input.speed)?input.speed:0)-60)/440),life=clamp01(input.life),flash=reducedFlash?.74:1;
  const owner=input.owner,ownerAlpha=owner==='travel'?.78:owner==='launch'?.72:.46,ownerLength=owner==='travel'?.9:owner==='launch'?.94:.62;
  return{owner,tailAlphaScale:(ownerAlpha+.14*speed)*(.76+.24*life)*flash,tailLengthScale:ownerLength*(.86+.14*speed)*(reducedMotion?.72:1),headAlphaScale:owner==='canonical'?.88:1,presentationOnly:true as const};
}

export interface ProjectileArrivalSettleRecoveryInput{impactLife:number;reaction:'hit'|'death'|'none';}
export function projectileArrivalSettleRecoveryPresentation(input:ProjectileArrivalSettleRecoveryInput,reducedFlash=false){
  const life=clamp01(input.impactLife),death=input.reaction==='death',flash=reducedFlash?.76:1;
  const directionAlphaScale=clamp01(life/.58)*(.82+(death?.08:0))*flash;
  const footprintAlphaScale=(.58+.42*life)*(death?1:.94)*flash;
  const spriteAlphaScale=.7+.3*life;
  return{directionAlphaScale,footprintAlphaScale,spriteAlphaScale,presentationOnly:true as const};
}

export interface HazardResidueReleaseInput{ttl:number;maxTtl:number;clearedMemoryLife:number;}
export function hazardResidueReleasePresentation(input:HazardResidueReleaseInput,reducedFlash=false){
  const life=clamp01((Number.isFinite(input.ttl)?input.ttl:0)/Math.max(.001,Number.isFinite(input.maxTtl)?input.maxTtl:1)),memory=clamp01(input.clearedMemoryLife),flash=reducedFlash?.84:1;
  if(life>.16)return{owner:'hazard' as const,hazardEdgeScale:1,clearedGroundAlphaScale:memory*.16*flash,presentationOnly:true as const};
  const release=clamp01(life/.16);
  return{owner:'residue' as const,hazardEdgeScale:(.72+.28*release)*flash,clearedGroundAlphaScale:(.56+.34*(1-release)+memory*.1)*flash,presentationOnly:true as const};
}

export interface SafeLaneHazardReclaimInput{expiringHazardCount:number;clearedMemoryCount:number;occlusion:number;}
export function safeLaneHazardReclaimPresentation(input:SafeLaneHazardReclaimInput,reducedMotion=false,reducedFlash=false){
  const expiring=clamp01(Math.max(0,input.expiringHazardCount)/3),cleared=clamp01(Math.max(0,input.clearedMemoryCount)/4),occlusion=clamp01(input.occlusion),releaseSeed=clamp01(expiring*.58+cleared*.42),release=releaseSeed*(.7+.3*(1-occlusion));
  const safeLaneAlphaScale=Math.max(.82,1-occlusion*.18+release*(reducedFlash?.12:.24));
  const hazardAlphaScale=1-release*(reducedMotion?.1:.18);
  return{release,safeLaneAlphaScale,hazardAlphaScale,presentationOnly:true as const};
}

export interface SilhouetteRecoveryReentryInput{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';recovery:number;motionBlend:number;turn:number;}
export function silhouetteRecoveryReentryPresentation(input:SilhouetteRecoveryReentryInput,reducedMotion=false){
  const recovery=clamp01(input.recovery),motion=clamp01(input.motionBlend),turn=clamp01(Math.abs(input.turn));
  if(input.owner==='locomotion')return{locomotionWeight:1,trailDistanceScale:1,alphaScale:1,presentationOnly:true as const};
  const ownerBase=input.owner==='recovery'?.34:input.owner==='attack'?.08:input.owner==='special'?.06:.04;
  const locomotionWeight=clamp01(ownerBase+(input.owner==='recovery'?recovery*.58:recovery*.14)+motion*.08-turn*.05);
  const trailDistanceScale=(1-locomotionWeight*.3)*(reducedMotion?.76:1),alphaScale=.76+.24*(1-Math.abs(.5-locomotionWeight)*.7);
  return{locomotionWeight,trailDistanceScale,alphaScale,presentationOnly:true as const};
}

export interface ContinuityCrowdBudgetInput{activeCount:number;indexFromNewest:number;owner:'travel'|'impact'|'hazard'|'silhouette';}
export function continuityCrowdBudgetPresentation(input:ContinuityCrowdBudgetInput,reducedMotion=false){
  const count=Math.max(0,Math.floor(input.activeCount)),capacity=count<=3?count:(reducedMotion?3:input.owner==='hazard'?4:5),visible=input.indexFromNewest<capacity,effectStrength=visible?1:0;
  return{visible,effectStrength,capacity,bodyAlphaScale:1,safeLaneAlphaScale:1,presentationOnly:true as const};
}
