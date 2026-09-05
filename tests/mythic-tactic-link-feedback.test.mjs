import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicTacticLinkFeedback } from '../dist/game/endless/mythic-tactic-link-feedback.js';

const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('tactic-link consumption feedback is distinct across all six mythic archetypes',()=>{
  const profiles=archetypes.map((id)=>mythicTacticLinkFeedback(id));
  assert.equal(new Set(profiles.map((p)=>p.label)).size,6);
  assert.equal(new Set(profiles.map((p)=>`${p.accent}:${p.secondaryAccent}`)).size,6);
  assert.deepEqual(profiles,archetypes.map((id)=>mythicTacticLinkFeedback(id)));
});

test('tactic-link feedback is bounded presentation only',()=>{
  for(const id of archetypes){
    const p=mythicTacticLinkFeedback(id);
    assert.ok(p.ringCount>=1&&p.ringCount<=2);
    assert.ok(p.particleCount>=5&&p.particleCount<=12);
    assert.ok(p.trailCount>=0&&p.trailCount<=4);
    assert.ok(p.ttl>=.18&&p.ttl<=.48);
    assert.ok(p.radius>=72&&p.radius<=132);
    assert.ok(!('damageMultiplier' in p));
    assert.ok(!('gold' in p));
    assert.ok(!('xp' in p));
  }
});
