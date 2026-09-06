export interface HeroUltimateAimContinuityState{lockedX:number;lockedY:number;hold:number;}
export interface HeroUltimateAimContinuityPresentation{owner:'current'|'ultimate';facingX:number;facingY:number;retention:number;overlayAngle:number;presentationOnly:true;}
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const duration=(reducedMotion:boolean)=>reducedMotion?.4:.82;
const unit=(x:number,y:number,fx=1,fy=0)=>{const len=Math.hypot(x,y);if(len>.0001)return{x:x/len,y:y/len};const fallback=Math.hypot(fx,fy)||1;return{x:fx/fallback,y:fy/fallback};};
export function createHeroUltimateAimContinuityState():HeroUltimateAimContinuityState{return{lockedX:1,lockedY:0,hold:0};}
export function advanceHeroUltimateAimContinuityState(state:HeroUltimateAimContinuityState|undefined,triggerDirection:{x:number;y:number}|null,dt:number,reducedMotion=false):HeroUltimateAimContinuityState{
  const current=state??createHeroUltimateAimContinuityState();
  if(triggerDirection){const d=unit(triggerDirection.x,triggerDirection.y,current.lockedX,current.lockedY);return{lockedX:d.x,lockedY:d.y,hold:duration(reducedMotion)};}
  return{lockedX:current.lockedX,lockedY:current.lockedY,hold:Math.max(0,current.hold-Math.max(0,dt))};
}
export function heroUltimateAimContinuityPresentation(state:HeroUltimateAimContinuityState|undefined,currentFacingX:number,currentFacingY:number,active:boolean,elapsed:number,reducedMotion=false):HeroUltimateAimContinuityPresentation{
  const current=unit(currentFacingX,currentFacingY),held=state??createHeroUltimateAimContinuityState(),span=duration(reducedMotion);
  if(!active||held.hold<=0)return{owner:'current',facingX:current.x,facingY:current.y,retention:0,overlayAngle:Math.atan2(current.y,current.x),presentationOnly:true};
  const age=clamp(elapsed,0,1.2),ageWeight=age<=.2?1:clamp(1-(age-.2)/.55,.18,1),retention=clamp(Math.max(ageWeight*.72,held.hold/Math.max(.001,span)*1.2));
  const blended=unit(current.x*(1-retention)+held.lockedX*retention,current.y*(1-retention)+held.lockedY*retention,held.lockedX,held.lockedY);
  return{owner:retention>.08?'ultimate':'current',facingX:blended.x,facingY:blended.y,retention,overlayAngle:Math.atan2(blended.y,blended.x),presentationOnly:true};
}
