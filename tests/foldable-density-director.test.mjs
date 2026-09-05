import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import { foldableDensityPolicy } from '../dist/game/foldable-density-director.js';

test('standard layouts preserve full HUD density',()=>{
  const safe=landscapeSafeAreaProfile(1600,900);
  const p=foldableDensityPolicy(safe,{bossActive:true,mythicActive:true,longRunTier:3,maxBuildLabels:4});
  assert.equal(p.foldable,false);
  assert.equal(p.showXpNumbers,true);
  assert.equal(p.showMeterText,true);
  assert.equal(p.maxBuildLabels,4);
  assert.equal(p.statusMaxChars,safe.statusMaxChars);
});

test('foldable density compresses progressively for boss and mythic pressure',()=>{
  const safe=landscapeSafeAreaProfile(2208,1840);
  const calm=foldableDensityPolicy(safe,{bossActive:false,mythicActive:false,longRunTier:0,maxBuildLabels:4});
  const boss=foldableDensityPolicy(safe,{bossActive:true,mythicActive:false,longRunTier:1,maxBuildLabels:4});
  const mythic=foldableDensityPolicy(safe,{bossActive:true,mythicActive:true,longRunTier:3,maxBuildLabels:4});
  assert.equal(calm.foldable,true);
  assert.ok(calm.maxBuildLabels>boss.maxBuildLabels);
  assert.ok(boss.maxBuildLabels>=mythic.maxBuildLabels);
  assert.equal(mythic.showXpNumbers,false);
  assert.equal(mythic.showMeterText,false);
  assert.ok(mythic.statusMaxChars>=20);
});

test('foldable policy never removes critical HP or status bars',()=>{
  const safe=landscapeSafeAreaProfile(2208,1840);
  const p=foldableDensityPolicy(safe,{bossActive:true,mythicActive:true,longRunTier:4,maxBuildLabels:1});
  assert.equal(p.showHpNumbers,true);
  assert.equal(p.showXpBar,true);
  assert.equal(p.showMeterBar,true);
  assert.ok(p.maxBuildLabels>=1);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('game applies foldable density to status text and build label count',()=>{
  assert.ok(gameSource.includes('foldableDensityPolicy'));
  assert.ok(gameSource.includes('density.statusMaxChars'));
  assert.ok(gameSource.includes('density.maxBuildLabels'));
  assert.ok(gameSource.includes('density.showXpNumbers'));
});
