import test from 'node:test';
import assert from 'node:assert/strict';
import { spellVfxDescriptor } from '../dist/game/spell-vfx.js';

test('spell vfx families keep four hero identities readable under shared slots', () => {
  assert.equal(spellVfxDescriptor('arkan', 'fireBolt', 1).family, 'fire');
  assert.equal(spellVfxDescriptor('seria', 'fireBolt', 1).family, 'frost');
  assert.equal(spellVfxDescriptor('kain', 'fireBolt', 1).family, 'lightning');
  assert.equal(spellVfxDescriptor('edric', 'fireBolt', 1).family, 'holy');
});

test('level five and ten evolution visibly escalates shape without unbounded particles', () => {
  const base = spellVfxDescriptor('arkan', 'fireBolt', 4);
  const mid = spellVfxDescriptor('arkan', 'fireBolt', 5);
  const final = spellVfxDescriptor('arkan', 'fireBolt', 10);
  assert.equal(base.tier, 0);
  assert.equal(mid.tier, 1);
  assert.equal(final.tier, 2);
  assert.ok(mid.trailWidth > base.trailWidth);
  assert.ok(final.burstRadius > mid.burstRadius);
  assert.ok(final.sparkCount > mid.sparkCount);
  assert.ok(final.sparkCount <= 18);
  assert.ok(final.opacity <= 0.92);
});

test('ultimate descriptors are denser but remain danger-safe', () => {
  const normal = spellVfxDescriptor('kain', 'chainLightning', 10);
  const ultimate = spellVfxDescriptor('kain', 'meteorStorm', 10);
  assert.equal(ultimate.ultimate, true);
  assert.ok(ultimate.burstRadius >= normal.burstRadius);
  assert.ok(ultimate.opacity <= 0.92);
});
