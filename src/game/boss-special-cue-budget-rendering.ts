import type { BossPhase } from './boss-patterns.js';
export interface BossSpecialCueBudgetInput{phase:BossPhase;charge:number;recovery:number;stagger:number;phaseOverlay:boolean;}
export interface BossSpecialCueBudgetPresentation{baseOutlineScale:number;primaryRingScale:number;secondaryRingScale:number;phaseOverlayScale:number;alphaScale:number;presentationOnly:true;}
const c=(v:number)=>Math.max(0,Math.min(1,v));
export function bossSpecialCueBudgetPresentation(input:BossSpecialCueBudgetInput,reducedMotion=false,reducedFlash=false):BossSpecialCueBudgetPresentation{
 const charge=c(input.charge),recovery=c(input.recovery),stagger=c(input.stagger);let baseOutlineScale=.92,primaryRingScale=0,secondaryRingScale=0,phaseOverlayScale=input.phaseOverlay?(input.phase===3?.88:.78):0;
 if(stagger>.5){baseOutlineScale=.72;primaryRingScale=.34*(1-stagger*.25);secondaryRingScale=.1*(1-stagger);phaseOverlayScale*=.58;}
 else if(recovery>.18&&charge<.22){baseOutlineScale=.62+.36*recovery;primaryRingScale=.32*(1-recovery);secondaryRingScale=.08*(1-recovery);phaseOverlayScale*=.72;}
 else if(charge>.04){primaryRingScale=.8+.2*charge;secondaryRingScale=charge>.55?.62+.22*charge:0;baseOutlineScale=.72-.34*charge;phaseOverlayScale*=input.phase===3?(.72-.16*charge):(.68-.18*charge);}
 if(reducedMotion){secondaryRingScale=Math.min(secondaryRingScale,.45);phaseOverlayScale=Math.min(phaseOverlayScale,.68);}
 return{baseOutlineScale:c(baseOutlineScale),primaryRingScale:c(primaryRingScale),secondaryRingScale:c(secondaryRingScale),phaseOverlayScale:c(phaseOverlayScale),alphaScale:reducedFlash?.66:1,presentationOnly:true};
}
