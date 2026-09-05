export type HeroCrisisGroundSettleOwner='ground'|'impact'|'settle';
export interface HeroCrisisGroundSettleState{impact:number;settle:number;}
export interface HeroCrisisGroundSettlePresentation{owner:HeroCrisisGroundSettleOwner;groundMotionScale:number;movementRestartScale:number;shadowFollowScale:number;widthScale:number;heightScale:number;alphaScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function advanceHeroCrisisGroundSettleState(previous:HeroCrisisGroundSettleState|undefined,hitIntensity:number|null,dt:number,reducedMotion=false):HeroCrisisGroundSettleState{
  let impact=clamp(previous?.impact??0,0,1),settle=clamp(previous?.settle??0,0,1);
  const hit=hitIntensity===null?0:clamp(Number.isFinite(hitIntensity)?hitIntensity:0,0,1.25);
  if(hitIntensity!==null&&hit>=.9){impact=Math.max(impact,clamp((hit-.82)/.35,.48,1));settle=1;}
  const safeDt=clamp(Number.isFinite(dt)?dt:0,0,.14);
  if(hitIntensity===null){impact=Math.max(0,impact-safeDt/(reducedMotion?.085:.13));settle=Math.max(0,settle-safeDt/(reducedMotion?.22:.36));}
  return{impact,settle};
}
export function heroCrisisGroundSettlePresentation(state:HeroCrisisGroundSettleState|undefined,movement:number,reducedMotion=false):HeroCrisisGroundSettlePresentation{
  const impact=clamp(state?.impact??0,0,1),settle=clamp(state?.settle??0,0,1),move=clamp(movement,0,1);
  const owner:HeroCrisisGroundSettleOwner=impact>.08?'impact':settle>.04?'settle':'ground';
  if(owner==='ground')return{owner,groundMotionScale:1,movementRestartScale:1,shadowFollowScale:1,widthScale:1,heightScale:1,alphaScale:1};
  let groundMotionScale=owner==='impact'?.54:clamp(.62+(1-settle)*.38+move*.055,.62,1);
  let movementRestartScale=owner==='impact'?.58:clamp(.68+(1-settle)*.32+move*.045,.68,1);
  let shadowFollowScale=owner==='impact'?.52:clamp(.62+(1-settle)*.38,.62,1);
  let widthScale=1+impact*.055+settle*.025,heightScale=1-impact*.12-settle*.035,alphaScale=1-impact*.03;
  if(reducedMotion){groundMotionScale=1-(1-groundMotionScale)*.72;movementRestartScale=1-(1-movementRestartScale)*.72;shadowFollowScale=1-(1-shadowFollowScale)*.7;widthScale=1+(widthScale-1)*.58;heightScale=1+(heightScale-1)*.58;alphaScale=1-(1-alphaScale)*.6;}
  return{owner,groundMotionScale:clamp(groundMotionScale,.5,1),movementRestartScale:clamp(movementRestartScale,.56,1),shadowFollowScale:clamp(shadowFollowScale,.48,1),widthScale:clamp(widthScale,1,1.09),heightScale:clamp(heightScale,.83,1),alphaScale:clamp(alphaScale,.94,1)};
}
