const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export interface ProjectileDepthRecoveryInput{occlusion:number;release:number;pressure:number;critical:boolean;}
export function projectileDepthRecoveryPresentation(input:ProjectileDepthRecoveryInput,reducedMotion=false){
  const occlusion=clamp01(input.occlusion),release=clamp01(input.release),pressure=clamp01(input.pressure);
  const suppression=occlusion*.4+pressure*.15*(1-release);
  const floor=input.critical?.8:.46;
  return{bodyAlphaScale:1,trailAlphaScale:Math.max(floor,Math.min(1,1-suppression))*(reducedMotion?.94:1),recovery:clamp01(release*(1-occlusion)),presentationOnly:true as const};
}

export interface SafeLaneDepthRecoveryInput{laneProximity:number;confidence:number;release:number;critical:boolean;}
export function safeLaneDepthRecoveryPresentation(input:SafeLaneDepthRecoveryInput,reducedMotion=false,reducedFlash=false){
  const proximity=clamp01(input.laneProximity),confidence=clamp01(input.confidence),release=clamp01(input.release);
  const protection=proximity*(.74+.26*confidence)*(1-release*.42),floor=input.critical?.78:.48;
  return{bodyAlphaScale:1,trailAlphaScale:Math.max(floor,1-protection*.48)*(reducedMotion?.94:1),safeLaneAlphaScale:1+protection*.12*(reducedFlash?.72:1),release,presentationOnly:true as const};
}

export interface ImpactDepthHandoffInput{life:number;heroProximity:number;neighborCount:number;critical:boolean;}
export function impactDepthHandoffPresentation(input:ImpactDepthHandoffInput,reducedFlash=false){
  const life=clamp01(input.life),proximity=clamp01(input.heroProximity),density=clamp01((Math.max(1,input.neighborCount)-1)/7),age=1-life;
  const pressure=clamp01(proximity*.42+density*.34+age*.36),criticalRelief=input.critical?.55:1;
  const fillAlphaScale=Math.max(input.critical?.58:.2,1-pressure*.58*criticalRelief)*(reducedFlash?.84:1),edgeAlphaScale=Math.max(fillAlphaScale,(.68+.2*life)*(reducedFlash?.96:1));
  return{pressure,fillAlphaScale,edgeAlphaScale,presentationOnly:true as const};
}

export interface BossTelegraphDepthReleaseInput{telegraphLife:number;impactLife:number;overlap:number;}
export function bossTelegraphDepthReleasePresentation(input:BossTelegraphDepthReleaseInput,reducedFlash=false){
  const telegraphLife=clamp01(input.telegraphLife),impactLife=clamp01(input.impactLife),overlap=clamp01(input.overlap),flash=reducedFlash?.86:1;
  const impactFillAlphaScale=Math.max(.3,(.52+.18*impactLife)*(1-overlap*.18))*flash;
  const impactEdgeAlphaScale=Math.max(impactFillAlphaScale,.68+.18*impactLife);
  const telegraphEdgeAlphaScale=Math.max(.9,(.92+.08*telegraphLife)*(reducedFlash?.98:1));
  return{telegraphEdgeAlphaScale,impactFillAlphaScale,impactEdgeAlphaScale,presentationOnly:true as const};
}

export interface SpecialistDepthRecoveryInput{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';recovery:number;hazardPressure:number;}
export function specialistDepthRecoveryPresentation(input:SpecialistDepthRecoveryInput,reducedMotion=false){
  const recovery=clamp01(input.recovery),hazard=clamp01(input.hazardPressure),action=input.owner==='special'?1:input.owner==='attack'?.9:input.owner==='hit'?.7:input.owner==='recovery'?.5:.12;
  const directionAlphaScale=Math.max(.58,.72+action*.24+recovery*.08-hazard*.05),trailAlphaScale=Math.max(.4,1-hazard*(.4-.18*recovery)-action*.1*(1-recovery))*(reducedMotion?.86:1);
  return{bodyAlphaScale:1,directionAlphaScale,trailAlphaScale,presentationOnly:true as const};
}

export interface DepthRecoveryBudgetInput{recoveringCount:number;pressure:number;criticalCount:number;}
export function depthRecoveryBudgetPresentation(input:DepthRecoveryBudgetInput,reducedMotion=false,reducedFlash=false){
  const count=clamp01(Math.max(0,input.recoveringCount-1)/9),pressure=clamp01(input.pressure),critical=clamp01(Math.max(0,input.criticalCount)/3),stress=clamp01(count*.58+pressure*.42+critical*.08),motion=reducedMotion?.9:1,flash=reducedFlash?.9:1;
  return{stress,criticalAlphaScale:1,canonicalBodyAlphaScale:1,secondaryRecoveryScale:(1-stress*.4)*motion*flash,presentationOnly:true as const};
}
