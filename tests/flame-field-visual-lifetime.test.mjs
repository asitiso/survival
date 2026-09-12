import test from 'node:test';
import assert from 'node:assert/strict';
import * as spells from '../dist/game/spells.js';

test('flame field stays readable, then fades during its final 1.6 seconds', () => {
  assert.equal(typeof spells.flameFieldVisualAlpha, 'function');
  const full = spells.flameFieldVisualAlpha(2, 4.4);
  const halfway = spells.flameFieldVisualAlpha(0.8, 4.4);
  const ending = spells.flameFieldVisualAlpha(0.1, 4.4);

  assert.ok(full >= 0.7);
  assert.ok(halfway >= 0.3 && halfway <= 0.55);
  assert.ok(ending >= 0.08 && ending <= 0.25);
  assert.ok(full > halfway && halfway > ending);
});

test('expired flame residue lingers briefly instead of vanishing immediately', () => {
  assert.equal(typeof spells.persistentZoneExpirySeconds, 'function');
  const flameSeconds = spells.persistentZoneExpirySeconds('flameField');
  const blackHoleSeconds = spells.persistentZoneExpirySeconds('blackHole');

  assert.ok(flameSeconds >= 0.28 && flameSeconds <= 0.36);
  assert.equal(blackHoleSeconds, 0.52);
});
