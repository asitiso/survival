export type HeroLaunchOriginHandoffKind='normal'|'ultimate';
export interface HeroLaunchOriginMemory{offsetX:number;offsetY:number;kind:HeroLaunchOriginHandoffKind;ttl:number}
export interface HeroLaunchOriginDesired{offsetX:number;offsetY:number;kind:HeroLaunchOriginHandoffKind}
export interface HeroLaunchOriginHandoffPresentation{owner:'desired'|'handoff';originOffsetX:number;originOffsetY:number;memoryTtl:number;presentationOnly:true}
const finite=(v:number)=>Number.isFinite(v)?v:0;
export function heroLaunchOriginHandoffPresentation(previous:HeroLaunchOriginMemory|null|undefined,desired:HeroLaunchOriginDesired,reducedMotion=false):HeroLaunchOriginHandoffPresentation{
 const dx=finite(desired.offsetX),dy=finite(desired.offsetY);if(!previous||previous.ttl<=0)return{owner:'desired',originOffsetX:dx,originOffsetY:dy,memoryTtl:reducedMotion?.09:.16,presentationOnly:true};
 const px=finite(previous.offsetX),py=finite(previous.offsetY),vx=dx-px,vy=dy-py,d=Math.hypot(vx,vy),max=(desired.kind==='ultimate'?(reducedMotion?10:16):(reducedMotion?7:12));
 if(d<=max||d<=.0001)return{owner:'desired',originOffsetX:dx,originOffsetY:dy,memoryTtl:reducedMotion?.09:.16,presentationOnly:true};
 const s=max/d;return{owner:'handoff',originOffsetX:px+vx*s,originOffsetY:py+vy*s,memoryTtl:reducedMotion?.09:.16,presentationOnly:true};
}
