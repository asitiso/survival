import test from 'node:test';
import assert from 'node:assert/strict';
import { heroActionLabel, heroSpellIdentity } from '../dist/game/hero-spells.js';

const heroes = ['arkan', 'seria', 'kain', 'edric'];

test('same action slot reads as a different signature spell for every hero', () => {
  const labels = heroes.map((hero) => heroActionLabel(hero, 'spell1'));
  assert.equal(new Set(labels).size, 4);
  for (const hero of heroes) {
    for (const action of ['spell1', 'spell2', 'spell3', 'spell4', 'ultimate1', 'ultimate2']) {
      assert.ok(heroActionLabel(hero, action).length >= 2);
    }
  }
});

test('arkan fire bolt is an explosive projectile rather than a plain stat reskin', () => {
  const fire = heroSpellIdentity('arkan', 'fireBolt');
  assert.ok(fire.splashRadius >= 36);
  assert.ok(fire.splashDamageMultiplier >= 0.35);
});

test('seria spreads control across projectiles chains fields and the second ultimate', () => {
  const bolt = heroSpellIdentity('seria', 'fireBolt');
  const chain = heroSpellIdentity('seria', 'chainLightning');
  const field = heroSpellIdentity('seria', 'flameField');
  const hole = heroSpellIdentity('seria', 'blackHole');
  assert.ok(bolt.projectileSlowFactor < 0.8);
  assert.ok(chain.chainSlowFactor < 0.8);
  assert.ok(field.fieldSlowFactor < 0.8);
  assert.ok(hole.holeSlowFactor < 0.7);
});

test('kain materially accelerates projectile chain and ultimate tempo', () => {
  const bolt = heroSpellIdentity('kain', 'fireBolt');
  const chain = heroSpellIdentity('kain', 'chainLightning');
  const field = heroSpellIdentity('kain', 'flameField');
  const meteor = heroSpellIdentity('kain', 'meteorStorm');
  assert.ok(bolt.projectileSpeedMultiplier >= 1.25);
  assert.ok(chain.chainJumpBonus >= 2);
  assert.ok(field.fieldTickMultiplier >= 1.25);
  assert.ok(meteor.meteorDelayMultiplier <= 0.72);
});

test('edric converts ordinary offense into lane control around the guardian core', () => {
  const bolt = heroSpellIdentity('edric', 'fireBolt');
  const nova = heroSpellIdentity('edric', 'frostNova');
  const field = heroSpellIdentity('edric', 'flameField');
  assert.ok(bolt.pierceBonus >= 1);
  assert.ok(nova.knockback >= 55);
  assert.equal(field.fieldAtCore, true);
});
