import test from 'node:test';
import assert from 'node:assert/strict';
import { composeRunStartStats } from '../dist/game/run-start.js';

test('run start stats combine permanent meta and selected trait exactly once', () => {
  const base = { maxHp: 1000, spellPower: 1.2, cooldownMultiplier: 0.95, speed: 300, pickupRadius: 100 };
  const meta = { maxHpMultiplier: 1.15, spellPowerMultiplier: 1.10, startingGold: 250, pickupRadiusMultiplier: 1.32 };
  const trait = {
    maxHpMultiplier: 0.92,
    spellPowerMultiplier: 1.12,
    cooldownMultiplier: 1,
    moveSpeedMultiplier: 1,
    goldMultiplier: 1,
    heroDamageTakenMultiplier: 1,
    coreDamageTakenMultiplier: 1,
  };
  const out = composeRunStartStats(base, meta, trait);
  assert.equal(out.maxHp, 1058);
  assert.equal(out.spellPower, 1.2 * 1.10 * 1.12);
  assert.equal(out.cooldownMultiplier, 0.95);
  assert.equal(out.speed, 300);
  assert.equal(out.pickupRadius, 132);
  assert.equal(out.startingGold, 250);
  assert.equal(out.goldMultiplier, 1);
});

test('run start stats expose trait risk multipliers without mutating base stats', () => {
  const base = { maxHp: 900, spellPower: 1, cooldownMultiplier: 1, speed: 320, pickupRadius: 110 };
  const meta = { maxHpMultiplier: 1, spellPowerMultiplier: 1, startingGold: 0, pickupRadiusMultiplier: 1 };
  const trait = {
    maxHpMultiplier: 1,
    spellPowerMultiplier: 1,
    cooldownMultiplier: 0.9,
    moveSpeedMultiplier: 1,
    goldMultiplier: 1,
    heroDamageTakenMultiplier: 1.08,
    coreDamageTakenMultiplier: 1,
  };
  const out = composeRunStartStats(base, meta, trait);
  assert.equal(out.cooldownMultiplier, 0.9);
  assert.equal(out.heroDamageTakenMultiplier, 1.08);
  assert.deepEqual(base, { maxHp: 900, spellPower: 1, cooldownMultiplier: 1, speed: 320, pickupRadius: 110 });
});
