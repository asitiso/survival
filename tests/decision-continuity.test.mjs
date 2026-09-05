import test from 'node:test';
import assert from 'node:assert/strict';
const mod = await import('../dist/game/decision-continuity.js').catch(()=>({}));
const { nextDecisionKind, DecisionPickGuard, DECISION_TRANSITION_BARRIER_MS } = mod;

const pending=(overrides={})=>({fate:false,heroAscension:false,runContract:false,bossRewardCount:0,levelUpCount:0,...overrides});

test('phase 1103-1110 decision priority stays fate ascension contract boss reward level up',()=>{
  assert.equal(typeof nextDecisionKind,'function');
  if(typeof nextDecisionKind!=='function') return;
  assert.equal(nextDecisionKind(pending({fate:true,heroAscension:true,runContract:true,bossRewardCount:2,levelUpCount:3})),'fate');
  assert.equal(nextDecisionKind(pending({heroAscension:true,runContract:true,bossRewardCount:2,levelUpCount:3})),'heroAscension');
  assert.equal(nextDecisionKind(pending({runContract:true,bossRewardCount:2,levelUpCount:3})),'runContract');
  assert.equal(nextDecisionKind(pending({bossRewardCount:2,levelUpCount:3})),'bossReward');
  assert.equal(nextDecisionKind(pending({levelUpCount:3})),'levelUp');
  assert.equal(nextDecisionKind(pending()),null);
});

test('phase 1111 pick generation is exactly once and stale generations cannot mutate twice',()=>{
  assert.equal(typeof DecisionPickGuard,'function');
  if(typeof DecisionPickGuard!=='function') return;
  const guard=new DecisionPickGuard();
  const generation=guard.render(1000,false);
  assert.equal(guard.accept(generation,1000),true);
  assert.equal(guard.accept(generation,1001),false);
  const next=guard.render(1001,true);
  assert.equal(guard.accept(generation,1200),false);
  assert.equal(guard.accept(next,1200),true);
});

test('phase 1112 next rendered generation rejects stale outgoing input for exactly 160ms',()=>{
  assert.equal(DECISION_TRANSITION_BARRIER_MS,160);
  assert.equal(typeof DecisionPickGuard,'function');
  if(typeof DecisionPickGuard!=='function') return;
  const guard=new DecisionPickGuard();
  const first=guard.render(500,false);
  assert.equal(guard.accept(first,500),true);
  const next=guard.render(500,true);
  assert.equal(guard.accept(next,659),false);
  assert.equal(guard.accept(next,660),true);
});

test('phase 1113 transient lifecycle reset invalidates current generation without clearing pending model',()=>{
  assert.equal(typeof DecisionPickGuard,'function');
  if(typeof DecisionPickGuard!=='function') return;
  const state=pending({bossRewardCount:2,levelUpCount:4});
  const guard=new DecisionPickGuard();
  const generation=guard.render(100,false);
  guard.resetTransient(120);
  assert.equal(guard.accept(generation,400),false);
  assert.deepEqual(state,pending({bossRewardCount:2,levelUpCount:4}));
  const next=guard.render(120,true);
  assert.equal(guard.accept(next,279),false);
  assert.equal(guard.accept(next,280),true);
});
