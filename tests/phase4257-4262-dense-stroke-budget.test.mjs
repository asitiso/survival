import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileReadabilityContrastPresentation,
  impactReadabilityContrastPresentation,
  hazardReadabilityContrastPresentation,
  readabilityContrastBudgetPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('dense readability budget exposes a tightening secondary stroke envelope',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(low.strongStrokeLimit,3);
  assert.equal(dense.strongStrokeLimit,1);
  assert.equal(dense.canonicalStrokeWidthScale,1);
  assert.equal(dense.safeLaneStrokeWidthScale,1);
  assert.ok(dense.secondaryStrokeWidthScale<low.secondaryStrokeWidthScale);
});

test('dense family admission keeps one unprotected stroke family strong at extreme crowding',()=>{
  const p=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:false,bossActive:false,crowd:1});
  const h=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const i=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  assert.ok(p.strokeWidthScale>h.strokeWidthScale);
  assert.ok(h.strokeWidthScale>i.strokeWidthScale);
  assert.ok(i.strokeWidthScale<=.6);
});

test('protected projectile and telegraph stroke width remain canonical under dense budget',()=>{
  const p=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const h=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  assert.equal(p.strokeWidthScale,1);
  assert.equal(h.strokeWidthScale,1);
});

test('live unprotected strokes consume dense stroke budget while protected paths bypass it',()=>{
  const enemies=src('enemies.ts'),spells=src('spells.ts'),game=src('game.ts');
  assert.match(enemies,/projectileReadabilityContrastBudget\.secondaryStrokeWidthScale/);
  assert.match(spells,/impactReadabilityContrastBudget\.secondaryStrokeWidthScale/);
  assert.match(game,/hazardReadabilityContrastBudget\.secondaryStrokeWidthScale/);
  assert.doesNotMatch(game,/safeLaneReadabilityContrastBudget\.secondaryStrokeWidthScale/);
});
