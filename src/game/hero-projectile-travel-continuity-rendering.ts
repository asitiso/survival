import type { Vec2 } from '../core/math.js';
export interface HeroProjectileTravelContinuityInput{origin:Vec2;projectile:Vec2;velocity:Vec2;ttl:number;maxTtl:number;radius:number}
export interface HeroProjectileTravelContinuityPresentation{visible:boolean;start:Vec2;end:Vec2;length:number;alpha:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function heroProjectileTravelContinuityPresentation(input:HeroProjectileTravelContinuityInput,reducedMotion=false):HeroProjectileTravelContinuityPresentation{
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.13),life=clamp((Number.isFinite(input.ttl)?input.ttl:0)/max,0,1),dx=input.projectile.x-input.origin.x,dy=input.projectile.y-input.origin.y,d=Math.hypot(dx,dy),cap=reducedMotion?48:76,len=Math.min(d,cap),s=d>.0001?len/d:0,end={x:input.origin.x+dx*s,y:input.origin.y+dy*s};
 return{visible:life>0&&d>2,start:{...input.origin},end,length:len,alpha:(.12+.34*life)*(reducedMotion?.72:1)};
}
