import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import {
  HERO_PORTRAIT_ATLAS,
  heroPortraitSprite,
  heroPortraitPresentation,
  auditHeroPortraitAtlas,
} from '../dist/game/hero-portrait-assets.js';

test('hero portrait atlas covers all four heroes with unique 2x2 cells', () => {
  const heroIds = HERO_PROFILES.map((profile) => profile.id);
  const audit = auditHeroPortraitAtlas(heroIds);
  assert.equal(audit.heroCount, 4);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 4);
  assert.equal(audit.missing.length, 0);
  assert.equal(audit.outOfBounds.length, 0);
  assert.equal(HERO_PORTRAIT_ATLAS.columns, 2);
  assert.equal(HERO_PORTRAIT_ATLAS.rows, 2);
});

test('hero portrait sprite coordinates stay inside the atlas and remain unique', () => {
  const cells = new Set();
  for (const profile of HERO_PROFILES) {
    const sprite = heroPortraitSprite(profile.id);
    assert.equal(sprite.sw, HERO_PORTRAIT_ATLAS.cellSize);
    assert.equal(sprite.sh, HERO_PORTRAIT_ATLAS.cellSize);
    assert.ok(sprite.sx >= 0 && sprite.sy >= 0);
    assert.ok(sprite.sx + sprite.sw <= HERO_PORTRAIT_ATLAS.width);
    assert.ok(sprite.sy + sprite.sh <= HERO_PORTRAIT_ATLAS.height);
    cells.add(`${sprite.sx}:${sprite.sy}`);
  }
  assert.equal(cells.size, 4);
});

test('hero portrait presentation is static and exposes css atlas positions', () => {
  const expected = new Map([
    ['arkan', ['0%', '0%']],
    ['seria', ['100%', '0%']],
    ['kain', ['0%', '100%']],
    ['edric', ['100%', '100%']],
  ]);
  for (const profile of HERO_PROFILES) {
    const presentation = heroPortraitPresentation(profile.id, true);
    assert.equal(presentation.visible, true);
    assert.equal(presentation.animated, false);
    assert.equal(presentation.motionAmplitude, 0);
    assert.deepEqual([presentation.backgroundX, presentation.backgroundY], expected.get(profile.id));
  }
});

test('hero portrait presentation fails closed to the existing orb when assets are unavailable', () => {
  const presentation = heroPortraitPresentation('arkan', false);
  assert.equal(presentation.visible, false);
  assert.equal(presentation.animated, false);
  assert.equal(presentation.motionAmplitude, 0);
  assert.equal(presentation.fallbackOrbVisible, true);
});
