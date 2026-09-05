import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBossRewardChoices } from '../dist/game/upgrades.js';

function spellState(levels) { return { levels: { ...levels } }; }

const base = { fireBolt: 10, chainLightning: 10, frostNova: 9, flameField: 10, meteorStorm: 2, blackHole: 2 };

test('boss rewards never offer a fusion until both component spells are final level', () => {
  const rewards = buildBossRewardChoices(spellState(base), () => 0, 'arkan', null, null, []);
  assert.equal(rewards.some((choice) => choice.kind === 'fusion' && choice.fusionId === 'frostfire-cataclysm'), false);
});

test('boss rewards can surface exactly one eligible fusion while preserving relic and growth choices', () => {
  const levels = { ...base, frostNova: 10 };
  const rewards = buildBossRewardChoices(spellState(levels), () => 0, 'seria', null, null, []);
  assert.equal(rewards.length, 3);
  assert.equal(rewards.filter((choice) => choice.kind === 'fusion').length, 1);
  assert.equal(rewards.filter((choice) => choice.kind === 'relic').length, 1);
  assert.equal(rewards.filter((choice) => choice.kind === 'upgrade').length, 1);
  const fusion = rewards.find((choice) => choice.kind === 'fusion');
  assert.match(fusion.title, /융합/);
  assert.match(fusion.title, /세리아|빙|설|극/);
});

test('two equipped fusions suppress later fusion reward cards', () => {
  const levels = { ...base, frostNova: 10 };
  const rewards = buildBossRewardChoices(spellState(levels), () => 0, 'kain', null, null, ['solar-detonation', 'storm-crucible']);
  assert.equal(rewards.some((choice) => choice.kind === 'fusion'), false);
});
