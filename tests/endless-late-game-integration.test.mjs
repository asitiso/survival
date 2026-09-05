import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { BossArenaSystem } from '../dist/game/boss-arena.js';
import { bossArenaMutationModifiers, createBossArenaMutation } from '../dist/game/endless/boss-arena-mutations.js';
import { createDefaultEndlessState, advanceEndlessRuntime } from '../dist/game/endless/runtime.js';
import { serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';
import { selectHeroAscension } from '../dist/game/endless/hero-ascension.js';

function legacy(elapsedMs, heroId = 'arkan') {
  return { heroId, elapsedMs, level: 60, threat: 5, kills: 9000, bossesDefeated: 12, elitesDefeated: 300, gold: 5000, xp: 20000, guardianCoreHp: 900, guardianCoreMaxHp: 1000, fate: 'guardian', spellFusionCount: 2, mapEvolutionRank: 4, masteryLevel: 20, deviceClass: 'high' };
}

test('late-game state migrates through the existing compact endless snapshot', () => {
  let state = createDefaultEndlessState(77);
  let step = advanceEndlessRuntime({ legacy: legacy(35 * 60_000, 'seria'), state, deltaMs: 16, events: [] });
  assert.equal(step.state.heroAscension.pendingOffer?.options.length, 3);
  state = { ...step.state, heroAscension: selectHeroAscension(step.state.heroAscension, step.state.heroAscension.pendingOffer.options[0].optionId) };
  step = advanceEndlessRuntime({ legacy: legacy(121 * 60_000, 'seria'), state, deltaMs: 16, events: [] });
  assert.deepEqual(step.state.chronicle.milestones, ['forty-five', 'hour-one', 'ninety', 'hour-two']);
  const restored = restoreExtension(serializeExtension(step.state), 1);
  assert.deepEqual(restored.heroAscension, step.state.heroAscension);
  assert.deepEqual(restored.chronicle, step.state.chronicle);
});

test('runtime emits hero ascension and chronicle effects without adding actions', () => {
  const state = createDefaultEndlessState(88);
  const step = advanceEndlessRuntime({ legacy: legacy(121 * 60_000), state, deltaMs: 16, events: [] });
  assert.ok(step.effects.some((effect) => effect.type === 'show_hero_ascension_offer'));
  assert.equal(step.effects.filter((effect) => effect.type === 'chronicle_milestone').length, 4);
});

test('boss arena consumes mutation modifiers to alter geometry while preserving telegraphs', () => {
  const base = new BossArenaSystem(() => 0.25);
  const changed = new BossArenaSystem(() => 0.25);
  const mutation = createBossArenaMutation('inferno', 6, 4);
  const modifiers = bossArenaMutationModifiers({ ...mutation, kind: 'fractured_ring' });
  const ctx = { bossPos:{x:800,y:400}, heroPos:{x:500,y:400}, archetype:'inferno', phase:2, variantTier:1 };
  base.update(5, ctx);
  changed.update(5, { ...ctx, mutation: modifiers });
  assert.equal(base.hazards.length, 1);
  assert.equal(changed.hazards.length, 1);
  assert.ok(changed.hazards[0].radius > base.hazards[0].radius);
  assert.ok(changed.hazards[0].telegraph > 0);
});

test('Game composes late-game systems through existing modal build and presentation paths', () => {
  const source = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /openPendingHeroAscension\(/);
  assert.match(source, /deriveRelicResonance\(/);
  assert.match(source, /evaluateAdaptiveDirector\(/);
  assert.match(source, /createBossArenaMutation\(/);
  assert.match(source, /chronicleSummary\(/);
});
