import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dangerUiState, criticalHapticEvents } from '../dist/game/danger-ui.js';

test('phase 1551-1558 hysteresis band does not duplicate haptics and a full safe exit rearms entry haptic', () => {
  const safe = dangerUiState(1, 1);
  const entered = dangerUiState(0.30, 1, safe);
  assert.deepEqual(criticalHapticEvents(safe, entered), ['hero']);

  const microHeal = dangerUiState(0.32, 1, entered);
  const microHit = dangerUiState(0.299, 1, microHeal);
  assert.equal(microHeal.heroCritical, true);
  assert.equal(microHit.heroCritical, true);
  assert.deepEqual(criticalHapticEvents(entered, microHeal), []);
  assert.deepEqual(criticalHapticEvents(microHeal, microHit), []);

  const exited = dangerUiState(0.34, 1, microHit);
  assert.equal(exited.heroCritical, false);
  assert.deepEqual(criticalHapticEvents(microHit, exited), []);

  const reentered = dangerUiState(0.30, 1, exited);
  assert.deepEqual(criticalHapticEvents(exited, reentered), ['hero']);
});

test('phase 1559-1566 core and hero attention remains latched across hysteresis bands until the primary really exits', () => {
  const both = dangerUiState(0.30, 0.35);
  const heroBand = dangerUiState(0.32, 0.36, both);
  assert.equal(heroBand.heroCritical, true);
  assert.equal(heroBand.coreCritical, true);
  assert.equal(heroBand.heroWarning, 'HP 위험');
  assert.equal(heroBand.coreWarning, '수호핵 위험');

  const heroSafe = dangerUiState(0.34, 0.36, heroBand);
  assert.equal(heroSafe.heroCritical, false);
  assert.equal(heroSafe.coreCritical, true);
  assert.equal(heroSafe.coreWarning, '수호핵 위험');
});

test('phase 1567-1574 Game feeds previous danger state into hysteresis resolver and new run still resets safe', () => {
  const source = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /dangerUiState\(\s*this\.hero\.hp[\s\S]*?this\.core\.hp[\s\S]*?this\.dangerState\s*,?\s*\)/);
  assert.match(source, /this\.dangerState\s*=\s*dangerUiState\(1,\s*1\)/);
});
