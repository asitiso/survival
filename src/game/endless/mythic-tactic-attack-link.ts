import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';

export interface MythicTacticAttackLink {
  archetype:BossArchetype;
  label:string;
  accent:string;
  expiresAtMs:number;
  consumed:boolean;
  projectileCountMultiplier:number;
  summonCountMultiplier:number;
  dashDistanceMultiplier:number;
  timeWarpPressureMultiplier:number;
  nextCadenceMultiplier:number;
}

const PROFILE:Record<BossArchetype,Omit<MythicTacticAttackLink,'archetype'|'expiresAtMs'|'consumed'>>={
  inferno:{label:'EMBER INTERCEPT',accent:'#ff9a62',projectileCountMultiplier:.76,summonCountMultiplier:.92,dashDistanceMultiplier:1,timeWarpPressureMultiplier:1,nextCadenceMultiplier:1.08},
  summoner:{label:'BROOD SEVER',accent:'#7ff0ac',projectileCountMultiplier:.92,summonCountMultiplier:.7,dashDistanceMultiplier:1,timeWarpPressureMultiplier:1,nextCadenceMultiplier:1.08},
  juggernaut:{label:'IRON SIDESTEP',accent:'#ffd36f',projectileCountMultiplier:.9,summonCountMultiplier:1,dashDistanceMultiplier:.7,timeWarpPressureMultiplier:1,nextCadenceMultiplier:1.1},
  abyssWitch:{label:'VOID DISRUPT',accent:'#d18cff',projectileCountMultiplier:.78,summonCountMultiplier:.9,dashDistanceMultiplier:1,timeWarpPressureMultiplier:1,nextCadenceMultiplier:1.18},
  twinMaw:{label:'TWIN BREAKSTEP',accent:'#ff7fb4',projectileCountMultiplier:.8,summonCountMultiplier:1,dashDistanceMultiplier:.82,timeWarpPressureMultiplier:1,nextCadenceMultiplier:1.12},
  timeEater:{label:'TIME RELEASE',accent:'#76d8ff',projectileCountMultiplier:.86,summonCountMultiplier:.92,dashDistanceMultiplier:1,timeWarpPressureMultiplier:.72,nextCadenceMultiplier:1.22},
};

export function createMythicTacticAttackLink(archetype:BossArchetype,nowMs:number,durationMs:number):MythicTacticAttackLink{
  const base=PROFILE[archetype];
  return{
    archetype,...base,
    expiresAtMs:Math.max(0,Math.round((Number.isFinite(nowMs)?nowMs:0)+clamp(Number.isFinite(durationMs)?durationMs:0,1200,8000))),
    consumed:false,
    projectileCountMultiplier:clamp(base.projectileCountMultiplier,.7,1),
    summonCountMultiplier:clamp(base.summonCountMultiplier,.7,1),
    dashDistanceMultiplier:clamp(base.dashDistanceMultiplier,.7,1),
    timeWarpPressureMultiplier:clamp(base.timeWarpPressureMultiplier,.7,1),
    nextCadenceMultiplier:clamp(base.nextCadenceMultiplier,1,1.25),
  };
}
export function activeMythicTacticAttackLink(state:MythicTacticAttackLink|null,nowMs:number,archetype:BossArchetype):MythicTacticAttackLink|null{
  if(!state||state.consumed||state.archetype!==archetype||!Number.isFinite(nowMs)||nowMs>state.expiresAtMs)return null;
  return state;
}
export function consumeMythicTacticAttackLink(state:MythicTacticAttackLink):MythicTacticAttackLink{return state.consumed?state:{...state,consumed:true};}
