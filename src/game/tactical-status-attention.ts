import type { CombatAttentionPrimary } from './combat-cue-priority.js';

export interface ObjectiveMarkerMotionInput {
  combatPrimary:CombatAttentionPrimary;
  reducedFlash:boolean;
  reducedMotion?:boolean;
  active:boolean;
}

export interface ObjectiveMarkerMotionPolicy {
  animated:boolean;
  motionAmplitude:number;
}

export function objectiveMarkerMotionPolicy(input:ObjectiveMarkerMotionInput):ObjectiveMarkerMotionPolicy {
  const reducedMotion=input.reducedMotion??input.reducedFlash;
  const animated=input.active&&input.combatPrimary==='normal'&&!reducedMotion;
  return {animated,motionAmplitude:animated?0.05:0};
}
