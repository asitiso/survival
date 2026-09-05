import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceRunMilestoneRecap, createDefaultRunMilestoneRecapState, sanitizeRunMilestoneRecapState } from '../dist/game/endless/run-milestone-recap.js';
import { advanceEndlessRuntime, createDefaultEndlessState } from '../dist/game/endless/runtime.js';
import { restoreExtension, serializeExtension } from '../dist/game/endless/snapshot.js';

function view(minutes,kills=0,bosses=0){return {heroId:'arkan',elapsedMs:minutes*60_000,level:80,threat:5,kills,bossesDefeated:bosses,elitesDefeated:20,gold:1000,xp:200,guardianCoreHp:1500,guardianCoreMaxHp:1800,fate:'none',spellFusionCount:2,mapEvolutionRank:2,masteryLevel:20,deviceClass:'high'};}

test('phase 115 run milestone recap fires at the five meaningful long-run milestones',()=>{
  let state=createDefaultRunMilestoneRecapState();
  const receipts=[];
  for(const minute of [119,120,239,240,359,360,479,480,719,720]){
    const result=advanceRunMilestoneRecap(state,view(minute,minute*20,Math.floor(minute/12)));
    state=result.state; if(result.reached) receipts.push(result.reached.minute);
  }
  assert.deepEqual(receipts,[120,240,360,480,720]);
});

test('phase 116 long resume catch-up collapses multiple missed recaps into one latest receipt',()=>{
  const result=advanceRunMilestoneRecap(createDefaultRunMilestoneRecapState(),view(500,15000,40));
  assert.deepEqual(result.state.reachedMilestones,[120,240,360,480]);
  assert.equal(result.reached?.minute,480);
  assert.equal(result.reached?.killsDelta,15000);
  assert.equal(result.reached?.bossesDelta,40);
});

test('phase 117 recap headline is compact and driven by run deltas',()=>{
  let state=createDefaultRunMilestoneRecapState();
  let result=advanceRunMilestoneRecap(state,view(120,4800,4)); state=result.state;
  result=advanceRunMilestoneRecap(state,view(240,10800,12));
  assert.ok(result.reached);
  assert.ok(result.reached.headline.length<=18);
  assert.equal(result.reached.killsDelta,6000);
  assert.equal(result.reached.bossesDelta,8);
});

test('phase 118 recap state sanitizes and survives extension snapshot migration',()=>{
  assert.deepEqual(sanitizeRunMilestoneRecapState({reachedMilestones:[120,120,999,240],lastKills:-5,lastBosses:3}),{reachedMilestones:[120,240],lastKills:0,lastBosses:3});
  const extension=createDefaultEndlessState(77);
  extension.recaps={reachedMilestones:[120,240],lastKills:9000,lastBosses:9};
  const restored=restoreExtension(serializeExtension(extension),3);
  assert.deepEqual(restored.recaps,extension.recaps);
  const legacy={...extension}; delete legacy.recaps;
  assert.deepEqual(restoreExtension(legacy,3).recaps,createDefaultRunMilestoneRecapState());
});

test('phase 118 endless runtime emits at most one non-blocking recap effect per update',()=>{
  const state=createDefaultEndlessState(1);
  const out=advanceEndlessRuntime({legacy:view(500,12000,30),state,deltaMs:16,events:[]});
  const effects=out.effects.filter((e)=>e.type==='run_milestone_recap');
  assert.equal(effects.length,1);
  assert.equal(effects[0].minute,480);
});
