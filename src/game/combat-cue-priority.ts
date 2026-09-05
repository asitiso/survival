export type CombatDamageSeverity='normal'|'heavy'|'critical'|null;
export interface CombatCuePriorityInput{damageSeverity:CombatDamageSeverity;bossSpecialTimer:number;}
export interface CombatCuePriorityPolicy{primary:'damage-critical'|'boss-response'|'damage-heavy'|'normal';maxProjectileCues:number;showAutoLabel:boolean;showWeakpointLabel:boolean;}
export function combatCuePriorityPolicy(input:CombatCuePriorityInput):CombatCuePriorityPolicy{
  if(input.damageSeverity==='critical')return{primary:'damage-critical',maxProjectileCues:2,showAutoLabel:false,showWeakpointLabel:false};
  if(Number.isFinite(input.bossSpecialTimer)&&input.bossSpecialTimer>=0&&input.bossSpecialTimer<=.75)return{primary:'boss-response',maxProjectileCues:3,showAutoLabel:false,showWeakpointLabel:true};
  if(input.damageSeverity==='heavy')return{primary:'damage-heavy',maxProjectileCues:4,showAutoLabel:true,showWeakpointLabel:true};
  return{primary:'normal',maxProjectileCues:6,showAutoLabel:true,showWeakpointLabel:true};
}

export type CombatAttentionPrimary='hero-critical'|'core-critical'|'boss-countdown'|CombatCuePriorityPolicy['primary'];
export interface CombatAttentionInput extends CombatCuePriorityInput{
  heroCritical:boolean;
  coreCritical:boolean;
  reducedFlash:boolean;
  reducedMotion?:boolean;
  bossCountdown?:number;
}
export interface CombatAttentionPolicy extends Omit<CombatCuePriorityPolicy,'primary'>{
  primary:CombatAttentionPrimary;
  heroWarningAnimated:boolean;
  coreWarningAnimated:boolean;
  criticalMotionAmplitude:number;
  bossAssistCompact:boolean;
  showBossAssistLabel:boolean;
  showBossAssistRing:boolean;
  showHeroWarning:boolean;
  showCoreWarning:boolean;
  showBossCountdown:boolean;
  bossCountdownAnimated:boolean;
  bossCountdownMotionAmplitude:number;
  openingPrepAnimated:boolean;
  showOpeningPrepLabel:boolean;
}

export function combatAttentionPolicy(input:CombatAttentionInput):CombatAttentionPolicy{
  const base=combatCuePriorityPolicy(input);
  const reducedMotion=input.reducedMotion??input.reducedFlash;
  const hpCritical=input.heroCritical||input.coreCritical;
  const bossResponseActive=Number.isFinite(input.bossSpecialTimer)&&input.bossSpecialTimer>=0&&input.bossSpecialTimer<=1.05;
  const bossCountdown=Number.isFinite(input.bossCountdown)?Math.max(0,input.bossCountdown??0):0;
  const bossCountdownActive=bossCountdown>0&&bossCountdown<=8;
  const openingPrepActive=bossCountdown>0&&bossCountdown<=12;
  const basePrimary:CombatAttentionPrimary=base.primary==='normal'&&bossCountdownActive?'boss-countdown':base.primary;
  const primary:CombatAttentionPrimary=input.heroCritical?'hero-critical':input.coreCritical?'core-critical':basePrimary;
  const heroWarningAnimated=input.heroCritical&&primary==='hero-critical'&&!reducedMotion;
  const coreWarningAnimated=input.coreCritical&&primary==='core-critical'&&!reducedMotion;
  const bossCountdownAnimated=bossCountdownActive&&primary==='boss-countdown'&&!reducedMotion;
  return{
    primary,
    maxProjectileCues:hpCritical?Math.max(1,Math.min(2,base.maxProjectileCues)):base.maxProjectileCues,
    showAutoLabel:hpCritical?false:base.showAutoLabel,
    showWeakpointLabel:hpCritical?false:base.showWeakpointLabel,
    heroWarningAnimated,
    coreWarningAnimated,
    criticalMotionAmplitude:(heroWarningAnimated||coreWarningAnimated)?0.20:0,
    bossAssistCompact:hpCritical&&bossResponseActive,
    showBossAssistLabel:bossResponseActive&&!hpCritical,
    showBossAssistRing:bossResponseActive,
    showHeroWarning:input.heroCritical,
    showCoreWarning:input.coreCritical,
    showBossCountdown:bossCountdownActive,
    bossCountdownAnimated,
    bossCountdownMotionAmplitude:bossCountdownAnimated?0.18:0,
    openingPrepAnimated:openingPrepActive&&primary==='normal'&&!reducedMotion,
    showOpeningPrepLabel:openingPrepActive,
  };
}

export type TargetGuidanceMotionOwner='weakpoint'|'auto-target'|'none';
export interface TargetGuidanceMotionInput{
  combatPrimary:CombatAttentionPrimary;
  reducedFlash:boolean;
  reducedMotion?:boolean;
  hasWeakpoint:boolean;
  hasAutoTarget:boolean;
}
export interface TargetGuidanceMotionPolicy{
  owner:TargetGuidanceMotionOwner;
  weakpointAnimated:boolean;
  autoTargetAnimated:boolean;
  weakpointMotionAmplitude:number;
  autoTargetMotionAmplitude:number;
}
export function targetGuidanceMotionPolicy(input:TargetGuidanceMotionInput):TargetGuidanceMotionPolicy{
  const reducedMotion=input.reducedMotion??input.reducedFlash;
  const motionAllowed=input.combatPrimary==='normal'&&!reducedMotion;
  const owner:TargetGuidanceMotionOwner=!motionAllowed?'none':input.hasWeakpoint?'weakpoint':input.hasAutoTarget?'auto-target':'none';
  return{
    owner,
    weakpointAnimated:owner==='weakpoint',
    autoTargetAnimated:owner==='auto-target',
    weakpointMotionAmplitude:owner==='weakpoint'?.08:0,
    autoTargetMotionAmplitude:owner==='auto-target'?.08:0,
  };
}

export type SecondaryCombatMotionOwner='boss-hazard'|'priority-threat'|'supply-crate'|'field-node'|'freeze-status'|'core-ambient'|'none';
export interface SecondaryCombatMotionInput{
  combatPrimary:CombatAttentionPrimary;
  reducedFlash:boolean;
  reducedMotion?:boolean;
  hasBossHazard:boolean;
  hasPriorityThreat:boolean;
  hasSupplyCrate:boolean;
  hasFieldNode:boolean;
  hasFreezeStatus:boolean;
  coreVisible:boolean;
}
export interface SecondaryCombatMotionPolicy{
  owner:SecondaryCombatMotionOwner;
  bossHazardMotionAmplitude:number;
  priorityThreatMotionAmplitude:number;
  supplyCrateMotionAmplitude:number;
  fieldNodeMotionAmplitude:number;
  freezeStatusMotionAmplitude:number;
  coreAmbientMotionAmplitude:number;
}
export function secondaryCombatMotionPolicy(input:SecondaryCombatMotionInput):SecondaryCombatMotionPolicy{
  const reducedMotion=input.reducedMotion??input.reducedFlash;
  const motionAllowed=input.combatPrimary==='normal'&&!reducedMotion;
  const owner:SecondaryCombatMotionOwner=!motionAllowed?'none'
    :input.hasBossHazard?'boss-hazard'
    :input.hasPriorityThreat?'priority-threat'
    :input.hasSupplyCrate?'supply-crate'
    :input.hasFieldNode?'field-node'
    :input.hasFreezeStatus?'freeze-status'
    :input.coreVisible?'core-ambient'
    :'none';
  return{
    owner,
    bossHazardMotionAmplitude:owner==='boss-hazard'?.08:0,
    priorityThreatMotionAmplitude:owner==='priority-threat'?.08:0,
    supplyCrateMotionAmplitude:owner==='supply-crate'?.06:0,
    fieldNodeMotionAmplitude:owner==='field-node'?.06:0,
    freezeStatusMotionAmplitude:owner==='freeze-status'?.08:0,
    coreAmbientMotionAmplitude:owner==='core-ambient'?.05:0,
  };
}


export type ResidualCombatMotionOwner='black-hole-vortex'|'terrain-crystal'|'golden-enemy'|'bomber-body'|'final-form-flow'|'none';
export interface ResidualCombatMotionInput{
  combatPrimary:CombatAttentionPrimary;
  reducedFlash:boolean;
  reducedMotion?:boolean;
  secondaryOwner:SecondaryCombatMotionOwner;
  hasBlackHole:boolean;
  hasTerrainCrystal:boolean;
  hasGoldenEnemy:boolean;
  hasBomber:boolean;
  finalFormFlowActive:boolean;
}
export interface ResidualCombatMotionPolicy{
  owner:ResidualCombatMotionOwner;
  blackHoleMotionAmplitude:number;
  terrainCrystalMotionAmplitude:number;
  goldenEnemyMotionAmplitude:number;
  bomberBodyMotionAmplitude:number;
  finalFormFlowMotionAmplitude:number;
}
export function residualCombatMotionPolicy(input:ResidualCombatMotionInput):ResidualCombatMotionPolicy{
  const reducedMotion=input.reducedMotion??input.reducedFlash;
  const motionAllowed=input.combatPrimary==='normal'&&!reducedMotion&&(input.secondaryOwner==='none'||input.secondaryOwner==='core-ambient');
  const owner:ResidualCombatMotionOwner=!motionAllowed?'none'
    :input.hasBlackHole?'black-hole-vortex'
    :input.hasTerrainCrystal?'terrain-crystal'
    :input.hasGoldenEnemy?'golden-enemy'
    :input.hasBomber?'bomber-body'
    :input.finalFormFlowActive?'final-form-flow'
    :'none';
  return{
    owner,
    blackHoleMotionAmplitude:owner==='black-hole-vortex'?.05:0,
    terrainCrystalMotionAmplitude:owner==='terrain-crystal'?.06:0,
    goldenEnemyMotionAmplitude:owner==='golden-enemy'?.05:0,
    bomberBodyMotionAmplitude:owner==='bomber-body'?.05:0,
    finalFormFlowMotionAmplitude:owner==='final-form-flow'?.05:0,
  };
}
