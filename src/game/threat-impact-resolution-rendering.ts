const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export interface ProjectileCanonicalReclaimInput{owner:'launch'|'travel'|'canonical';launchLife:number;travelLife:number;speed:number;}
export function projectileCanonicalReclaimPresentation(input:ProjectileCanonicalReclaimInput,reducedMotion=false,reducedFlash=false){
  const launch=clamp01(input.launchLife),travel=clamp01(input.travelLife),life=Math.max(launch,travel),speed=clamp01((Math.max(0,Number.isFinite(input.speed)?input.speed:0)-60)/440);
  if(input.owner==='canonical'||life<=.02)return{owner:'canonical' as const,transitionAlphaScale:0,bodyAlphaScale:1,trailLengthScale:1,presentationOnly:true as const};
  const transitionAlphaScale=clamp01((.48+.38*life+.14*speed)*(reducedFlash?.78:1));
  const bodyAlphaScale=.92+.08*(1-life);
  const trailLengthScale=(.82+.18*life)*(reducedMotion?.8:1);
  return{owner:input.owner,transitionAlphaScale,bodyAlphaScale,trailLengthScale,presentationOnly:true as const};
}

export interface ImpactFootprintRetirementInput{life:number;reaction:'hit'|'death'|'none';}
export function impactFootprintRetirementPresentation(input:ImpactFootprintRetirementInput,reducedFlash=false){
  const life=clamp01(input.life),death=input.reaction==='death',flash=reducedFlash?.78:1;
  const footprintAlphaScale=(.16+.84*life)*flash;
  const responseAlphaScale=(.52+.48*Math.sqrt(life))*flash;
  const aftermathAlphaScale=(death?.46:.3)+life*(death?.44:.38);
  const spriteAlphaScale=.86+.14*life;
  return{footprintAlphaScale,responseAlphaScale,aftermathAlphaScale,spriteAlphaScale,presentationOnly:true as const};
}

export interface HazardGroundResolutionInput{hazardActive:boolean;hazardLife:number;memoryLife:number;}
export function hazardGroundResolutionPresentation(input:HazardGroundResolutionInput,reducedFlash=false){
  const hazardLife=clamp01(input.hazardLife),memoryLife=clamp01(input.memoryLife),flash=reducedFlash?.86:1;
  if(input.hazardActive)return{owner:'hazard' as const,hazardEdgeAlphaScale:.92+.08*hazardLife,clearedGroundAlphaScale:0,presentationOnly:true as const};
  if(memoryLife>.01)return{owner:'cleared' as const,hazardEdgeAlphaScale:0,clearedGroundAlphaScale:(.5+.5*memoryLife)*flash,presentationOnly:true as const};
  return{owner:'canonical' as const,hazardEdgeAlphaScale:0,clearedGroundAlphaScale:0,presentationOnly:true as const};
}

export interface SafeLaneCanonicalResolutionInput{release:number;hazardPressure:number;memoryCount:number;}
export function safeLaneCanonicalResolutionPresentation(input:SafeLaneCanonicalResolutionInput,reducedFlash=false){
  const release=clamp01(input.release),pressure=clamp01(input.hazardPressure),memory=clamp01(Math.max(0,input.memoryCount)/4);
  if(release<=.001&&pressure<=.001&&memory<=.001)return{safeLaneAlphaScale:1,edgeAlphaScale:1,presentationOnly:true as const};
  const focus=clamp01(release*(.62+.18*pressure+.2*memory)),flash=reducedFlash?.62:1;
  return{safeLaneAlphaScale:1+focus*.16*flash,edgeAlphaScale:1+focus*.08*flash,presentationOnly:true as const};
}

export interface SilhouetteLocomotionSettleInput{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';locomotionWeight:number;motionBlend:number;turn:number;}
export function silhouetteLocomotionSettlePresentation(input:SilhouetteLocomotionSettleInput,reducedMotion=false){
  if(input.owner==='locomotion')return{overlayAlphaScale:1,trailScale:1,bodyAlphaScale:1,presentationOnly:true as const};
  const locomotion=clamp01(input.locomotionWeight),motion=clamp01(input.motionBlend),turn=clamp01(Math.abs(input.turn));
  const settle=clamp01(locomotion*.78+motion*.18-turn*.08);
  const overlayAlphaScale=.68+.32*settle;
  const trailScale=(.72+.28*settle)*(reducedMotion?.84:1);
  return{overlayAlphaScale,trailScale,bodyAlphaScale:1,presentationOnly:true as const};
}

export type ContinuityResolutionKind='projectile'|'impact'|'hazard'|'silhouette';
export interface ContinuityResolutionBudgetInput{activeCount:number;indexFromNewest:number;kind:ContinuityResolutionKind;}
export function continuityResolutionBudgetPresentation(input:ContinuityResolutionBudgetInput,reducedMotion=false){
  const count=Math.max(0,Math.floor(input.activeCount));
  const baseCapacity=input.kind==='hazard'?4:input.kind==='silhouette'?5:input.kind==='projectile'?6:5;
  const capacity=count<=baseCapacity?count:Math.max(2,baseCapacity-(reducedMotion?1:0));
  const visible=input.indexFromNewest<capacity;
  const effectStrength=visible?1:0;
  return{visible,effectStrength,capacity,bodyAlphaScale:1,safeLaneAlphaScale:1,presentationOnly:true as const};
}
