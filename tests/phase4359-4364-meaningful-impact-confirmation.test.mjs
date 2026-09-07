import test from 'node:test';
import assert from 'node:assert/strict';
import { BossEncounterSystem } from '../dist/game/boss-encounters.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

test('Phase 4359-4364 boss magic targeting reports contact separately from weakpoint destruction',()=>{
  const encounter=new BossEncounterSystem();
  encounter.begin(1,'inferno',{x:400,y:220},0);
  const node=encounter.nodes[0];
  assert.ok(node);
  const contact=encounter.hitMagic(node.pos,10);
  assert.equal(contact.hit,true);
  assert.equal(contact.nodeId,node.id);
  assert.equal(contact.destroyed,false);
  assert.equal(contact.allDestroyed,false);
  const broken=encounter.hitMagic(node.pos,node.maxHp);
  assert.equal(broken.hit,true);
  assert.equal(broken.nodeId,node.id);
  assert.equal(broken.destroyed,true);
  assert.equal(broken.allDestroyed,false);
  const miss=encounter.hitMagic({x:0,y:0},10);
  assert.deepEqual(miss,{hit:false,nodeId:null,destroyed:false,allDestroyed:false});
});

test('repeated weakpoint contact is coalesced while the resolved break is never lost behind it',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addActionResult({x:100,y:100},'weakpointHit',{x:20,y:100});
  feedback.addActionResult({x:101,y:100},'weakpointHit',{x:20,y:100});
  assert.equal(feedback.activeCount,1);
  feedback.addActionResult({x:100,y:100},'weakpointBreak',{x:20,y:100});
  assert.equal(feedback.activeCount,2);
});

test('resolved guard, boss stagger and kill confirmations bypass ordinary contact throttling',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addActionResult({x:120,y:90},'normalHit',{x:20,y:90});
  feedback.addActionResult({x:120,y:90},'normalHit',{x:20,y:90});
  assert.equal(feedback.activeCount,1);
  feedback.addActionResult({x:120,y:90},'guardBreak',{x:20,y:90});
  feedback.addActionResult({x:120,y:90},'bossStagger',{x:20,y:90});
  feedback.addActionResult({x:120,y:90},'enemyKill',{x:20,y:90});
  assert.equal(feedback.activeCount,4);
});
