import test from 'node:test';
import assert from 'node:assert/strict';
import { thumbFatigueAudit } from '../dist/core/thumb-fatigue-audit.js';

test('phase 479 long-drag audit samples sustained movement in four directions instead of one idealized drag',()=>{
  const audit=thumbFatigueAudit();
  assert.equal(audit.paths,4);
  assert.ok(audit.samples>=80);
});

test('phase 480 soft-follow reduces cumulative thumb extension burden by a material amount',()=>{
  const audit=thumbFatigueAudit();
  assert.ok(audit.reachBurdenReduction>=.25);
  assert.ok(audit.softFollowAverageReach<audit.fixedAverageReach);
});

test('phase 481 sustained drags stay inside the configured comfort radius without runaway anchor drift',()=>{
  const audit=thumbFatigueAudit();
  assert.ok(audit.maxSoftReach<=audit.maxReach+1e-6);
  assert.ok(audit.maxAnchorShift<=96);
});

test('phase 482 thumb-fatigue audit passes without changing action buttons or adding another input mode',()=>{
  const audit=thumbFatigueAudit();
  assert.equal(audit.passed,true);
  assert.deepEqual(audit.issues,[]);
  assert.deepEqual(Object.keys(audit).sort(),['fixedAverageReach','issues','maxAnchorShift','maxReach','maxSoftReach','passed','paths','reachBurdenReduction','samples','softFollowAverageReach'].sort());
});
