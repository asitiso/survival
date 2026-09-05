import test from 'node:test';
import assert from 'node:assert/strict';

import { createBossArenaMutation, bossArenaMutationModifiers } from '../dist/game/endless/boss-arena-mutations.js';
import { createDefaultHeroAscensionState, advanceHeroAscension, selectHeroAscension, heroAscensionModifiers } from '../dist/game/endless/hero-ascension.js';
import { deriveRelicResonance } from '../dist/game/endless/relic-resonance.js';
import { evaluateAdaptiveDirector } from '../dist/game/endless/adaptive-director.js';
import { createDefaultChronicleState, advanceChronicle, chronicleSummary } from '../dist/game/endless/chronicle.js';

const MIN = 60_000;

test('phase 28 boss arena mutation is deterministic, bounded, and changes late boss space', () => {
  assert.equal(createBossArenaMutation('inferno', 1, 2), null);
  const first = createBossArenaMutation('inferno', 4, 7);
  const again = createBossArenaMutation('inferno', 4, 7);
  assert.deepEqual(first, again);
  assert.ok(first);
  const mods = bossArenaMutationModifiers(first);
  assert.ok(mods.cadenceMultiplier >= 0.72 && mods.cadenceMultiplier <= 1.05);
  assert.ok(mods.radiusMultiplier >= 0.82 && mods.radiusMultiplier <= 1.28);
  assert.ok(mods.telegraphMultiplier >= 0.78 && mods.telegraphMultiplier <= 1.15);
  assert.ok(mods.maxHazards >= 4 && mods.maxHazards <= 8);
});

test('phase 29 hero ascension offers three hero-specific choices at 35 50 and 65 minutes', () => {
  let state = createDefaultHeroAscensionState();
  let step = advanceHeroAscension('arkan', 34.9 * MIN, state);
  assert.equal(step.state.pendingOffer, undefined);
  step = advanceHeroAscension('arkan', 35 * MIN, state);
  assert.equal(step.state.pendingOffer?.options.length, 3);
  assert.equal(new Set(step.state.pendingOffer?.options.map((x) => x.optionId)).size, 3);
  assert.ok(step.state.pendingOffer?.options.every((x) => x.heroId === 'arkan'));
  state = selectHeroAscension(step.state, step.state.pendingOffer.options[0].optionId);
  assert.equal(state.selected.length, 1);
  step = advanceHeroAscension('arkan', 50 * MIN, state);
  assert.equal(step.state.pendingOffer?.milestone, 50);
  state = selectHeroAscension(step.state, step.state.pendingOffer.options[0].optionId);
  step = advanceHeroAscension('arkan', 65 * MIN, state);
  state = selectHeroAscension(step.state, step.state.pendingOffer.options[0].optionId);
  assert.equal(state.selected.length, 3);
  const mods = heroAscensionModifiers(state.selected);
  assert.ok(mods.spellPowerMultiplier <= 1.45);
  assert.ok(mods.cooldownMultiplier >= 0.72);
  assert.ok(mods.bossDamageMultiplier <= 1.35);
});

test('phase 30 relic resonance derives from the existing build and caps at tier three without a new inventory', () => {
  const none = deriveRelicResonance({ heroId: 'seria', relicId: null, fusionCount: 2, fateChoiceCount: 3, ascensionSelections: 3 });
  assert.equal(none.tier, 0);
  const resonant = deriveRelicResonance({ heroId: 'seria', relicId: 'winter-heart', fusionCount: 2, fateChoiceCount: 3, ascensionSelections: 3 });
  assert.equal(resonant.tier, 3);
  assert.ok(resonant.name.includes('공명'));
  assert.ok(resonant.modifiers.spellPowerMultiplier <= 1.18);
  assert.ok(resonant.modifiers.cooldownMultiplier >= 0.88);
});

test('phase 31 adaptive director sheds visual load before materially changing enemy logic', () => {
  const stressed = evaluateAdaptiveDirector({ fps: 28, enemyCount: 290, projectileCount: 140, effectCount: 220, coreRatio: 0.3, heroHpRatio: 0.4, deviceClass: 'low', ascensionTier: 8 });
  assert.ok(stressed.visualDensity <= 0.58);
  assert.ok(stressed.compositionPressureMultiplier >= 0.94);
  assert.ok(stressed.compositionPressureMultiplier <= 1.08);
  assert.ok(stressed.projectileVisualDensity <= stressed.visualDensity);
  const healthy = evaluateAdaptiveDirector({ fps: 60, enemyCount: 120, projectileCount: 40, effectCount: 80, coreRatio: 1, heroHpRatio: 1, deviceClass: 'high', ascensionTier: 8 });
  assert.ok(healthy.compositionPressureMultiplier >= 1);
  assert.ok(healthy.compositionPressureMultiplier <= 1.08);
});

test('phase 32 chronicle recognizes 45 through 180 minute milestones exactly once', () => {
  let state = createDefaultChronicleState();
  let result = advanceChronicle(121 * MIN, state);
  assert.deepEqual(result.unlocked.map((x) => x.minute), [45, 60, 90, 120]);
  state = result.state;
  result = advanceChronicle(181 * MIN, state);
  assert.deepEqual(result.unlocked.map((x) => x.minute), [180]);
  state = result.state;
  result = advanceChronicle(240 * MIN, state);
  assert.equal(result.unlocked.length, 0);
  assert.equal(state.milestones.length, 5);
  assert.ok(chronicleSummary(state, 3).length <= 3);
});
