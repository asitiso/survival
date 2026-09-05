import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';

test('Game bridges the endless runtime once per frame and persists it in the existing snapshot', () => {
  const source = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /advanceEndlessRuntime\(/);
  assert.match(source, /serializeExtension\(this\.endlessState\)/);
  assert.match(source, /restoreExtension\(snapshot\.endless/);
  assert.match(source, /buildLegacyRunView\(/);
});

test('contracts reuse LevelUpOverlay and battlefield nodes stay movement-driven without extra actions', () => {
  const source = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /acceptContract\(/);
  assert.match(source, /contractChoiceCards\(/);
  assert.match(source, /updateEndlessFieldNodes\(/);
  assert.match(source, /drawEndlessFieldNodes\(/);
  assert.equal(ACTION_BUTTONS.length, 9);
});
