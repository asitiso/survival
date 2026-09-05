import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../dist/game/boss-presentation.js');
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 863-866 boss archetypes expose six distinct cinematic motifs',()=>{
  assert.equal(typeof mod.bossPhaseCinematicProfile,'function');
  const profiles=archetypes.map((a)=>mod.bossPhaseCinematicProfile(a,3));
  assert.equal(new Set(profiles.map((p)=>p.motif)).size,6);
});

test('phase 867-868 phase three cinematic escalates phase two without exceeding accessibility caps',()=>{
  for(const a of archetypes){
    const p2=mod.bossPhaseCinematicProfile(a,2),p3=mod.bossPhaseCinematicProfile(a,3);
    assert.ok(p3.shockwaveCount>=p2.shockwaveCount);
    assert.ok(p3.edgePulseAlpha>=p2.edgePulseAlpha);
    assert.ok(p3.vignetteAlpha>=p2.vignetteAlpha);
    assert.ok(p3.shockwaveCount<=3);
    assert.ok(p3.edgePulseAlpha<=0.34);
    assert.ok(p3.vignetteAlpha<=0.28);
  }
});

test('phase 869-870 boss phase cues carry a cinematic profile for immediate runtime use',()=>{
  const tracker=new mod.BossPresentationTracker();
  tracker.update(7,1,'abyssWitch');
  const cue=tracker.update(7,.66,'abyssWitch');
  assert.ok(cue?.cinematic);
  assert.equal(cue.cinematic.motif,'void');
  assert.equal(cue.cinematic.cameraKind,'bossPhase2');
});
