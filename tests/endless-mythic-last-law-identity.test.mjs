import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicLastLawIdentityProfile } from '../dist/game/endless/mythic-last-law-identity.js';

const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
const mythic=mythicBossProfile(7200,5,3);

function pressure(p){
  return (1/p.specialCadenceMultiplier)+p.summonCountMultiplier+p.dashDistanceMultiplier+p.projectileDensityMultiplier+(1/p.bossDamageTakenMultiplier);
}

test('six mythic archetypes expose six distinct Last Law identities',()=>{
  const profiles=archetypes.map((id)=>mythicLastLawIdentityProfile(mythic,id,.1,1));
  assert.equal(new Set(profiles.map((p)=>p.lawId)).size,6);
  assert.equal(new Set(profiles.map((p)=>p.label)).size,6);
  assert.ok(profiles.every((p)=>p.active));
  assert.equal(mythicLastLawIdentityProfile(mythic,'inferno',.3,1).active,false);
});

test('clearing weakpoints reduces total Last Law pressure for every mythic identity',()=>{
  for(const id of archetypes){
    const uncleared=mythicLastLawIdentityProfile(mythic,id,.1,1);
    const cleared=mythicLastLawIdentityProfile(mythic,id,.1,0);
    assert.ok(pressure(cleared)<pressure(uncleared),`${id} should become less oppressive after weakpoint clear`);
    assert.ok(cleared.bossDamageTakenMultiplier>=uncleared.bossDamageTakenMultiplier);
  }
});

test('identity modifiers stay inside the existing encounter hard caps',()=>{
  for(const id of archetypes){
    for(const weakpoints of [0,0.5,1]){
      const p=mythicLastLawIdentityProfile(mythic,id,.1,weakpoints);
      assert.ok(p.specialCadenceMultiplier>=.62 && p.specialCadenceMultiplier<=1.05);
      assert.ok(p.summonCountMultiplier>=.72 && p.summonCountMultiplier<=1.55);
      assert.ok(p.dashDistanceMultiplier>=.82 && p.dashDistanceMultiplier<=1.55);
      assert.ok(p.projectileDensityMultiplier>=.9 && p.projectileDensityMultiplier<=1.45);
      assert.ok(p.bossDamageTakenMultiplier>=.7 && p.bossDamageTakenMultiplier<=1.85);
    }
  }
});
