import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { buildCompletionSpeedSamples, auditBuildCompletionSpeed } from '../dist/game/build-completion-speed-audit.js';

test('phase 375 build completion audit covers 4 heroes x 4 archetypes x 3 threats',()=>{
  const audit=auditBuildCompletionSpeed();
  assert.equal(audit.combinations.length,48);
  for(const hero of HERO_PROFILES)assert.equal(audit.combinations.filter((entry)=>entry.heroId===hero.id).length,12);
});

test('phase 376 focused build progress rises monotonically from 10 through 60 minutes',()=>{
  const samples=buildCompletionSpeedSamples();
  const keys=[...new Set(samples.map((sample)=>`${sample.heroId}|${sample.archetype}|${sample.threat}`))];
  assert.equal(keys.length,48);
  for(const key of keys){
    const group=samples.filter((sample)=>`${sample.heroId}|${sample.archetype}|${sample.threat}`===key).sort((a,b)=>a.minute-b.minute);
    assert.equal(group.length,8);
    for(let i=1;i<group.length;i++)assert.ok(group[i].completionProgress>=group[i-1].completionProgress);
    assert.equal(group.at(-1).completionProgress,1);
  }
});

test('phase 377 coherent archetypes complete inside a bounded release window',()=>{
  const audit=auditBuildCompletionSpeed();
  assert.equal(audit.passed,true);
  assert.ok(audit.minCompletionMinute>=15);
  assert.ok(audit.maxCompletionMinute<=30);
  assert.ok(audit.maxHeroCompletionSpread<=1.35);
});

test('phase 378 threat choice does not silently slow level-driven build completion',()=>{
  const audit=auditBuildCompletionSpeed();
  assert.equal(audit.threatParity,true);
  for(const hero of HERO_PROFILES)for(const archetype of ['burst','cycle','domain','fortress']){
    const group=audit.combinations.filter((entry)=>entry.heroId===hero.id&&entry.archetype===archetype);
    assert.equal(new Set(group.map((entry)=>entry.completionMinute)).size,1);
  }
});
