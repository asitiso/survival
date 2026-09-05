import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ELITE_AFFIX_IDENTITY_ATLAS,
  ELITE_AFFIX_IDENTITY_IDS,
  eliteAffixIdentityIcon,
  eliteAffixIdentityRowLayout,
  eliteAffixIdentityEmphasis,
  auditEliteAffixIdentityAtlas,
} from '../dist/game/elite-affix-identity-assets.js';

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('phase 1961 elite affix atlas covers six identities with unique in-bounds cells', () => {
  assert.deepEqual(ELITE_AFFIX_IDENTITY_IDS, ['swift','armored','regenerating','frenzied','commander','manaShield']);
  assert.deepEqual(ELITE_AFFIX_IDENTITY_ATLAS, {
    src: './assets/enemies/elite-affix-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192,
  });
  const audit = auditEliteAffixIdentityAtlas();
  assert.equal(audit.itemCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.deepEqual(audit.outOfBounds, []);
  for (const id of ELITE_AFFIX_IDENTITY_IDS) {
    const icon = eliteAffixIdentityIcon(id);
    assert.equal(icon.animated, false);
    assert.equal(icon.motionAmplitude, 0);
    assert.equal(icon.textFallbackPreserved, true);
    assert.equal(icon.loadFailureBlocksGameplay, false);
  }
});

test('phase 1961 one/two affix rows center icons and clamp at logical arena edges', () => {
  const one = eliteAffixIdentityRowLayout(1, 34, { x: 800, y: 450 });
  assert.equal(one.iconSize >= 16 && one.iconSize <= 18, true);
  assert.deepEqual(one.offsetsX, [0]);
  const two = eliteAffixIdentityRowLayout(2, 34, { x: 800, y: 450 });
  assert.equal(two.offsetsX.length, 2);
  assert.equal(two.offsetsX[0], -two.offsetsX[1]);
  assert.ok(two.offsetsX[1] > 0);
  const edge = eliteAffixIdentityRowLayout(2, 34, { x: 1597, y: 897 });
  for (const x of edge.worldCentersX) assert.ok(x - edge.iconSize / 2 >= 0 && x + edge.iconSize / 2 <= 1600);
  assert.ok(edge.worldCenterY - edge.iconSize / 2 >= 0 && edge.worldCenterY + edge.iconSize / 2 <= 900);
});

test('phase 1961 dangerous emphasis is static and state-derived', () => {
  assert.equal(eliteAffixIdentityEmphasis('frenzied', 0.42, 0), 1);
  assert.equal(eliteAffixIdentityEmphasis('frenzied', 0.421, 0), 0);
  assert.equal(eliteAffixIdentityEmphasis('manaShield', 1, 0.1), 1);
  assert.equal(eliteAffixIdentityEmphasis('manaShield', 1, 0), 0);
  assert.equal(eliteAffixIdentityEmphasis('regenerating', 1, 0), 1);
  assert.equal(eliteAffixIdentityEmphasis('swift', 1, 0), 0);
});

test('phase 1961 declared affix PNG exists at exact 3x2 dimensions', () => {
  const file = path.resolve(ELITE_AFFIX_IDENTITY_ATLAS.src.replace(/^\.\//, ''));
  const buffer = fs.readFileSync(file);
  assert.deepEqual(pngDimensions(buffer), { width: 288, height: 192 });
  assert.ok(buffer.length > 8_000);
});
