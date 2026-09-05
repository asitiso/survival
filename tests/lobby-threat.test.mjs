import test from 'node:test';
import assert from 'node:assert/strict';
import { lobbyThreatChoices } from '../dist/ui/lobby.js';

test('lobby threat choices show all six tiers while locking tiers above progress', () => {
  const choices = lobbyThreatChoices({ version: 1, unlocked: 2, selected: 1 });
  assert.equal(choices.length, 6);
  assert.equal(choices[1].selected, true);
  assert.equal(choices[2].locked, false);
  assert.equal(choices[3].locked, true);
  assert.ok(choices.every((choice) => choice.name.length > 0));
});
