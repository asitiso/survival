import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { heroReleaseModel } from '../dist/game/hero-release-model.js';
import { auditHeroThreatReleaseBalance } from '../dist/game/hero-threat-release-audit.js';

test('phase 343 hero release model keeps four asymmetric roles inside bounded release spreads',()=>{
  const models=HERO_PROFILES.map((hero)=>heroReleaseModel(hero.id));
  assert.equal(models.length,4);
  const ratio=(field)=>Math.max(...models.map((m)=>m[field]))/Math.min(...models.map((m)=>m[field]));
  assert.ok(ratio('offenseIndex')<=1.35);
  assert.ok(ratio('survivalIndex')<=1.35);
  assert.ok(ratio('coreGuardIndex')<=1.70);
  assert.ok(ratio('compositeIndex')<=1.10);
  assert.ok(models.every((m)=>m.offenseIndex>0&&m.controlIndex>=1&&m.compositeIndex>0));
});

test('phase 344 hero threat audit samples 4 heroes x 3 threats x 6 first-thirty checkpoints',()=>{
  const audit=auditHeroThreatReleaseBalance();
  assert.equal(audit.checkpoints.length,72);
  assert.deepEqual([...new Set(audit.checkpoints.map((point)=>point.threat))],[0,3,5]);
  assert.deepEqual([...new Set(audit.checkpoints.map((point)=>point.minute))],[5,10,15,20,25,30]);
  assert.ok(audit.checkpoints.every((point)=>Number.isFinite(point.releaseMargin)&&point.releaseMargin>0));
});

test('phase 345 threat pressure rises monotonically and every hero margin falls with threat',()=>{
  const audit=auditHeroThreatReleaseBalance();
  assert.equal(audit.threatMonotonic,true);
  assert.equal(audit.heroMarginsMonotonic,true);
  for(const hero of HERO_PROFILES){
    for(const minute of [5,10,15,20,25,30]){
      const samples=audit.checkpoints.filter((point)=>point.heroId===hero.id&&point.minute===minute).sort((a,b)=>a.threat-b.threat);
      assert.equal(samples.length,3);
      assert.ok(samples[0].pressureIndex<samples[1].pressureIndex&&samples[1].pressureIndex<samples[2].pressureIndex);
      assert.ok(samples[0].releaseMargin>samples[1].releaseMargin&&samples[1].releaseMargin>samples[2].releaseMargin);
    }
  }
});

test('phase 346 release balance audit passes all role spread ceilings without flattening hero identity',()=>{
  const audit=auditHeroThreatReleaseBalance();
  assert.equal(audit.passed,true);
  assert.ok(audit.maxOffenseSpread>1.10&&audit.maxOffenseSpread<=1.35);
  assert.ok(audit.maxSurvivalSpread<=1.35);
  assert.ok(audit.maxCoreGuardSpread<=1.70);
  assert.ok(audit.maxCompositeSpread<=1.10);
});
