import test from 'node:test';
import assert from 'node:assert/strict';
import { bossVariantTierForOrdinal, bossVariantTuning, bossArchetypeTuning } from '../dist/game/boss-patterns.js';

test('same archetype advances through three variant tiers on repeated appearances', () => {
  assert.equal(bossVariantTierForOrdinal(0), 0);
  assert.equal(bossVariantTierForOrdinal(5), 0);
  assert.equal(bossVariantTierForOrdinal(6), 1);
  assert.equal(bossVariantTierForOrdinal(12), 2);
  assert.equal(bossVariantTierForOrdinal(18), 2);
});

test('later boss variants escalate pattern density without changing archetype identity', () => {
  const base = bossArchetypeTuning('inferno', 3);
  const tier1 = bossVariantTuning(base, 1);
  const tier2 = bossVariantTuning(base, 2);
  assert.ok(tier1.specialInterval < base.specialInterval);
  assert.ok(tier2.specialInterval < tier1.specialInterval);
  assert.ok(tier2.fanProjectiles > base.fanProjectiles);
  assert.ok(tier2.ringProjectiles >= base.ringProjectiles + 4);
  assert.ok(tier2.projectileSpeedMultiplier > base.projectileSpeedMultiplier);
});

test('variant tuning also strengthens summoning and juggernaut movement channels', () => {
  const summoner = bossVariantTuning(bossArchetypeTuning('summoner', 2), 2);
  const juggernaut = bossVariantTuning(bossArchetypeTuning('juggernaut', 2), 2);
  assert.ok(summoner.summonCount >= bossArchetypeTuning('summoner', 2).summonCount + 2);
  assert.ok(juggernaut.dashDistance >= bossArchetypeTuning('juggernaut', 2).dashDistance + 60);
});

test('threat bonus can advance boss variant tier without exceeding tier two', () => {
  assert.equal(bossVariantTierForOrdinal(0, 1), 1);
  assert.equal(bossVariantTierForOrdinal(0, 2), 2);
  assert.equal(bossVariantTierForOrdinal(6, 2), 2);
});

import { bossVariantLabel } from '../dist/game/boss-patterns.js';
test('boss variant labels stay compact for HUD and telegraphs', () => {
  assert.equal(bossVariantLabel(0), '원형');
  assert.equal(bossVariantLabel(1), '강화');
  assert.equal(bossVariantLabel(2), '극한');
});
