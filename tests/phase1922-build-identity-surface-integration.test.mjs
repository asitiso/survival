import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 1922 active HUD initializes and renders build identity atlas',()=>{
  const source=readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/initializeBuildIdentityAtlas\(\)/);
  assert.match(source,/drawBuildIdentityStrip\(/);
  assert.match(source,/BUILD_IDENTITY_ATLAS/);
});

test('phase 1922 lobby and results reuse build identity icons',()=>{
  const lobby=readFileSync(new URL('../src/ui/lobby.ts',import.meta.url),'utf8');
  const results=readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');
  assert.match(lobby,/buildIdentityIconStyle/);
  assert.match(lobby,/decodeBuildCapsule/);
  assert.match(results,/result-build-identities/);
  assert.match(results,/buildIdentityIconStyle/);
});
