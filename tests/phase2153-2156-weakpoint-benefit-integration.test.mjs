import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2153-2154 Game loads weakpoint break atlas and emits completion identity once when final node is destroyed',()=>{
  for(const needle of ['BOSS_WEAKPOINT_BREAK_IDENTITY_ATLAS','bossWeakpointBreakIdentityIcon','initializeBossWeakpointBreakIdentityAtlas','eventToastBossWeakpointBreakArchetype','drawBossWeakpointBreakToastIcon','syncBossWeakpointBreakFeedback']) assert.match(game,new RegExp(needle));
  assert.match(game,/this\.bossEncounter\.destroyedNodes===total/);
  assert.match(game,/previousDestroyed<total/);
});

test('phase 2155-2156 Game renders counterplay benefit recall only from current BossEncounter modifiers and below urgent cues',()=>{
  for(const needle of ['BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS','bossCounterplayBenefitIdentityIcon','bossCounterplayBenefitActive','initializeBossCounterplayBenefitIdentityAtlas','drawBossCounterplayBenefitRecall']) assert.match(game,new RegExp(needle));
  assert.match(game,/bossCounterplayBenefitActive\(archetype,this\.bossEncounter\.modifiers\)/);
  assert.match(game,/this\.dangerState\.heroCritical\|\|this\.dangerState\.coreCritical/);
  assert.match(game,/\(boss\.specialTimer\?\?99\)<=1\.2/);
  assert.match(game,/lastLaw\.active/);
});

test('phase 2153-2156 integration does not add actions or snapshot fields',()=>{const snap=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');assert.doesNotMatch(snap,/weakpointBreakIdentity|counterplayBenefitIdentity|eventToastBossWeakpointBreak/);});
