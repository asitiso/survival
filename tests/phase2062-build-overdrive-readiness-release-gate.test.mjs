import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2062 release freeze binds build overdrive readiness recall evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.buildOverdriveReadinessRecallPassed,true); assert.equal(freeze.buildOverdriveReadinessRecallSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2062 candidate fails closed on forged overdrive readiness evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.buildOverdriveReadinessRecallPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.buildOverdriveReadinessRecallSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/build-overdrive-readiness-recall safe \(60\)/);
});
