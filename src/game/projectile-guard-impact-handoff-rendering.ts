function clamp01(v:number){return Math.max(0,Math.min(1,Number.isFinite(v)?v:0));}
export type ProjectileGuardImpactOwner='impact'|'guard'|'retired';
export interface ProjectileGuardImpactInput{preventedRatio:number;impactTtl:number;impactMaxTtl:number;}
export function projectileGuardImpactHandoffPresentation(input:ProjectileGuardImpactInput,reducedFlash=false){
  const prevented=clamp01(input.preventedRatio),life=input.impactMaxTtl>0?clamp01(input.impactTtl/input.impactMaxTtl):0;
  if(life<=0)return{owner:'retired' as ProjectileGuardImpactOwner,threatAlphaScale:0,ordinaryImpactAlphaScale:0,guardImpactAlpha:0,deflectDistance:0,presentationOnly:true as const};
  const guarded=prevented>=.18;
  if(!guarded)return{owner:'impact' as ProjectileGuardImpactOwner,threatAlphaScale:0,ordinaryImpactAlphaScale:1,guardImpactAlpha:0,deflectDistance:0,presentationOnly:true as const};
  const flashScale=reducedFlash?.58:1;
  const guardImpactAlpha=clamp01((.42+prevented*.48)*life*flashScale);
  return{owner:'guard' as ProjectileGuardImpactOwner,threatAlphaScale:0,ordinaryImpactAlphaScale:clamp01(1-prevented*.52),guardImpactAlpha,deflectDistance:Math.min(22,7+prevented*18)*life,presentationOnly:true as const};
}
