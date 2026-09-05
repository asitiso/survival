import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPresentationSettings, sanitizePresentationSettings, applyPresentationSettings } from '../dist/game/presentation-settings.js';

test('presentation settings sanitize malformed storage values to safe defaults', () => {
  const defaults = defaultPresentationSettings();
  assert.deepEqual(sanitizePresentationSettings(null), defaults);
  const bad = sanitizePresentationSettings({ quality: 'ultra', reducedFlash: 'yes', reducedShake: 4, haptics: null });
  assert.deepEqual(bad, defaults);
});

test('reduced flash caps alpha while reduced shake scales presentation shake only', () => {
  const settings = { quality: 'high', reducedFlash: true, reducedShake: true, haptics: true };
  const cue = applyPresentationSettings({ alpha: 0.95, shake: 12, haptic: true }, settings);
  assert.ok(cue.alpha <= 0.58);
  assert.ok(cue.shake <= 4.8);
  assert.equal(cue.haptic, true);
});

test('haptics toggle suppresses presentation vibration requests', () => {
  const settings = { quality: 'medium', reducedFlash: false, reducedShake: false, haptics: false };
  assert.equal(applyPresentationSettings({ alpha: 0.4, shake: 2, haptic: true }, settings).haptic, false);
});
