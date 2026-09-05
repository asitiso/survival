import test from 'node:test';
import assert from 'node:assert/strict';
import { auditStrategicInputReliability } from '../dist/game/strategic-input-reliability-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1341 release freeze includes deterministic strategic input reliability evidence',()=>{
  const strategic=auditStrategicInputReliability();
  const freeze=auditReleaseFreeze();
  assert.equal(strategic.passed,true);
  assert.equal(freeze.strategicInputReliabilityPassed,true);
  assert.equal(freeze.strategicInputReliabilitySamples,strategic.samples);
});

test('phase 1342 candidate fails closed when strategic input reliability evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,strategicInputReliabilityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1342 candidate signature binds strategic input reliability samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,strategicInputReliabilitySamples:evidence.releaseFreeze.strategicInputReliabilitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
