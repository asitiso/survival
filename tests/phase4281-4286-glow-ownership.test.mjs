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

test('protected glow owners keep canonical blur radius while dense secondary halos yield',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const normalProjectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:false,bossActive:false,crowd:1});
  const impact=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.5,confidence:1,critical:true,bossActive:true,crowd:1});
  assert.equal(projectile.glowBlurScale,1);
  assert.equal(telegraph.glowBlurScale,1);
  assert.equal(lane.glowBlurScale,1);
  assert.ok(normalProjectile.glowBlurScale<1);
  assert.ok(impact.glowBlurScale<1);
  assert.ok(hazard.glowBlurScale<1);
});

test('glow budget protects canonical owners and reduces secondary blur occupancy under stress',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(dense.canonicalGlowBlurScale,1);
  assert.equal(dense.safeLaneGlowBlurScale,1);
  assert.ok(dense.secondaryGlowBlurScale<low.secondaryGlowBlurScale);
});

test('live projectile and spell halo shadowBlur paths consume presentation-only glow scales',()=>{
  const enemies=src('enemies.ts'),spells=src('spells.ts');
  assert.match(enemies,/projectileReadabilityContrast\.glowBlurScale/);
  assert.match(enemies,/projectile\.bossArchetype\?10:/);
  assert.match(spells,/glowOwnershipPresentation\(/);
  assert.match(spells,/shadowBlur\s*=\s*18\s*\*/);
});
