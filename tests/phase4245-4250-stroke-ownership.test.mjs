import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileReadabilityContrastPresentation,
  impactReadabilityContrastPresentation,
  hazardReadabilityContrastPresentation,
  safeLaneReadabilityContrastPresentation,
  specialistReadabilityContrastPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('protected stroke owners keep canonical width while dense secondary edges yield',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const impact=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.2,confidence:1,critical:true,bossActive:true,crowd:1});
  const recovery=specialistReadabilityContrastPresentation({silhouetteFloor:.2,trailScale:1,owner:'recovery',critical:false,crowd:1});
  assert.equal(projectile.strokeWidthScale,1);
  assert.equal(telegraph.strokeWidthScale,1);
  assert.equal(lane.strokeWidthScale,1);
  assert.ok(impact.strokeWidthScale<1);
  assert.ok(hazard.strokeWidthScale<1);
  assert.ok(recovery.strokeWidthScale<1);
});

test('live canvas stroke widths consume presentation-only width scale',()=>{
  assert.match(src('enemies.ts'),/projectileReadabilityContrast\.strokeWidthScale/);
  assert.match(src('spells.ts'),/impactReadabilityContrast\.strokeWidthScale/);
  assert.match(src('game.ts'),/hazardReadabilityContrast\.strokeWidthScale/);
  assert.match(src('game.ts'),/safeLaneReadabilityContrast\.strokeWidthScale/);
});
