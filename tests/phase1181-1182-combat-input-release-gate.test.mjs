import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCombatInputReliability } from '../dist/game/combat-input-reliability-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1181 release freeze includes deterministic combat input reliability evidence',()=>{
  const input=auditCombatInputReliability();
  const freeze=auditReleaseFreeze();
  assert.equal(input.passed,true);
  assert.equal(freeze.combatInputReliabilityPassed,true);
  assert.equal(freeze.combatInputReliabilitySamples,input.samples);
});

test('phase 1182 candidate fails closed when combat input evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,combatInputReliabilityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1182 candidate signature binds combat input reliability samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,combatInputReliabilitySamples:evidence.releaseFreeze.combatInputReliabilitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
