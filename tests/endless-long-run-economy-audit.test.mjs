import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLongRunEconomy } from '../dist/game/endless/long-run-reward-density.js';

test('phase 335 long-run economy audit covers drought healthy and saturated scenarios from two to twelve hours',()=>{
  const audit=auditLongRunEconomy();
  assert.deepEqual(audit.minutes,[120,180,240,360,480,600,720]);
  assert.equal(audit.checkpoints.length,21);
  assert.deepEqual([...new Set(audit.checkpoints.map((point)=>point.scenario))],['drought','healthy','saturated']);
});

test('phase 336 every audited Gold and XP multiplier stays inside the release bound',()=>{
  const audit=auditLongRunEconomy();
  assert.equal(audit.bounded,true);
  assert.ok(audit.checkpoints.every((point)=>point.goldMultiplier>=1&&point.goldMultiplier<=1.08));
  assert.ok(audit.checkpoints.every((point)=>point.xpMultiplier>=1&&point.xpMultiplier<=1.08));
});

test('phase 337 saturated economy always damps to neutral and XP never outgrows Gold',()=>{
  const audit=auditLongRunEconomy();
  assert.equal(audit.saturatedNeutral,true);
  assert.equal(audit.xpBalanced,true);
  for(const point of audit.checkpoints.filter((point)=>point.scenario==='saturated')){
    assert.equal(point.goldMultiplier,1);
    assert.equal(point.xpMultiplier,1);
  }
});

test('phase 338 drought correction has no late-game multiplier spike through twelve hours',()=>{
  const audit=auditLongRunEconomy();
  assert.equal(audit.noLateSpike,true);
  assert.ok(audit.maxAdjacentGoldDelta<=.02);
  assert.ok(audit.maxAdjacentXpDelta<=.02);
  assert.equal(audit.passed,true);
});
