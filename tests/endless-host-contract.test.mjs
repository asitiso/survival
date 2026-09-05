import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { buildLegacyRunView, contractChoiceCards, composeEndlessHostModifiers } from '../dist/game/endless/host.js';
import { createDefaultEndlessState } from '../dist/game/endless/runtime.js';

test('host adapter maps existing Phase 22 state into endless view without leaking host objects', () => {
  const view = buildLegacyRunView({
    heroId: 'seria', elapsedSeconds: 901, level: 33, threat: 4, kills: 800, bossesDefeated: 4, elitesDefeated: 22,
    gold: 5500, xp: 42000, guardianCoreHp: 700, guardianCoreMaxHp: 1000, fateChoices: ['golden','guardian'],
    spellFusionCount: 2, mapEvolutionRank: 2, masteryLevel: 12, presentationQuality: 'medium',
  });
  assert.equal(view.elapsedMs, 901000);
  assert.equal(view.fate, 'guardian');
  assert.equal(view.deviceClass, 'mid');
  assert.equal(view.heroId, 'seria');
});

test('contract offers reuse generic three-card choice data and do not alter the nine combat actions', () => {
  const cards = contractChoiceCards([
    { optionId: '1', family: 'slayer', title: 'A', description: 'AA', target: 1, durationMs: 1 },
    { optionId: '2', family: 'warden', title: 'B', description: 'BB', target: 1, durationMs: 1 },
    { optionId: '3', family: 'arcane', title: 'C', description: 'CC', target: 1, durationMs: 1 },
  ]);
  assert.equal(cards.length, 3);
  assert.ok(cards.every((card) => card.accent.startsWith('#')));
  assert.equal(ACTION_BUTTONS.length, 9);
});

test('world and ascension compose bounded host pressure and rewards', () => {
  const state = createDefaultEndlessState(77);
  state.world.current = 'blood_moon';
  state.ascension.tier = 10;
  const mods = composeEndlessHostModifiers(state, 5);
  assert.ok(mods.spawnPressureMultiplier > 1 && mods.spawnPressureMultiplier <= 2.1);
  assert.ok(mods.eliteIntervalMultiplier >= 0.55 && mods.eliteIntervalMultiplier <= 1.1);
  assert.ok(mods.goldMultiplier >= 1 && mods.goldMultiplier <= 2);
  assert.equal(mods.enemyHealthMultiplier, 2);
  assert.equal(mods.enemyDamageMultiplier, 1.7);
});
