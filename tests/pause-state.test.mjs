import test from 'node:test';
import assert from 'node:assert/strict';
import { PauseState } from '../dist/game/pause-state.js';

test('manual and visibility pauses are independent reasons', () => {
  const state = new PauseState();
  assert.equal(state.paused, false);
  state.set('manual', true);
  state.set('visibility', true);
  assert.equal(state.paused, true);
  state.set('visibility', false);
  assert.equal(state.paused, true);
  assert.equal(state.has('manual'), true);
  state.set('manual', false);
  assert.equal(state.paused, false);
});

test('pause state reset clears only external pause reasons deterministically', () => {
  const state = new PauseState();
  state.set('visibility', true);
  state.set('manual', true);
  state.reset();
  assert.deepEqual(state.reasons, []);
});

test('game and main wire manual pause plus visibility lifecycle without reusing modal pause', async () => {
  const { readFile } = await import('node:fs/promises');
  const game = await readFile(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  const main = await readFile(new URL('../src/main.ts', import.meta.url), 'utf8');
  for (const token of ['PauseState', 'setVisibilityPaused', 'toggleManualPause', 'this.pauseState.paused']) {
    assert.ok(game.includes(token), `missing game pause token ${token}`);
  }
  assert.ok(main.includes('visibilitychange'));
  assert.ok(main.includes('toggleManualPause'));
});
