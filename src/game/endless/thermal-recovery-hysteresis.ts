import type { ThermalBudgetPolicy, ThermalTier } from './thermal-budget-director.js';

export interface ThermalRecoveryState{
  tier:ThermalTier;
  stressFrames:number;
  recoveryFrames:number;
  transitions:number;
}
export interface ThermalRecoveryAudit{
  fastEscalation:boolean;
  slowRecovery:boolean;
  noFlapping:boolean;
  logicPreserved:boolean;
  passed:boolean;
}
const ESCALATE_FRAMES=45;
const RECOVER_FRAMES=240;
const RANK:Record<ThermalTier,number>={cool:0,warm:1,hot:2};
const BY_RANK:readonly ThermalTier[]=['cool','warm','hot'];

export function createThermalRecoveryState(tier:ThermalTier='cool'):ThermalRecoveryState{return{tier,stressFrames:0,recoveryFrames:0,transitions:0};}
function stepToward(current:ThermalTier,target:ThermalTier):ThermalTier{
  const c=RANK[current],t=RANK[target];
  if(c===t)return current;
  return BY_RANK[c+(t>c?1:-1)]!;
}
export function advanceThermalRecovery(state:ThermalRecoveryState,desiredTier:ThermalTier):ThermalRecoveryState{
  const currentRank=RANK[state.tier],desiredRank=RANK[desiredTier];
  if(desiredRank>currentRank){
    const stressFrames=Math.min(ESCALATE_FRAMES,Math.max(0,state.stressFrames)+1);
    if(stressFrames>=ESCALATE_FRAMES)return{tier:stepToward(state.tier,desiredTier),stressFrames:0,recoveryFrames:0,transitions:state.transitions+1};
    return{...state,stressFrames,recoveryFrames:0};
  }
  if(desiredRank<currentRank){
    const recoveryFrames=Math.min(RECOVER_FRAMES,Math.max(0,state.recoveryFrames)+1);
    if(recoveryFrames>=RECOVER_FRAMES)return{tier:stepToward(state.tier,desiredTier),stressFrames:0,recoveryFrames:0,transitions:state.transitions+1};
    return{...state,stressFrames:0,recoveryFrames};
  }
  return{...state,stressFrames:Math.max(0,state.stressFrames-2),recoveryFrames:Math.max(0,state.recoveryFrames-2)};
}
export function thermalPolicyForEffectiveTier(base:ThermalBudgetPolicy,tier:ThermalTier):ThermalBudgetPolicy{
  if(tier==='hot')return{...base,tier,visualDensityMultiplier:.72,particleCapMultiplier:.62,trailCapMultiplier:.56,audioVoiceMultiplier:.72,telegraphMultiplier:1,enemyLogicMultiplier:1};
  if(tier==='warm')return{...base,tier,visualDensityMultiplier:.88,particleCapMultiplier:.82,trailCapMultiplier:.78,audioVoiceMultiplier:.88,telegraphMultiplier:1,enemyLogicMultiplier:1};
  return{...base,tier,visualDensityMultiplier:1,particleCapMultiplier:1,trailCapMultiplier:1,audioVoiceMultiplier:1,telegraphMultiplier:1,enemyLogicMultiplier:1};
}
function repeat(state:ThermalRecoveryState,tier:ThermalTier,count:number):ThermalRecoveryState{let next=state;for(let i=0;i<count;i++)next=advanceThermalRecovery(next,tier);return next;}
export function auditThermalRecoveryHysteresis():ThermalRecoveryAudit{
  const afterEscalation=repeat(createThermalRecoveryState(),'hot',ESCALATE_FRAMES*2);
  const beforeRecovery=repeat(afterEscalation,'cool',RECOVER_FRAMES-1);
  const afterOneRecovery=advanceThermalRecovery(beforeRecovery,'cool');
  const flapHot=advanceThermalRecovery(createThermalRecoveryState('hot'),'cool');
  const flapCool=advanceThermalRecovery(createThermalRecoveryState('cool'),'hot');
  const sample=thermalPolicyForEffectiveTier({tier:'cool',pressure:.1,visualDensityMultiplier:1,particleCapMultiplier:1,trailCapMultiplier:1,audioVoiceMultiplier:1,telegraphMultiplier:1,enemyLogicMultiplier:1},'hot');
  const fastEscalation=afterEscalation.tier==='hot'&&afterEscalation.transitions===2;
  const slowRecovery=beforeRecovery.tier==='hot'&&afterOneRecovery.tier==='warm';
  const noFlapping=flapHot.tier==='hot'&&flapCool.tier==='cool';
  const logicPreserved=sample.enemyLogicMultiplier===1&&sample.telegraphMultiplier===1;
  return{fastEscalation,slowRecovery,noFlapping,logicPreserved,passed:fastEscalation&&slowRecovery&&noFlapping&&logicPreserved};
}
