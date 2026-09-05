import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { mythicArenaGeometryProfile } from '../dist/game/endless/mythic-arena-geometry.js';
import { openingCombatPacing } from '../dist/game/opening-pacing.js';
import { longRunComfortPolicy } from '../dist/game/endless/long-run-comfort.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const arena=fs.readFileSync(new URL('../src/game/boss-arena.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 123-142 keeps exactly nine combat actions and adds no new control surface',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.deepEqual(ACTION_BUTTONS.map((x)=>x.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
  assert.doesNotMatch(game,/flowButton|comfortButton|openingPacingButton|arenaGeometryButton/);
});

test('mythic geometry is wired into BossArena placement and render paths',()=>{
  assert.match(game,/mythicArenaGeometryProfile\(/);
  assert.match(game,/geometryShape/);
  assert.match(arena,/ctx\.geometry/);
  const full=mythicArenaGeometryProfile('twinMaw',0);
  const relieved=mythicArenaGeometryProfile('twinMaw',1);
  assert.ok(relieved.pressure<full.pressure);
});

test('Final Form flow is transient, cast-driven, and intentionally absent from snapshot schema',()=>{
  assert.match(game,/recordFinalFormFlowCast\(/);
  assert.match(game,/finalFormFlowModifiers\(/);
  assert.match(game,/advanceFinalFormFlow\(/);
  assert.doesNotMatch(snapshot,/finalFormFlow/);
});

test('opening pacing ends at ten minutes and does not modify shop or enemy budget contracts',()=>{
  assert.equal(openingCombatPacing(601).band,'standard');
  assert.equal(openingCombatPacing(300).shopIntervalMultiplier,1);
  assert.equal(openingCombatPacing(300).enemyBudgetMultiplier,1);
  assert.match(game,/openingPacing\.spawnPressureMultiplier/);
  assert.match(game,/openingReward/);
});

test('deep long-run comfort reduces decorative density while telegraph and combat pressure stay intact',()=>{
  const policy=longRunComfortPolicy(8*3600);
  assert.ok(policy.vfxDensity<1);
  assert.equal(policy.dangerTelegraphMultiplier,1);
  assert.equal(policy.enemyPressureMultiplier,1);
  assert.match(game,/prioritizeLandscapeBuildLabels\(/);
  assert.match(game,/comfort\.vfxDensity/);
});
