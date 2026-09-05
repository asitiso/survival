import type { BossArchetype } from '../boss-patterns.js';
import { activeMythicTacticAttackLink, type MythicTacticAttackLink } from './mythic-tactic-attack-link.js';

export type MythicTacticAttackLinkEffectId='projectile-count'|'summon-count'|'dash-distance'|'time-warp-pressure'|'next-cadence';

export interface MythicTacticAttackLinkEffectProjection {
  id:MythicTacticAttackLinkEffectId;
  labelStem:string;
  multiplier:number;
  deltaPercent:number;
  magnitude:number;
  label:string;
}

export interface MythicTacticAttackLinkProjection {
  archetype:BossArchetype;
  label:string;
  accent:string;
  effects:MythicTacticAttackLinkEffectProjection[];
  primaryEffects:MythicTacticAttackLinkEffectProjection[];
  maxPrimaryEffects:2;
}

const MIN_VISIBLE_PERCENT=1;
const CHANNELS:readonly {id:MythicTacticAttackLinkEffectId;labelStem:string;read:(link:MythicTacticAttackLink)=>number}[]=[
  {id:'projectile-count',labelStem:'탄막',read:link=>link.projectileCountMultiplier},
  {id:'summon-count',labelStem:'소환',read:link=>link.summonCountMultiplier},
  {id:'dash-distance',labelStem:'돌진',read:link=>link.dashDistanceMultiplier},
  {id:'time-warp-pressure',labelStem:'시간압박',read:link=>link.timeWarpPressureMultiplier},
  {id:'next-cadence',labelStem:'다음주기',read:link=>link.nextCadenceMultiplier},
] as const;

function roundedPercent(multiplier:number):number{
  const safe=Number.isFinite(multiplier)?multiplier:1;
  const value=Math.round((safe-1)*1000)/10;
  return Object.is(value,-0)?0:value;
}
function compactPercent(value:number):string{
  const magnitude=Math.abs(value),text=Number.isInteger(magnitude)?String(magnitude):magnitude.toFixed(1);
  return `${value>=0?'+':'-'}${text}%`;
}

export function projectMythicTacticAttackLink(state:MythicTacticAttackLink|null,nowMs:number,archetype:BossArchetype):MythicTacticAttackLinkProjection|null{
  const active=activeMythicTacticAttackLink(state,nowMs,archetype);if(!active)return null;
  const effects=CHANNELS.map(({id,labelStem,read})=>{
    const raw=read(active),multiplier=Number.isFinite(raw)?raw:1,deltaPercent=roundedPercent(multiplier),magnitude=Math.abs(deltaPercent);
    return{id,labelStem,multiplier,deltaPercent,magnitude,label:`${labelStem} ${compactPercent(deltaPercent)}`};
  });
  const order=new Map(CHANNELS.map((channel,index)=>[channel.id,index] as const));
  const primaryEffects=effects.filter(effect=>effect.magnitude>=MIN_VISIBLE_PERCENT).sort((a,b)=>(b.magnitude-a.magnitude)||((order.get(a.id)??99)-(order.get(b.id)??99))).slice(0,2);
  return{archetype:active.archetype,label:active.label,accent:active.accent,effects,primaryEffects,maxPrimaryEffects:2};
}

export function mythicTacticAttackLinkProjectionHint(projection:MythicTacticAttackLinkProjection,limit=2):string{
  return projection.primaryEffects.slice(0,Math.max(0,Math.min(2,limit))).map(effect=>effect.label).join(' · ');
}
