import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMidgameBuildVelocity } from '../dist/game/midgame-build-velocity-audit.js';

test('phase 595 midgame velocity audit covers every hero archetype and threat combination',()=>{
  const a=auditMidgameBuildVelocity();
  assert.equal(a.combinations,48);
  assert.ok(a.samples>=144);
});

test('phase 596 every modeled build keeps meaningful progress from fifteen to twenty minutes',()=>{
  const a=auditMidgameBuildVelocity();
  assert.ok(a.minFifteenToTwentyGain>=.08);
  assert.ok(a.minTwentyMinuteProgress>=.85);
});

test('phase 597 all modeled coherent builds complete by twenty-five minutes without threat slowdown',()=>{
  const a=auditMidgameBuildVelocity();
  assert.ok(a.maxCompletionMinute<=25);
  assert.equal(a.threatParity,true);
  assert.equal(a.passed,true);
});

test('phase 598 build velocity audit is read-only and does not change action or snapshot surface',()=>{
  const a=auditMidgameBuildVelocity();
  assert.equal(a.actionCount,9);
  assert.equal(a.snapshotMutation,false);
});
