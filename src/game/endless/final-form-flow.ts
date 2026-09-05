import { clamp } from '../../core/math.js';
import type { HeroFinalFormId } from './final-form.js';
import { finalFormMobilityProfile } from './final-form-mobility.js';

export interface FinalFormFlowState { formId:HeroFinalFormId|null; streak:number; expiresAtMs:number; lastCastAtMs:number; }
export interface FinalFormFlowModifiers { damageMultiplier:number; cooldownMultiplier:number; moveSpeedMultiplier:number; }

export function createDefaultFinalFormFlowState():FinalFormFlowState{return{formId:null,streak:0,expiresAtMs:0,lastCastAtMs:0};}

export function recordFinalFormFlowCast(state:FinalFormFlowState,formId:HeroFinalFormId|null,moving:boolean,nowMs:number):FinalFormFlowState{
  const now=Math.max(0,Number.isFinite(nowMs)?nowMs:0);
  if(!formId||!moving)return advanceFinalFormFlow(state,now);
  const continuing=state.formId===formId&&state.expiresAtMs>now;
  return {formId,streak:Math.min(5,(continuing?state.streak:0)+1),expiresAtMs:now+4200,lastCastAtMs:now};
}

export function advanceFinalFormFlow(state:FinalFormFlowState,nowMs:number):FinalFormFlowState{
  const now=Math.max(0,Number.isFinite(nowMs)?nowMs:0);
  if(state.expiresAtMs<=now)return createDefaultFinalFormFlowState();
  return {...state,streak:Math.max(0,Math.min(5,Math.floor(state.streak)))};
}

export function finalFormFlowModifiers(state:FinalFormFlowState,formId:HeroFinalFormId|null,nowMs:number):FinalFormFlowModifiers{
  const safe=advanceFinalFormFlow(state,nowMs);
  if(!formId||safe.formId!==formId||safe.streak<=0)return{damageMultiplier:1,cooldownMultiplier:1,moveSpeedMultiplier:1};
  const ratio=clamp(safe.streak/5,0,1); const family=finalFormMobilityProfile(formId).family;
  let damage=1+.07*ratio,cooldown=1-.04*ratio,move=1+.02*ratio;
  if(family==='surge'){damage=1+.16*ratio;move=1+.035*ratio;}
  else if(family==='flow'){cooldown=1-.13*ratio;move=1+.045*ratio;damage=1+.08*ratio;}
  else if(family==='drift'){damage=1+.11*ratio;cooldown=1-.075*ratio;}
  else {damage=1+.13*ratio;cooldown=1-.035*ratio;move=1+.01*ratio;}
  return{damageMultiplier:clamp(damage,1,1.18),cooldownMultiplier:clamp(cooldown,.86,1),moveSpeedMultiplier:clamp(move,1,1.05)};
}
