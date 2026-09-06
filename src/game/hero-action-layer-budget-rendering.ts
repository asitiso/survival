export type HeroActionLayerBudgetOwner='movement'|'cast'|'ultimate'|'recovery'|'hit';
export interface HeroActionLayerBudgetInput{owner:HeroActionLayerBudgetOwner;movement:number;cast:number;recovery:number;ultimate:number;hit:number;meter:number;}
export interface HeroActionLayerBudgetPresentation{idleScale:number;movementScale:number;castScale:number;recoveryScale:number;crestScale:number;singleActionOwner:true;presentationOnly:true;}
const c=(v:number)=>Math.max(0,Math.min(1,v));
export function heroActionLayerBudgetPresentation(input:HeroActionLayerBudgetInput,reducedMotion=false):HeroActionLayerBudgetPresentation{
 const movement=c(input.movement),cast=c(input.cast),recovery=c(input.recovery),ultimate=c(input.ultimate),hit=c(input.hit),meter=c(input.meter);let idleScale=.72,movementScale=.72+.28*movement,castScale=.2,recoveryScale=.2,crestScale=.55+.35*meter;
 if(input.owner==='cast'){idleScale=.42;movementScale=.34+.12*(1-cast);castScale=.9+.1*cast;recoveryScale=.16;crestScale=.58+.22*meter;}
 else if(input.owner==='ultimate'){idleScale=.3;movementScale=.24;castScale=.42+.12*(1-ultimate);recoveryScale=.16;crestScale=.62+.28*meter;}
 else if(input.owner==='recovery'){idleScale=.52;movementScale=.46+.12*(1-recovery);castScale=.22;recoveryScale=.76+.2*recovery;crestScale=.52+.22*meter;}
 else if(input.owner==='hit'){const y=1-hit*.66;idleScale=.34*y;movementScale=.36*y;castScale=.42*y;recoveryScale=.36*y;crestScale=.38*y;}
 if(reducedMotion){idleScale*=.8;movementScale=Math.min(movementScale,.62);crestScale=Math.min(crestScale,.62);}
 return{idleScale:c(idleScale),movementScale:c(movementScale),castScale:c(castScale),recoveryScale:c(recoveryScale),crestScale:c(crestScale),singleActionOwner:true,presentationOnly:true};
}
