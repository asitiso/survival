import type { Vec2 } from '../core/math.js';
import type { PresentationQuality } from './presentation-budget.js';
export type ProjectileImpactSourceClass='archer'|'boss';
export interface ProjectileImpactSourceContinuitySegment{sourceClass:ProjectileImpactSourceClass;start:Vec2;end:Vec2;length:number;alpha:number;accent:string;animated:false;motionAmplitude:0;}
export function projectileImpactSourceContinuity(input:{impact:Vec2;incoming:Vec2;sourceClass:ProjectileImpactSourceClass;quality:PresentationQuality;reducedFlash:boolean;}):ProjectileImpactSourceContinuitySegment|null{
 const speed=Math.hypot(input.incoming.x,input.incoming.y);if(speed<1e-6)return null;const length=input.quality==='high'?72:input.quality==='medium'?58:46,nx=input.incoming.x/speed,ny=input.incoming.y/speed,alpha=(input.sourceClass==='boss'?.7:.58)*(input.reducedFlash?.68:1);return{sourceClass:input.sourceClass,start:{x:input.impact.x-nx*length,y:input.impact.y-ny*length},end:{...input.impact},length,alpha,accent:input.sourceClass==='boss'?'#ff7a8a':'#d9a7ff',animated:false,motionAmplitude:0};
}
