import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { bossRewardFairnessSamples, auditBossRewardFairness } from '../dist/game/boss-reward-fairness-audit.js';

test('phase 367 boss reward fairness samples 4 heroes x 6 archetypes x 3 progression states',()=>{
  const samples=bossRewardFairnessSamples();
  assert.equal(samples.length,72);
  for(const hero of HERO_PROFILES)assert.equal(samples.filter((sample)=>sample.heroId===hero.id).length,18);
  assert.deepEqual([...new Set(samples.map((sample)=>sample.stage))],['early','fusion_ready','late']);
});

test('phase 368 every boss reward keeps three cards with relic and growth access',()=>{
  const samples=bossRewardFairnessSamples();
  assert.ok(samples.every((sample)=>sample.choiceCount===3));
  assert.ok(samples.every((sample)=>sample.relicCount===1));
  assert.ok(samples.every((sample)=>sample.growthAccess===true));
  assert.ok(samples.filter((sample)=>sample.stage==='fusion_ready').every((sample)=>sample.fusionCount===1));
  assert.ok(samples.filter((sample)=>sample.stage!=='fusion_ready').every((sample)=>sample.fusionCount===0));
});

test('phase 369 hero structural access and relic pool size stay fair across every boss and stage',()=>{
  const audit=auditBossRewardFairness();
  assert.equal(audit.passed,true);
  assert.equal(audit.maxHeroAccessSpread,1);
  assert.equal(audit.maxRelicPoolSpread,1);
  assert.equal(audit.invalidChoiceCount,0);
});

test('phase 370 fairness audit preserves boss-specific relic access without hero lockout',()=>{
  const audit=auditBossRewardFairness();
  assert.equal(audit.bossRelicAccessComplete,true);
  assert.ok(audit.samples.every((sample)=>sample.relicCandidateCount>=4));
});
