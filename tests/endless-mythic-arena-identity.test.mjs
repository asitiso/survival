import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicArenaIdentityProfile } from '../dist/game/endless/mythic-arena-identity.js';

const base={cadenceMultiplier:.82,radiusMultiplier:1,telegraphMultiplier:.82,damageMultiplier:1.1,maxHazards:8,orbitOffsetRadians:.2};
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 107 six mythic archetypes produce materially distinct arena identities',()=>{
  const rows=archetypes.map((id)=>mythicArenaIdentityProfile(id,base,0));
  assert.equal(new Set(rows.map((p)=>p.identityId)).size,6);
  assert.equal(new Set(rows.map((p)=>`${p.modifiers.cadenceMultiplier.toFixed(3)}:${p.modifiers.radiusMultiplier.toFixed(3)}:${p.modifiers.orbitOffsetRadians.toFixed(3)}`)).size,6);
  assert.ok(rows.every((p)=>p.label.length<=28));
});

test('phase 108 mythic arena identity preserves telegraph safety and hard hazard caps',()=>{
  for(const id of archetypes){
    const p=mythicArenaIdentityProfile(id,base,0);
    assert.ok(p.modifiers.telegraphMultiplier>=.78);
    assert.ok(p.modifiers.maxHazards<=8);
    assert.ok(p.modifiers.damageMultiplier<=1.22);
    assert.ok(p.modifiers.cadenceMultiplier>=.68);
  }
});

test('phase 109 destroyed weakpoints reduce arena pressure for every mythic identity',()=>{
  for(const id of archetypes){
    const raw=mythicArenaIdentityProfile(id,base,0).modifiers;
    const relieved=mythicArenaIdentityProfile(id,base,1).modifiers;
    assert.ok(relieved.cadenceMultiplier>=raw.cadenceMultiplier);
    assert.ok(relieved.damageMultiplier<=raw.damageMultiplier);
    assert.ok(relieved.maxHazards<=raw.maxHazards);
    assert.ok(relieved.telegraphMultiplier>=raw.telegraphMultiplier);
  }
});

test('phase 110 mythic arena modifier output stays finite under malformed weakpoint ratios',()=>{
  for(const ratio of [-5,Number.NaN,99]){
    const p=mythicArenaIdentityProfile('timeEater',base,ratio);
    for(const value of Object.values(p.modifiers)) assert.ok(Number.isFinite(value));
  }
});
