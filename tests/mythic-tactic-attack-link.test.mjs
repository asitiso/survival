import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMythicTacticAttackLink,
  activeMythicTacticAttackLink,
  consumeMythicTacticAttackLink,
} from '../dist/game/endless/mythic-tactic-attack-link.js';

const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('tactic attack link creates six distinct bounded one-shot profiles',()=>{
  const profiles=archetypes.map((id)=>createMythicTacticAttackLink(id,1000,5000));
  assert.equal(new Set(profiles.map((p)=>p.label)).size,6);
  for(const p of profiles){
    assert.equal(p.consumed,false);
    assert.ok(p.expiresAtMs<=6000);
    assert.ok(p.projectileCountMultiplier>=.7&&p.projectileCountMultiplier<=1);
    assert.ok(p.summonCountMultiplier>=.7&&p.summonCountMultiplier<=1);
    assert.ok(p.dashDistanceMultiplier>=.7&&p.dashDistanceMultiplier<=1);
    assert.ok(p.timeWarpPressureMultiplier>=.7&&p.timeWarpPressureMultiplier<=1);
    assert.ok(p.nextCadenceMultiplier>=1&&p.nextCadenceMultiplier<=1.25);
  }
});

test('link is active only for the matching archetype before expiry',()=>{
  const state=createMythicTacticAttackLink('summoner',1000,4000);
  assert.equal(activeMythicTacticAttackLink(state,2500,'summoner')?.archetype,'summoner');
  assert.equal(activeMythicTacticAttackLink(state,2500,'inferno'),null);
  assert.equal(activeMythicTacticAttackLink(state,5001,'summoner'),null);
});

test('consuming the link prevents a second special from receiving it',()=>{
  const state=createMythicTacticAttackLink('juggernaut',1000,4000);
  const consumed=consumeMythicTacticAttackLink(state);
  assert.equal(consumed.consumed,true);
  assert.equal(activeMythicTacticAttackLink(consumed,1200,'juggernaut'),null);
});
