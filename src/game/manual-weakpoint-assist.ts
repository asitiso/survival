import { distance, type Vec2 } from '../core/math.js';
import type { BossEncounterNode } from './boss-encounters.js';
import type { SpellTargetCandidate } from './auto-targeting.js';

export const MANUAL_WEAKPOINT_AIM_BLEND=0.38;

type WeakpointNode=Pick<BossEncounterNode,'id'|'pos'|'hp'|'maxHp'|'alive'|'radius'>;
export interface ManualWeakpointAssistInput<T extends Pick<SpellTargetCandidate,'id'|'type'|'pos'>>{
  target:T|null;
  heroPos:Vec2;
  activeBossId:number|null;
  nodes:readonly WeakpointNode[];
  maxAimDistance?:number;
  maxBossOffset?:number;
}

export function manualWeakpointAssistAimPoint<T extends Pick<SpellTargetCandidate,'id'|'type'|'pos'>>(input:ManualWeakpointAssistInput<T>):Vec2|null{
  const target=input.target;
  if(!target)return null;
  if(target.type!=='boss'||input.activeBossId!==target.id)return{...target.pos};
  const maxAim=input.maxAimDistance??760,maxBossOffset=input.maxBossOffset??190;
  const live=input.nodes.filter((node)=>node.alive&&node.hp>0&&distance(input.heroPos,node.pos)<=maxAim&&distance(target.pos,node.pos)<=maxBossOffset);
  if(live.length===0)return{...target.pos};
  const primary=[...live].sort((a,b)=>{
    const ar=a.hp/Math.max(1,a.maxHp),br=b.hp/Math.max(1,b.maxHp);
    if(Math.abs(ar-br)>.001)return ar-br;
    const ad=distance(input.heroPos,a.pos),bd=distance(input.heroPos,b.pos);
    if(Math.abs(ad-bd)>.001)return ad-bd;
    return a.id-b.id;
  })[0];
  if(!primary)return{...target.pos};
  return{x:target.pos.x+(primary.pos.x-target.pos.x)*MANUAL_WEAKPOINT_AIM_BLEND,y:target.pos.y+(primary.pos.y-target.pos.y)*MANUAL_WEAKPOINT_AIM_BLEND};
}
