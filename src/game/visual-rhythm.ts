import type { PresentationQuality } from './presentation-budget.js';
import type { EnemyType } from './enemies.js';
import type { ProjectileThreatLevel } from './projectile-threat-visibility.js';
import type { BossArchetype } from './boss-patterns.js';
import type { SpellId } from './spells.js';
import { enemyDeathCue } from './enemy-presentation.js';

export type EdgeThreatTarget='hero'|'core';
export interface EdgeThreatVfxProfile { alpha:number; thickness:number; segmentCount:number; ttl:number; color:string; }
export function edgeThreatVfxProfile(level:ProjectileThreatLevel,target:EdgeThreatTarget):EdgeThreatVfxProfile {
  const base=level==='critical'?{alpha:.22,thickness:8,segmentCount:3,ttl:.18}:level==='danger'?{alpha:.15,thickness:6,segmentCount:2,ttl:.16}:{alpha:.08,thickness:4,segmentCount:1,ttl:.14};
  const alpha=Math.min(.24,base.alpha+(target==='core'?.01:0));
  return {...base,alpha,color:target==='core'?'#ff8f78':level==='critical'?'#ff5f70':level==='danger'?'#ffb45f':'#ffd98a'};
}
export type ScreenEdge='left'|'right'|'top'|'bottom';
export interface EdgeThreatIndicator { edge:ScreenEdge; position:number; inset:number; }
export function edgeThreatIndicator(pos:{x:number;y:number},width:number,height:number):EdgeThreatIndicator {
  const w=Math.max(1,width),h=Math.max(1,height),x=Math.max(0,Math.min(w,pos.x)),y=Math.max(0,Math.min(h,pos.y));
  const distances:[ScreenEdge,number][]=[['left',x],['right',w-x],['top',y],['bottom',h-y]];
  distances.sort((a,b)=>a[1]-b[1]||['left','right','top','bottom'].indexOf(a[0])-['left','right','top','bottom'].indexOf(b[0]));
  const edge=distances[0]![0];
  const position=edge==='left'||edge==='right'?Math.max(.08,Math.min(.92,y/h)):Math.max(.08,Math.min(.92,x/w));
  return {edge,position,inset:18};
}

export interface DeathAfterglowProfile { motif:string; color:string; radius:number; alpha:number; ttl:number; particleCount:number; drift:number; }
export function deathAfterglowProfile(type:EnemyType,quality:PresentationQuality):DeathAfterglowProfile {
  const cue=enemyDeathCue(type);
  const q=quality==='high'?1:quality==='medium'?.72:.46;
  const baseTtl=type==='boss'?.56:type==='elite'?.38:type==='siegeGolem'?.31:.22;
  const baseParticles=type==='boss'?10:type==='elite'?8:type==='siegeGolem'||type==='bomber'?7:5;
  const alphaBase=type==='boss'?.20:type==='elite'?.17:.13;
  return {motif:cue.motif,color:cue.color,radius:Math.min(210,Math.round(cue.radius*(type==='boss'?1.18:1.10))),alpha:Math.min(.22,alphaBase*q),ttl:baseTtl,particleCount:Math.max(2,Math.round(baseParticles*q)),drift:cue.motif==='shadow'||cue.motif==='slash'?42:type==='boss'?30:24};
}

export type UltimateAftermathMotion='embers'|'collapse';
export interface UltimateAftermathProfile { motion:UltimateAftermathMotion; color:string; secondary:string; ringCount:number; particleCount:number; alpha:number; ttl:number; radius:number; }
export function ultimateAftermathProfile(spellId:Extract<SpellId,'meteorStorm'|'blackHole'>,level:number,quality:PresentationQuality):UltimateAftermathProfile {
  const tier=level>=10?2:level>=5?1:0,q=quality==='high'?1:quality==='medium'?.74:.48;
  if(spellId==='meteorStorm') return {motion:'embers',color:'#ff8b52',secondary:'#ffd36d',ringCount:[2,3,4][tier]!,particleCount:Math.max(3,Math.round([7,9,12][tier]!*q)),alpha:Math.min(.24,[.16,.20,.24][tier]!*q),ttl:[.42,.52,.62][tier]!,radius:[86,112,142][tier]!};
  return {motion:'collapse',color:'#9d87ff',secondary:'#d8ceff',ringCount:[2,3,4][tier]!,particleCount:Math.max(3,Math.round([6,8,10][tier]!*q)),alpha:Math.min(.22,[.15,.18,.22][tier]!*q),ttl:[.46,.56,.64][tier]!,radius:[78,104,136][tier]!};
}

export interface BossSettleProfile { motif:string; color:string; rayCount:number; alpha:number; ttl:number; radius:number; }
const BOSS_SETTLE:Record<BossArchetype,{motif:string;color:string}>={
  inferno:{motif:'cinder-fall',color:'#ff805e'},summoner:{motif:'sigil-fade',color:'#7be5ae'},juggernaut:{motif:'dust-settle',color:'#ffc765'},abyssWitch:{motif:'void-dissolve',color:'#d77cff'},twinMaw:{motif:'cross-fade',color:'#ff7db0'},timeEater:{motif:'time-echo',color:'#70d3ff'},
};
export function bossSettleProfile(archetype:BossArchetype,quality:PresentationQuality):BossSettleProfile {
  const id=BOSS_SETTLE[archetype],q=quality==='high'?1:quality==='medium'?.72:.46;
  return {motif:id.motif,color:id.color,rayCount:Math.max(2,Math.round(8*q)),alpha:Math.min(.18,.17*q),ttl:.72,radius:188};
}

export interface VfxQualityTransitionState { current:PresentationQuality; candidate:PresentationQuality; dwellSeconds:number; }
export function createVfxQualityTransition(initial:PresentationQuality):VfxQualityTransitionState { return {current:initial,candidate:initial,dwellSeconds:0}; }
function rank(q:PresentationQuality):number{return q==='high'?2:q==='medium'?1:0;}
function stepUp(q:PresentationQuality):PresentationQuality{return q==='low'?'medium':'high';}
export function advanceVfxQualityTransition(state:VfxQualityTransitionState,target:PresentationQuality,dt:number):VfxQualityTransitionState {
  const step=Math.max(0,Math.min(2,Number.isFinite(dt)?dt:0));
  if(rank(target)<rank(state.current)) return {current:target,candidate:target,dwellSeconds:0};
  if(target===state.current) return {current:state.current,candidate:target,dwellSeconds:0};
  const dwell=state.candidate===target?state.dwellSeconds+step:step;
  if(dwell>=1.2) return {current:stepUp(state.current),candidate:target,dwellSeconds:0};
  return {current:state.current,candidate:target,dwellSeconds:dwell};
}
