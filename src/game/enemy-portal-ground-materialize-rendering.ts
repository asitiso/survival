export type EnemyPortalGroundMaterializeKind='regular'|'specialist'|'elite';
export interface EnemyPortalGroundMaterializeState{kind:EnemyPortalGroundMaterializeKind;strength:number;}
export interface EnemyPortalGroundMaterializePresentation{locomotionScale:number;shadowAlphaScale:number;shadowWidthScale:number;groundPulseScale:number;groundOffsetY:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function advanceEnemyPortalGroundMaterializeState(previous:EnemyPortalGroundMaterializeState|undefined,event:{kind:EnemyPortalGroundMaterializeKind}|null,dt:number,reducedMotion=false):EnemyPortalGroundMaterializeState|undefined{
  if(event)return{kind:event.kind,strength:1};
  if(!previous)return undefined;
  const duration=previous.kind==='elite'?(reducedMotion?.26:.48):previous.kind==='specialist'?(reducedMotion?.22:.38):(reducedMotion?.2:.42);
  const strength=Math.max(0,previous.strength-clamp(Number.isFinite(dt)?dt:0,0,.14)/duration);
  return strength<=.001?undefined:{...previous,strength};
}
export function enemyPortalGroundMaterializePresentation(state:EnemyPortalGroundMaterializeState|undefined,reducedMotion=false):EnemyPortalGroundMaterializePresentation{
  const strength=clamp(state?.strength??0,0,1),kind=state?.kind??'regular';
  if(strength<=0)return{locomotionScale:1,shadowAlphaScale:1,shadowWidthScale:1,groundPulseScale:1,groundOffsetY:0};
  const baseLocomotion=kind==='elite'?.28:kind==='specialist'?.24:.22;
  const baseShadow=kind==='elite'?.52:kind==='specialist'?.46:.44;
  const widthBoost=kind==='elite'?.12:kind==='specialist'?.055:.035;
  let locomotionScale=1-strength*(1-baseLocomotion),shadowAlphaScale=1-strength*(1-baseShadow),shadowWidthScale=1+strength*widthBoost,groundPulseScale=1-strength*.9,groundOffsetY=strength*(kind==='elite'?2.2:1.5);
  if(reducedMotion){locomotionScale=1-(1-locomotionScale)*.72;shadowAlphaScale=1-(1-shadowAlphaScale)*.74;shadowWidthScale=1+(shadowWidthScale-1)*.62;groundOffsetY*=.58;}
  return{locomotionScale:clamp(locomotionScale,.2,1),shadowAlphaScale:clamp(shadowAlphaScale,.4,1),shadowWidthScale:clamp(shadowWidthScale,1,1.13),groundPulseScale:clamp(groundPulseScale,.08,1),groundOffsetY:clamp(groundOffsetY,0,2.4)};
}
