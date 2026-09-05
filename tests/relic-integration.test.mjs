import test from 'node:test';
import assert from 'node:assert/strict';
import { relicModifiers } from '../dist/game/relics.js';
import { kainOverloadNext, kainOverloadCooldownMultiplier } from '../dist/game/hero-passives.js';

test('seria winter heart is a control-oriented area and tempo relic', () => {
  const mod = relicModifiers('winter-heart', 'seria');
  assert.equal(mod.areaMultiplier, 1.25);
  assert.equal(mod.cooldownMultiplier, 0.92);
});

test('kain storm core composes with the existing overload passive instead of replacing it', () => {
  const mod = relicModifiers('storm-core', 'kain');
  const normal = kainOverloadNext(0, true, 1);
  const boosted = kainOverloadNext(0, true, 1, mod.kainOverloadGainMultiplier);
  assert.ok(boosted > normal);
  assert.equal(kainOverloadCooldownMultiplier(1, mod.kainOverloadMaxCooldownReduction), 0.7);
});

test('edric oath seal expands and strengthens the existing guardian aura', () => {
  const mod = relicModifiers('oath-seal', 'edric');
  assert.equal(220 + mod.edricAuraRadiusBonus, 300);
  assert.ok(mod.edricHeroAuraMultiplier < 0.78);
  assert.ok(mod.edricCoreAuraMultiplier < 0.74);
});
