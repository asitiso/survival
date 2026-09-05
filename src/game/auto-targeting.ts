import { distance, type Vec2 } from '../core/math.js';
import type { EnemyTarget, EnemyType } from './enemies.js';

export interface SpellTargetCandidate {
  id:number;
  type:EnemyType;
  pos:Vec2;
  target:EnemyTarget;
  hp:number;
  maxHp:number;
  alive:boolean;
}

function nearest<T extends SpellTargetCandidate>(enemies:readonly T[],pos:Vec2,predicate:(enemy:T)=>boolean=()=>true):T|null{
  let best:T|null=null,bestDistance=Number.POSITIVE_INFINITY;
  for(const enemy of enemies){
    if(!enemy.alive||!predicate(enemy))continue;
    const d=distance(pos,enemy.pos);
    if(d<bestDistance||(Math.abs(d-bestDistance)<.001&&best&&enemy.id<best.id)){best=enemy;bestDistance=d;}
  }
  return best;
}

function autoPriority(enemy:SpellTargetCandidate,heroPos:Vec2,corePos:Vec2|null):number{
  const heroDistance=distance(heroPos,enemy.pos);
  let score=-heroDistance*.52;
  if(enemy.type==='boss')score+=360;
  else if(enemy.type==='elite')score+=190;
  else if(enemy.type==='siegeGolem')score+=110;
  else if(enemy.type==='bomber'||enemy.type==='nullifier'||enemy.type==='assassin')score+=70;
  if(enemy.target==='core'){
    score+=250;
    if(corePos)score+=Math.max(0,170-distance(corePos,enemy.pos)*.55);
  }
  const hpRatio=Math.max(0,Math.min(1,enemy.hp/Math.max(1,enemy.maxHp)));
  score+=(1-hpRatio)*32;
  return score;
}

const AUTO_SWITCH_MARGIN=48;

export function chooseSpellTarget<T extends SpellTargetCandidate>(enemies:readonly T[],heroPos:Vec2,corePos:Vec2|null,autoAim:boolean,preferredAutoTargetId:number|null=null):T|null{
  if(!autoAim){
    const coreAttacker=nearest(enemies,heroPos,(enemy)=>enemy.target==='core');
    if(coreAttacker&&distance(heroPos,coreAttacker.pos)<620)return coreAttacker;
    const elite=nearest(enemies,heroPos,(enemy)=>enemy.type==='elite'||enemy.type==='boss');
    if(elite&&distance(heroPos,elite.pos)<650)return elite;
    return nearest(enemies,heroPos);
  }
  let best:T|null=null,bestScore=Number.NEGATIVE_INFINITY;
  for(const enemy of enemies){
    if(!enemy.alive||distance(heroPos,enemy.pos)>720)continue;
    const score=autoPriority(enemy,heroPos,corePos);
    if(score>bestScore+.001||(Math.abs(score-bestScore)<=.001&&best&&enemy.id<best.id)){best=enemy;bestScore=score;}
  }
  if(preferredAutoTargetId!==null&&best){
    const preferred=enemies.find((enemy)=>enemy.id===preferredAutoTargetId&&enemy.alive&&distance(heroPos,enemy.pos)<=720)??null;
    if(preferred){
      const preferredScore=autoPriority(preferred,heroPos,corePos);
      if(best.id===preferred.id||bestScore-preferredScore<AUTO_SWITCH_MARGIN)return preferred;
    }
  }
  return best;
}
