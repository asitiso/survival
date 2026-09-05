function clamp01(value:number):number{return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));}
export type CoreGuardSurvivalResponseOwner='survival'|'world'|'retired';
export interface CoreGuardSurvivalResponseArbitrationInput{worldGuardStrength:number;worldGuardOwned:boolean;survivalTtl:number;survivalMaxTtl:number;}
export function coreGuardSurvivalResponseArbitrationPresentation(input:CoreGuardSurvivalResponseArbitrationInput,reducedFlash=false){
  const ttl=Math.max(0,Number.isFinite(input.survivalTtl)?input.survivalTtl:0),maxTtl=Math.max(.001,Number.isFinite(input.survivalMaxTtl)?input.survivalMaxTtl:.001),life=clamp01(ttl/maxTtl),worldGuardStrength=clamp01(input.worldGuardStrength);
  if(life<=0)return{owner:'retired' as CoreGuardSurvivalResponseOwner,worldGuardOwned:Boolean(input.worldGuardOwned),survivalAlphaScale:0,presentationOnly:true as const};
  const worldOwns=Boolean(input.worldGuardOwned)||worldGuardStrength>=.14;
  if(worldOwns)return{owner:(worldGuardStrength>=.14?'world':'retired') as CoreGuardSurvivalResponseOwner,worldGuardOwned:true,survivalAlphaScale:0,presentationOnly:true as const};
  return{owner:'survival' as CoreGuardSurvivalResponseOwner,worldGuardOwned:false,survivalAlphaScale:reducedFlash?.76:1,presentationOnly:true as const};
}
