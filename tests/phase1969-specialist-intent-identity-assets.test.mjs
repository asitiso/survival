import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SPECIALIST_INTENT_TYPES,
  SPECIALIST_INTENT_ATLAS,
  specialistIntentIcon,
  specialistIntentOnBodyLayout,
  specialistIntentEmphasis,
  auditSpecialistIntentAtlas,
} from '../dist/game/specialist-intent-identity-assets.js';

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('phase 1969 specialist intent atlas covers six identities with unique in-bounds cells', () => {
  assert.deepEqual(SPECIALIST_INTENT_TYPES, ['bomber','shaman','shieldbearer','assassin','siegeGolem','nullifier']);
  assert.deepEqual(SPECIALIST_INTENT_ATLAS, {
    src: './assets/enemies/specialist-intent-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192,
  });
  const audit = auditSpecialistIntentAtlas();
  assert.equal(audit.itemCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.deepEqual(audit.outOfBounds, []);
  for (const type of SPECIALIST_INTENT_TYPES) {
    const icon = specialistIntentIcon(type);
    assert.equal(icon.animated, false);
    assert.equal(icon.motionAmplitude, 0);
    assert.equal(icon.legacyFallbackPreserved, true);
    assert.equal(icon.loadFailureBlocksGameplay, false);
  }
});

test('phase 1969 specialist on-body identity stays compact and clamps inside the logical arena', () => {
  const center = specialistIntentOnBodyLayout(23, { x: 800, y: 450 });
  assert.ok(center.iconSize >= 16 && center.iconSize <= 18);
  assert.equal(center.worldCenterX, 800);
  assert.ok(center.localCenterY > 23);
  const left = specialistIntentOnBodyLayout(31, { x: 2, y: 2 });
  assert.ok(left.worldCenterX - left.iconSize / 2 >= 0);
  assert.ok(left.worldCenterY - left.iconSize / 2 >= 0);
  const right = specialistIntentOnBodyLayout(31, { x: 1598, y: 898 });
  assert.ok(right.worldCenterX + right.iconSize / 2 <= 1600);
  assert.ok(right.worldCenterY + right.iconSize / 2 <= 900);
});

test('phase 1969 active emphasis is static and derived only from frozen specialist state', () => {
  const base = { guardHp: 0, specialistTimer: 9, target: 'hero', heroInsideNullifier: false };
  assert.equal(specialistIntentEmphasis('bomber', base), 1);
  assert.equal(specialistIntentEmphasis('shaman', base), 1);
  assert.equal(specialistIntentEmphasis('shieldbearer', { ...base, guardHp: 1 }), 1);
  assert.equal(specialistIntentEmphasis('shieldbearer', base), 0);
  assert.equal(specialistIntentEmphasis('assassin', { ...base, specialistTimer: 1.2 }), 1);
  assert.equal(specialistIntentEmphasis('assassin', { ...base, specialistTimer: 1.21 }), 0);
  assert.equal(specialistIntentEmphasis('siegeGolem', { ...base, target: 'core' }), 1);
  assert.equal(specialistIntentEmphasis('siegeGolem', base), 0);
  assert.equal(specialistIntentEmphasis('nullifier', { ...base, heroInsideNullifier: true }), 1);
  assert.equal(specialistIntentEmphasis('nullifier', base), 0);
});

test('phase 1969 declared specialist PNG exists at exact 3x2 dimensions', () => {
  const file = path.resolve(SPECIALIST_INTENT_ATLAS.src.replace(/^\.\//, ''));
  const buffer = fs.readFileSync(file);
  assert.deepEqual(pngDimensions(buffer), { width: 288, height: 192 });
  assert.ok(buffer.length > 8_000);
});
