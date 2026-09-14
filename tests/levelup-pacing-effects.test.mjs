import test from 'node:test';
import assert from 'node:assert/strict';

import { xpNeededForLevel } from '../dist/domain/progression.js';

test('level-up pacing is about ten percent slower without reshaping progression', () => {
  assert.equal(xpNeededForLevel(1), 84);
  assert.equal(xpNeededForLevel(5), 253);
  assert.equal(xpNeededForLevel(10), 508);
  assert.equal(xpNeededForLevel(30), 1586);
  assert.equal(xpNeededForLevel(50), 3093);

  for (let level = 2; level <= 50; level += 1) {
    assert.ok(
      xpNeededForLevel(level) > xpNeededForLevel(level - 1),
      `XP requirement should keep increasing at level ${level}`,
    );
  }
});
