const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export interface ProjectileFocusHoldInput{critical:boolean;life:number;release:number;pressure:number;}
export function projectileFocusHoldPresentation(input:ProjectileFocusHoldInput,reducedFlash=false){
  const life=clamp01(input.life),release=clamp01(input.release),pressure=clamp01(input.pressure),hold=clamp01(Math.max(life,release*.82));
  const normalDirection=(1-pressure*.28*(1-hold*.45))*(reducedFlash?.88:1);
  return{hold,bodyAlphaScale:1,criticalAlphaScale:1,directionAlphaScale:input.critical?Math.max(.9,.92+.08*hold):Math.max(.5,normalDirection),presentationOnly:true as const};
}

export interface ImpactBurstSettleInput{life:number;neighborCount:number;critical:boolean;}
export function impactBurstSettlePresentation(input:ImpactBurstSettleInput,reducedFlash=false){
  const life=clamp01(input.life),density=clamp01((Math.max(1,input.neighborCount)-1)/7),flash=reducedFlash?.82:1;
  const base=(.5+.5*life)*(1-density*.35),decorationAlphaScale=input.critical?Math.max(.68,base*flash):Math.max(.24,base*flash);
  const edgeAlphaScale=Math.max(decorationAlphaScale,(.68+.18*life)*(reducedFlash?.96:1));
  return{density,decorationAlphaScale,edgeAlphaScale,presentationOnly:true as const};
}

export interface HazardCorridorStabilityInput{active:boolean;life:number;laneProximity:number;pressure:number;}
export function hazardCorridorStabilityPresentation(input:HazardCorridorStabilityInput,reducedFlash=false){
  if(!input.active)return{carve:0,fillAlphaScale:1,edgeAlphaScale:1,presentationOnly:true as const};
  const life=clamp01(input.life),proximity=clamp01(input.laneProximity),pressure=clamp01(input.pressure),carve=proximity*(.5+.5*pressure)*(1-life*.15);
  const fillAlphaScale=1-carve*.35,edgeAlphaScale=Math.max(.9,(.96+.04*(1-carve))*(reducedFlash?.98:1));
  return{carve,fillAlphaScale,edgeAlphaScale,presentationOnly:true as const};
}

export interface SafeLaneAttentionHoldInput{confidence:number;critical:boolean;pressure:number;release:number;}
export function safeLaneAttentionHoldPresentation(input:SafeLaneAttentionHoldInput,reducedFlash=false){
  const confidence=clamp01(input.confidence),pressure=clamp01(input.pressure),release=clamp01(input.release),hold=Math.max(release,input.critical?1:0),focus=clamp01(pressure*.6+hold*.5),flash=reducedFlash?.72:1;
  return{hold,pathAlphaFloor:Math.max(.9,.9+confidence*.06),safeLaneAlphaScale:1+focus*.16*flash,presentationOnly:true as const};
}

export interface SilhouetteContrastRecoveryInput{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';recovery:number;pressure:number;}
export function silhouetteContrastRecoveryPresentation(input:SilhouetteContrastRecoveryInput,reducedMotion=false){
  const recovery=clamp01(input.recovery),pressure=clamp01(input.pressure),ownerWeight=input.owner==='special'?1:input.owner==='attack'?.88:input.owner==='hit'?.76:input.owner==='recovery'?.56:.12;
  const suppression=clamp01((pressure*.62+ownerWeight*.22)*(1-recovery*.72));
  return{bodyAlphaScale:1,overlayAlphaScale:1-suppression*.34,trailAlphaScale:(1-suppression*.46)*(reducedMotion?.82:1),presentationOnly:true as const};
}

export interface TemporalThreatBudgetInput{churn:number;pressure:number;criticalCount:number;}
export function temporalThreatBudgetPresentation(input:TemporalThreatBudgetInput,reducedMotion=false,reducedFlash=false){
  const churn=clamp01(input.churn),pressure=clamp01(input.pressure),critical=clamp01(Math.max(0,input.criticalCount)/3),stress=clamp01(churn*.55+pressure*.45+critical*.12),motion=reducedMotion?.9:1,flash=reducedFlash?.88:1;
  return{stress,criticalAlphaScale:1,safeLaneAlphaScale:1+stress*.11*flash,secondaryAlphaScale:(1-stress*.38)*motion*flash,presentationOnly:true as const};
}
