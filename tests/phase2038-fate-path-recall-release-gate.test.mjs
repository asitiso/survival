import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2038 release freeze binds fate path recall evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.fatePathRecallAssetsPassed,true); assert.equal(freeze.fatePathRecallAssetsSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2038 candidate fails closed on forged fate recall evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.fatePathRecallAssetsPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.fatePathRecallAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/fate-path-recall-assets safe \(60\)/);
});
