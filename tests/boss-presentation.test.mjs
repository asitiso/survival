import test from 'node:test';
import assert from 'node:assert/strict';
import { BossPresentationTracker, bossPatternTelegraph } from '../dist/game/boss-presentation.js';

test('boss presentation fires phase transitions once at exact health thresholds', () => {
  const tracker = new BossPresentationTracker();
  assert.equal(tracker.update(1, 1, 'inferno'), null);
  const phase2 = tracker.update(1, 0.66, 'inferno');
  assert.equal(phase2?.phase, 2);
  assert.equal(tracker.update(1, 0.65, 'inferno'), null);
  const phase3 = tracker.update(1, 0.33, 'inferno');
  assert.equal(phase3?.phase, 3);
  assert.equal(tracker.update(1, 0.20, 'inferno'), null);
});

test('boss presentation resets identity for a new boss id', () => {
  const tracker = new BossPresentationTracker();
  tracker.update(1, 0.30, 'inferno');
  assert.equal(tracker.update(2, 0.70, 'summoner'), null);
  assert.equal(tracker.update(2, 0.66, 'summoner')?.phase, 2);
});

test('boss archetypes expose distinct readable pattern telegraphs', () => {
  const inferno = bossPatternTelegraph('inferno', 3);
  const summoner = bossPatternTelegraph('summoner', 3);
  const juggernaut = bossPatternTelegraph('juggernaut', 3);
  assert.equal(inferno.style, 'radial');
  assert.equal(summoner.style, 'summon');
  assert.equal(juggernaut.style, 'lane');
  assert.notEqual(inferno.color, summoner.color);
});
