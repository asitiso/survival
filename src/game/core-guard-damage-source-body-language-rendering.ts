import type { CoreHitWorldGuardOwner } from './core-hit-world-guard-arbitration-rendering.js';
function clamp01(value:number):number{return Math.max(0,Math.min(1,Number.isFinite(value)?value:0));}
export type CoreGuardDamageSourceClass='projectile'|'contact'|'other';
export interface CoreGuardDamageSourceBodyLanguageInput{source:string;owner:CoreHitWorldGuardOwner;mitigationRatio:number;ttl:number;maxTtl:number;}
export function coreGuardDamageSourceBodyLanguagePresentation(input:CoreGuardDamageSourceBodyLanguageInput,reducedFlash=false){
  const sourceClass:CoreGuardDamageSourceClass=input.source==='projectile'?'projectile':input.source==='contact'?'contact':'other';
  const life=clamp01(Math.max(0,input.ttl)/Math.max(.001,input.maxTtl));
  const mitigation=clamp01(input.mitigationRatio),guardOwned=input.owner==='world-guard'||input.owner==='shared',visible=guardOwned&&life>0&&mitigation>=.18;
  const bodyScaleX=sourceClass==='projectile'?1.16:sourceClass==='contact'?.94:1,bodyScaleY=sourceClass==='projectile'?.84:sourceClass==='contact'?1.06:1;
  const accentScale=(reducedFlash?.58:1)*life*Math.max(.35,mitigation);
  return{sourceClass,visible,bodyScaleX,bodyScaleY,deflectAlpha:visible&&sourceClass==='projectile'?.5*accentScale:0,contactRingAlpha:visible&&sourceClass==='contact'?.42*accentScale:0,damageOwner:input.owner,duplicatesDamageCue:false as const,presentationOnly:true as const};
}
