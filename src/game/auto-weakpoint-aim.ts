import { distance, type Vec2 } from '../core/math.js';
import type { BossEncounterNode } from './boss-encounters.js';
import type { SpellTargetCandidate } from './auto-targeting.js';
import { AUTO_WEAKPOINT_AIM_BLEND } from './auto-combat-brain.js';

export interface AutoWeakpointAimInput<T extends Pick<SpellTargetCandidate,'id'|'type'|'pos'>> {
  autoAim:boolean;
  target:T|null;
  heroPos:Vec2;
  activeBossId:number|null;
  nodes:readonly Pick<BossEncounterNode,'id'|'pos'|'hp'|'maxHp'|'alive'|'radius'>[];
  maxAimDistance?:number;
  preferredNodeId?:number|null;
}

export function autoWeakpointAimPoint<T extends Pick<SpellTargetCandidate,'id'|'type'|'pos'>>(input:AutoWeakpointAimInput<T>):Vec2|null{
  const target=input.target;
  if(!target)return null;
  if(!input.autoAim||target.type!=='boss'||input.activeBossId!==target.id)return{...target.pos};
  const maxDistance=input.maxAimDistance??760;
  const live=input.nodes.filter((node)=>node.alive&&node.hp>0&&distance(input.heroPos,node.pos)<=maxDistance);
  if(live.length===0)return{...target.pos};
  const preferred=input.preferredNodeId===undefined||input.preferredNodeId===null
    ?undefined
    :live.find((node)=>node.id===input.preferredNodeId);
  const primary=preferred??[...live].sort((a,b)=>{
    const ar=a.hp/Math.max(1,a.maxHp),br=b.hp/Math.max(1,b.maxHp);
    if(Math.abs(ar-br)>.001)return ar-br;
    const ad=distance(input.heroPos,a.pos),bd=distance(input.heroPos,b.pos);
    if(Math.abs(ad-bd)>.001)return ad-bd;
    return a.id-b.id;
  })[0];
  if(!primary)return{...target.pos};
  if(input.preferredNodeId===undefined||input.preferredNodeId===null)return{...primary.pos};
  return{x:target.pos.x+(primary.pos.x-target.pos.x)*AUTO_WEAKPOINT_AIM_BLEND,y:target.pos.y+(primary.pos.y-target.pos.y)*AUTO_WEAKPOINT_AIM_BLEND};
}
