import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCombatAttentionArbitration } from '../dist/game/combat-attention-arbitration-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1541 release freeze includes deterministic combat attention arbitration evidence',()=>{
  const attention=auditCombatAttentionArbitration();
  const freeze=auditReleaseFreeze();
  assert.equal(attention.passed,true);
  assert.equal(freeze.combatAttentionArbitrationPassed,true);
  assert.equal(freeze.combatAttentionArbitrationSamples,attention.samples.length);
});

test('phase 1542 candidate fails closed when combat attention evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,combatAttentionArbitrationPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1542 candidate signature binds combat attention sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,combatAttentionArbitrationSamples:evidence.releaseFreeze.combatAttentionArbitrationSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
