import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileReadabilityContrastPresentation,
  impactReadabilityContrastPresentation,
  hazardReadabilityContrastPresentation,
  safeLaneReadabilityContrastPresentation,
  readabilityContrastBudgetPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('protected threat color owners keep canonical value and chroma',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.4,confidence:1,critical:true,bossActive:true,crowd:1});
  assert.equal(projectile.valueScale,1);
  assert.equal(projectile.chromaScale,1);
  assert.equal(telegraph.valueScale,1);
  assert.equal(telegraph.chromaScale,1);
  assert.equal(lane.valueScale,1);
  assert.equal(lane.chromaScale,1);
});

test('secondary value and chroma step back as crowding rises',()=>{
  const low=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:.1});
  const dense=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  assert.ok(dense.valueScale<low.valueScale);
  assert.ok(dense.chromaScale<low.chromaScale);
  assert.ok(dense.valueScale>=.78);
  assert.ok(dense.chromaScale>=.62);
});

test('readability budget exposes secondary color separation without touching canonical owners',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(dense.canonicalValueScale,1);
  assert.equal(dense.canonicalChromaScale,1);
  assert.equal(dense.safeLaneValueScale,1);
  assert.equal(dense.safeLaneChromaScale,1);
  assert.ok(dense.secondaryValueScale<low.secondaryValueScale);
  assert.ok(dense.secondaryChromaScale<low.secondaryChromaScale);
});

test('live secondary render paths consume value and chroma filters while protected telegraph bypasses them',()=>{
  const enemies=src('enemies.ts'),spells=src('spells.ts'),game=src('game.ts');
  assert.match(enemies,/valueChromaFilter\(/);
  assert.match(spells,/valueChromaFilter\(/);
  assert.match(game,/hazard\.telegraph>0\?'none':valueChromaFilter\(/);
});
