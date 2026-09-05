import test from 'node:test';
import assert from 'node:assert/strict';
import { combatAttentionPolicy } from '../dist/game/combat-cue-priority.js';
import { auditBossCountdownAttention } from '../dist/game/boss-countdown-attention-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

const policy=(overrides={})=>combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:0,reducedFlash:false,...overrides});

test('phase 1623-1630 boss countdown joins global combat attention priority below heavy damage',()=>{
  assert.equal(policy({bossCountdown:8}).primary,'boss-countdown');
  assert.equal(policy({damageSeverity:'heavy',bossCountdown:4}).primary,'damage-heavy');
  assert.equal(policy({bossSpecialTimer:.4,bossCountdown:4}).primary,'boss-response');
  assert.equal(policy({heroCritical:true,bossCountdown:1}).primary,'hero-critical');
  assert.equal(policy({coreCritical:true,bossCountdown:1}).primary,'core-critical');
  assert.equal(policy({damageSeverity:'critical',bossCountdown:1}).primary,'damage-critical');
});

test('phase 1631-1638 countdown remains visible but only animates when primary and reduced flash is off',()=>{
  const primary=policy({bossCountdown:4});
  assert.equal(primary.showBossCountdown,true);
  assert.equal(primary.bossCountdownAnimated,true);
  assert.ok(primary.bossCountdownMotionAmplitude>0);
  const secondary=policy({heroCritical:true,bossCountdown:4});
  assert.equal(secondary.showBossCountdown,true);
  assert.equal(secondary.bossCountdownAnimated,false);
  assert.equal(secondary.bossCountdownMotionAmplitude,0);
  const reduced=policy({bossCountdown:4,reducedFlash:true});
  assert.equal(reduced.showBossCountdown,true);
  assert.equal(reduced.bossCountdownAnimated,false);
  assert.equal(reduced.bossCountdownMotionAmplitude,0);
});

test('phase 1639-1654 opening prep stays visible but steady during countdown and clears at spawn',()=>{
  const countdown=policy({bossCountdown:8});
  assert.equal(countdown.openingPrepAnimated,false);
  assert.equal(countdown.showOpeningPrepLabel,true);
  const critical=policy({heroCritical:true,bossCountdown:8});
  assert.equal(critical.openingPrepAnimated,false);
  assert.equal(critical.showOpeningPrepLabel,true);
  const spawned=policy({bossCountdown:0,bossSpecialTimer:.5});
  assert.equal(spawned.showBossCountdown,false);
  assert.equal(spawned.bossCountdownAnimated,false);
  assert.equal(spawned.primary,'boss-response');
});

test('phase 1655-1660 deterministic boss countdown attention audit meets bounded targets',()=>{
  const audit=auditBossCountdownAttention();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,25);
  assert.ok(audit.maxAnimatedPrimaryWarnings<=1);
  assert.equal(audit.countdownVisibilityRate,1);
  assert.equal(audit.criticalCountdownMotionAmplitude,0);
  assert.equal(audit.reducedFlashCountdownMotionAmplitude,0);
  assert.equal(audit.staleCountdownReplayCount,0);
  assert.equal(audit.openingPrepDuplicateMotionCount,0);
  assert.equal(audit.reachableActionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});

test('phase 1661 release freeze and candidate fail closed when countdown attention evidence is false',()=>{
  const evidence=collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.bossCountdownAttentionPassed,true);
  assert.equal(evidence.releaseFreeze.bossCountdownAttentionSamples,25);
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,bossCountdownAttentionPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1662 candidate signature binds countdown attention evidence sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,bossCountdownAttentionSamples:evidence.releaseFreeze.bossCountdownAttentionSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
