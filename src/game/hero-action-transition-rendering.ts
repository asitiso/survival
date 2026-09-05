export type HeroActionTransitionEvent='hit'|'cast'|'evade'|null;
export type HeroActionTransitionKind='neutral'|'hit'|'cast'|'evade';

export interface HeroActionTransitionState{
  hit:number;
  cast:number;
  evade:number;
  bridge:number;
  last:HeroActionTransitionKind;
}

export interface HeroActionTransitionPresentation{
  hitToCast:number;
  castToEvade:number;
  castContinuity:number;
  evadeContinuity:number;
  hitRecoilScale:number;
  recoverSuppression:number;
  offsetX:number;
  offsetY:number;
  rotation:number;
  scaleX:number;
  scaleY:number;
}

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function advanceHeroActionTransitionState(
  previous:HeroActionTransitionState|undefined,
  event:HeroActionTransitionEvent,
  dt:number,
  reducedMotion=false,
):HeroActionTransitionState{
  const prev=previous??{hit:0,cast:0,evade:0,bridge:0,last:'neutral'};
  const safeDt=clamp(Number.isFinite(dt)?dt:0,0,.1);
  const durationScale=reducedMotion?.82:1;
  let hit=Math.max(0,prev.hit-safeDt/(.30*durationScale));
  let cast=Math.max(0,prev.cast-safeDt/(.34*durationScale));
  let evade=Math.max(0,prev.evade-safeDt/(.38*durationScale));
  let bridge=Math.max(0,prev.bridge-safeDt/(.42*durationScale));
  let last:HeroActionTransitionKind=bridge>0?prev.last:'neutral';

  if(event==='hit'){
    hit=1;
    cast*=.72;
    evade*=.45;
    bridge=1;
    last='hit';
  }else if(event==='cast'){
    cast=1;
    evade*=.55;
    bridge=1;
    last='cast';
  }else if(event==='evade'){
    evade=1;
    hit*=.45;
    bridge=1;
    last='evade';
  }
  if(bridge<=0.0001)last='neutral';
  return{hit,cast,evade,bridge,last};
}

export function heroActionTransitionPresentation(
  state:HeroActionTransitionState|undefined,
  facingX:number,
  facingY:number,
  speed:number,
  reducedMotion=false,
):HeroActionTransitionPresentation{
  const s=state??{hit:0,cast:0,evade:0,bridge:0,last:'neutral'};
  const hit=clamp(s.hit,0,1),cast=clamp(s.cast,0,1),evade=clamp(s.evade,0,1),bridge=clamp(s.bridge,0,1);
  const len=Math.hypot(facingX,facingY)||1,fx=facingX/len,fy=facingY/len;
  const move=clamp(speed,0,1);
  const hitToCast=s.last==='cast'?Math.min(hit,cast)*bridge:0;
  const castToEvade=s.last==='evade'?Math.min(cast,evade)*bridge:0;
  const castContinuity=clamp(cast*(.72+.28*bridge)+hitToCast*.18,0,1);
  const evadeContinuity=clamp(evade*(.72+.28*bridge)+castToEvade*.12,0,1);
  const hitRecoilScale=clamp(1-hitToCast*.48-castToEvade*.18,.35,1);
  const recoverSuppression=clamp(hitToCast*.34+castToEvade*.74,0,.86);
  const motionScale=reducedMotion?.38:1;
  const forward=(hitToCast*(1.2+move*.8)+castToEvade*(3.2+move*1.35))*motionScale;
  const side=castToEvade*1.15*motionScale;
  let offsetX=(fx*forward-fy*side);
  let offsetY=(fy*forward+fx*side*.32-evadeContinuity*.72*motionScale);
  const maxOffset=reducedMotion?2.6:6.2;
  const magnitude=Math.hypot(offsetX,offsetY);
  if(magnitude>maxOffset){const ratio=maxOffset/magnitude;offsetX*=ratio;offsetY*=ratio;}
  const rotation=clamp(((fy-fx*.18)*castToEvade*.075-fy*hitToCast*.035)*motionScale,-.16,.16);
  const scaleX=clamp(1+castToEvade*.025*motionScale-hitToCast*.012*motionScale,.92,1.08);
  const scaleY=clamp(1-castToEvade*.02*motionScale+hitToCast*.018*motionScale,.92,1.08);
  return{hitToCast,castToEvade,castContinuity,evadeContinuity,hitRecoilScale,recoverSuppression,offsetX,offsetY,rotation,scaleX,scaleY};
}
