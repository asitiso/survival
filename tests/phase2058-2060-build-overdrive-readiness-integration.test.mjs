import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { advanceBuildOverdrive, createDefaultOverdriveState, overdriveModifiers } from '../dist/game/endless/build-overdrive.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2058-2060 Game renders overdrive readiness beside build identity with compact and active countdown modes',()=>{
  assert.match(source,/buildOverdriveRecallPresentation/);
  assert.match(source,/drawBuildOverdriveRecall\(ctx/);
  assert.match(source,/filledSegments/);
  assert.match(source,/numericLabel/);
  assert.match(source,/focus\.tier >= 2|focus\.tier>=2/);
  assert.match(source,/this\.drawBuildOverdriveRecall\(ctx,this\.endlessState\.overdrive,this\.elapsed\*1000/);
});

test('phase 2058-2060 overdrive charge activation duration reset modifiers and action count remain unchanged',()=>{
  let state=createDefaultOverdriveState();
  state=advanceBuildOverdrive(state,[{type:'spell_cast',spellId:'fireBolt'},{type:'spell_cast',spellId:'fusion',fusion:true},{type:'enemy_killed',enemyId:'a'},{type:'enemy_killed',enemyId:'e',elite:true},{type:'boss_defeated',bossId:'b',durationMs:1,coreDamage:0}],1_000);
  assert.equal(state.charge,31);
  state=advanceBuildOverdrive(state,Array.from({length:35},(_,i)=>({type:'spell_cast',spellId:`s${i}`})),2_000);
  assert.equal(state.charge,0); assert.equal(state.activeUntilMs,14_000); assert.equal(state.activations,1);
  const locked=advanceBuildOverdrive(state,[{type:'boss_defeated',bossId:'b2',durationMs:1,coreDamage:0}],5_000);
  assert.deepEqual(locked,state);
  const expired=advanceBuildOverdrive(state,[],14_001); assert.equal(expired.charge,0); assert.equal(expired.activeUntilMs,0);
  assert.deepEqual(overdriveModifiers(state,'burst',5_000),{active:true,spellPowerMultiplier:1.2,cooldownMultiplier:1,areaMultiplier:1,heroDamageTakenMultiplier:1,coreDamageTakenMultiplier:1,bossDamageMultiplier:1.18,fusionPowerMultiplier:1.08});
  assert.equal(ACTION_BUTTONS.length,9);
});
