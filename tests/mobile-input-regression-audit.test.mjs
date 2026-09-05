import test from 'node:test';
import assert from 'node:assert/strict';
import { mobileInputRegressionAudit } from '../dist/game/mobile-input-regression-audit.js';
import { releaseCandidateAudit, collectReleaseCandidateEvidence } from '../dist/game/release-candidate-audit.js';
test('phase 499 mobile input regression audit covers sustained drag and all nine action buttons',()=>{
  const audit=mobileInputRegressionAudit();assert.equal(audit.actionCount,9);assert.ok(audit.dragSamples>=96);assert.ok(audit.profiles>=3);
});
test('phase 500 mobile input regression audit preserves reachability and hinge safety',()=>{
  const audit=mobileInputRegressionAudit();assert.equal(audit.reachableActionCount,9);assert.equal(audit.hingeClear,true);assert.equal(audit.issues.length,0);
});
test('phase 501 mobile input regression audit preserves thumb relief without moving visible action coordinates',()=>{
  const audit=mobileInputRegressionAudit();assert.ok(audit.reachBurdenReduction>=.25);assert.ok(audit.maxSoftReach<=92.001);assert.equal(audit.actionLayoutMutation,false);
});
test('phase 502 release candidate fails closed when the mobile input regression gate fails',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const failed={...evidence,mobileInputRegression:{...evidence.mobileInputRegression,passed:false,issues:['forced-input-regression']}};
  const audit=releaseCandidateAudit(failed);assert.equal(audit.status,'REVIEW');assert.ok(audit.issues.includes('mobile-input-regression'));
});
