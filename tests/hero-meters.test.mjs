import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeroMeterState, updateHeroMeter, heroMeterModifiers, heroMeterLabel } from '../dist/game/hero-meters.js';

for (const heroId of ['arkan','seria','kain','edric']) {
  test(`${heroId} meter remains bounded and exposes readable metadata`, () => {
    let state = createHeroMeterState(heroId);
    state = updateHeroMeter(state, 0, { casts: 100, kills: 100, chilledHits: 100, frozenKills: 100, preventedDamageRatio: 100, moving: true }).state;
    assert.ok(state.charge >= 0 && state.charge <= 1);
    assert.ok(state.activeTimer >= 0);
    assert.ok(heroMeterLabel(heroId).name.length > 0);
  });
}

test('arkan enters inferno from casts and kills and gains explosive pressure', () => {
  let state = createHeroMeterState('arkan');
  const out = updateHeroMeter(state, 0, { casts: 12, kills: 6 });
  state = out.state;
  assert.equal(out.activated, true);
  assert.ok(state.activeTimer >= 6);
  const mods = heroMeterModifiers(state);
  assert.ok(mods.spellPowerMultiplier > 1.15);
  assert.ok(mods.arkanExplosionChanceBonus >= 0.12);
});

test('seria absolute zero is driven by chill and frozen kills and empowers shatter', () => {
  const out = updateHeroMeter(createHeroMeterState('seria'), 0, { chilledHits: 14, frozenKills: 2 });
  assert.equal(out.activated, true);
  const mods = heroMeterModifiers(out.state);
  assert.ok(mods.areaMultiplier > 1.15);
  assert.ok(mods.shatterRadius >= 145);
});

test('kain surge rewards movement and casting then decays after activation', () => {
  let state = createHeroMeterState('kain');
  let activated = false;
  for (let i = 0; i < 16; i++) {
    const out = updateHeroMeter(state, 0.25, { moving: true, casts: 1 });
    state = out.state;
    activated ||= out.activated;
  }
  assert.equal(activated, true);
  assert.ok(heroMeterModifiers(state).cooldownMultiplier < 0.85);
  const after = updateHeroMeter(state, 8, {}).state;
  assert.equal(after.activeTimer, 0);
});

test('edric judgment charges from prevented damage and signals a defensive release', () => {
  const out = updateHeroMeter(createHeroMeterState('edric'), 0, { preventedDamageRatio: 0.62 });
  assert.equal(out.activated, true);
  assert.equal(out.releaseShockwave, true);
  assert.ok(heroMeterModifiers(out.state).coreDamageTakenMultiplier < 0.85);
});
