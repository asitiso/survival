import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as spellVfx from '../dist/game/spell-vfx.js';

test('phase 911-914 meteor and black hole use distinct projectile choreography',()=>{
  assert.equal(typeof spellVfx.ultimateChoreographyDescriptor,'function');
  const meteor=spellVfx.ultimateChoreographyDescriptor('meteorStorm',10);
  const hole=spellVfx.ultimateChoreographyDescriptor('blackHole',10);
  assert.equal(meteor.motion,'descent');
  assert.equal(hole.motion,'orbit');
  assert.notEqual(meteor.trailCount,hole.trailCount);
  assert.notEqual(meteor.ringCount,hole.ringCount);
});

test('phase 915-916 ultimate choreography escalates by level without excessive glow',()=>{
  for(const spell of ['meteorStorm','blackHole']){
    const low=spellVfx.ultimateChoreographyDescriptor(spell,1);
    const high=spellVfx.ultimateChoreographyDescriptor(spell,10);
    assert.ok(high.trailCount>=low.trailCount);
    assert.ok(high.ringCount>=low.ringCount);
    assert.ok(high.glowAlpha>=low.glowAlpha);
    assert.ok(high.trailCount<=10&&high.ringCount<=5&&high.glowAlpha<=0.36);
  }
});

test('phase 917-918 spell renderer consumes choreography for meteor descent and black hole orbit',()=>{
  const source=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
  assert.match(source,/ultimateChoreographyDescriptor/);
  assert.match(source,/choreography\.motion/);
  assert.match(source,/choreography\.orbitCount/);
});
