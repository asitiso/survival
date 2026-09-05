import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCombatHapticArbitration } from '../dist/game/combat-haptic-arbitration-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1621 release freeze includes deterministic combat haptic arbitration evidence',()=>{
  const haptic=auditCombatHapticArbitration();
  const freeze=auditReleaseFreeze();
  assert.equal(haptic.passed,true);
  assert.equal(freeze.combatHapticArbitrationPassed,true);
  assert.equal(freeze.combatHapticArbitrationSamples,haptic.samples.length);
});

test('phase 1622 candidate fails closed when combat haptic arbitration evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,combatHapticArbitrationPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1622 candidate signature binds combat haptic arbitration sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,combatHapticArbitrationSamples:evidence.releaseFreeze.combatHapticArbitrationSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
