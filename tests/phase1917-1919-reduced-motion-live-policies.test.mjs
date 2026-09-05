import test from 'node:test';
import assert from 'node:assert/strict';
import { secondaryCombatMotionPolicy, residualCombatMotionPolicy } from '../dist/game/combat-cue-priority.js';
import { actionCuePresentation } from '../dist/game/hud-presentation.js';
import { bossPressureEnvelope } from '../dist/game/visual-presence.js';

const secondary=(overrides={})=>secondaryCombatMotionPolicy({
  combatPrimary:'normal',reducedFlash:false,reducedMotion:false,
  hasBossHazard:false,hasPriorityThreat:false,hasSupplyCrate:false,hasFieldNode:false,hasFreezeStatus:false,coreVisible:false,
  ...overrides,
});
const residual=(overrides={})=>residualCombatMotionPolicy({
  combatPrimary:'normal',reducedFlash:false,reducedMotion:false,secondaryOwner:'none',
  hasBlackHole:false,hasTerrainCrystal:false,hasGoldenEnemy:false,hasBomber:false,finalFormFlowActive:false,
  ...overrides,
});

test('phase 1917 secondary and residual owners preserve flash-only motion but stop under motion-low',()=>{
  const secondaryFlashOnly=secondary({reducedFlash:true,reducedMotion:false,hasBossHazard:true});
  assert.equal(secondaryFlashOnly.owner,'boss-hazard');
  assert.equal(secondaryFlashOnly.bossHazardMotionAmplitude,0.08);
  const secondaryLow=secondary({reducedFlash:false,reducedMotion:true,hasBossHazard:true});
  assert.equal(secondaryLow.owner,'none');
  assert.equal(secondaryLow.bossHazardMotionAmplitude,0);

  const residualFlashOnly=residual({reducedFlash:true,reducedMotion:false,hasBlackHole:true});
  assert.equal(residualFlashOnly.owner,'black-hole-vortex');
  assert.equal(residualFlashOnly.blackHoleMotionAmplitude,0.05);
  const residualLow=residual({reducedFlash:false,reducedMotion:true,hasBlackHole:true});
  assert.equal(residualLow.owner,'none');
  assert.equal(residualLow.blackHoleMotionAmplitude,0);
});

test('phase 1918 assist and ultimate-ready outer rings use reducedMotion, not flash, for animation',()=>{
  const assistFlashOnly=actionCuePresentation({assistActive:true,queued:false,readyPulseRequested:false,readyPulseActive:false,reducedFlash:true,reducedMotion:false});
  assert.equal(assistFlashOnly.outerCue,'assist');
  assert.equal(assistFlashOnly.animated,true);
  assert.equal(assistFlashOnly.motionAmplitude,0.05);
  const assistLow=actionCuePresentation({assistActive:true,queued:false,readyPulseRequested:false,readyPulseActive:false,reducedFlash:false,reducedMotion:true});
  assert.equal(assistLow.outerCue,'assist');
  assert.equal(assistLow.animated,false);
  assert.equal(assistLow.showAssistLabel,true);

  const readyFlashOnly=actionCuePresentation({assistActive:false,queued:false,readyPulseRequested:true,readyPulseActive:true,reducedFlash:true,reducedMotion:false});
  assert.equal(readyFlashOnly.outerCue,'ready');
  assert.equal(readyFlashOnly.animated,true);
  const readyLow=actionCuePresentation({assistActive:false,queued:false,readyPulseRequested:true,readyPulseActive:true,reducedFlash:false,reducedMotion:true});
  assert.equal(readyLow.outerCue,'ready');
  assert.equal(readyLow.animated,false);
  assert.equal(readyLow.motionAmplitude,0);
});

test('phase 1919 boss health pressure envelope stays visible but becomes steady under reduced motion',()=>{
  const moving=bossPressureEnvelope('inferno',0.18,0.1,'high',true,false);
  const movingLater=bossPressureEnvelope('inferno',0.18,0.3,'high',true,false);
  assert.notDeepEqual(moving,movingLater);
  const steady=bossPressureEnvelope('inferno',0.18,0.1,'high',false,true);
  const steadyLater=bossPressureEnvelope('inferno',0.18,0.3,'high',false,true);
  assert.deepEqual(steady,steadyLater);
  assert.ok(steady.edgeScale>0);
  assert.ok(steady.glowScale>0);
});
