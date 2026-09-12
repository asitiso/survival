import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const mobile = readFileSync(new URL('../src/game/mobile-landscape-modal-styles.ts', import.meta.url), 'utf8');

test('every modal type has a game-viewport ceiling without transform scaling', () => {
  for (const panel of ['hero-select-panel', 'levelup-panel', 'trait-panel', 'shop-panel', 'results-panel', 'lobby-panel']) {
    assert.match(css, new RegExp('\\.' + panel + '\\s*\\{[^}]*max-height:\\s*calc\\(100% - 16px\\)'));
  }
  assert.doesNotMatch(css, /\.modal-panel[^}]*transform:\s*scale/);
  assert.match(mobile, /\.results-overlay \.results-panel\s*\{[\s\S]*max-height:\s*calc\(100% - 16px\);/);
  assert.match(mobile, /\.results-overlay \.results-actions button\s*\{[\s\S]*min-height:\s*44px;/);
});
