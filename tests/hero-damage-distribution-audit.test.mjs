import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { auditHeroDamageDistribution, heroDamageDistributionSamples } from '../dist/game/hero-damage-distribution-audit.js';

test('phase 351 damage distribution audit samples four heroes at threats zero three and five',()=>{
  const samples=heroDamageDistributionSamples();
  assert.equal(samples.length,12);
  for(const hero of HERO_PROFILES)assert.deepEqual(samples.filter((sample)=>sample.heroId===hero.id).map((sample)=>sample.threat),[0,3,5]);
});

test('phase 352 hero and core damage source shares normalize and no unavoidable source dominates',()=>{
  const audit=auditHeroDamageDistribution();
  assert.equal(audit.sharesNormalized,true);
  assert.equal(audit.sourceDominanceBounded,true);
  for(const sample of audit.samples){
    const heroSum=Object.values(sample.heroDamageShares).reduce((a,b)=>a+b,0);
    const coreSum=Object.values(sample.coreDamageShares).reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(heroSum-1)<0.002);
    assert.ok(Math.abs(coreSum-1)<0.002);
    assert.ok(Math.max(...Object.values(sample.heroDamageShares))<=0.55);
    assert.ok(Math.max(...Object.values(sample.coreDamageShares))<=0.60);
  }
});

test('phase 353 relative hero loss and guardian core loss stay inside role-aware release spreads',()=>{
  const audit=auditHeroDamageDistribution();
  assert.equal(audit.heroLossSpreadBounded,true);
  assert.equal(audit.coreLossSpreadBounded,true);
  assert.ok(audit.maxHeroLossSpread<=1.55);
  assert.ok(audit.maxCoreLossSpread<=1.75);
});

test('phase 354 damage load rises monotonically with threat for every hero without flattening Edric core identity',()=>{
  const audit=auditHeroDamageDistribution();
  assert.equal(audit.threatMonotonic,true);
  assert.equal(audit.passed,true);
  for(const hero of HERO_PROFILES){
    const samples=audit.samples.filter((sample)=>sample.heroId===hero.id).sort((a,b)=>a.threat-b.threat);
    assert.ok(samples[0].heroLossIndex<samples[1].heroLossIndex&&samples[1].heroLossIndex<samples[2].heroLossIndex);
    assert.ok(samples[0].coreLossIndex<samples[1].coreLossIndex&&samples[1].coreLossIndex<samples[2].coreLossIndex);
  }
  const threat3=audit.samples.filter((sample)=>sample.threat===3);
  const edric=threat3.find((sample)=>sample.heroId==='edric');
  assert.ok(edric.coreLossIndex===Math.min(...threat3.map((sample)=>sample.coreLossIndex)));
});
