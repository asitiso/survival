import test from 'node:test';
import assert from 'node:assert/strict';
import { bossGauntletVersatilitySamples, auditBossGauntletVersatility } from '../dist/game/boss-gauntlet-versatility-audit.js';

test('phase 407 gauntlet audit folds every threat-five completed build across all six boss identities',()=>{
  const samples=bossGauntletVersatilitySamples();
  assert.equal(samples.length,5760);
  assert.ok(samples.every((sample)=>sample.bossCount===6&&sample.gauntletIndex>0));
  assert.ok(samples.every((sample)=>sample.versatilityFloor>0&&sample.versatilityFloor<=1));
});

test('phase 408 each hero keeps a generalist build with no catastrophic boss matchup',()=>{
  const audit=auditBossGauntletVersatility();
  assert.equal(audit.heroes.length,4);
  assert.ok(audit.minTopBuildVersatilityFloor>=0.82);
  assert.equal(audit.catastrophicTopBuildCount,0);
});

test('phase 409 boss specialists cannot outclass the best gauntlet build by a large margin',()=>{
  const audit=auditBossGauntletVersatility();
  assert.ok(audit.maxSpecialistGain<=1.18);
  assert.ok(audit.maxHeroGauntletSpread<=1.18);
});

test('phase 410 boss gauntlet versatility audit passes release bounds',()=>{
  assert.equal(auditBossGauntletVersatility().passed,true);
});
