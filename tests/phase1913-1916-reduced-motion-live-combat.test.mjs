import test from 'node:test';
import assert from 'node:assert/strict';
import * as combat from '../dist/game/combat-cue-priority.js';
import { objectiveMarkerMotionPolicy } from '../dist/game/tactical-status-attention.js';

const attention=(overrides={})=>combat.combatAttentionPolicy({
  heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:0,
  reducedFlash:false,reducedMotion:false,...overrides,
});

test('phase 1913 primary combat motion follows reducedMotion independently from reducedFlash',()=>{
  const flashOnly=attention({heroCritical:true,reducedFlash:true,reducedMotion:false});
  assert.equal(flashOnly.primary,'hero-critical');
  assert.equal(flashOnly.heroWarningAnimated,true);
  assert.equal(flashOnly.criticalMotionAmplitude,0.20);

  const motionLow=attention({heroCritical:true,reducedFlash:false,reducedMotion:true});
  assert.equal(motionLow.showHeroWarning,true);
  assert.equal(motionLow.heroWarningAnimated,false);
  assert.equal(motionLow.criticalMotionAmplitude,0);

  const countdownFlashOnly=attention({bossCountdown:4,reducedFlash:true,reducedMotion:false});
  assert.equal(countdownFlashOnly.bossCountdownAnimated,true);
  assert.equal(countdownFlashOnly.bossCountdownMotionAmplitude,0.18);

  const countdownMotionLow=attention({bossCountdown:4,reducedFlash:false,reducedMotion:true});
  assert.equal(countdownMotionLow.showBossCountdown,true);
  assert.equal(countdownMotionLow.bossCountdownAnimated,false);
  assert.equal(countdownMotionLow.bossCountdownMotionAmplitude,0);
});

test('phase 1914 opening prep, auto target, weakpoint and objective motion obey reducedMotion',()=>{
  const prep=attention({bossCountdown:10,reducedFlash:true,reducedMotion:false});
  assert.equal(prep.openingPrepAnimated,true);
  const prepLow=attention({bossCountdown:10,reducedFlash:false,reducedMotion:true});
  assert.equal(prepLow.showOpeningPrepLabel,true);
  assert.equal(prepLow.openingPrepAnimated,false);

  const autoFlashOnly=combat.targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:true,reducedMotion:false,hasWeakpoint:false,hasAutoTarget:true});
  assert.equal(autoFlashOnly.owner,'auto-target');
  assert.equal(autoFlashOnly.autoTargetMotionAmplitude,0.08);
  const weakLow=combat.targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:false,reducedMotion:true,hasWeakpoint:true,hasAutoTarget:true});
  assert.equal(weakLow.owner,'none');
  assert.equal(weakLow.weakpointMotionAmplitude,0);

  const objectiveFlashOnly=objectiveMarkerMotionPolicy({combatPrimary:'normal',reducedFlash:true,reducedMotion:false,active:true});
  assert.equal(objectiveFlashOnly.animated,true);
  const objectiveLow=objectiveMarkerMotionPolicy({combatPrimary:'normal',reducedFlash:false,reducedMotion:true,active:true});
  assert.equal(objectiveLow.animated,false);
  assert.equal(objectiveLow.motionAmplitude,0);
});
