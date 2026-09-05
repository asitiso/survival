import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { composeObjectiveCombatModifiers } from '../dist/game/build-modifiers.js';

test('objective temporary power and curse pressure compose through one bounded helper', () => {
  assert.deepEqual(composeObjectiveCombatModifiers(0), { spellPowerMultiplier: 1, spawnPressureMultiplier: 1 });
  assert.deepEqual(composeObjectiveCombatModifiers(10), { spellPowerMultiplier: 1.18, spawnPressureMultiplier: 1 });
  assert.deepEqual(composeObjectiveCombatModifiers(0, true), { spellPowerMultiplier: 1, spawnPressureMultiplier: 1.35 });
  const both = composeObjectiveCombatModifiers(10, true);
  assert.ok(both.spellPowerMultiplier <= 1.18);
  assert.ok(both.spawnPressureMultiplier <= 1.35);
});

test('game owns and resets battlefield objective systems and applies existing reward types', () => {
  const source = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /BattlefieldObjectiveDirector/);
  assert.match(source, /ObjectiveRuntime/);
  assert.match(source, /battlefieldObjectives\.reset\(\)/);
  assert.match(source, /objectiveRuntime\.reset\(\)/);
  assert.match(source, /shopToken/);
  assert.match(source, /temporaryPower/);
  assert.match(source, /drawBattlefieldObjective/);
});

test('phase 15 adds no new combat action ids', () => {
  const config = fs.readFileSync(new URL('../src/game/config.ts', import.meta.url), 'utf8');
  for (const id of ['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']) assert.match(config, new RegExp(id));
  assert.doesNotMatch(config, /objectiveButton|interactButton|altarButton/);
});
