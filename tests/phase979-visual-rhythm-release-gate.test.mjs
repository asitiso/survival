import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVisualEffectsSafety } from '../dist/game/visual-effects-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 979 visual release audit includes bounded visual rhythm evidence',()=>{
  const visual=auditVisualEffectsSafety();
  assert.equal(visual.visualRhythmPassed,true);
  assert.ok(visual.visualRhythmSamples>=80);
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.visualRhythmPassed,true);
  assert.equal(freeze.visualRhythmSamples,visual.visualRhythmSamples);
});

test('phase 979 candidate fails closed when visual rhythm evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,visualRhythmPassed:false,passed:true}};
  const audit=releaseCandidateAudit(broken);
  assert.equal(audit.ok,false);
  assert.ok(audit.issues.includes('release-freeze'));
});
