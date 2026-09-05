import test from 'node:test';
import assert from 'node:assert/strict';
import * as enemyVfx from '../dist/game/enemy-presentation.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

const types=['grunt','hound','brute','archer','bomber','shaman','shieldbearer','assassin','siegeGolem','nullifier','golden','elite','boss'];

test('phase 903-906 enemy archetypes expose differentiated hit signatures',()=>{
  assert.equal(typeof enemyVfx.enemyImpactVfxDescriptor,'function');
  const profiles=types.map((type)=>enemyVfx.enemyImpactVfxDescriptor(type,'heavy'));
  assert.ok(new Set(profiles.map((p)=>p.motif)).size>=8);
  assert.ok(profiles.every((p)=>p.rayCount<=10&&p.glowAlpha<=0.32&&p.ringRadius<=46));
});

test('phase 907-908 death cues preserve archetype identity within bounded budgets',()=>{
  const cues=types.map((type)=>enemyVfx.enemyDeathCue(type));
  assert.ok(cues.every((cue)=>typeof cue.motif==='string'));
  assert.ok(new Set(cues.map((cue)=>cue.motif)).size>=8);
  assert.ok(cues.every((cue)=>cue.particles<=24&&cue.rayCount<=12&&cue.glowAlpha<=0.34));
});

test('phase 909-910 combat feedback retains enemy type for hit rendering',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addHit({x:10,y:20},50,'heavy','assassin');
  feedback.addHit({x:30,y:40},50,'critical','siegeGolem');
  assert.deepEqual(feedback.hitEnemyTypeCounts,{assassin:1,siegeGolem:1});
});
