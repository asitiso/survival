import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMissionRewardToState, composeEnemyPressure } from '../dist/game/phase9-runtime.js';

const baseEquipment = { coins: 200, weapon: null, armor: null, healingPotions: 1 };

test('mission rewards reuse existing shop token gold and potion state without new currencies', () => {
  const token = applyMissionRewardToState({ shopTokens: 1, equipmentState: baseEquipment, goldEarned: 500 }, { kind: 'shopToken', amount: 1 });
  assert.equal(token.shopTokens, 2);
  assert.equal(token.equipmentState.coins, 200);

  const gold = applyMissionRewardToState({ shopTokens: 1, equipmentState: baseEquipment, goldEarned: 500 }, { kind: 'gold', amount: 320 });
  assert.equal(gold.equipmentState.coins, 520);
  assert.equal(gold.goldEarned, 820);

  const potion = applyMissionRewardToState({ shopTokens: 1, equipmentState: baseEquipment, goldEarned: 500 }, { kind: 'potion', amount: 1 });
  assert.equal(potion.equipmentState.healingPotions, 2);
});

test('enemy pressure composes event catastrophe and threat directive multipliers exactly once', () => {
  const threatWeights = { grunt: 1.35, hound: 2.1, brute: 0.55, archer: 0.75, bomber: 0.75, shaman: 0.55 };
  const out = composeEnemyPressure(
    { spawnPressureMultiplier: 1.5, eliteIntervalMultiplier: 0.8 },
    { enemySpeedMultiplier: 1.22, spawnPressureMultiplier: 1.1, eliteIntervalMultiplier: 0.9 },
    { enemySpeedMultiplier: 1.06, spawnPressureMultiplier: 1.18, eliteIntervalMultiplier: 1.1, regularWeights: threatWeights },
  );
  assert.equal(out.enemySpeedMultiplier, 1.22 * 1.06);
  assert.equal(out.spawnPressureMultiplier, 1.5 * 1.1 * 1.18);
  assert.equal(out.eliteIntervalMultiplier, 0.8 * 0.9 * 1.1);
  assert.deepEqual(out.regularWeights, threatWeights);
});
