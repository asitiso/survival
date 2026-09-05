import type { BossPhase } from './boss-patterns.js';
export type BossGroundCueOwner='neutral'|'locomotion'|'telegraph'|'recovery'|'stagger';
export interface BossGroundCueArbitrationInput{motion:number;settle:number;recovery:number;stagger:number;specialTimer:number;}
export interface BossGroundCueArbitrationPresentation{owner:BossGroundCueOwner;locomotionScale:number;shadowMotionScale:number;contactPulseScale:number;locomotionShadowBoostScale:number;recoveryShadowBoostScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function bossGroundCueArbitrationPresentation(phase:BossPhase,input:BossGroundCueArbitrationInput,reducedMotion=false):BossGroundCueArbitrationPresentation{
  const motion=clamp(input.motion,0,1),settle=clamp(input.settle,0,1),recovery=clamp(input.recovery,0,1),stagger=clamp(input.stagger,0,1);const telegraph=Number.isFinite(input.specialTimer)&&input.specialTimer>=0&&input.specialTimer<=1.2;
  let owner:BossGroundCueOwner='neutral';if(telegraph)owner='telegraph';else if(recovery>.12)owner='recovery';else if(stagger>.06)owner='stagger';else if(motion>.08||settle>.08)owner='locomotion';
  let locomotionScale=1,shadowMotionScale=1,contactPulseScale=1,locomotionShadowBoostScale=1,recoveryShadowBoostScale=0;
  if(owner==='telegraph'){locomotionScale=.22;shadowMotionScale=.25;contactPulseScale=.04;locomotionShadowBoostScale=.2;recoveryShadowBoostScale=.24;}
  else if(owner==='recovery'){const phaseWeight=phase===3?1.08:phase===2?1.04:1;locomotionScale=clamp(1-recovery*.72*phaseWeight,.24,.68);shadowMotionScale=clamp(1-recovery*.64,.28,.72);contactPulseScale=clamp(1-recovery*.92,.08,.38);locomotionShadowBoostScale=.34;recoveryShadowBoostScale=clamp(.76+recovery*.28,.76,1);}
  else if(owner==='stagger'){locomotionScale=.45;shadowMotionScale=.4;contactPulseScale=.44;locomotionShadowBoostScale=.5;recoveryShadowBoostScale=.18;}
  if(reducedMotion){locomotionScale*=.86;shadowMotionScale*=.84;contactPulseScale*=.8;}
  return{owner,locomotionScale:clamp(locomotionScale,0,1),shadowMotionScale:clamp(shadowMotionScale,0,1),contactPulseScale:clamp(contactPulseScale,0,1),locomotionShadowBoostScale:clamp(locomotionShadowBoostScale,0,1),recoveryShadowBoostScale:clamp(recoveryShadowBoostScale,0,1)};
}
