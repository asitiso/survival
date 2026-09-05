import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { growthChoiceIcon, growthChoiceIconStyle } from '../dist/game/growth-choice-icon-assets.js';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('phase 1955 spell choices use hero ability identity when hero context is supplied', () => {
  const seria = growthChoiceIcon('fireBolt', undefined, 'seria');
  const kainUltimate = growthChoiceIcon('meteorStorm', 'upgrade', 'kain');
  assert.match(seria.atlasSrc, /hero-ability-icons\.png$/);
  assert.match(kainUltimate.atlasSrc, /hero-ability-icons\.png$/);
  assert.match(growthChoiceIconStyle('blackHole', 'upgrade', 'edric'), /hero-ability-icons\.png/);
  assert.notEqual(seria.backgroundPosition, growthChoiceIcon('fireBolt', undefined, 'arkan').backgroundPosition);
});

test('phase 1958 missing hero context keeps legacy spell icons and generic/relic/fusion assets stay unchanged', () => {
  assert.match(growthChoiceIcon('fireBolt').atlasSrc, /action-icons\.png$/);
  assert.match(growthChoiceIcon('spellPower', undefined, 'seria').atlasSrc, /growth-choice-icons\.png$/);
  assert.match(growthChoiceIcon('relic:abyss-eye', 'relic', 'seria').atlasSrc, /build-identity-icons\.png$/);
  assert.match(growthChoiceIcon('fusion:solar-detonation', 'fusion', 'seria').atlasSrc, /build-identity-icons\.png$/);
});

test('phase 1956-1957 game decorates only spell upgrade and boss ultimate choices at the presentation boundary', () => {
  assert.match(gameSource, /growthChoiceIconStyle/);
  assert.match(gameSource, /choice\.id in this\.spells\.levels/);
  assert.match(gameSource, /identityIconStyle:\s*growthChoiceIconStyle\(String\(choice\.id\),/);
  assert.match(gameSource, /this\.hero\.profileId/);
  assert.match(gameSource, /levelUpOverlay\.open\(presentedChoices/);
});
