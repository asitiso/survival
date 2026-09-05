import test from 'node:test';
import assert from 'node:assert/strict';
import { auditJoystickNeutralRecovery } from '../dist/game/joystick-neutral-recovery-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1301 release freeze includes deterministic joystick neutral recovery evidence',()=>{
  const neutral=auditJoystickNeutralRecovery();
  const freeze=auditReleaseFreeze();
  assert.equal(neutral.passed,true);
  assert.equal(freeze.joystickNeutralRecoveryPassed,true);
  assert.equal(freeze.joystickNeutralRecoverySamples,neutral.samples);
});

test('phase 1302 candidate fails closed when joystick neutral recovery evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,joystickNeutralRecoveryPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1302 candidate signature binds joystick neutral recovery samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,joystickNeutralRecoverySamples:evidence.releaseFreeze.joystickNeutralRecoverySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
