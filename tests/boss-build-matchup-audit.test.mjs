import test from 'node:test';
import assert from 'node:assert/strict';
import { bossBuildMatchupSamples, auditBossBuildMatchups } from '../dist/game/boss-build-matchup-audit.js';

test('phase 387 boss matchup audit scores every threat-five completed build against six boss identities',()=>{
  const samples=bossBuildMatchupSamples();
  assert.equal(samples.length,34560);
  assert.deepEqual(new Set(samples.map((sample)=>sample.bossArchetype)),new Set(['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater']));
  assert.ok(samples.every((sample)=>sample.threat===5&&sample.matchupIndex>0));
});

test('phase 388 each boss exposes explicit best and worst completed build evidence',()=>{
  const audit=auditBossBuildMatchups();
  assert.equal(audit.bosses.length,6);
  for(const boss of audit.bosses){
    assert.ok(boss.best.matchupIndex>=boss.worst.matchupIndex);
    assert.ok(boss.bestToWorstSpread>=1);
    assert.equal(boss.topHeroCount,4);
  }
});

test('phase 389 boss best-worst build gaps and hero top envelopes stay bounded',()=>{
  const audit=auditBossBuildMatchups();
  assert.ok(audit.maxBestToWorstSpread<=2.10);
  assert.ok(audit.maxHeroTopSpread<=1.35);
  assert.ok(audit.minWorstReleaseMargin>=0.55);
});

test('phase 390 boss build matchup audit passes release bounds',()=>{
  assert.equal(auditBossBuildMatchups().passed,true);
});
