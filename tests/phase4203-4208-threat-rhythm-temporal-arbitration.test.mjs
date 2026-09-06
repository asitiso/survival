import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  criticalTemporalPriorityPresentation,
  safeLaneTemporalPriorityPresentation,
  bossTelegraphTemporalPriorityPresentation,
  canonicalBodyTemporalProtectionPresentation,
  secondaryRhythmTemporalRetirementPresentation,
  unifiedTemporalArbitrationPresentation,
} from '../dist/game/threat-rhythm-temporal-arbitration-rendering.js';

test('Phase 4203 critical ownership remains absolute under peak-family pressure',()=>{
  const p=criticalTemporalPriorityPresentation({criticalCount:3,pressure:1,secondaryPeak:1,heroProximity:1});
  assert.equal(p.criticalScale,1);
  assert.equal(p.canonicalScale,1);
  assert.ok(p.secondaryScale<=.56);
  assert.ok(p.reserve>=.8);
});

test('Phase 4204 safe lane wins temporal crossing while boss edge remains legible',()=>{
  const p=safeLaneTemporalPriorityPresentation({confidence:1,crossing:1,bossPressure:1,secondaryPeak:1,critical:true});
  assert.ok(p.safeLaneScale>=1);
  assert.ok(p.bossEdgeScale>=.84);
  assert.ok(p.secondaryScale<p.bossEdgeScale);
});

test('Phase 4205 boss telegraph edge outranks its decorative interior rhythm',()=>{
  const p=bossTelegraphTemporalPriorityPresentation({charge:1,hazardPressure:1,secondaryPeak:1,critical:true});
  assert.equal(p.bossEdgeScale,1);
  assert.ok(p.bossInteriorScale<.76);
  assert.ok(p.secondaryScale<=p.bossInteriorScale);
});

test('Phase 4206 canonical projectile and character body stay protected under crowd rhythm',()=>{
  const p=canonicalBodyTemporalProtectionPresentation({crowd:1,secondaryPeak:1,critical:true,bossActive:true});
  assert.equal(p.bodyScale,1);
  assert.equal(p.canonicalScale,1);
  assert.ok(p.trailScale<.72);
});

test('Phase 4207 stale secondary rhythm retires before canonical information',()=>{
  const fresh=secondaryRhythmTemporalRetirementPresentation({life:1,churn:.2,pressure:.2,critical:false});
  const stale=secondaryRhythmTemporalRetirementPresentation({life:.15,churn:1,pressure:1,critical:false});
  assert.equal(stale.canonicalScale,1);
  assert.ok(stale.secondaryScale<fresh.secondaryScale);
  assert.ok(stale.secondaryScale<=.5);
});

test('Phase 4208 unified arbitration preserves critical > lane > boss edge > canonical > secondary policy',()=>{
  const p=unifiedTemporalArbitrationPresentation({criticalCount:3,safeLaneVisible:true,laneConfidence:1,bossActive:true,bossCharge:1,projectilePressure:1,impactPressure:1,hazardPressure:1,secondaryFamilies:6,heroProximity:1});
  assert.equal(p.criticalScale,1);
  assert.equal(p.canonicalScale,1);
  assert.ok(p.safeLaneScale>=p.bossEdgeScale);
  assert.ok(p.bossEdgeScale>=.84);
  assert.ok(p.secondaryScale<=.55);
});

test('Phase 4203-4208 reduced motion/flash never increases temporal secondary intensity',()=>{
  const input={criticalCount:2,safeLaneVisible:true,laneConfidence:1,bossActive:true,bossCharge:1,projectilePressure:1,impactPressure:1,hazardPressure:1,secondaryFamilies:6,heroProximity:1};
  const normal=unifiedTemporalArbitrationPresentation(input,false,false);
  const reduced=unifiedTemporalArbitrationPresentation(input,true,true);
  assert.ok(reduced.secondaryScale<=normal.secondaryScale);
  assert.ok(reduced.safeLaneScale<=normal.safeLaneScale);
  assert.ok(reduced.bossEdgeScale<=normal.bossEdgeScale);
});

test('Phase 4203-4208 live renderers consume unified temporal arbitration',()=>{
  const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  const s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
  const g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(e,/canonicalBodyTemporalProtectionPresentation/);
  assert.match(e,/secondaryRhythmTemporalRetirementPresentation/);
  assert.match(s,/bossTelegraphTemporalPriorityPresentation/);
  assert.match(s,/secondaryRhythmTemporalRetirementPresentation/);
  assert.match(g,/criticalTemporalPriorityPresentation/);
  assert.match(g,/safeLaneTemporalPriorityPresentation/);
  assert.match(g,/unifiedTemporalArbitrationPresentation/);
});
