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

test('dense halo budget tightens strong secondary glow envelope from three to one',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(low.strongGlowLimit,3);
  assert.equal(dense.strongGlowLimit,1);
  assert.equal(dense.canonicalGlowBlurScale,1);
  assert.equal(dense.safeLaneGlowBlurScale,1);
  assert.ok(dense.secondaryGlowBlurScale<low.secondaryGlowBlurScale);
});

test('dense family admission actively demotes lower-priority halo families',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:false,bossActive:false,crowd:1});
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const impact=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  assert.equal(projectile.strongGlow,true);
  assert.equal(hazard.strongGlow,false);
  assert.equal(impact.strongGlow,false);
  assert.ok(projectile.glowBlurScale>hazard.glowBlurScale);
  assert.ok(hazard.glowBlurScale>impact.glowBlurScale);
});

test('protected glow families remain canonical under dense halo pressure',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.5,confidence:1,critical:true,bossActive:true,crowd:1});
  assert.equal(projectile.glowBlurScale,1);
  assert.equal(telegraph.glowBlurScale,1);
  assert.equal(lane.glowBlurScale,1);
});

test('live spell halos consume dense family admission scale',()=>{
  const spells=src('spells.ts');
  assert.match(spells,/denseGlowFamilyPresentation\(/);
  assert.match(spells,/spellGlow\.glowBlurScale\*denseSpellGlow\.glowBlurScale/);
});
