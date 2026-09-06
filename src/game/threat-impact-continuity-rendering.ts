const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));

export type ThreatLaunchOwner='launch'|'travel'|'canonical';
export interface ThreatLaunchOwnershipInput{launchLife:number;travelLife:number;threat:number;}
export function threatLaunchOwnershipPresentation(input:ThreatLaunchOwnershipInput,reducedFlash=false){
  const launch=clamp01(input.launchLife),travel=clamp01(input.travelLife),threat=clamp01(input.threat);
  const owner:ThreatLaunchOwner=launch>.16?'launch':travel>.08?'travel':'canonical';
  const flash=reducedFlash?.72:1;
  return{
    owner,
    launchAlphaScale:(owner==='launch'?(.58+.42*launch):.2*launch)*(.78+.22*threat)*flash,
    travelAlphaScale:(owner==='travel'?(.62+.38*travel):(.34+.36*travel))*(.82+.18*threat)*flash,
    presentationOnly:true as const,
  };
}

export interface ProjectileTravelThreatCarryInput{speed:number;launchLife:number;travelLife:number;radius:number;}
export function projectileTravelThreatCarryPresentation(input:ProjectileTravelThreatCarryInput,reducedMotion=false,reducedFlash=false){
  const speed=Math.max(0,Number.isFinite(input.speed)?input.speed:0),travel=clamp01(input.travelLife),launch=clamp01(input.launchLife),radius=Math.max(0,Number.isFinite(input.radius)?input.radius:0);
  const speedWeight=clamp01((speed-80)/420),visible=travel>.04&&speed>40;
  const alpha=(.45+.28*speedWeight)*(.76+.24*travel)*(1-.18*launch)*(reducedFlash?.72:1);
  const lengthScale=(.72+.28*speedWeight)*(reducedMotion?.72:1);
  return{visible,alphaScale:visible?alpha:0,lengthScale,minLength:Math.max(8,radius*1.4),presentationOnly:true as const};
}

export interface ImpactArrivalFootprintContinuityInput{life:number;response:'hit'|'death'|'none';secondary:boolean;}
export function impactArrivalFootprintContinuityPresentation(input:ImpactArrivalFootprintContinuityInput,reducedFlash=false){
  const life=clamp01(input.life),death=input.response==='death',secondary=input.secondary;
  const flash=reducedFlash?.7:1;
  const fillAlphaScale=(.34+.66*life)*(secondary?.84:1)*flash;
  const edgeAlphaScale=(.76+.18*(1-life)+.06*(death?1:0))*(secondary?.9:1)*flash;
  const radiusScale=1+(1-life)*(death?.18:.12);
  return{fillAlphaScale,edgeAlphaScale,radiusScale,presentationOnly:true as const};
}

export interface ImpactReactionCarryInput{life:number;reaction:'hit'|'death'|'none';response:'canonical'|'guard'|'weakpoint';}
export function impactReactionCarryPresentation(input:ImpactReactionCarryInput,reducedMotion=false){
  const life=clamp01(input.life),death=input.reaction==='death',hit=input.reaction==='hit',priority=input.response==='weakpoint'?1:input.response==='guard'?.82:.68;
  const aftermathBase=death?.66:hit?.42:.24;
  const aftermathAlphaScale=(aftermathBase+.24*life)*(.86+.14*priority)*(reducedMotion?.9:1);
  const spriteAlphaScale=death?(.58+.28*life):hit?(.78+.2*life):1;
  return{aftermathAlphaScale,spriteAlphaScale,presentationOnly:true as const};
}

export interface HazardExpiryEdgeContinuityInput{ttl:number;maxTtl:number;telegraph:number;}
export function hazardExpiryEdgeContinuityPresentation(input:HazardExpiryEdgeContinuityInput,reducedFlash=false){
  if((Number.isFinite(input.telegraph)?input.telegraph:0)>0)return{owner:'telegraph' as const,fillAlphaScale:1,edgeAlphaScale:1,presentationOnly:true as const};
  const life=clamp01((Number.isFinite(input.ttl)?input.ttl:0)/Math.max(.001,Number.isFinite(input.maxTtl)?input.maxTtl:1));
  if(life>.22)return{owner:'active' as const,fillAlphaScale:1,edgeAlphaScale:1,presentationOnly:true as const};
  const expiry=clamp01(life/.22),flash=reducedFlash?.82:1;
  return{owner:'expiry' as const,fillAlphaScale:(.28+.72*expiry)*flash,edgeAlphaScale:(.9+.1*expiry)*flash,presentationOnly:true as const};
}

export interface DenseBattleSafeLaneContinuityInput{hazardCount:number;projectileCount:number;bossSpecial:boolean;}
export function denseBattleSafeLaneContinuityPresentation(input:DenseBattleSafeLaneContinuityInput,reducedMotion=false,reducedFlash=false){
  const hazardPressure=clamp01(Math.max(0,input.hazardCount-2)/5),projectilePressure=clamp01(Math.max(0,input.projectileCount-3)/12),special=input.bossSpecial?.34:0;
  const pressure=clamp01(hazardPressure*.52+projectilePressure*.34+special);
  const safeLaneAlphaScale=1+pressure*(reducedFlash?.12:.24);
  const hazardFillScale=1-pressure*(reducedMotion?.22:.38);
  return{pressure,safeLaneAlphaScale,hazardFillScale,hazardEdgeScale:1,presentationOnly:true as const};
}
