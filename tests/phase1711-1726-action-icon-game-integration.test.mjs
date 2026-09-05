import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const atlasPath = new URL('../assets/ui/action-icons.png', import.meta.url);

test('phase 1711-1718 game preloads one action icon atlas and falls back without blocking controls', () => {
  assert.match(gameSource, /ACTION_ICON_ATLAS/);
  assert.match(gameSource, /actionIconAtlasReady/);
  assert.match(gameSource, /initializeActionIconAtlas/);
  assert.match(gameSource, /onload/);
  assert.match(gameSource, /onerror/);
});

test('phase 1719-1726 control renderer draws atlas sprite before labels while preserving text labels', () => {
  assert.match(gameSource, /actionIconSprite\(button\.id\)/);
  assert.match(gameSource, /actionIconPresentation\(button\.radius,\s*this\.actionIconAtlasReady\)/);
  assert.match(gameSource, /ctx\.drawImage\(/);
  assert.match(gameSource, /ctx\.fillText\(buttonLabel,\s*button\.x,\s*button\.y \+ iconPresentation\.labelOffsetY\)/);
  assert.match(gameSource, /ctx\.fillText\(secondaryLabel,\s*button\.x,\s*button\.y \+ iconPresentation\.secondaryOffsetY\)/);
});

test('phase 1727-1734 generated atlas stays a single lightweight static PNG resource', () => {
  const bytes = statSync(atlasPath).size;
  assert.ok(bytes > 0);
  assert.ok(bytes <= 350_000, `atlas bytes ${bytes}`);
  const signature = readFileSync(atlasPath).subarray(0, 8);
  assert.deepEqual([...signature], [137, 80, 78, 71, 13, 10, 26, 10]);
});
