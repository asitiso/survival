import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('game owns resets and updates arcane combo runtime from the real build', () => {
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/ComboRuntime/);
  assert.match(source,/analyzeArcaneCombo/);
  assert.match(source,/comboRuntime\.reset\(\)/);
  assert.match(source,/comboRuntime\.update/);
  assert.match(source,/drawArcaneComboHud/);
});

test('end run includes battlefield objective boss weakpoint and combo recap in tactical score', () => {
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/calculateTacticalScoreBonus/);
  assert.match(source,/objectiveRuntime\.stats/);
  assert.match(source,/bossEncounterNodesDestroyed/);
  assert.match(source,/highestCombo/);
  assert.match(source,/tacticalRecap/);
});

test('phase 17 keeps the combat action surface unchanged', () => {
  const config=fs.readFileSync(new URL('../src/game/config.ts',import.meta.url),'utf8');
  assert.doesNotMatch(config,/comboButton|objectiveButton|weakpointButton/);
});
