import type { BossArchetype, BossPhase } from './boss-patterns.js';
export interface BossSpecialAnticipationEmphasisInput{archetype:BossArchetype;phase:BossPhase;charge:number;recovery:number;stagger:number;}
export interface BossSpecialAnticipationEmphasisPresentation{active:boolean;bodyStrength:number;bodyScaleX:number;bodyScaleY:number;ringAlphaScale:number;ringWidthScale:number;ringRadiusScale:number;secondaryRingAlphaScale:number;presentationOnly:true;}
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function bossSpecialAnticipationEmphasisPresentation(input:BossSpecialAnticipationEmphasisInput,reducedMotion=false,reducedFlash=false):BossSpecialAnticipationEmphasisPresentation{
  const charge=clamp(input.charge),recovery=clamp(input.recovery),stagger=clamp(input.stagger),phaseWeight=input.phase===3?1.18:input.phase===2?1.08:1;
  const active=charge>.025;const yieldScale=(1-stagger*.7)*(1-recovery*.32);const bodyStrength=clamp(charge*yieldScale);const motionScale=reducedMotion?.4:1;
  let sx=1,sy=1;
  if(input.archetype==='juggernaut'){sx=1+.075*bodyStrength;sy=1-.09*bodyStrength;}
  else if(input.archetype==='abyssWitch'){sx=1-.018*bodyStrength;sy=1+.085*bodyStrength;}
  else if(input.archetype==='summoner'){sx=1+.025*bodyStrength;sy=1+.065*bodyStrength;}
  else if(input.archetype==='twinMaw'){sx=1+.07*bodyStrength;sy=1-.035*bodyStrength;}
  else if(input.archetype==='timeEater'){sx=1-.055*bodyStrength;sy=1+.035*bodyStrength;}
  else{sx=1+.065*bodyStrength;sy=1+.025*bodyStrength;}
  sx=1+(sx-1)*motionScale;sy=1+(sy-1)*motionScale;
  const flashScale=reducedFlash?.68:1;const ringAlphaScale=clamp((.92+charge*.32)*phaseWeight*yieldScale*flashScale,0,1.35);const ringWidthScale=1+charge*(.22+.08*(input.phase-1))*yieldScale;const ringRadiusScale=1+charge*(.035+.012*(input.phase-1));const secondaryRingAlphaScale=charge>.55?clamp((.72+charge*.18)*yieldScale*flashScale):0;
  return{active,bodyStrength,bodyScaleX:sx,bodyScaleY:sy,ringAlphaScale,ringWidthScale,ringRadiusScale,secondaryRingAlphaScale,presentationOnly:true};
}
