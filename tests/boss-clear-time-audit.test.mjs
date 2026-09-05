import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFirstSixBosses, firstSixBossCheckpoints } from '../dist/game/boss-clear-time-audit.js';

test('phase 327 first six boss audit follows the runtime boss cadence and records six checkpoints',()=>{
  const points=firstSixBossCheckpoints();
  assert.equal(points.length,6);
  assert.deepEqual(points.map((point)=>point.ordinal),[0,1,2,3,4,5]);
  assert.ok(points.every((point,index)=>index===0||point.spawnSecond>points[index-1].spawnSecond));
  assert.ok(points.every((point)=>point.clearSeconds>0));
});

test('phase 328 first three eased bosses transition into neutral bosses four through six',()=>{
  const points=firstSixBossCheckpoints();
  assert.ok(points[0].healthMultiplier<1);
  assert.ok(points[1].healthMultiplier<1);
  assert.ok(points[2].healthMultiplier<1);
  for(const point of points.slice(3)){
    assert.equal(point.healthMultiplier,1);
    assert.equal(point.damageMultiplier,1);
    assert.equal(point.specialTimerMultiplier,1);
  }
});

test('phase 329 clear time and normalized difficulty grow without a single release-blocking spike',()=>{
  const audit=auditFirstSixBosses();
  assert.equal(audit.clearTimesBounded,true);
  assert.equal(audit.difficultySlopeBounded,true);
  assert.equal(audit.lateNeutral,true);
  assert.ok(audit.maxClearTimeRatio<=1.35);
  assert.ok(audit.maxDifficultyRatio<=1.5);
  assert.equal(audit.passed,true);
});

test('phase 330 boss clear audit keeps all six estimated clears inside a readable 15 to 60 second window',()=>{
  const audit=auditFirstSixBosses();
  assert.ok(audit.checkpoints.every((point)=>point.clearSeconds>=15&&point.clearSeconds<=60));
});
