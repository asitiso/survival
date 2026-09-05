import type { DamageImpactTier } from './combat-feedback.js';
export type SpecialistAttackHitType='shieldbearer'|'assassin'|'siegeGolem'|'nullifier';
export type SpecialistAttackHitOwner='neutral'|'attack'|'hit'|'fatal';
export interface SpecialistAttackHitArbitrationInput{pullback:number;lunge:number;resolve:number;hitStagger:number;tier:DamageImpactTier;fatal:boolean;}
export interface SpecialistAttackHitArbitrationPresentation{owner:SpecialistAttackHitOwner;attackCommitment:number;attackScale:number;attackResolveScale:number;hitStaggerScale:number;fatalTransitionScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const COMMITMENT:Readonly<Record<SpecialistAttackHitType,number>>={shieldbearer:1.05,assassin:.82,siegeGolem:1.12,nullifier:.95};
const TIER_VISIBILITY:Readonly<Record<DamageImpactTier,number>>={normal:.18,heavy:.28,critical:.38};
export function specialistAttackHitArbitrationPresentation(type:SpecialistAttackHitType,input:SpecialistAttackHitArbitrationInput,_reducedMotion=false):SpecialistAttackHitArbitrationPresentation{
  if(input.fatal)return{owner:'fatal',attackCommitment:1,attackScale:0,attackResolveScale:0,hitStaggerScale:0,fatalTransitionScale:1};
  const pullback=clamp(input.pullback,0,1),lunge=clamp(input.lunge,0,1),resolve=clamp(input.resolve,0,1),hit=clamp(input.hitStagger,0,1);
  const attackCommitment=clamp(Math.max(pullback*.92+lunge*.4,lunge,resolve*.45)*COMMITMENT[type],0,1);
  const committed=attackCommitment>=.24;
  const hitStaggerScale=committed?clamp(1-attackCommitment*(1-TIER_VISIBILITY[input.tier]),.12,1):1;
  const owner:SpecialistAttackHitOwner=committed?'attack':hit>.08?'hit':'neutral';
  const attackScale=owner==='hit'?clamp(1-hit*.16,.78,1):1;
  const attackResolveScale=owner==='hit'?clamp(1-hit*.34,.58,1):1;
  return{owner,attackCommitment,attackScale,attackResolveScale,hitStaggerScale,fatalTransitionScale:0};
}
