export type HeroMotionBudgetOwner='neutral'|'movement'|'hit'|'cast'|'evade'|'ultimate';
export interface HeroMotionBudgetInput{movement:number;cast:number;ultimate:number;hit:number;evade:number;}
export interface HeroMotionBudgetPresentation{owner:HeroMotionBudgetOwner;budgetCap:number;totalLoad:number;movementScale:number;castScale:number;ultimateScale:number;hitScale:number;transitionScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function heroMotionBudgetPresentation(input:HeroMotionBudgetInput,reducedMotion=false):HeroMotionBudgetPresentation{
  const movement=clamp(input.movement,0,1),cast=clamp(input.cast,0,1),ultimate=clamp(input.ultimate,0,1),hit=clamp(input.hit,0,1),evade=clamp(input.evade,0,1);
  let owner:HeroMotionBudgetOwner='neutral';
  if(ultimate>=.42)owner='ultimate';
  else if(evade>=.5)owner='evade';
  else if(cast>=.34)owner='cast';
  else if(hit>=.3)owner='hit';
  else if(movement>=.08)owner='movement';
  let movementScale=1,castScale=1,ultimateScale=1,hitScale=1,transitionScale=1;
  if(owner==='ultimate'){movementScale=.32;castScale=.55;ultimateScale=.96;hitScale=.4;transitionScale=.5;}
  else if(owner==='evade'){movementScale=.5;castScale=.72;ultimateScale=.8;hitScale=.58;transitionScale=.96;}
  else if(owner==='cast'){movementScale=.55;castScale=.96;ultimateScale=.85;hitScale=.72;transitionScale=.82;}
  else if(owner==='hit'){movementScale=.58;castScale=.68;ultimateScale=.82;hitScale=.95;transitionScale=.76;}
  if(reducedMotion){const compress=(value:number,protectedOwner:boolean)=>clamp(value*(protectedOwner?.86:.7),.18,1);movementScale=compress(movementScale,owner==='movement');castScale=compress(castScale,owner==='cast');ultimateScale=compress(ultimateScale,owner==='ultimate');hitScale=compress(hitScale,owner==='hit');transitionScale=compress(transitionScale,owner==='evade');}
  const budgetCap=reducedMotion?1.72:2.3;
  let rawLoad=movement*movementScale+cast*castScale+ultimate*ultimateScale+hit*hitScale+evade*transitionScale;
  if(rawLoad>budgetCap){
    const protectedLoad=owner==='movement'?movement*movementScale:owner==='cast'?cast*castScale:owner==='ultimate'?ultimate*ultimateScale:owner==='hit'?hit*hitScale:owner==='evade'?evade*transitionScale:0;
    const secondaryLoad=Math.max(0,rawLoad-protectedLoad);
    const secondaryBudget=Math.max(0,budgetCap-protectedLoad);
    const compression=secondaryLoad>0?clamp(secondaryBudget/secondaryLoad,0,1):1;
    if(owner!=='movement')movementScale*=compression;
    if(owner!=='cast')castScale*=compression;
    if(owner!=='ultimate')ultimateScale*=compression;
    if(owner!=='hit')hitScale*=compression;
    if(owner!=='evade')transitionScale*=compression;
    rawLoad=movement*movementScale+cast*castScale+ultimate*ultimateScale+hit*hitScale+evade*transitionScale;
  }
  const totalLoad=rawLoad;
  return{owner,budgetCap,totalLoad,movementScale,castScale,ultimateScale,hitScale,transitionScale};
}
