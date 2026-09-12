import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lobby = readFileSync(new URL('../src/ui/lobby.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('lobby keeps the battle-start action outside scrollable upgrades and records', () => {
  assert.match(lobby, /className = 'lobby-scroll-body'/);
  assert.match(lobby, /footer\.className = 'lobby-footer'/);
  assert.match(css, /\.lobby-panel\s*\{[^}]*max-height:\s*calc\(100% - 16px\);[^}]*overflow:\s*hidden;/);
  assert.match(css, /\.lobby-scroll-body\s*\{[^}]*overflow-y:\s*auto;[^}]*touch-action:\s*pan-y;/);
  assert.match(css, /\.lobby-footer\s*\{[^}]*flex-shrink:\s*0;/);
});
