import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BOSS_WEAKPOINT_IDENTITY_KINDS,
  BOSS_WEAKPOINT_IDENTITY_ATLAS,
  bossWeakpointIdentityIcon,
  auditBossWeakpointIdentityAtlas,
} from '../dist/game/boss-weakpoint-identity-assets.js';

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('phase 1977 boss weakpoint atlas covers six node identities with unique in-bounds cells', () => {
  assert.deepEqual(BOSS_WEAKPOINT_IDENTITY_KINDS, ['flamePylon','summonCore','armorPlate','curseAnchor','mawSigil','clockShard']);
  assert.deepEqual(BOSS_WEAKPOINT_IDENTITY_ATLAS, {
    src: './assets/bosses/boss-weakpoint-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192,
  });
  const audit = auditBossWeakpointIdentityAtlas();
  assert.equal(audit.itemCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.deepEqual(audit.outOfBounds, []);
  for (const kind of BOSS_WEAKPOINT_IDENTITY_KINDS) {
    const icon = bossWeakpointIdentityIcon(kind);
    assert.equal(icon.animated, false);
    assert.equal(icon.motionAmplitude, 0);
    assert.equal(icon.textFallbackPreserved, true);
    assert.equal(icon.loadFailureBlocksGameplay, false);
    assert.ok(icon.sx >= 0 && icon.sy >= 0);
    assert.ok(icon.sx + icon.sw <= BOSS_WEAKPOINT_IDENTITY_ATLAS.width);
    assert.ok(icon.sy + icon.sh <= BOSS_WEAKPOINT_IDENTITY_ATLAS.height);
  }
});

test('phase 1977 declared boss weakpoint PNG exists at exact 3x2 dimensions', () => {
  const file = path.resolve(BOSS_WEAKPOINT_IDENTITY_ATLAS.src.replace(/^\.\//, ''));
  const buffer = fs.readFileSync(file);
  assert.deepEqual(pngDimensions(buffer), { width: 288, height: 192 });
  assert.ok(buffer.length > 8_000);
});
