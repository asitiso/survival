import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRunCheckpointState, advanceRunCheckpoints } from '../dist/game/endless/run-checkpoints.js';
import { createDefaultEndlessState, advanceEndlessRuntime } from '../dist/game/endless/runtime.js';
import { serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';

function legacy(elapsedMs){return {heroId:'arkan',elapsedMs,level:80,threat:5,kills:12000,bossesDefeated:30,elitesDefeated:500,gold:8000,xp:20000,guardianCoreHp:900,guardianCoreMaxHp:1000,fate:'guardian',spellFusionCount:2,mapEvolutionRank:8,masteryLevel:20,deviceClass:'low'};}

test('run checkpoints fire at five long-run milestones exactly once',()=>{
  let state=createDefaultRunCheckpointState();
  let step=advanceRunCheckpoints(state,89*60_000+59_999); assert.equal(step.reached,null); state=step.state;
  step=advanceRunCheckpoints(state,90*60_000); assert.equal(step.reached?.minute,90); state=step.state;
  step=advanceRunCheckpoints(state,91*60_000); assert.equal(step.reached,null); state=step.state;
  for(const minute of [180,300,480,720]){step=advanceRunCheckpoints(state,minute*60_000);assert.equal(step.reached?.minute,minute);state=step.state;}
  assert.deepEqual(state.reachedMilestones,[90,180,300,480,720]);
});

test('checkpoint catch-up marks old milestones without spamming more than one receipt',()=>{
  const step=advanceRunCheckpoints(createDefaultRunCheckpointState(),500*60_000);
  assert.equal(step.reached?.minute,480);
  assert.deepEqual(step.state.reachedMilestones,[90,180,300,480]);
  assert.equal(advanceRunCheckpoints(step.state,500*60_000).reached,null);
});

test('checkpoint state survives extension snapshot and older snapshots migrate to empty state',()=>{
  const state=createDefaultEndlessState(77); state.checkpoints={reachedMilestones:[90,180,300]};
  const restored=restoreExtension(serializeExtension(state),1);
  assert.deepEqual(restored.checkpoints,state.checkpoints);
  const legacy=structuredClone(state); delete legacy.checkpoints;
  assert.deepEqual(restoreExtension(legacy,1).checkpoints,createDefaultRunCheckpointState());
});

test('endless runtime emits a non-modal checkpoint effect at the milestone',()=>{
  const state=createDefaultEndlessState(1);
  const step=advanceEndlessRuntime({legacy:legacy(90*60_000),state,deltaMs:16,events:[]});
  const effect=step.effects.find((e)=>e.type==='run_checkpoint');
  assert.equal(effect?.minute,90);
  assert.match(effect?.title,/CHECKPOINT/);
  assert.deepEqual(step.state.checkpoints.reachedMilestones,[90]);
});
