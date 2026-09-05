import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('Phase 1944 release freeze binds battlefield environment identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.battlefieldEnvironmentAssetsPassed,true);
  assert.equal(freeze.battlefieldEnvironmentAssetsSamples,45);
  assert.equal(freeze.passed,true);
});

test('Phase 1944 candidate fails closed on forged battlefield evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit();
  assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence);
  forged.releaseFreeze.battlefieldEnvironmentAssetsPassed=false;
  forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged);
  assert.notEqual(rejected.status,'PASS');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);
  changed.releaseFreeze.battlefieldEnvironmentAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
});
