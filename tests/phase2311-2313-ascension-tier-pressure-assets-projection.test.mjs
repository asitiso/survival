import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const assetsUrl=new URL('../dist/game/ascension-tier-pressure-identity-assets.js',import.meta.url);
const projectionUrl=new URL('../dist/game/ascension-tier-pressure-projection.js',import.meta.url);

test('phase 2311 provides seven static ascension tier pressure identities in one atlas',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'ascension tier pressure identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.ASCENSION_TIER_PRESSURE_IDS,['enemy-health','enemy-damage','spawn-pressure','elite-pressure','gold','mastery','mutator-threshold']);
  assert.deepEqual(m.ASCENSION_TIER_PRESSURE_ATLAS,{src:'./assets/ui/ascension-tier-pressure-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  const a=m.auditAscensionTierPressureIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,7);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.ASCENSION_TIER_PRESSURE_IDS){const icon=m.ascensionTierPressureIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2312 projects the authoritative 30 minute start ten minute cadence and ninety second forecast window',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'ascension tier pressure projection module must exist');
  const m=await import(projectionUrl.href);
  const pre=m.projectAscensionTierForecast(29*60_000);assert.equal(pre.currentTier,0);assert.equal(pre.nextTier,1);assert.equal(pre.secondsToNext,60);assert.equal(pre.visible,true);
  const early=m.projectAscensionTierForecast(28*60_000);assert.equal(early.currentTier,0);assert.equal(early.nextTier,1);assert.equal(early.secondsToNext,120);assert.equal(early.visible,false);
  const tier1=m.projectAscensionTierForecast(38.5*60_000);assert.equal(tier1.currentTier,1);assert.equal(tier1.nextTier,2);assert.equal(tier1.secondsToNext,90);assert.equal(tier1.visible,true);
  const cap=m.projectAscensionTierForecast(121*60_000);assert.equal(cap.currentTier,10);assert.equal(cap.nextTier,null);assert.equal(cap.secondsToNext,0);assert.equal(cap.visible,false);assert.deepEqual(cap.effects,[]);
});

test('phase 2312 derives real pressure and reward deltas from getAscensionModifiers and marks mutator thresholds',async()=>{
  const m=await import(projectionUrl.href);
  const p=m.projectAscensionTierOutcome(3);assert.equal(p.fromTier,2);assert.equal(p.toTier,3);assert.equal(p.mutatorThreshold,true);
  const byId=Object.fromEntries(p.effects.map(v=>[v.id,v]));
  assert.equal(byId['enemy-health'].before,1.2);assert.equal(byId['enemy-health'].after,1.3);assert.equal(byId['enemy-health'].delta,0.1);
  assert.equal(byId['enemy-damage'].before,1.14);assert.equal(byId['enemy-damage'].after,1.21);assert.equal(byId['enemy-damage'].delta,0.07);
  assert.equal(byId['spawn-pressure'].delta,0.06);assert.equal(byId['elite-pressure'].delta,0.05);assert.equal(byId.gold.delta,0.04);assert.equal(byId.mastery.delta,0.05);
  assert.deepEqual(p.primaryPressureIds,['enemy-health','enemy-damage']);assert.match(m.ascensionTierPressureHint(p),/HP\+0\.10×/);assert.match(m.ascensionTierPressureHint(p),/피해\+0\.07×/);assert.match(m.ascensionTierPressureHint(p),/변이/);
});

test('phase 2313 threshold detection is limited to tiers three six and nine and tier ten remains capped',async()=>{
  const m=await import(projectionUrl.href);
  assert.deepEqual([1,2,3,4,5,6,7,8,9,10].filter(t=>m.projectAscensionTierOutcome(t).mutatorThreshold),[3,6,9]);
  const capped=m.projectAscensionTierOutcome(10);assert.equal(capped.toTier,10);assert.equal(capped.effects.length,6);assert.equal(capped.mutatorThreshold,false);
});
