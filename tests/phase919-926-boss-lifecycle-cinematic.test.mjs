import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as bossVfx from '../dist/game/boss-presentation.js';
import { cameraPressureProfile } from '../dist/game/combat-feedback.js';
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 919-922 boss entrance and death cinematics preserve six archetype motifs',()=>{
  assert.equal(typeof bossVfx.bossLifecycleCinematicProfile,'function');
  const entrances=archetypes.map((a)=>bossVfx.bossLifecycleCinematicProfile(a,'entrance'));
  const deaths=archetypes.map((a)=>bossVfx.bossLifecycleCinematicProfile(a,'death'));
  assert.equal(new Set(entrances.map((p)=>p.motif)).size,6);
  assert.equal(new Set(deaths.map((p)=>p.motif)).size,6);
});

test('phase 923-924 death cinematic escalates entrance while staying accessible',()=>{
  for(const a of archetypes){
    const enter=bossVfx.bossLifecycleCinematicProfile(a,'entrance');
    const death=bossVfx.bossLifecycleCinematicProfile(a,'death');
    assert.ok(death.shockwaveCount>=enter.shockwaveCount);
    assert.ok(death.rayCount>=enter.rayCount);
    assert.ok(death.flashAlpha>=enter.flashAlpha);
    assert.ok(death.flashAlpha<=0.36&&death.shockwaveCount<=4&&death.rayCount<=16);
  }
  assert.ok(Math.abs(cameraPressureProfile('bossEnter').scaleOffset)<=0.03);
  assert.ok(Math.abs(cameraPressureProfile('bossDeath').scaleOffset)<=0.03);
});

test('phase 925-926 game connects boss first-seen and boss death to lifecycle cinematics',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/bossLifecycleCinematicProfile\(archetype,'entrance'\)/);
  assert.match(source,/bossLifecycleCinematicProfile\([^\n]*'death'\)/);
  assert.match(source,/addCameraPressure\('bossEnter'\)/);
  assert.match(source,/addCameraPressure\('bossDeath'\)/);
});
