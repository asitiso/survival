import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLongRunControlHudIntegration } from '../dist/game/long-run-control-hud-integration-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 535 long-run integration audit covers 2 4 8 and 12 hour HUD and input checkpoints',()=>{
  const a=auditLongRunControlHudIntegration();
  assert.deepEqual(a.hours,[2,4,8,12]);
  assert.ok(a.checkpoints.length>=12);
});
test('phase 536 long-run HUD relief preserves all critical bars and danger telegraphs',()=>{
  const a=auditLongRunControlHudIntegration();
  assert.equal(a.criticalBarLossCount,0);
  assert.equal(a.dangerTelegraphLossCount,0);
});
test('phase 537 every long-run checkpoint keeps nine reachable actions and sustained-drag relief',()=>{
  const a=auditLongRunControlHudIntegration();
  assert.equal(a.minReachableActions,9);
  assert.ok(a.minReachBurdenReduction>=.25);
  assert.equal(a.hingeCrossingCount,0);
});
test('phase 538 release candidate fails closed when long-run controls or HUD regress',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const failed={...evidence,longRunControlHud:{...evidence.longRunControlHud,passed:false,issues:['forced-long-run-control']}};
  const audit=releaseCandidateAudit(failed);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('long-run-control-hud'));
});
