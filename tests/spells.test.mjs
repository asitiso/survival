import test from 'node:test';
import assert from 'node:assert/strict';
import { spellTuning } from '../dist/game/spells.js';

test('fire bolt becomes stronger and denser as it levels', () => {
  const l1 = spellTuning('fireBolt', 1);
  const l8 = spellTuning('fireBolt', 8);
  assert.ok(l8.damage > l1.damage);
  assert.ok(l8.cooldown < l1.cooldown);
  assert.ok(l8.projectiles > l1.projectiles);
});

test('chain lightning gains more jumps at high level', () => {
  assert.ok(spellTuning('chainLightning', 9).jumps > spellTuning('chainLightning', 1).jumps);
});

test('fire bolt and chain lightning flatten rank 6 to 10 damage and cooldown growth', () => {
  for (const id of ['fireBolt', 'chainLightning']) {
    const rank4 = spellTuning(id, 4);
    const rank5 = spellTuning(id, 5);
    const rank6 = spellTuning(id, 6);
    const earlyDamageStep = rank5.damage - rank4.damage;
    const lateDamageStep = rank6.damage - rank5.damage;
    const earlyCooldownStep = rank4.cooldown - rank5.cooldown;
    const lateCooldownStep = rank5.cooldown - rank6.cooldown;
    assert.ok(Math.abs(lateDamageStep / earlyDamageStep - 0.55) < 0.001);
    assert.ok(Math.abs(lateCooldownStep / earlyCooldownStep - 0.5) < 0.001);
  }
});

test('frost nova radius scales with level', () => {
  assert.ok(spellTuning('frostNova', 7).radius > spellTuning('frostNova', 1).radius);
});

test('ultimate cooldown remains meaningfully longer than normal spells', () => {
  assert.ok(spellTuning('meteorStorm', 1).cooldown > spellTuning('fireBolt', 1).cooldown * 20);
});

import { chainJumpBudget } from '../dist/game/spells.js';
test('temporary surge jump bonus adds chain targets without changing base tuning', () => {
  assert.equal(chainJumpBudget(4, 0), 4);
  assert.equal(chainJumpBudget(4, 2), 6);
  assert.equal(chainJumpBudget(4, -9), 4);
});
