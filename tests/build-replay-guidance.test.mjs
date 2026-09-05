import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeBuildCapsule } from '../dist/domain/build-capsule.js';
import { createBuildReplayPlan } from '../dist/domain/build-replay.js';
import { replayGuidance } from '../dist/domain/build-replay-guidance.js';

const target={
  version:1,heroId:'kain',traitId:'stormPursuit',threatLevel:4,mapId:'frozenFen',seed:424242,
  finalForm:'thunder-tyrant',ascensions:['storm-circuit','overcharge','sky-breaker'],fateChoices:['frenzy','guardian'],
  relic:'storm-crown',fusions:['thunder-singularity','glacial-conduit'],archetype:'burst',
  spellLevels:{fireBolt:8,chainLightning:10,frostNova:7,flameField:6,meteorStorm:5,blackHole:4},
};
const plan=createBuildReplayPlan(encodeBuildCapsule(target));
assert.ok(plan);

function current(extra={}){
  return {...target,
    finalForm:null,ascensions:[],fateChoices:[],relic:null,fusions:[],archetype:'cycle',
    spellLevels:{fireBolt:1,chainLightning:1,frostNova:1,flameField:1,meteorStorm:1,blackHole:1},
    ...extra,
  };
}

test('phase 103 replay guidance chooses the highest-impact missing target deterministically',()=>{
  const a=replayGuidance(plan,current());
  const b=replayGuidance(plan,structuredClone(current()));
  assert.deepEqual(a,b);
  assert.equal(a.category,'relic');
  assert.match(a.label,/유물/);
  assert.ok(a.progress>=0 && a.progress<100);
});

test('phase 104 replay guidance becomes a concrete spell-level target after larger gaps are satisfied',()=>{
  const guide=replayGuidance(plan,current({relic:'storm-crown',fusions:['thunder-singularity','glacial-conduit'],ascensions:['storm-circuit','overcharge','sky-breaker'],fateChoices:['frenzy','guardian'],finalForm:'thunder-tyrant',archetype:'burst'}));
  assert.equal(guide.category,'spell');
  assert.match(guide.label,/Lv\.10/);
  assert.ok(guide.label.length<=36);
});

test('phase 105 guidance is complete only at the exact target build',()=>{
  const almost={...target,spellLevels:{...target.spellLevels,chainLightning:9}};
  assert.notEqual(replayGuidance(plan,almost).category,'complete');
  const done=replayGuidance(plan,target);
  assert.equal(done.progress,100);
  assert.equal(done.category,'complete');
  assert.equal(done.label,'빌드 재현 완료');
});

test('phase 106 guidance copy always stays one-line compact',()=>{
  for(const payload of [current(),target,current({relic:'storm-crown'})]){
    const guide=replayGuidance(plan,payload);
    assert.equal(guide.label.includes('\n'),false);
    assert.ok(guide.label.length<=36);
  }
});
