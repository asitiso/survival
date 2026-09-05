import type { Vec2 } from '../core/math.js';
export type HeroProjectileLaunchKind='normal'|'ultimate';
export interface HeroProjectileLaunchOriginInput{bodyOffsetX:number;bodyOffsetY:number;facingX:number;facingY:number;radius:number;kind:HeroProjectileLaunchKind}
export interface HeroProjectileLaunchOriginPresentation{owner:'body-pose';originOffsetX:number;originOffsetY:number;forwardDistance:number;convergeSeconds:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
function clampVector(x:number,y:number,max:number){const m=Math.hypot(x,y);if(m<=max||m<=.0001)return{x,y};const s=max/m;return{x:x*s,y:y*s};}
export function heroProjectileLaunchOriginPresentation(input:HeroProjectileLaunchOriginInput,reducedMotion=false):HeroProjectileLaunchOriginPresentation{
 const len=Math.hypot(input.facingX,input.facingY)||1,fx=input.facingX/len,fy=input.facingY/len;
 const bodyMax=reducedMotion?5.5:10.5,body=clampVector(Number.isFinite(input.bodyOffsetX)?input.bodyOffsetX:0,Number.isFinite(input.bodyOffsetY)?input.bodyOffsetY:0,bodyMax);
 const r=clamp(Number.isFinite(input.radius)?input.radius:20,10,44),kind=input.kind;
 const motion=reducedMotion?.72:1,forwardDistance=clamp(r*(kind==='ultimate'?.92:.72)*motion,kind==='ultimate'?14:11,kind==='ultimate'?27:22);
 const max=kind==='ultimate'?(reducedMotion?25:36):(reducedMotion?21:30);
 const offset=clampVector(body.x+fx*forwardDistance,body.y+fy*forwardDistance,max);
 return{owner:'body-pose',originOffsetX:offset.x,originOffsetY:offset.y,forwardDistance,convergeSeconds:(kind==='ultimate'?.14:.105)*(reducedMotion?.62:1)};
}
export function visualLaunchPosition(gameplayPos:Vec2,offset:Vec2,ttl:number,maxTtl:number):Vec2{const max=Math.max(.0001,Number.isFinite(maxTtl)?maxTtl:0),t=clamp((Number.isFinite(ttl)?ttl:0)/max,0,1),blend=t*t;return{x:gameplayPos.x+offset.x*blend,y:gameplayPos.y+offset.y*blend};}
