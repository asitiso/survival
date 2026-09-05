import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningFlowFriction } from '../dist/game/opening-flow-friction-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 559 opening friction audit measures the run-start through first-boss convenience path',()=>{
  const a=auditOpeningFlowFriction();
  assert.ok(a.samples>=12);
  assert.equal(a.autoTapReduction,1);
});

test('phase 560 recommendation and early shop fast path cover every modeled actionable opening state',()=>{
  const a=auditOpeningFlowFriction();
  assert.equal(a.upgradeRecommendationCoverage,1);
  assert.equal(a.bossPrepCoverage,1);
  assert.ok(a.shopPointerTravelReduction>=.45);
});

test('phase 561 opening flow improves materially without adding action or snapshot surface',()=>{
  const a=auditOpeningFlowFriction();
  assert.equal(a.actionCount,9);
  assert.equal(a.snapshotMutation,false);
  assert.ok(a.estimatedFrictionReduction>=.3);
  assert.equal(a.passed,true);
});

test('phase 562 candidate fails closed when opening friction evidence regresses',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,openingFlowFriction:{...evidence.openingFlowFriction,passed:false}};
  const audit=releaseCandidateAudit(broken);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('opening-flow-friction'));
});
