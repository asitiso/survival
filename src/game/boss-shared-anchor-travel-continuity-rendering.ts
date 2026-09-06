import type { Vec2 } from '../core/math.js';
export interface BossSharedAnchorTravelContinuityInput{anchor:Vec2;projectile:Vec2;velocity:Vec2;ttl:number;maxTtl:number;radius:number}
export interface BossSharedAnchorTravelContinuityPresentation{visible:boolean;start:Vec2;end:Vec2;length:number;alpha:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function bossSharedAnchorTravelContinuityPresentation(input:BossSharedAnchorTravelContinuityInput,reducedMotion=false):BossSharedAnchorTravelContinuityPresentation{
 const max=Math.max(.0001,Number.isFinite(input.maxTtl)?input.maxTtl:.15),life=clamp((Number.isFinite(input.ttl)?input.ttl:0)/max,0,1),dx=input.projectile.x-input.anchor.x,dy=input.projectile.y-input.anchor.y,d=Math.hypot(dx,dy),cap=reducedMotion?58:92,len=Math.min(d,cap),s=d>.0001?len/d:0,end={x:input.anchor.x+dx*s,y:input.anchor.y+dy*s};
 return{visible:life>0&&d>3,start:{...input.anchor},end,length:len,alpha:(.1+.32*life)*(reducedMotion?.7:1)};
}
