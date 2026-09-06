import type { Vec2 } from '../core/math.js';
export interface SpecialistStrikeOriginArrivalInput{body:Vec2;origin:Vec2;target:Vec2;ttl:number;maxTtl:number}
export interface SpecialistStrikeOriginArrivalPresentation{marker:Vec2;progress:number;presentationOnly:true}
const c=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function specialistStrikeOriginArrivalPresentation(input:SpecialistStrikeOriginArrivalInput,reducedMotion=false):SpecialistStrikeOriginArrivalPresentation{
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.18),life=c(input.ttl/max),progress=1-life;
 const travel=reducedMotion?progress*.58:progress,ox=Number.isFinite(input.origin.x)?input.origin.x:input.body.x,oy=Number.isFinite(input.origin.y)?input.origin.y:input.body.y,tx=Number.isFinite(input.target.x)?input.target.x:ox,ty=Number.isFinite(input.target.y)?input.target.y:oy;
 return{marker:{x:ox+(tx-ox)*travel,y:oy+(ty-oy)*travel},progress,presentationOnly:true};
}
