import test from 'node:test';
import assert from 'node:assert/strict';
import { dangerUiState } from '../dist/game/danger-ui.js';

test('phase 1543-1546 hero critical enters at 30 percent and stays latched through 33 percent', () => {
  const entered = dangerUiState(0.30, 1);
  assert.equal(entered.heroCritical, true);

  const at31 = dangerUiState(0.31, 1, entered);
  const at33 = dangerUiState(0.33, 1, at31);
  assert.equal(at31.heroCritical, true);
  assert.equal(at33.heroCritical, true);
  assert.ok(at31.vignetteAlpha >= 0.18);
  assert.ok(at33.vignetteAlpha >= 0.18);

  const exited = dangerUiState(0.3301, 1, at33);
  assert.equal(exited.heroCritical, false);
  assert.equal(exited.vignetteAlpha, 0);
});

test('phase 1547-1550 core critical enters at 35 percent and stays latched through 38 percent', () => {
  const entered = dangerUiState(1, 0.35);
  assert.equal(entered.coreCritical, true);

  const at36 = dangerUiState(1, 0.36, entered);
  const at38 = dangerUiState(1, 0.38, at36);
  assert.equal(at36.coreCritical, true);
  assert.equal(at38.coreCritical, true);

  const exited = dangerUiState(1, 0.3801, at38);
  assert.equal(exited.coreCritical, false);
});
