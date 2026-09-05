import test from 'node:test';
import assert from 'node:assert/strict';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

const threeThreats={bossDamageTakenMultiplier:.90,specialCadenceMultiplier:.95,summonCountMultiplier:1.20,dashDistanceMultiplier:1.15};
const fourThreats={bossDamageTakenMultiplier:.90,specialCadenceMultiplier:.95,summonCountMultiplier:1.20,dashDistanceMultiplier:1.15};

test('phase 2375 reports two hidden threats when four visible threats compete for two chips',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure(threeThreats);
  assert.equal(p.visibleThreatCount,4); // all four inputs are threats in this fixture
  assert.equal(p.hiddenThreatCount,2);
  assert.equal(p.hiddenThreatLabel,'+2 위험');
});

test('phase 2376 reports exactly one hidden threat for a three-threat encounter',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:1.25,specialCadenceMultiplier:.95,summonCountMultiplier:1.20,dashDistanceMultiplier:1.15});
  assert.equal(p.visibleThreatCount,3);
  assert.equal(p.hiddenThreatCount,1);
  assert.equal(p.hiddenThreatLabel,'+1 위험');
});

test('phase 2377 keeps hidden-threat metadata empty when at most two threats are visible',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:1.25,specialCadenceMultiplier:.95,summonCountMultiplier:1.20,dashDistanceMultiplier:.80});
  assert.equal(p.visibleThreatCount,2);
  assert.equal(p.hiddenThreatCount,0);
  assert.equal(p.hiddenThreatLabel,'');
});
