import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicPhaseProfile } from '../dist/game/endless/mythic-phases.js';

const mythic={active:true,label:'MYTHIC 3',tier:3,channels:['inferno','summoner','juggernaut']};
const close=(a,b)=>Math.abs(a-b)<1e-9;

test('phase 2127 preserves Mythic Phase 70/35 thresholds and weakpoint counterplay math',()=>{
  assert.equal(mythicPhaseProfile(mythic,1,1).phase,1);
  assert.equal(mythicPhaseProfile(mythic,.7,1).phase,1);
  assert.equal(mythicPhaseProfile(mythic,.699999,1).phase,2);
  assert.equal(mythicPhaseProfile(mythic,.35,1).phase,2);
  assert.equal(mythicPhaseProfile(mythic,.349999,1).phase,3);
  const p1=mythicPhaseProfile(mythic,.8,1),p2=mythicPhaseProfile(mythic,.5,1),p3=mythicPhaseProfile(mythic,.2,1);
  assert.ok(close(p1.bossDamageTakenMultiplier,.94)); assert.ok(close(p1.specialCadenceMultiplier,.96)); assert.ok(close(p1.summonCountMultiplier,1.02)); assert.ok(close(p1.dashDistanceMultiplier,1.02));
  assert.ok(close(p2.bossDamageTakenMultiplier,.92)); assert.ok(close(p2.specialCadenceMultiplier,.88)); assert.ok(close(p2.summonCountMultiplier,1.1)); assert.ok(close(p2.dashDistanceMultiplier,1.08));
  assert.ok(close(p3.bossDamageTakenMultiplier,.9)); assert.ok(close(p3.specialCadenceMultiplier,.8)); assert.ok(close(p3.summonCountMultiplier,1.16)); assert.ok(close(p3.dashDistanceMultiplier,1.14));
  const cleared=mythicPhaseProfile(mythic,.2,0);
  assert.ok(cleared.bossDamageTakenMultiplier>p3.bossDamageTakenMultiplier);
  assert.ok(cleared.specialCadenceMultiplier>p3.specialCadenceMultiplier);
  assert.ok(cleared.summonCountMultiplier<p3.summonCountMultiplier);
  assert.ok(cleared.dashDistanceMultiplier<p3.dashDistanceMultiplier);
});
