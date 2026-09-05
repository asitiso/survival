import type { Vec2 } from '../core/math.js';
import { BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET, type BossSafeResponseLabelPlacement, type BossSafeResponseLabelPlacementInput, type BossSafeResponseLabelSlot } from './boss-safe-response-label-placement.js';
export const BOSS_SAFE_RESPONSE_SLOT_HOLD_SECONDS=.2;
export const BOSS_SAFE_RESPONSE_SLOT_RELEASE_CLEARANCE=44;
export const BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD=96;
export const BOSS_SAFE_RESPONSE_SLOT_REBASE_WINDOW_SECONDS=.55;
export const BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT=2;
export const BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS=.18;
export const BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS=.08;
export interface BossSafeResponseSlotMemory{bossId:number;cycle:number;slot:Exclude<BossSafeResponseLabelSlot,'hidden'>;pos:Vec2;bossPos:Vec2;holdUntil:number;rebaseWindowStartedAt:number;rebaseCount:number;strictHandoffUntil:number;strictSlotLockUntil:number;presentationOnly:true;}
export interface BossSafeResponseSlotHysteresisResult{placement:BossSafeResponseLabelPlacement;memory:BossSafeResponseSlotMemory|null;presentationOnly:true;}
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
export function bossSafeResponseRelativeFollowPosition(memory:BossSafeResponseSlotMemory,currentBossPos:Vec2):Vec2{return{x:memory.pos.x+(currentBossPos.x-memory.bossPos.x),y:memory.pos.y+(currentBossPos.y-memory.bossPos.y)};}
export function bossSafeResponseStrictHandoffActive(memory:BossSafeResponseSlotMemory,nowValue:number):boolean{const now=Number.isFinite(nowValue)?nowValue:0;return now<memory.strictHandoffUntil;}
export function bossSafeResponseStrictSlotPosition(slot:Exclude<BossSafeResponseLabelSlot,'hidden'>,input:BossSafeResponseLabelPlacementInput):Vec2{
  const r=Math.max(0,input.bossRadius);
  if(slot==='above')return{x:input.bossPos.x,y:input.bossPos.y-r-32};
  if(slot==='right')return{x:input.bossPos.x+r+58,y:input.bossPos.y-8};
  if(slot==='left')return{x:input.bossPos.x-r-58,y:input.bossPos.y-8};
  return{x:input.bossPos.x,y:input.bossPos.y+r+42};
}
function positionStillSafe(p:Vec2,input:BossSafeResponseLabelPlacementInput):boolean{
  if(p.x<BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||p.x>input.width-BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||p.y<BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||p.y>input.height-BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET)return false;
  if(distance(p,input.heroPos)<BOSS_SAFE_RESPONSE_SLOT_RELEASE_CLEARANCE||distance(p,input.corePos)<BOSS_SAFE_RESPONSE_SLOT_RELEASE_CLEARANCE)return false;
  if((input.extraProtected??[]).some((anchor)=>distance(p,anchor)<Math.max(0,anchor.radius)+12))return false;
  return true;
}
function rebaseBudgetExhausted(previous:BossSafeResponseSlotMemory,now:number):boolean{return now-previous.rebaseWindowStartedAt<=BOSS_SAFE_RESPONSE_SLOT_REBASE_WINDOW_SECONDS&&previous.rebaseCount>=BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT;}
function strictPlacementMemory(input:{previous:BossSafeResponseSlotMemory;current:BossSafeResponseLabelPlacement;placementInput:BossSafeResponseLabelPlacementInput;bossId:number;cycle:number;now:number;startEpoch:boolean;lockTransition?:boolean;}):BossSafeResponseSlotHysteresisResult{
  if(!input.current.visible||input.current.slot==='hidden')return{placement:{...input.current,pos:{...input.current.pos}},memory:null,presentationOnly:true};
  const strictHandoffUntil=input.startEpoch?input.now+BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS:input.previous.strictHandoffUntil;
  const changedSlot=input.current.slot!==input.previous.slot;
  const strictSlotLockUntil=input.lockTransition&&changedSlot?input.now+BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS:changedSlot?input.previous.strictSlotLockUntil:input.previous.strictSlotLockUntil;
  const memory:BossSafeResponseSlotMemory={bossId:input.bossId,cycle:input.cycle,slot:input.current.slot,pos:{...input.current.pos},bossPos:{...input.placementInput.bossPos},holdUntil:input.now,rebaseWindowStartedAt:input.now,rebaseCount:0,strictHandoffUntil,strictSlotLockUntil,presentationOnly:true};
  return{placement:{...input.current,pos:{...input.current.pos}},memory,presentationOnly:true};
}
function strictLockedPlacement(previous:BossSafeResponseSlotMemory,input:BossSafeResponseLabelPlacementInput):BossSafeResponseLabelPlacement{
  const pos=bossSafeResponseStrictSlotPosition(previous.slot,input);return{visible:true,slot:previous.slot,pos,animated:false,motionAmplitude:0,presentationOnly:true};
}
export function bossSafeResponseSameSlotRebase(input:{previous:BossSafeResponseSlotMemory;current:BossSafeResponseLabelPlacement;placementInput:BossSafeResponseLabelPlacementInput;bossId:number;cycle:number;now:number;}):BossSafeResponseSlotHysteresisResult|null{
  const {previous,current,placementInput}=input;
  if(previous.bossId!==input.bossId||previous.cycle!==input.cycle||!current.visible||current.slot==='hidden'||current.slot!==previous.slot)return null;
  const now=Number.isFinite(input.now)?input.now:0;
  if(bossSafeResponseStrictHandoffActive(previous,now))return null;
  const followed=bossSafeResponseRelativeFollowPosition(previous,placementInput.bossPos);
  if(!positionStillSafe(followed,placementInput))return null;
  const windowExpired=now-previous.rebaseWindowStartedAt>BOSS_SAFE_RESPONSE_SLOT_REBASE_WINDOW_SECONDS;
  const rebaseCount=windowExpired?1:previous.rebaseCount+1;
  if(!windowExpired&&previous.rebaseCount>=BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT)return null;
  const memory:BossSafeResponseSlotMemory={...previous,pos:{...followed},bossPos:{...placementInput.bossPos},holdUntil:now+BOSS_SAFE_RESPONSE_SLOT_HOLD_SECONDS,rebaseWindowStartedAt:windowExpired?now:previous.rebaseWindowStartedAt,rebaseCount,strictHandoffUntil:0,strictSlotLockUntil:0,presentationOnly:true};
  return{placement:{visible:true,slot:previous.slot,pos:followed,animated:false,motionAmplitude:0,presentationOnly:true},memory,presentationOnly:true};
}
export function bossSafeResponseSlotHysteresis(input:{previous:BossSafeResponseSlotMemory|null;current:BossSafeResponseLabelPlacement;placementInput:BossSafeResponseLabelPlacementInput;bossId:number;cycle:number;now:number;}):BossSafeResponseSlotHysteresisResult{
  const now=Number.isFinite(input.now)?input.now:0,previous=input.previous;
  const sameIdentity=Boolean(previous&&previous.bossId===input.bossId&&previous.cycle===input.cycle);
  if(previous&&sameIdentity&&bossSafeResponseStrictHandoffActive(previous,now)){
    if(input.current.visible&&input.current.slot!=='hidden'&&input.current.slot!==previous.slot){
      const previousStrictPos=bossSafeResponseStrictSlotPosition(previous.slot,input.placementInput);
      const locked=now<previous.strictSlotLockUntil;
      if(locked&&positionStillSafe(previousStrictPos,input.placementInput)){
        const placement=strictLockedPlacement(previous,input.placementInput);
        const memory:BossSafeResponseSlotMemory={...previous,pos:{...placement.pos},bossPos:{...input.placementInput.bossPos},holdUntil:now,rebaseWindowStartedAt:now,rebaseCount:0,presentationOnly:true};
        return{placement,memory,presentationOnly:true};
      }
      return strictPlacementMemory({...input,previous,now,startEpoch:false,lockTransition:true});
    }
    return strictPlacementMemory({...input,previous,now,startEpoch:false});
  }
  const bossDisplacement=previous?distance(previous.bossPos,input.placementInput.bossPos):Infinity;
  const followed=previous?bossSafeResponseRelativeFollowPosition(previous,input.placementInput.bossPos):null;
  if(previous&&followed&&sameIdentity&&bossDisplacement<=BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD&&now<previous.holdUntil&&positionStillSafe(followed,input.placementInput)){
    return{placement:{visible:true,slot:previous.slot,pos:followed,animated:false,motionAmplitude:0,presentationOnly:true},memory:{...previous,pos:{...previous.pos},bossPos:{...previous.bossPos},strictSlotLockUntil:0},presentationOnly:true};
  }
  if(previous&&sameIdentity&&bossDisplacement>BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD){
    const exhausted=rebaseBudgetExhausted(previous,now);
    const rebased=bossSafeResponseSameSlotRebase({...input,previous,now});if(rebased)return rebased;
    if(exhausted&&input.current.visible&&input.current.slot!=='hidden'&&input.current.slot===previous.slot)return strictPlacementMemory({...input,previous,now,startEpoch:true});
  }
  if(!input.current.visible||input.current.slot==='hidden')return{placement:{...input.current,pos:{...input.current.pos}},memory:null,presentationOnly:true};
  const memory:BossSafeResponseSlotMemory={bossId:input.bossId,cycle:input.cycle,slot:input.current.slot,pos:{...input.current.pos},bossPos:{...input.placementInput.bossPos},holdUntil:now+BOSS_SAFE_RESPONSE_SLOT_HOLD_SECONDS,rebaseWindowStartedAt:now,rebaseCount:0,strictHandoffUntil:0,strictSlotLockUntil:0,presentationOnly:true};
  return{placement:{...input.current,pos:{...input.current.pos}},memory,presentationOnly:true};
}
