function clamp01(v:number){return Math.max(0,Math.min(1,Number.isFinite(v)?v:0));}
export type CoreProjectileGuardImpactOwner='impact'|'core-guard'|'retired';
export interface CoreProjectileGuardImpactInput{preventedRatio:number;impactTtl:number;impactMaxTtl:number;}
export function coreProjectileGuardImpactHandoffPresentation(input:CoreProjectileGuardImpactInput,reducedFlash=false){
  const prevented=clamp01(input.preventedRatio),life=input.impactMaxTtl>0?clamp01(input.impactTtl/input.impactMaxTtl):0;
  if(life<=0)return{owner:'retired' as CoreProjectileGuardImpactOwner,threatAlphaScale:0,ordinaryImpactAlphaScale:0,coreGuardImpactAlpha:0,arcRadius:16,deflectDistance:0,presentationOnly:true as const};
  if(prevented<.16)return{owner:'impact' as CoreProjectileGuardImpactOwner,threatAlphaScale:0,ordinaryImpactAlphaScale:1,coreGuardImpactAlpha:0,arcRadius:16,deflectDistance:0,presentationOnly:true as const};
  const flashScale=reducedFlash?.56:1;
  return{
    owner:'core-guard' as CoreProjectileGuardImpactOwner,
    threatAlphaScale:0,
    ordinaryImpactAlphaScale:clamp01(1-prevented*.48),
    coreGuardImpactAlpha:clamp01((.44+prevented*.5)*life*flashScale),
    arcRadius:Math.min(34,18+prevented*18),
    deflectDistance:Math.min(20,6+prevented*17)*life,
    presentationOnly:true as const,
  };
}
