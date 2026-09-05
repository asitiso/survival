import test from 'node:test';
import assert from 'node:assert/strict';
import * as combat from '../dist/game/combat-cue-priority.js';

test('phase 1663-1670 target guidance exposes a single motion owner below combat attention',()=>{
  assert.equal(typeof combat.targetGuidanceMotionPolicy,'function');
  const normal=combat.targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:false,hasWeakpoint:true,hasAutoTarget:true});
  assert.equal(normal.owner,'weakpoint');
  assert.equal(normal.weakpointAnimated,true);
  assert.equal(normal.autoTargetAnimated,false);
  const autoOnly=combat.targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:false,hasWeakpoint:false,hasAutoTarget:true});
  assert.equal(autoOnly.owner,'auto-target');
  assert.equal(autoOnly.autoTargetAnimated,true);
});

import { readFileSync } from 'node:fs';

const motion=(overrides={})=>combat.targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:false,hasWeakpoint:true,hasAutoTarget:true,...overrides});

test('phase 1671-1686 combat warnings and reduced flash make all target guidance steady',()=>{
  for(const combatPrimary of ['hero-critical','core-critical','damage-critical','boss-response','damage-heavy','boss-countdown']){
    const p=motion({combatPrimary});
    assert.equal(p.owner,'none',combatPrimary);
    assert.equal(p.weakpointMotionAmplitude,0,combatPrimary);
    assert.equal(p.autoTargetMotionAmplitude,0,combatPrimary);
  }
  const reduced=motion({reducedFlash:true});
  assert.equal(reduced.owner,'none');
  assert.equal(reduced.weakpointMotionAmplitude,0);
  assert.equal(reduced.autoTargetMotionAmplitude,0);
});

test('phase 1671-1686 game rendering consumes target guidance policy instead of unconditional target pulses',()=>{
  const source=readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/targetGuidanceMotionPolicy/);
  assert.match(source,/autoTargetMotionAmplitude/);
  assert.match(source,/weakpointMotionAmplitude/);
  assert.doesNotMatch(source,/const pulse=1\+Math\.sin\(this\.elapsed\*8\)\*\.08/);
  assert.doesNotMatch(source,/const pulse=1\+Math\.sin\(this\.elapsed\*7\+node\.id\)\*\.08/);
});

test('phase 1701 release freeze exposes target guidance attention evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.targetGuidanceAttentionPassed,true);
  assert.equal(evidence.releaseFreeze.targetGuidanceAttentionSamples,25);
});

test('phase 1695-1700 deterministic target guidance audit meets bounded targets',async()=>{
  const auditModule=await import('../dist/game/target-guidance-attention-audit.js');
  const audit=auditModule.auditTargetGuidanceAttention();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,25);
  assert.ok(audit.maxAnimatedOwners<=1);
  assert.equal(audit.criticalMotionAmplitude,0);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.equal(audit.duplicateMotionCount,0);
  assert.equal(audit.staleMotionReplayCount,0);
  assert.equal(audit.targetVisibilityRate,1);
  assert.equal(audit.reachableActionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});

test('phase 1701 candidate fails closed when target guidance evidence is forged false under top-level PASS',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,targetGuidanceAttentionPassed:false,passed:true}};
  const result=release.releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1702 candidate signature binds target guidance attention sample count',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  const healthy=release.releaseCandidateAudit(evidence);
  const changed=release.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,targetGuidanceAttentionSamples:evidence.releaseFreeze.targetGuidanceAttentionSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
  assert.match(healthy.markdown,/target-guidance-attention safe \(25\)/);
});
