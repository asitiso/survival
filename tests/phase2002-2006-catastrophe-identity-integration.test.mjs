import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { catastropheAt, catastropheModifiers } from '../dist/domain/catastrophe.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2002-2006 Game loads catastrophe atlas asynchronously and adds banner plus persistent HUD identity without replacing text',()=>{
  assert.match(source,/CATASTROPHE_IDENTITY_ATLAS/);
  assert.match(source,/catastropheIdentityIcon/);
  assert.match(source,/catastropheIdentityAtlasImage/);
  assert.match(source,/catastropheIdentityAtlasReady/);
  assert.match(source,/initializeCatastropheIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*CATASTROPHE_IDENTITY_ATLAS\.src/);
  assert.match(source,/drawCatastropheStatusIcon\(ctx/);
  assert.match(source,/ctx\.drawImage\(this\.catastropheIdentityAtlasImage/);
  assert.match(source,/ctx\.fillText\(this\.catastrophe\.name, 800, 387\)/);
  assert.match(source,/ctx\.fillText\(this\.catastrophe\.description, 800, 420\)/);
  assert.match(source,/disasterName:this\.catastrophe\?\.name/);
});

test('phase 2002-2006 catastrophe timing order and gameplay modifiers remain unchanged',()=>{
  assert.equal(catastropheAt(1199),null);
  const ids=[0,1,2,3,4,5].map(i=>catastropheAt(1200+180*i)?.id);
  assert.deepEqual(ids,['goldenNight','frenzy','arcaneSurge','redMoon','guardianGrace','goldenNight']);
  assert.deepEqual(catastropheModifiers(catastropheAt(1200)),{goldMultiplier:2,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1});
  assert.deepEqual(catastropheModifiers(catastropheAt(1380)),{goldMultiplier:1,enemySpeedMultiplier:1.22,cooldownMultiplier:1,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1});
  assert.deepEqual(catastropheModifiers(catastropheAt(1560)),{goldMultiplier:1,enemySpeedMultiplier:1.1,cooldownMultiplier:.82,spawnPressureMultiplier:1,eliteIntervalMultiplier:1,coreDamageMultiplier:1});
  assert.deepEqual(catastropheModifiers(catastropheAt(1740)),{goldMultiplier:1,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1.32,eliteIntervalMultiplier:.58,coreDamageMultiplier:1});
  assert.deepEqual(catastropheModifiers(catastropheAt(1920)),{goldMultiplier:1,enemySpeedMultiplier:1,cooldownMultiplier:1,spawnPressureMultiplier:1.08,eliteIntervalMultiplier:1,coreDamageMultiplier:.78});
});
