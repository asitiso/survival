import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeroMeterState, updateHeroMeter, heroMeterModifiers } from '../dist/game/hero-meters.js';
import { composeHeroMeterCombat } from '../dist/game/hero-meter-integration.js';

const base = {
  spellPowerMultiplier: 1.2, cooldownMultiplier: 0.9, areaMultiplier: 1.1,
  coreDamageTakenMultiplier: 0.8, arkanExplosionChanceBonus: 0.04, arkanExplosionRadiusMultiplier: 1.1,
};

test('active hero meter composes multiplicatively with existing build channels', () => {
  const active = updateHeroMeter(createHeroMeterState('arkan'), 0, { casts: 20 }).state;
  const out = composeHeroMeterCombat(base, heroMeterModifiers(active));
  assert.ok(out.spellPowerMultiplier > base.spellPowerMultiplier);
  assert.ok(out.areaMultiplier > base.areaMultiplier);
  assert.ok(out.arkanExplosionChanceBonus > base.arkanExplosionChanceBonus);
});

test('inactive meter leaves existing build channels unchanged', () => {
  const mods = heroMeterModifiers(createHeroMeterState('seria'));
  assert.deepEqual(composeHeroMeterCombat(base, mods), base);
});

import { heroMeterCastSignals, heroMeterKillSignals } from '../dist/game/hero-meter-integration.js';

test('hero meter signals map existing actions to distinct hero identities', () => {
  assert.equal(heroMeterCastSignals('arkan', 'spell1').casts, 1);
  assert.ok(heroMeterCastSignals('seria', 'spell3').chilledHits >= 4);
  assert.equal(heroMeterCastSignals('kain', 'spell2').casts, 1);
  assert.deepEqual(heroMeterCastSignals('edric', 'spell1'), {});
  assert.equal(heroMeterKillSignals('arkan', { wasSlowed: false }).kills, 1);
  assert.equal(heroMeterKillSignals('seria', { wasSlowed: true }).frozenKills, 1);
});
