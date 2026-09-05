import test from 'node:test';
import assert from 'node:assert/strict';
import { spellButtonPresentation, compactBuildLabels } from '../dist/game/hud-presentation.js';

test('spell button presentation distinguishes cooldown and ready states', () => {
  const cooling = spellButtonPresentation(2.34, false, false, false);
  assert.equal(cooling.ready, false);
  assert.equal(cooling.secondary, '2.3');
  const ready = spellButtonPresentation(0, false, false, false);
  assert.equal(ready.ready, true);
  assert.equal(ready.secondary, 'READY');
});

test('ultimate pulse only fires on transition into ready', () => {
  assert.equal(spellButtonPresentation(0, true, false, false).pulse, true);
  assert.equal(spellButtonPresentation(0, true, true, false).pulse, false);
  assert.equal(spellButtonPresentation(1, true, true, false).pulse, false);
});

test('auto and compact build labels stay readable in two lines', () => {
  assert.equal(spellButtonPresentation(0, false, true, true).autoLabel, 'AUTO ON');
  assert.deepEqual(compactBuildLabels('잿불 왕관', ['화염 지배', '파멸의 눈', '초과']), ['유물 · 잿불 왕관', '시너지 · 화염 지배 / 파멸의 눈']);
});
