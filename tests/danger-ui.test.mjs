import test from 'node:test';
import assert from 'node:assert/strict';
import { dangerUiState, priorityThreatIds, criticalHapticEvents } from '../dist/game/danger-ui.js';

test('danger UI enters hero and core critical states exactly at readable thresholds', () => {
  assert.deepEqual(dangerUiState(0.31, 0.36), {
    heroCritical: false,
    coreCritical: false,
    vignetteAlpha: 0,
    heroWarning: '',
    coreWarning: '',
  });
  const hero = dangerUiState(0.30, 0.80);
  assert.equal(hero.heroCritical, true);
  assert.ok(hero.vignetteAlpha > 0);
  assert.equal(hero.heroWarning, 'HP 위험');

  const core = dangerUiState(0.80, 0.35);
  assert.equal(core.coreCritical, true);
  assert.equal(core.coreWarning, '수호핵 위험');
});

test('vignette strength increases as hero health becomes more critical but remains bounded', () => {
  const low = dangerUiState(0.25, 1).vignetteAlpha;
  const nearDeath = dangerUiState(0.05, 1).vignetteAlpha;
  assert.ok(nearDeath > low);
  assert.ok(nearDeath <= 0.48);
});

test('priority threat selection always includes bosses and only the two nearest bomber or shaman threats', () => {
  const enemies = [
    { id: 1, type: 'grunt', pos: { x: 101, y: 100 }, alive: true },
    { id: 2, type: 'shaman', pos: { x: 150, y: 100 }, alive: true },
    { id: 3, type: 'bomber', pos: { x: 130, y: 100 }, alive: true },
    { id: 4, type: 'shaman', pos: { x: 110, y: 100 }, alive: true },
    { id: 5, type: 'boss', pos: { x: 900, y: 700 }, alive: true },
    { id: 6, type: 'bomber', pos: { x: 105, y: 100 }, alive: false },
  ];
  const ids = priorityThreatIds(enemies, { x: 100, y: 100 }, 2);
  assert.ok(ids.includes(5));
  assert.deepEqual(ids.filter((id) => id !== 5).sort((a, b) => a - b), [3, 4]);
  assert.equal(ids.includes(1), false);
  assert.equal(ids.includes(6), false);
});

test('critical haptics only fire on entering a critical state, never every frame', () => {
  const safe = dangerUiState(1, 1);
  const heroCritical = dangerUiState(0.2, 1);
  const bothCritical = dangerUiState(0.2, 0.2);
  assert.deepEqual(criticalHapticEvents(safe, heroCritical), ['hero']);
  assert.deepEqual(criticalHapticEvents(heroCritical, heroCritical), []);
  assert.deepEqual(criticalHapticEvents(heroCritical, bothCritical), ['core']);
});
