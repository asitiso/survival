import type { Vec2 } from '../core/math.js';
import { projectileImpactEntryOffset } from './projectile-impact-arrival-handoff-rendering.js';
export type ProjectileImpactCarryOwner='arrival'|'canonical';
export type ProjectileNextTrailOwner='canonical'|'retired';
export interface ProjectileMultiHitImpactInput{launchOffset?:Vec2|undefined;launchTtl?:number|undefined;launchMaxTtl?:number|undefined;priorImpactCount:number;continues:boolean;}
export function projectileMultiHitImpactHandoff(input:ProjectileMultiHitImpactInput,reducedMotion=false){
  const firstImpact=Math.max(0,Math.floor(input.priorImpactCount))===0;
  const entryOffset=firstImpact?projectileImpactEntryOffset(input.launchOffset,input.launchTtl,input.launchMaxTtl,reducedMotion):{x:0,y:0};
  const hasCarry=Math.hypot(entryOffset.x,entryOffset.y)>.0001;
  return{entryOffset,impactOwner:(hasCarry?'arrival':'canonical') as ProjectileImpactCarryOwner,retireLaunchOwner:firstImpact,nextTrailOwner:(input.continues?'canonical':'retired') as ProjectileNextTrailOwner,presentationOnly:true as const};
}
