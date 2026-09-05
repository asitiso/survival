import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFirstThirtyFlowHealth } from '../dist/game/first-thirty-flow-health-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 599 thirty-minute flow health composes opening midgame shop boss-goal and build-velocity evidence',()=>{
  const a=auditFirstThirtyFlowHealth();
  assert.equal(a.childAuditCount,4);
  assert.ok(a.samples>=100);
});

test('phase 600 zero-to-thirty flow materially reduces modeled decision pause without combat-stat inflation',()=>{
  const a=auditFirstThirtyFlowHealth();
  assert.ok(a.estimatedDecisionPauseReduction>=.35);
  assert.equal(a.maxCombatStatInflation,0);
});

test('phase 601 thirty-minute flow preserves nine actions and snapshot schema and passes release thresholds',()=>{
  const a=auditFirstThirtyFlowHealth();
  assert.equal(a.actionCount,9);
  assert.equal(a.snapshotMutation,false);
  assert.equal(a.passed,true);
});

test('phase 602 candidate fails closed when zero-to-thirty flow health regresses',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,firstThirtyFlowHealth:{...evidence.firstThirtyFlowHealth,passed:false}};
  const audit=releaseCandidateAudit(broken);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('first-thirty-flow-health'));
});
