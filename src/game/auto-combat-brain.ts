import { distance, type Vec2 } from '../core/math.js';
import type { BossEncounterNode } from './boss-encounters.js';
import { chooseSpellTarget, type SpellTargetCandidate } from './auto-targeting.js';
import type { CombatCastAction } from './cast-intent-buffer.js';

export const AUTO_TARGET_REVIEW_SECONDS = 0.14;
export const AUTO_NORMAL_SWITCH_SECONDS = 0.18;
export const AUTO_CORE_SWITCH_SECONDS = 0.10;
export const AUTO_CAST_GAP_SECONDS = 0.14;
export const AUTO_WEAKPOINT_SWITCH_SECONDS = 0.22;
export const AUTO_WEAKPOINT_AIM_BLEND = 0.79;

const AUTO_ACTION_ORDER = ['spell1','spell2','spell3','spell4'] as const satisfies readonly CombatCastAction[];

type WeakpointCandidate = Pick<BossEncounterNode,'id'|'pos'|'hp'|'maxHp'|'alive'|'radius'>;

export class AutoCombatBrain {
  private targetId:number|null=null;
  private pendingTargetId:number|null=null;
  private pendingTargetSince=0;
  private nextTargetReviewAt=Number.NEGATIVE_INFINITY;
  private weakpointBossId:number|null=null;
  private weakpointId:number|null=null;
  private pendingWeakpointId:number|null=null;
  private pendingWeakpointSince=0;
  private lastCastAt=Number.NEGATIVE_INFINITY;
  private castCursor=0;

  reset():void{
    this.targetId=null;
    this.pendingTargetId=null;
    this.pendingTargetSince=0;
    this.nextTargetReviewAt=Number.NEGATIVE_INFINITY;
    this.weakpointBossId=null;
    this.weakpointId=null;
    this.pendingWeakpointId=null;
    this.pendingWeakpointSince=0;
    this.lastCastAt=Number.NEGATIVE_INFINITY;
    this.castCursor=0;
  }

  currentTargetId():number|null{return this.targetId;}
  currentWeakpointId():number|null{return this.weakpointId;}

  selectTarget<T extends SpellTargetCandidate>(enemies:readonly T[],heroPos:Vec2,corePos:Vec2|null,nowSeconds:number):T|null{
    const now=Number.isFinite(nowSeconds)?nowSeconds:0;
    const current=this.targetId===null?null:enemies.find((enemy)=>enemy.id===this.targetId&&enemy.alive&&distance(heroPos,enemy.pos)<=720)??null;
    if(!current){
      const candidate=chooseSpellTarget(enemies,heroPos,corePos,true,null);
      this.targetId=candidate?.id??null;
      this.pendingTargetId=null;
      this.nextTargetReviewAt=now+AUTO_TARGET_REVIEW_SECONDS;
      return candidate;
    }
    const urgentCoreReview=enemies.some((enemy)=>enemy.alive&&enemy.target==='core'&&enemy.id!==current.id&&distance(heroPos,enemy.pos)<=720);
    if(now+1e-9<this.nextTargetReviewAt&&!urgentCoreReview)return current;
    this.nextTargetReviewAt=now+AUTO_TARGET_REVIEW_SECONDS;
    const candidate=chooseSpellTarget(enemies,heroPos,corePos,true,this.targetId);
    if(!candidate){this.targetId=null;this.pendingTargetId=null;return null;}
    if(candidate.id===current.id){this.pendingTargetId=null;return current;}
    if(this.pendingTargetId!==candidate.id){this.pendingTargetId=candidate.id;this.pendingTargetSince=now;return current;}
    const reaction=candidate.target==='core'?AUTO_CORE_SWITCH_SECONDS:AUTO_NORMAL_SWITCH_SECONDS;
    if(now-this.pendingTargetSince+1e-9<reaction)return current;
    this.targetId=candidate.id;
    this.pendingTargetId=null;
    return candidate;
  }

  selectWeakpoint(activeBossId:number|null,nodes:readonly WeakpointCandidate[],heroPos:Vec2,nowSeconds:number):number|null{
    const now=Number.isFinite(nowSeconds)?nowSeconds:0;
    const live=nodes.filter((node)=>node.alive&&node.hp>0&&distance(heroPos,node.pos)<=760);
    if(activeBossId===null||live.length===0){this.weakpointBossId=null;this.weakpointId=null;this.pendingWeakpointId=null;return null;}
    if(this.weakpointBossId!==activeBossId){this.weakpointBossId=activeBossId;this.weakpointId=null;this.pendingWeakpointId=null;}
    const best=[...live].sort((a,b)=>{
      const ar=a.hp/Math.max(1,a.maxHp),br=b.hp/Math.max(1,b.maxHp);
      if(Math.abs(ar-br)>.001)return ar-br;
      const ad=distance(heroPos,a.pos),bd=distance(heroPos,b.pos);
      if(Math.abs(ad-bd)>.001)return ad-bd;
      return a.id-b.id;
    })[0]??null;
    const current=this.weakpointId===null?null:live.find((node)=>node.id===this.weakpointId)??null;
    if(!current){this.weakpointId=best?.id??null;this.pendingWeakpointId=null;return this.weakpointId;}
    if(!best||best.id===current.id){this.pendingWeakpointId=null;return current.id;}
    if(this.pendingWeakpointId!==best.id){this.pendingWeakpointId=best.id;this.pendingWeakpointSince=now;return current.id;}
    if(now-this.pendingWeakpointSince+1e-9<AUTO_WEAKPOINT_SWITCH_SECONDS)return current.id;
    this.weakpointId=best.id;
    this.pendingWeakpointId=null;
    return best.id;
  }

  chooseAutoCastAction(readyActions:readonly CombatCastAction[],nowSeconds:number):CombatCastAction|null{
    const now=Number.isFinite(nowSeconds)?nowSeconds:0;
    if(now-this.lastCastAt+1e-9<AUTO_CAST_GAP_SECONDS||readyActions.length===0)return null;
    const ready=new Set(readyActions);
    for(let offset=0;offset<AUTO_ACTION_ORDER.length;offset++){
      const index=(this.castCursor+offset)%AUTO_ACTION_ORDER.length;
      const action=AUTO_ACTION_ORDER[index]!;
      if(ready.has(action))return action;
    }
    return null;
  }

  recordAutoCast(action:CombatCastAction,nowSeconds:number):void{
    this.lastCastAt=Number.isFinite(nowSeconds)?nowSeconds:0;
    const index=AUTO_ACTION_ORDER.indexOf(action as typeof AUTO_ACTION_ORDER[number]);
    if(index>=0)this.castCursor=(index+1)%AUTO_ACTION_ORDER.length;
  }
}
