import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeBuildCapsule } from '../dist/domain/build-capsule.js';
import { createBuildReplayPlan, replayProgressPercent } from '../dist/domain/build-replay.js';
import { sanitizeRunSnapshot } from '../dist/domain/run-snapshot.js';

const target={
  version:1,heroId:'kain',traitId:'stormPursuit',threatLevel:4,mapId:'frozenFen',seed:424242,
  finalForm:'thunder-tyrant',ascensions:['storm-circuit','overcharge','sky-breaker'],fateChoices:['frenzy','guardian'],
  relic:'storm-crown',fusions:['thunder-singularity','glacial-conduit'],archetype:'burst',
  spellLevels:{fireBolt:8,chainLightning:10,frostNova:7,flameField:6,meteorStorm:5,blackHole:4},
};
const code=encodeBuildCapsule(target);

function snapshot(extra={}) {
  return {
    version:1,savedAt:1,heroId:'kain',traitId:'stormPursuit',threatLevel:4,elapsed:300,
    hero:{level:20,xp:10,xpNext:100,hp:100,maxHp:100,coins:50,kills:100},coreHp:500,
    spellLevels:{fireBolt:2,chainLightning:3,frostNova:2,flameField:2,meteorStorm:1,blackHole:1},
    equipment:{coins:50,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],
    map:{id:'frozenFen',evolutionStage:0},progression:{bossesKilled:2,goldEarned:50,shopTokens:0},...extra,
  };
}

test('build replay plan restores only progression-valid run start identity from a capsule',()=>{
  const plan=createBuildReplayPlan(code);
  assert.ok(plan);
  assert.deepEqual(plan.blueprint,{version:1,heroId:'kain',traitId:'stormPursuit',threatLevel:4,mapId:'frozenFen',seed:424242});
  assert.equal(plan.target.relic,'storm-crown');
  assert.equal(plan.target.spellLevels.chainLightning,10);
  assert.equal(createBuildReplayPlan('bad capsule'),null);
});

test('replay progress is deterministic monotonic and reaches one hundred only at the target build',()=>{
  const plan=createBuildReplayPlan(code); assert.ok(plan);
  const base={...target,finalForm:null,ascensions:[],fateChoices:[],relic:null,fusions:[],archetype:'cycle',spellLevels:{fireBolt:1,chainLightning:1,frostNova:1,flameField:1,meteorStorm:1,blackHole:1}};
  const mid={...base,relic:'storm-crown',fusions:['thunder-singularity'],fateChoices:['frenzy'],ascensions:['storm-circuit'],spellLevels:{fireBolt:4,chainLightning:6,frostNova:4,flameField:3,meteorStorm:2,blackHole:2}};
  const a=replayProgressPercent(plan,base), b=replayProgressPercent(plan,mid), c=replayProgressPercent(plan,target);
  assert.ok(a>=0 && a< b); assert.ok(b<c); assert.equal(c,100);
  assert.equal(replayProgressPercent(plan,structuredClone(mid)),b);
});

test('run snapshot preserves a valid replay capsule and drops malformed replay data',()=>{
  assert.equal(sanitizeRunSnapshot(snapshot({replayCapsule:code}))?.replayCapsule,code);
  assert.equal(sanitizeRunSnapshot(snapshot({replayCapsule:'BLD1.corrupt'}))?.replayCapsule,undefined);
});
