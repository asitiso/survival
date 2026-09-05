import test from 'node:test';
import assert from 'node:assert/strict';
import { LegendaryEffectController } from '../dist/game/legendary-effects.js';

function item(id, kind) {
  return { id, kind, name: id, rank: 5, power: 0.1, legendary: true };
}

function equipment(weapon = null, armor = null) {
  return { coins: 0, weapon, armor, healingPotions: 0 };
}

const safe = { heroHpRatio: 1, coreHpRatio: 1, moving: false };

test('archmage heart triggers a bounded spell power surge every twenty kills', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(item('arcane-staff', 'weapon'));
  for (let i = 0; i < 19; i++) c.onKill('grunt', eq);
  assert.equal(c.modifiers.spellPowerMultiplier, 1);
  c.onKill('grunt', eq);
  assert.equal(c.modifiers.spellPowerMultiplier, 1.30);
  c.update(4.1, eq, safe);
  assert.equal(c.modifiers.spellPowerMultiplier, 1);
});

test('chronos scepter creates a time rush every thirty five kills', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(item('rapid-wand', 'weapon'));
  for (let i = 0; i < 35; i++) c.onKill('grunt', eq);
  assert.equal(c.modifiers.cooldownMultiplier, 0.78);
  c.update(5.1, eq, safe);
  assert.equal(c.modifiers.cooldownMultiplier, 1);
});

test('nebula destroyer primes a large nova after eighteen kills and releases it on the next non boss kill', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(item('blast-rod', 'weapon'));
  for (let i = 0; i < 18; i++) assert.equal(c.onKill('grunt', eq).some((p) => p.type === 'nova'), false);
  const proc = c.onKill('grunt', eq).find((p) => p.type === 'nova');
  assert.ok(proc);
  assert.equal(proc.radius, 170);
});

test('midas hand pays clear bonus gold for elite and boss kills', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(item('golden-wand', 'weapon'));
  assert.deepEqual(c.onKill('elite', eq), [{ type: 'bonusGold', amount: 90 }]);
  assert.deepEqual(c.onKill('boss', eq), [{ type: 'bonusGold', amount: 280 }]);
});

test('immortal robe only triggers its low hp defense after internal cooldown', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(null, item('iron-robe', 'armor'));
  c.update(0.1, eq, { ...safe, heroHpRatio: 0.34 });
  assert.equal(c.modifiers.heroDamageTakenMultiplier, 0.65);
  c.update(6.1, eq, { ...safe, heroHpRatio: 0.34 });
  assert.equal(c.modifiers.heroDamageTakenMultiplier, 1);
  c.update(20, eq, { ...safe, heroHpRatio: 0.34 });
  assert.equal(c.modifiers.heroDamageTakenMultiplier, 1);
  c.update(12, eq, { ...safe, heroHpRatio: 0.34 });
  assert.equal(c.modifiers.heroDamageTakenMultiplier, 0.65);
});

test('stormlord cloak rewards sustained movement but requires rebuilding momentum', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(null, item('gale-cloak', 'armor'));
  c.update(2.9, eq, { ...safe, moving: true });
  assert.equal(c.modifiers.moveSpeedMultiplier, 1);
  c.update(0.2, eq, { ...safe, moving: true });
  assert.equal(c.modifiers.moveSpeedMultiplier, 1.18);
  assert.equal(c.modifiers.cooldownMultiplier, 0.88);
  c.update(4.1, eq, { ...safe, moving: true });
  assert.equal(c.modifiers.moveSpeedMultiplier, 1);
  c.update(2.8, eq, { ...safe, moving: true });
  assert.equal(c.modifiers.moveSpeedMultiplier, 1);
  c.update(0.3, eq, { ...safe, moving: true });
  assert.equal(c.modifiers.moveSpeedMultiplier, 1.18);
});

test('abyss magnet cloak emits a periodic global magnet pulse', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(null, item('magnet-cloak', 'armor'));
  assert.equal(c.update(21.9, eq, safe).length, 0);
  assert.deepEqual(c.update(0.2, eq, safe), [{ type: 'magnet', duration: 3 }]);
  assert.equal(c.update(21.7, eq, safe).length, 0);
  assert.deepEqual(c.update(0.4, eq, safe), [{ type: 'magnet', duration: 3 }]);
});

test('eternal wall heals and shields the core on a bounded low core trigger', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(null, item('guardian-plate', 'armor'));
  const first = c.update(0.1, eq, { ...safe, coreHpRatio: 0.49 });
  assert.deepEqual(first, [{ type: 'coreHeal', fraction: 0.10 }]);
  assert.equal(c.modifiers.coreDamageTakenMultiplier, 0.75);
  c.update(8.1, eq, { ...safe, coreHpRatio: 0.49 });
  assert.equal(c.modifiers.coreDamageTakenMultiplier, 1);
  assert.equal(c.update(20, eq, { ...safe, coreHpRatio: 0.49 }).length, 0);
  assert.deepEqual(c.update(25, eq, { ...safe, coreHpRatio: 0.49 }), [{ type: 'coreHeal', fraction: 0.10 }]);
});

test('reset clears all counters buffs and timers', () => {
  const c = new LegendaryEffectController();
  const eq = equipment(item('arcane-staff', 'weapon'));
  for (let i = 0; i < 20; i++) c.onKill('grunt', eq);
  assert.equal(c.modifiers.spellPowerMultiplier, 1.30);
  c.reset();
  assert.deepEqual(c.modifiers, {
    spellPowerMultiplier: 1,
    cooldownMultiplier: 1,
    moveSpeedMultiplier: 1,
    heroDamageTakenMultiplier: 1,
    coreDamageTakenMultiplier: 1,
  });
});
