import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { thermalBudgetPolicy } from '../dist/game/endless/thermal-budget-director.js';
import { createThermalRecoveryState, advanceThermalRecovery, thermalPolicyForEffectiveTier, auditThermalRecoveryHysteresis } from '../dist/game/endless/thermal-recovery-hysteresis.js';

function repeat(state,tier,count){let next=state;for(let i=0;i<count;i++)next=advanceThermalRecovery(next,tier);return next;}

test('phase 331 thermal escalation requires sustained stress but rises faster than recovery',()=>{
  let state=createThermalRecoveryState();
  state=repeat(state,'hot',44);
  assert.equal(state.tier,'cool');
  state=advanceThermalRecovery(state,'hot');
  assert.equal(state.tier,'warm');
  state=repeat(state,'hot',45);
  assert.equal(state.tier,'hot');
  state=repeat(state,'cool',239);
  assert.equal(state.tier,'hot');
  state=advanceThermalRecovery(state,'cool');
  assert.equal(state.tier,'warm');
});

test('phase 332 a brief recovered or stressed sample cannot flap the effective thermal tier',()=>{
  let hot=createThermalRecoveryState('hot');
  hot=advanceThermalRecovery(hot,'cool');
  assert.equal(hot.tier,'hot');
  let cool=createThermalRecoveryState('cool');
  cool=advanceThermalRecovery(cool,'hot');
  assert.equal(cool.tier,'cool');
});

test('phase 333 effective thermal policy changes presentation only and preserves danger and logic',()=>{
  const base=thermalBudgetPolicy({elapsedSeconds:28800,fps:60,adaptivePressure:.1,frameGovernorTier:'full',deviceClass:'high'});
  const hot=thermalPolicyForEffectiveTier(base,'hot');
  assert.equal(hot.tier,'hot');
  assert.equal(hot.enemyLogicMultiplier,1);
  assert.equal(hot.telegraphMultiplier,1);
  assert.ok(hot.particleCapMultiplier<base.particleCapMultiplier);
  assert.ok(hot.trailCapMultiplier<base.trailCapMultiplier);
});

test('phase 334 hysteresis audit passes and Game keeps the state transient outside snapshots',()=>{
  const audit=auditThermalRecoveryHysteresis();
  assert.equal(audit.fastEscalation,true);
  assert.equal(audit.slowRecovery,true);
  assert.equal(audit.noFlapping,true);
  assert.equal(audit.logicPreserved,true);
  assert.equal(audit.passed,true);
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/thermalRecoveryState/);
  assert.match(source,/advanceThermalRecovery/);
  assert.match(source,/thermalPolicyForEffectiveTier/);
  assert.doesNotMatch(source,/endlessState\.thermalRecovery/);
});
