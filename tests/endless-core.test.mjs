import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFloat } from '../dist/game/endless/rng.js';
import { createDefaultContractState, createContractOffer, shouldOfferContract, acceptContract, advanceContract } from '../dist/game/endless/contracts.js';
import { createDefaultWorldState, evolveWorld, shouldEvolveWorld } from '../dist/game/endless/world-evolution.js';
import { createDefaultNemesisState, recordBossEncounter, getBossAdaptations } from '../dist/game/endless/nemesis.js';
import { createDefaultAscensionState, getAscensionTier, advanceAscension, getAscensionModifiers } from '../dist/game/endless/ascension.js';
import { evaluatePerformanceBudget } from '../dist/game/endless/performance-budget.js';
import { simulateBalanceV2 } from '../dist/game/endless/balance-simulator-v2.js';
import { createDefaultEndlessState, advanceEndlessRuntime } from '../dist/game/endless/runtime.js';

function legacy(overrides = {}) {
  return {
    heroId: 'arkan', elapsedMs: 0, level: 20, threat: 3, kills: 500,
    bossesDefeated: 2, elitesDefeated: 10, gold: 2000, xp: 9000,
    guardianCoreHp: 900, guardianCoreMaxHp: 1000, fate: 'none', spellFusionCount: 1,
    mapEvolutionRank: 1, masteryLevel: 8, deviceClass: 'mid', ...overrides,
  };
}

test('deterministic endless RNG reproduces sequence', () => {
  let a = { seed: 0xdecafbad, cursor: 0 };
  let b = { seed: 0xdecafbad, cursor: 0 };
  const left = [], right = [];
  for (let i = 0; i < 8; i += 1) { const ra = nextFloat(a); a = ra.state; left.push(ra.value); const rb = nextFloat(b); b = rb.state; right.push(rb.value); }
  assert.deepEqual(left, right);
  assert.equal(a.cursor, 8);
});

test('contracts begin at four minutes, use three unique choices, and progress from events', () => {
  const base = createDefaultContractState();
  assert.equal(shouldOfferContract(base, 239_999), false);
  assert.equal(shouldOfferContract(base, 240_000), true);
  const offered = createContractOffer(legacy({ elapsedMs: 240_000 }), base, { seed: 9, cursor: 0 });
  assert.equal(offered.offer.options.length, 3);
  assert.equal(new Set(offered.offer.options.map((x) => x.family)).size, 3);
  const slayer = offered.offer.options.find((x) => x.family === 'slayer') ?? offered.offer.options[0];
  const accepted = acceptContract(offered.state, slayer.optionId, 240_000, 900);
  const events = Array.from({ length: slayer.target }, () => ({ type: 'enemy_killed' }));
  const advanced = advanceContract(accepted, legacy({ elapsedMs: 250_000 }), events, 10_000);
  assert.equal(advanced.state.completedCount, 1);
});

test('world evolves every eight minutes deterministically', () => {
  const base = createDefaultWorldState();
  assert.equal(shouldEvolveWorld(base, 479_999), false);
  assert.equal(shouldEvolveWorld(base, 480_000), true);
  const a = evolveWorld(legacy({ elapsedMs: 480_000 }), base, { seed: 42, cursor: 0 });
  const b = evolveWorld(legacy({ elapsedMs: 480_000 }), base, { seed: 42, cursor: 0 });
  assert.deepEqual(a.state, b.state);
  assert.notEqual(a.state.current, 'calm');
});

test('nemesis learns dangerous encounters but exposes at most three adaptations', () => {
  let state = createDefaultNemesisState();
  state = recordBossEncounter(state, { bossId: 'abyssWitch', durationMs: 120_000, coreDamage: 350, heroDefeated: true, affinityDamage: { fire: 900, ice: 100 } }).state;
  state = recordBossEncounter(state, { bossId: 'abyssWitch', durationMs: 95_000, coreDamage: 280, heroDefeated: false, affinityDamage: { fire: 700, ice: 300 } }).state;
  const adaptations = getBossAdaptations(state, 'abyssWitch');
  assert.ok(adaptations.length > 0 && adaptations.length <= 3);
  assert.equal(state.profiles.abyssWitch.mirrorAffinity, 'fire');
});

test('ascension starts at thirty minutes and numeric scaling caps at tier ten', () => {
  assert.equal(getAscensionTier(29 * 60_000 + 59_999), 0);
  assert.equal(getAscensionTier(30 * 60_000), 1);
  assert.equal(getAscensionTier(600 * 60_000), 10);
  const mods = getAscensionModifiers(99);
  assert.equal(mods.enemyHealthMultiplier, 2);
  const a = advanceAscension(120 * 60_000, createDefaultAscensionState(), { seed: 77, cursor: 0 });
  assert.equal(a.state.tier, 10);
  assert.equal(a.state.mutators.length, 3);
});

test('performance guard degrades visuals before enemy logic and remains safe at 90 minutes', () => {
  const calm = evaluatePerformanceBudget({ deviceClass: 'low', threat: 0, ascensionTier: 0 });
  const hard = evaluatePerformanceBudget({ deviceClass: 'low', threat: 5, ascensionTier: 10 });
  assert.equal(calm.enemyLogicCap, hard.enemyLogicCap);
  assert.ok(hard.effectCap < calm.effectCap);
  const sim = simulateBalanceV2({ threat: 5, deviceClass: 'low' });
  assert.deepEqual(sim.checkpoints.map((x) => x.minute), [10,20,30,45,60,90]);
  assert.ok(sim.checkpoints.every((x) => x.withinPerformanceGuard && x.contractFeasible));
});

test('orchestrator exposes phase 23-27 effects without adding combat actions', () => {
  const initial = createDefaultEndlessState(123456);
  const at4 = advanceEndlessRuntime({ legacy: legacy({ elapsedMs: 240_000 }), state: initial, deltaMs: 16, events: [{ type: 'spell_cast', spellId: 'fireBolt', fusion: true }] });
  assert.ok(at4.effects.some((e) => e.type === 'show_contract_offer'));
  const at8 = advanceEndlessRuntime({ legacy: legacy({ elapsedMs: 480_000 }), state: at4.state, deltaMs: 16, events: [] });
  assert.ok(at8.effects.some((e) => e.type === 'world_evolved'));
  const at30 = advanceEndlessRuntime({ legacy: legacy({ elapsedMs: 1_800_000 }), state: at8.state, deltaMs: 16, events: [] });
  assert.equal(at30.state.ascension.tier, 1);
});

test('completed contracts create snapshot-safe timed boons that expire automatically', async () => {
  const { createDefaultContractState, createContractOffer, acceptContract, advanceContract, getContractModifiers } = await import('../dist/game/endless/contracts.js');
  const offered = createContractOffer(legacy({ elapsedMs: 240_000 }), createDefaultContractState(), { seed: 25, cursor: 0 });
  const slayer = offered.offer.options.find((x) => x.family === 'slayer') ?? offered.offer.options[0];
  const accepted = acceptContract(offered.state, slayer.optionId, 240_000, 900);
  const completed = advanceContract(accepted, legacy({ elapsedMs: 250_000 }), Array.from({ length: slayer.target }, () => ({ type: 'enemy_killed' })), 10_000);
  assert.equal(completed.state.boons.length, 1);
  assert.equal(completed.state.boons[0].family, slayer.family);
  assert.ok(getContractModifiers(completed.state, 250_000).xpMultiplier >= 1);
  const expired = advanceContract(completed.state, legacy({ elapsedMs: 400_001 }), [], 1);
  assert.equal(expired.state.boons.length, 0);
});

test('field nodes can be consumed exactly once and disappear from runtime state', async () => {
  const { createDefaultWorldState, consumeFieldNode } = await import('../dist/game/endless/world-evolution.js');
  const state = { ...createDefaultWorldState(), nodes: [{ nodeId: 'mana-1', kind: 'mana_well', x: .5, y: .5, radius: .1, expiresAtMs: 999999 }] };
  const first = consumeFieldNode(state, 'mana-1');
  assert.equal(first.consumed?.kind, 'mana_well');
  assert.equal(first.state.nodes.length, 0);
  const second = consumeFieldNode(first.state, 'mana-1');
  assert.equal(second.consumed, undefined);
});
