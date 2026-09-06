import type { Vec2 } from '../core/math.js';
export interface BossAnchorTravelReleaseInput{anchor:Vec2;projectile:Vec2;ttl:number;maxTtl:number}
export interface BossAnchorTravelReleasePresentation{visible:boolean;start:Vec2;end:Vec2;length:number;alpha:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function bossAnchorTravelReleasePresentation(input:BossAnchorTravelReleaseInput,reducedMotion=false):BossAnchorTravelReleasePresentation{
 const life=clamp(input.ttl/Math.max(.0001,input.maxTtl),0,1),dx=input.projectile.x-input.anchor.x,dy=input.projectile.y-input.anchor.y,d=Math.hypot(dx,dy),cap=reducedMotion?58:92,overflow=Math.max(0,d-cap),s=d>.0001?overflow/d:0,start={x:input.anchor.x+dx*s,y:input.anchor.y+dy*s};
 return{visible:life>0&&d>3,start,end:{...input.projectile},length:Math.min(d,cap),alpha:(.08+.28*life)*(reducedMotion?.68:1)};
}
