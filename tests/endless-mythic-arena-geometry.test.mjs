import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicArenaGeometryProfile, MYTHIC_ARENA_GEOMETRY_IDS } from '../dist/game/endless/mythic-arena-geometry.js';

const bosses=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 123 gives every mythic boss a distinct arena geometry identity',()=>{
  const profiles=bosses.map((id)=>mythicArenaGeometryProfile(id,0));
  assert.equal(MYTHIC_ARENA_GEOMETRY_IDS.length,6);
  assert.equal(new Set(profiles.map((p)=>p.id)).size,6);
  assert.equal(new Set(profiles.map((p)=>p.shape)).size,6);
  for(const p of profiles){
    assert.ok(p.placementRadius>=80&&p.placementRadius<=260);
    assert.ok(p.rotationRate>=-1.2&&p.rotationRate<=1.2);
    assert.ok(p.pressure>=0.72&&p.pressure<=1.18);
  }
});

test('destroying weakpoints softens geometry pressure without erasing identity',()=>{
  for(const id of bosses){
    const full=mythicArenaGeometryProfile(id,0);
    const relieved=mythicArenaGeometryProfile(id,1);
    assert.equal(relieved.id,full.id);
    assert.equal(relieved.shape,full.shape);
    assert.ok(relieved.pressure<full.pressure);
    assert.ok(relieved.safeGapRadians>=full.safeGapRadians);
  }
});
