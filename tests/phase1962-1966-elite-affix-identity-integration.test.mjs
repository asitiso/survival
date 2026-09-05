import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemySource = readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');

test('phase 1962 game loads elite affix atlas independently and passes it to enemy rendering', () => {
  assert.match(gameSource, /ELITE_AFFIX_IDENTITY_ATLAS/);
  assert.match(gameSource, /eliteAffixIdentityAtlasImage/);
  assert.match(gameSource, /eliteAffixIdentityAtlasReady/);
  assert.match(gameSource, /initializeEliteAffixIdentityAtlas\(\)/);
  assert.match(gameSource, /image\.src\s*=\s*ELITE_AFFIX_IDENTITY_ATLAS\.src/);
  assert.match(gameSource, /renderEnemies\([\s\S]*this\.eliteAffixIdentityAtlasImage,[\s\S]*this\.eliteAffixIdentityAtlasReady/);
});

test('phase 1962-1966 elite rendering is icon-first with static state emphasis and legacy text fallback', () => {
  assert.match(enemySource, /eliteAffixIdentityIcon/);
  assert.match(enemySource, /eliteAffixIdentityRowLayout/);
  assert.match(enemySource, /eliteAffixIdentityEmphasis/);
  assert.match(enemySource, /eliteAffixAtlasReady\s*&&\s*eliteAffixAtlasImage/);
  assert.match(enemySource, /ctx\.drawImage\(eliteAffixAtlasImage/);
  assert.match(enemySource, /enemy\.hp\s*\/\s*Math\.max\(1,\s*enemy\.maxHp\)/);
  assert.match(enemySource, /enemy\.manaShield\s*\/\s*Math\.max\(1,\s*enemy\.maxManaShield\)/);
  assert.match(enemySource, /enemy\.eliteAffixes\.map\(eliteAffixLabel\)\.join\('·'\)/);
  assert.match(enemySource, /ctx\.fillText\(text,\s*0,/);
});

test('phase 1962-1966 affix presentation does not alter elite spawn modifiers or two-affix selection rules', () => {
  assert.match(enemySource, /const eliteAffixes = type === 'elite' \? selectEliteAffixes\(danger\) : \[\]/);
  assert.match(enemySource, /const affix = eliteAffixModifiers\(eliteAffixes\)/);
  assert.match(enemySource, /speed: stats\.speed \* affix\.speedMultiplier/);
  assert.match(enemySource, /damageTakenMultiplier: affix\.damageTakenMultiplier/);
  assert.match(enemySource, /regenPerSecondRatio: affix\.regenPerSecondRatio/);
  assert.match(enemySource, /lowHpDamageMultiplier: affix\.lowHpDamageMultiplier/);
  assert.match(enemySource, /commandAuraMultiplier: affix\.commandAuraMultiplier/);
  assert.match(enemySource, /manaShield: stats\.hp \* affix\.shieldRatio/);
});
