import type { DamageImpactTier } from './combat-feedback.js';
export type SpecialistRecoveryHitHandoffOwner='neutral'|'attack'|'recovery'|'hit';
export interface SpecialistRecoveryHitHandoffInput{pullback:number;lunge:number;resolve:number;hitStagger:number;tier:DamageImpactTier;}
export interface SpecialistRecoveryHitHandoffPresentation{owner:SpecialistRecoveryHitHandoffOwner;attackResolveScale:number;hitStaggerScale:number;silhouetteAlphaScale:number;silhouetteReentryScale:number;yieldStrength:number;presentationOnly:true;}
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const HIT_THRESHOLD:Readonly<Record<DamageImpactTier,number>>={normal:.76,heavy:.56,critical:.42};
export function specialistRecoveryHitHandoffPresentation(input:SpecialistRecoveryHitHandoffInput,reducedMotion=false):SpecialistRecoveryHitHandoffPresentation{
  const pullback=clamp(input.pullback),lunge=clamp(input.lunge),resolve=clamp(input.resolve),hit=clamp(input.hitStagger),active=Math.max(pullback,lunge);
  if(active>.16){const protection=clamp(active*.72);return{owner:'attack',attackResolveScale:1,hitStaggerScale:clamp(1-protection*.7,.24,1),silhouetteAlphaScale:1,silhouetteReentryScale:1,yieldStrength:0,presentationOnly:true};}
  const threshold=HIT_THRESHOLD[input.tier],hitPressure=clamp((hit-threshold)/Math.max(.001,1-threshold)),recoveryWindow=clamp((resolve-.2)/.58),yieldStrength=clamp(hitPressure*recoveryWindow*(input.tier==='critical'?1.12:1));
  if(yieldStrength>.08){const resolveYield=reducedMotion?.7:.78;return{owner:'hit',attackResolveScale:clamp(1-yieldStrength*resolveYield,.2,1),hitStaggerScale:clamp(.82+yieldStrength*.18,.82,1),silhouetteAlphaScale:clamp(1-yieldStrength*(reducedMotion?.34:.48),.42,1),silhouetteReentryScale:clamp(1-yieldStrength*(reducedMotion?.45:.65),.3,1),yieldStrength,presentationOnly:true};}
  return{owner:resolve>.08?'recovery':'neutral',attackResolveScale:1,hitStaggerScale:1,silhouetteAlphaScale:1,silhouetteReentryScale:1,yieldStrength,presentationOnly:true};
}
