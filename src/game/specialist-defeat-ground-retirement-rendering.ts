import type { SpecialistEnemyType } from './enemy-specialists.js';
export type SpecialistDefeatGroundOwner='body'|'retire';
export interface SpecialistDefeatGroundBody{offsetX:number;offsetY:number;alpha:number;radius:number;}
export interface SpecialistDefeatGroundRetirementPresentation{owner:SpecialistDefeatGroundOwner;shadowOffsetX:number;shadowOffsetY:number;shadowAlpha:number;widthScale:number;heightScale:number;groundPulseScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const widthByType:Readonly<Record<SpecialistEnemyType,number>>={shieldbearer:1.08,assassin:.9,siegeGolem:1.2,nullifier:1};
const alphaByType:Readonly<Record<SpecialistEnemyType,number>>={shieldbearer:.34,assassin:.26,siegeGolem:.38,nullifier:.3};
const followByType:Readonly<Record<SpecialistEnemyType,number>>={shieldbearer:.15,assassin:.18,siegeGolem:.12,nullifier:.14};
export function specialistDefeatGroundRetirementPresentation(type:SpecialistEnemyType,progress:number,body:SpecialistDefeatGroundBody,reducedMotion=false):SpecialistDefeatGroundRetirementPresentation{
  const p=clamp(progress,0,1),owner:SpecialistDefeatGroundOwner=p>=.86?'retire':'body';
  const fade=p>=.88?0:clamp(1-p/.88,0,1),follow=followByType[type]*(reducedMotion?.55:1),maxOffset=reducedMotion?1.8:2.8;
  const shadowOffsetX=clamp((Number.isFinite(body.offsetX)?body.offsetX:0)*follow,-maxOffset,maxOffset);
  const shadowOffsetY=clamp((Number.isFinite(body.offsetY)?body.offsetY:0)*follow,-maxOffset*.62,maxOffset*.62);
  const shadowAlpha=owner==='retire'&&p>=.88?0:clamp(body.alpha,0,1)*alphaByType[type]*fade;
  const settle=clamp(1-p,0,1),widthScale=widthByType[type]*(.94+settle*.06),heightScale=(type==='siegeGolem'?.62:type==='shieldbearer'?.56:.5)*(1-p*.18);
  return{owner,shadowOffsetX,shadowOffsetY,shadowAlpha:clamp(shadowAlpha,0,.42),widthScale:clamp(widthScale,.78,1.24),heightScale:clamp(heightScale,.34,.7),groundPulseScale:0};
}
