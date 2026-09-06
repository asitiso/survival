export type SpecialistSilhouettePhaseOwner='locomotion'|'windup'|'strike'|'resolve'|'hit';
export interface SpecialistSilhouettePhaseHandoffInput{pullback:number;lunge:number;resolve:number;hit:number;}
export interface SpecialistSilhouettePhaseHandoffPresentation{owner:SpecialistSilhouettePhaseOwner;strikeScale:number;resolveScale:number;strikeCarry:number;attackAlphaScale:number;trailScale:number;presentationOnly:true;}
const c=(v:number)=>Math.max(0,Math.min(1,v));
export function specialistSilhouettePhaseHandoffPresentation(input:SpecialistSilhouettePhaseHandoffInput,reducedMotion=false):SpecialistSilhouettePhaseHandoffPresentation{
 const pullback=c(input.pullback),lunge=c(input.lunge),resolve=c(input.resolve),hit=c(input.hit);
 let owner:SpecialistSilhouettePhaseOwner='locomotion',strikeScale=0,resolveScale=0,strikeCarry=0,attackAlphaScale=1,trailScale=1;
 if(hit>.55){owner='hit';attackAlphaScale=.36*(1-hit*.4);trailScale=.42;}
 else if(lunge>.06){owner='strike';strikeScale=.72+.28*lunge;resolveScale=.18*resolve;attackAlphaScale=.94;trailScale=.88;}
 else if(pullback>.06){owner='windup';strikeScale=.18*pullback;attackAlphaScale=.84;trailScale=.72;}
 else if(resolve>.06){owner='resolve';resolveScale=.42+.5*resolve;strikeCarry=Math.max(0,.38*(1-resolve/.58));attackAlphaScale=.72-.24*resolve;trailScale=.64-.18*resolve;}
 if(reducedMotion){strikeCarry=0;trailScale=Math.min(trailScale,.58);}
 return{owner,strikeScale:c(strikeScale),resolveScale:c(resolveScale),strikeCarry:c(strikeCarry),attackAlphaScale:c(attackAlphaScale),trailScale:c(trailScale),presentationOnly:true};
}
