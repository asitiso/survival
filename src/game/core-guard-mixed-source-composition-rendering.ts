import type { CoreHitWorldGuardOwner } from './core-hit-world-guard-arbitration-rendering.js';
export interface CoreGuardMixedSourceCompositionInput{sourceClass:'projectile'|'contact'|'other';mixedPressure:boolean;owner:CoreHitWorldGuardOwner;ttl:number;maxTtl:number;}
const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function coreGuardMixedSourceCompositionPresentation(input:CoreGuardMixedSourceCompositionInput,reducedFlash=false){
  const life=clamp01(Math.max(0,input.ttl)/Math.max(.001,input.maxTtl)),guardOwned=input.owner==='world-guard'||input.owner==='shared',mixed=guardOwned&&input.mixedPressure&&life>0,accent=(reducedFlash?.58:1)*life;
  const projectileAccentAlpha=guardOwned&&(mixed||input.sourceClass==='projectile')?(mixed?.34:.48)*accent:0,contactAccentAlpha=guardOwned&&(mixed||input.sourceClass==='contact')?(mixed?.30:.42)*accent:0;
  const bodyScaleX=mixed?1.02:input.sourceClass==='projectile'?1.16:input.sourceClass==='contact'?.94:1,bodyScaleY=mixed?.98:input.sourceClass==='projectile'?.84:input.sourceClass==='contact'?1.06:1;
  return{mixed,bodyScaleX,bodyScaleY,projectileAccentAlpha,contactAccentAlpha,damageOwner:input.owner,duplicatesDamageCue:false as const,presentationOnly:true as const};
}
