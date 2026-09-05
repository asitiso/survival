import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('phase 1954 game loads hero ability atlas independently and non-blocking', () => {
  assert.match(gameSource, /HERO_ABILITY_IDENTITY_ATLAS/);
  assert.match(gameSource, /heroAbilityIdentityIcon/);
  assert.match(gameSource, /isHeroAbilityActionId/);
  assert.match(gameSource, /heroAbilityIconAtlasImage/);
  assert.match(gameSource, /heroAbilityIconAtlasReady/);
  assert.match(gameSource, /initializeHeroAbilityIconAtlas\(\)/);
  assert.match(gameSource, /image\.src\s*=\s*HERO_ABILITY_IDENTITY_ATLAS\.src/);
});

test('phase 1954 six spell buttons prefer hero sprites but legacy action atlas remains fallback for every action', () => {
  assert.match(gameSource, /isHeroAbilityActionId\(button\.id\)/);
  assert.match(gameSource, /heroAbilityIdentityIcon\(this\.hero\.profileId,\s*button\.id\)/);
  assert.match(gameSource, /this\.heroAbilityIconAtlasReady\s*&&\s*this\.heroAbilityIconAtlasImage/);
  assert.match(gameSource, /actionIconSprite\(button\.id\)/);
  assert.match(gameSource, /this\.actionIconAtlasReady/);
  assert.match(gameSource, /ctx\.fillText\(buttonLabel/);
});
