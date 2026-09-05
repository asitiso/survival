import type { BossArchetype,BossPhase } from './boss-patterns.js';
export type BossHeavyHitTier='heavy'|'critical';
export interface BossHeavyHitStaggerEvent{tier:BossHeavyHitTier;directionX:number;directionY:number;}
export interface BossHeavyHitStaggerState{stagger:number;tier:BossHeavyHitTier|null;directionX:number;directionY:number;}
export interface BossHeavyHitStaggerPresentation{stagger:number;stance:string;telegraphProtected:boolean;genericRecoilScale:number;offsetX:number;offsetY:number;rotation:number;scaleX:number;scaleY:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const unit=(x:number,y:number)=>{const len=Math.hypot(x,y)||1;return{x:x/len,y:y/len};};
export function advanceBossHeavyHitStaggerState(previous:BossHeavyHitStaggerState|undefined,event:BossHeavyHitStaggerEvent|null,dt:number,_reducedMotion=false):BossHeavyHitStaggerState{
  const prev=previous??{stagger:0,tier:null,directionX:-1,directionY:0};
  if(event){const d=unit(event.directionX,event.directionY);return{stagger:event.tier==='critical'?1:.72,tier:event.tier,directionX:d.x,directionY:d.y};}
  const stagger=Math.max(0,prev.stagger-clamp(Number.isFinite(dt)?dt:0,0,.12)/.34);
  return{stagger,tier:stagger>0?prev.tier:null,directionX:prev.directionX,directionY:prev.directionY};
}
const archetypeProfile=(archetype:BossArchetype)=>{
  if(archetype==='inferno')return{stance:'inferno-rebound',x:1,y:.22,rot:.55,sx:.025,sy:-.02};
  if(archetype==='summoner')return{stance:'summoner-drift',x:.45,y:-.42,rot:.92,sx:-.015,sy:.03};
  if(archetype==='juggernaut')return{stance:'juggernaut-brace',x:.24,y:1.18,rot:.18,sx:.045,sy:-.055};
  if(archetype==='abyssWitch')return{stance:'abyss-curl',x:.56,y:-.22,rot:.82,sx:-.025,sy:.04};
  if(archetype==='twinMaw')return{stance:'twin-maw-yaw',x:.62,y:.12,rot:1.05,sx:.02,sy:-.025};
  return{stance:'time-compress',x:.22,y:.48,rot:.38,sx:-.045,sy:.055};
};
export function bossHeavyHitStaggerPresentation(archetype:BossArchetype,phase:BossPhase,state:BossHeavyHitStaggerState|undefined,specialTimer:number,reducedMotion=false):BossHeavyHitStaggerPresentation{
  const s=state??{stagger:0,tier:null,directionX:-1,directionY:0},p=archetypeProfile(archetype);
  const phaseScale=phase===1?1:phase===2?.88:.74;
  const telegraphProtected=Number.isFinite(specialTimer)&&specialTimer>=0&&specialTimer<=1.2;
  const protection=telegraphProtected?.08:1;
  const motionScale=(reducedMotion?.36:1)*phaseScale*protection;
  const strength=clamp(s.stagger,0,1);
  const dir=unit(s.directionX,s.directionY);
  let offsetX=(dir.x*4.8*p.x+dir.y*1.25*p.rot)*strength*motionScale;
  let offsetY=(dir.y*2.4+p.y*3.15)*strength*motionScale;
  let rotation=clamp((dir.y-dir.x*.3)*.13*p.rot*strength*motionScale,-.16,.16);
  let scaleX=clamp(1+p.sx*strength*motionScale,.9,1.1),scaleY=clamp(1+p.sy*strength*motionScale,.9,1.1);
  const magnitude=Math.hypot(offsetX,offsetY),cap=reducedMotion?3:7.8;if(magnitude>cap){const r=cap/magnitude;offsetX*=r;offsetY*=r;}
  if(strength<=0){offsetX=0;offsetY=0;rotation=0;scaleX=1;scaleY=1;}
  return{stagger:strength,stance:p.stance,telegraphProtected,genericRecoilScale:telegraphProtected?.08:1,offsetX,offsetY,rotation,scaleX,scaleY};
}
