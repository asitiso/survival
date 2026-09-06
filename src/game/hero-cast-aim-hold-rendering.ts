export interface HeroCastAimHoldState{lockedX:number;lockedY:number;hold:number;previousX:number;previousY:number;retarget:number;}
export interface HeroCastAimHoldPresentation{owner:'current'|'cast';facingX:number;facingY:number;retention:number;retargetBlend:number;overlayAngle:number;presentationOnly:true;}
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const duration=(reducedMotion:boolean)=>reducedMotion?.28:.5;
const normalize=(x:number,y:number,fallbackX=1,fallbackY=0)=>{const len=Math.hypot(x,y);if(len>.0001)return{x:x/len,y:y/len};const fallbackLen=Math.hypot(fallbackX,fallbackY)||1;return{x:fallbackX/fallbackLen,y:fallbackY/fallbackLen};};
const retargetDuration=(fromX:number,fromY:number,toX:number,toY:number,reducedMotion:boolean)=>{if(reducedMotion)return 0;const dot=clamp(fromX*toX+fromY*toY,-1,1),angle=Math.acos(dot);return angle<.035?0:clamp(.14*(angle/Math.PI),.006,.14);};
export function createHeroCastAimHoldState():HeroCastAimHoldState{return{lockedX:1,lockedY:0,hold:0,previousX:1,previousY:0,retarget:0};}
export function advanceHeroCastAimHoldState(state:HeroCastAimHoldState|undefined,castDirection:{x:number;y:number}|null,dt:number,reducedMotion=false):HeroCastAimHoldState{
  const current=state??createHeroCastAimHoldState();
  if(castDirection){const locked=normalize(castDirection.x,castDirection.y,current.lockedX,current.lockedY),hasPrevious=current.hold>0,previous=hasPrevious?normalize(current.lockedX,current.lockedY):locked,retarget=hasPrevious?retargetDuration(previous.x,previous.y,locked.x,locked.y,reducedMotion):0;return{lockedX:locked.x,lockedY:locked.y,hold:duration(reducedMotion),previousX:previous.x,previousY:previous.y,retarget};}
  return{lockedX:current.lockedX,lockedY:current.lockedY,hold:Math.max(0,current.hold-Math.max(0,dt)),previousX:current.previousX,previousY:current.previousY,retarget:Math.max(0,current.retarget-Math.max(0,dt))};
}
export function heroCastAimHoldPresentation(state:HeroCastAimHoldState|undefined,currentFacingX:number,currentFacingY:number,cast:number,recover:number,reducedMotion=false):HeroCastAimHoldPresentation{
  const current=normalize(currentFacingX,currentFacingY),held=state??createHeroCastAimHoldState(),span=duration(reducedMotion),castBlend=clamp(cast),recoverBlend=clamp(recover);
  const retention=held.hold<=0?0:castBlend>.04?1:recoverBlend>.04?clamp(held.hold/Math.max(.001,span)*1.4):0;
  const maxRetarget=retargetDuration(held.previousX,held.previousY,held.lockedX,held.lockedY,false),retargetBlend=reducedMotion||held.retarget<=0||maxRetarget<=0?1:clamp(1-held.retarget/maxRetarget),aim=normalize(held.previousX*(1-retargetBlend)+held.lockedX*retargetBlend,held.previousY*(1-retargetBlend)+held.lockedY*retargetBlend,held.lockedX,held.lockedY);
  if(retention<=.08)return{owner:'current',facingX:current.x,facingY:current.y,retention:0,retargetBlend,overlayAngle:Math.atan2(current.y,current.x),presentationOnly:true};
  const blended=normalize(current.x*(1-retention)+aim.x*retention,current.y*(1-retention)+aim.y*retention,aim.x,aim.y);
  return{owner:'cast',facingX:blended.x,facingY:blended.y,retention,retargetBlend,overlayAngle:Math.atan2(blended.y,blended.x),presentationOnly:true};
}
