const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export type ThreatCuePriorityOwner='critical'|'boss'|'hazard'|'projectile'|'canonical';
export interface ThreatCuePriorityInput{threatLevel:number;bossSpecial:boolean;heroCritical:boolean;coreCritical:boolean;safeLaneVisible:boolean;}
export function threatCuePriorityArbitrationPresentation(input:ThreatCuePriorityInput,reducedFlash=false){
  const threat=clamp01(input.threatLevel),critical=input.heroCritical||input.coreCritical;
  const owner:ThreatCuePriorityOwner=critical?'critical':input.bossSpecial?'boss':threat>=.66?'hazard':threat>.25?'projectile':'canonical';
  const baseSecondary=owner==='critical'?.54:owner==='boss'?.7:owner==='hazard'?.8:owner==='projectile'?.9:1;
  const secondaryAlphaScale=baseSecondary*(reducedFlash?.86:1);
  const primaryAlphaScale=owner==='critical'?1:.86+.14*threat;
  const safeLaneFloor=input.safeLaneVisible?(owner==='critical'?.94:owner==='boss'?.91:owner==='hazard'?.88:.86):0;
  return{owner,primaryAlphaScale,secondaryAlphaScale,safeLaneFloor,presentationOnly:true as const};
}

export type ThreatOverlapKind='projectile'|'impact'|'hazard'|'silhouette';
export interface ThreatOverlapSuppressionBudgetInput{activeCount:number;indexFromNewest:number;kind:ThreatOverlapKind;critical:boolean;}
export function threatOverlapSuppressionBudgetPresentation(input:ThreatOverlapSuppressionBudgetInput,reducedMotion=false){
  if(input.critical)return{visible:true,alphaScale:1,capacity:Infinity,presentationOnly:true as const};
  const count=Math.max(0,Math.floor(input.activeCount)),base=input.kind==='hazard'?4:input.kind==='projectile'?6:5,capacity=count<=base?count:Math.max(2,base-(reducedMotion?1:0));
  const visible=input.indexFromNewest<capacity;
  const alphaScale=visible?Math.max(.58,1-(Math.max(0,input.indexFromNewest)/Math.max(1,capacity))*.32):0;
  return{visible,alphaScale,capacity,presentationOnly:true as const};
}

export interface HazardImpactEdgeArbitrationInput{hazardActive:boolean;hazardLife:number;impactLife:number;overlap:number;}
export function hazardImpactEdgeArbitrationPresentation(input:HazardImpactEdgeArbitrationInput,reducedFlash=false){
  const hazardLife=clamp01(input.hazardLife),impactLife=clamp01(input.impactLife),overlap=clamp01(input.overlap);
  if(!input.hazardActive)return{owner:'impact' as const,hazardEdgeAlphaScale:0,impactAlphaScale:.9+.1*impactLife,presentationOnly:true as const};
  const edgeBase=.92+.08*hazardLife,edgeFlash=reducedFlash?.98:1;
  const hazardEdgeAlphaScale=Math.max(.9,edgeBase*edgeFlash);
  const impactAlphaScale=(.88-overlap*.46)*(.84+.16*impactLife)*(reducedFlash?.82:1);
  return{owner:'hazard' as const,hazardEdgeAlphaScale,impactAlphaScale:Math.max(.24,impactAlphaScale),presentationOnly:true as const};
}

export interface SafeLaneOcclusionGuardInput{confidence:number;hazardPressure:number;projectilePressure:number;criticalPressure:number;}
export function safeLaneOcclusionGuardPresentation(input:SafeLaneOcclusionGuardInput,reducedFlash=false){
  const confidence=clamp01(input.confidence),hazard=clamp01(input.hazardPressure),projectile=clamp01(input.projectilePressure),critical=clamp01(input.criticalPressure);
  const pressure=clamp01(hazard*.46+projectile*.32+critical*.42),flash=reducedFlash?.68:1;
  const safeLaneAlphaScale=Math.max(.9,1+pressure*(.12+.1*confidence)*flash);
  const hazardDecorationScale=1-pressure*.36;
  const projectileDecorationScale=1-pressure*.3;
  return{pressure,safeLaneAlphaScale,hazardDecorationScale,projectileDecorationScale,presentationOnly:true as const};
}

export interface SilhouetteThreatDeconflictionInput{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';threatPressure:number;attackStrength:number;}
export function silhouetteThreatDeconflictionPresentation(input:SilhouetteThreatDeconflictionInput,reducedMotion=false){
  const threat=clamp01(input.threatPressure),attack=clamp01(input.attackStrength);
  if(input.owner==='locomotion'&&threat<.18)return{overlayAlphaScale:1,trailScale:1,bodyAlphaScale:1,presentationOnly:true as const};
  const actionWeight=input.owner==='special'?1:input.owner==='attack'?.9:input.owner==='hit'?.78:input.owner==='recovery'?.58:.3;
  const suppression=clamp01(threat*.58+attack*.24+actionWeight*.18);
  const overlayAlphaScale=1-suppression*.34;
  const trailScale=(1-suppression*.42)*(reducedMotion?.78:1);
  return{overlayAlphaScale,trailScale,bodyAlphaScale:1,presentationOnly:true as const};
}

export interface BattlefieldThreatLayerBudgetInput{projectileCount:number;impactCount:number;hazardCount:number;silhouetteCount:number;criticalCount:number;}
export function battlefieldThreatLayerBudgetPresentation(input:BattlefieldThreatLayerBudgetInput,reducedMotion=false,reducedFlash=false){
  const projectile=clamp01(Math.max(0,input.projectileCount-2)/10),impact=clamp01(Math.max(0,input.impactCount-2)/8),hazard=clamp01(Math.max(0,input.hazardCount-1)/6),silhouette=clamp01(Math.max(0,input.silhouetteCount-2)/8),critical=clamp01(Math.max(0,input.criticalCount)/3);
  const pressure=clamp01(projectile*.24+impact*.24+hazard*.28+silhouette*.14+critical*.28);
  const motion=reducedMotion?.88:1,flash=reducedFlash?.84:1;
  return{
    pressure,
    criticalAlphaScale:1,
    safeLaneAlphaScale:1+pressure*.14*flash,
    projectileDecorationScale:(1-pressure*.34)*motion,
    impactDecorationScale:(1-pressure*.38)*flash,
    hazardDecorationScale:1-pressure*.3,
    silhouetteDecorationScale:(1-pressure*.28)*motion,
    presentationOnly:true as const,
  };
}
