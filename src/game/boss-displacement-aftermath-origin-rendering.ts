export type BossDisplacementAftermathOwner='body'|'rebase';
export interface BossDisplacementAftermathOriginInput{rebase:number;groundOffsetX:number;groundOffsetY:number;specialStrength:number;settle:number;}
export interface BossDisplacementAftermathOriginPresentation{owner:BossDisplacementAftermathOwner;originOffsetX:number;originOffsetY:number;aftermathAlphaScale:number;contactPulseScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function bossDisplacementAftermathOriginPresentation(input:BossDisplacementAftermathOriginInput,reducedMotion=false):BossDisplacementAftermathOriginPresentation{
  const rebase=clamp(input.rebase,0,1),special=clamp(input.specialStrength,0,1),settle=clamp(input.settle,0,1),owner:BossDisplacementAftermathOwner=rebase>.04?'rebase':'body';
  if(owner==='body')return{owner,originOffsetX:0,originOffsetY:0,aftermathAlphaScale:1,contactPulseScale:1};
  const motionScale=reducedMotion?.52:.78,capX=reducedMotion?11:18,capY=reducedMotion?7:11;
  const originOffsetX=clamp((Number.isFinite(input.groundOffsetX)?input.groundOffsetX:0)*rebase*motionScale,-capX,capX);
  const originOffsetY=clamp((Number.isFinite(input.groundOffsetY)?input.groundOffsetY:0)*rebase*motionScale,-capY,capY);
  let aftermathAlphaScale=clamp(1-rebase*.28-special*.34+(1-settle)*.08,.3,1);
  let contactPulseScale=clamp(1-rebase*.42-special*.5,.08,1);
  if(reducedMotion){aftermathAlphaScale=Math.min(aftermathAlphaScale,.72);contactPulseScale=Math.min(contactPulseScale,.58);}
  return{owner,originOffsetX,originOffsetY,aftermathAlphaScale,contactPulseScale};
}
