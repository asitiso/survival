import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleasePlayJourney } from '../dist/game/release-play-journey-audit.js';

test('phase 703 release play journey covers every hero archetype threat combination from 20 to 30 minutes',()=>{
  const audit=auditReleasePlayJourney();
  assert.equal(audit.combinations,48);
  assert.deepEqual(audit.checkpoints,[20,25,30]);
  assert.equal(audit.samples,144);
});
test('phase 704 release play journey reaches a coherent core build before the first half-hour closes',()=>{
  const audit=auditReleasePlayJourney();
  assert.ok(audit.minTwentyMinuteProgress>=.85);
  assert.ok(audit.maxCompletionMinute<=25);
  assert.equal(audit.buildVelocityPassed,true);
});
test('phase 705 release play journey preserves nine actions and has no modeled blocking dead ends',()=>{
  const audit=auditReleasePlayJourney();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.blockingDeadEnds,0);
  assert.equal(audit.snapshotMutation,false);
});
test('phase 706 release play journey smoke passes the launch bounds',()=>{
  assert.equal(auditReleasePlayJourney().passed,true);
});
