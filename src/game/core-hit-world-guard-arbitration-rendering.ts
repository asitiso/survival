function clamp01(value:number):number{return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));}
export type CoreHitWorldGuardOwner='hit'|'shared'|'world-guard'|'retired';
export interface CoreHitWorldGuardArbitrationInput{worldGuardStrength:number;mitigationRatio:number;worldDamageOwned:boolean;hitTtl:number;hitMaxTtl:number;}
export function coreHitWorldGuardArbitrationPresentation(input:CoreHitWorldGuardArbitrationInput,reducedFlash=false){
  const ttl=Math.max(0,Number.isFinite(input.hitTtl)?input.hitTtl:0),maxTtl=Math.max(.001,Number.isFinite(input.hitMaxTtl)?input.hitMaxTtl:.001),life=clamp01(ttl/maxTtl),worldGuardStrength=clamp01(input.worldGuardStrength),mitigationRatio=clamp01(input.mitigationRatio);
  if(life<=0)return{owner:'retired' as CoreHitWorldGuardOwner,worldDamageOwned:Boolean(input.worldDamageOwned),coreHitAlphaScale:0,coreHitSizeScale:.82,presentationOnly:true as const};
  if(input.worldDamageOwned)return{owner:(worldGuardStrength>=.14?'world-guard':'retired') as CoreHitWorldGuardOwner,worldDamageOwned:true,coreHitAlphaScale:0,coreHitSizeScale:.82,presentationOnly:true as const};
  if(worldGuardStrength>=.14&&mitigationRatio>=.62)return{owner:'world-guard' as CoreHitWorldGuardOwner,worldDamageOwned:true,coreHitAlphaScale:0,coreHitSizeScale:.82,presentationOnly:true as const};
  if(worldGuardStrength>=.14&&mitigationRatio>=.36){const alpha=(.32+.16*(1-mitigationRatio))*(reducedFlash?.72:1);return{owner:'shared' as CoreHitWorldGuardOwner,worldDamageOwned:false,coreHitAlphaScale:clamp01(alpha),coreHitSizeScale:.88,presentationOnly:true as const};}
  return{owner:'hit' as CoreHitWorldGuardOwner,worldDamageOwned:false,coreHitAlphaScale:reducedFlash?.76:1,coreHitSizeScale:1,presentationOnly:true as const};
}
