import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceLongRunOaths,
  createDefaultLongRunOathState,
  longRunOathModifiers,
  oathHudLine,
} from '../dist/game/endless/long-run-oaths.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from '../dist/game/endless/snapshot.js';

function legacy(minute, overrides={}) {
  return {
    heroId:'arkan', elapsedMs:minute*60_000, level:90, threat:5, kills:3000, bossesDefeated:25,
    elitesDefeated:100, gold:9999, xp:9999, guardianCoreHp:900, guardianCoreMaxHp:1000,
    fate:'frenzy', spellFusionCount:2, mapEvolutionRank:5, masteryLevel:20, deviceClass:'low', ...overrides,
  };
}

test('first long-run oath starts automatically at 120 minutes and remains single-slot', () => {
  let state=createDefaultLongRunOathState();
  const first=advanceLongRunOaths(state,legacy(119.9),[],0,123);
  assert.equal(first.state.active,null);
  const started=advanceLongRunOaths(first.state,legacy(120),[],1000,123);
  assert.ok(started.state.active);
  assert.equal(started.state.active.milestone,120);
  assert.equal(started.effects.filter((e)=>e.type==='oath_started').length,1);
  const again=advanceLongRunOaths(started.state,legacy(121),[],1000,123);
  assert.equal(again.state.active?.id,started.state.active?.id);
});

test('kill oath progresses from existing enemy events, completes once, and grants a bounded boon', () => {
  const state={...createDefaultLongRunOathState(),active:{id:'oath-120-slayer',milestone:120,kind:'slayer',title:'소탕 서약',startedAtMs:120*60_000,deadlineMs:150*60_000,target:3,progress:0,baselineCoreHp:1000,coreDamage:0}};
  const events=[{type:'enemy_killed'},{type:'enemy_killed',elite:true},{type:'enemy_killed'}];
  const result=advanceLongRunOaths(state,legacy(121),events,1000,1);
  assert.equal(result.state.active,null);
  assert.deepEqual(result.state.completedMilestones,[120]);
  assert.equal(result.effects.filter((e)=>e.type==='oath_completed').length,1);
  const mods=longRunOathModifiers(result.state,121*60_000);
  assert.ok(mods.goldMultiplier>=1 && mods.goldMultiplier<=1.18);
  assert.ok(mods.spellPowerMultiplier>=1 && mods.spellPowerMultiplier<=1.1);
  const repeat=advanceLongRunOaths(result.state,legacy(122),events,1000,1);
  assert.equal(repeat.effects.some((e)=>e.type==='oath_completed'),false);
});

test('core defense oath can fail from excessive core damage and does not block later milestones', () => {
  const state={...createDefaultLongRunOathState(),active:{id:'oath-150-core_guard',milestone:150,kind:'core_guard',title:'수호 서약',startedAtMs:150*60_000,deadlineMs:154*60_000,target:240000,progress:0,baselineCoreHp:1000,coreDamage:0}};
  const failed=advanceLongRunOaths(state,legacy(151),[{type:'core_damaged',amount:130}],1000,2);
  assert.equal(failed.state.active,null);
  assert.deepEqual(failed.state.failedMilestones,[150]);
  assert.equal(failed.effects.some((e)=>e.type==='oath_failed'),true);
  const next=advanceLongRunOaths(failed.state,legacy(180),[],1000,2);
  assert.equal(next.state.active?.milestone,180);
});

test('stale non-defense oath expires at the next milestone instead of blocking the run forever', () => {
  const state={...createDefaultLongRunOathState(),active:{id:'oath-120-arcane_flow',milestone:120,kind:'arcane_flow',title:'영창 서약',startedAtMs:120*60_000,deadlineMs:150*60_000,target:9999,progress:2,baselineCoreHp:1000,coreDamage:0}};
  const result=advanceLongRunOaths(state,legacy(150),[],1000,5);
  assert.equal(result.state.expiredMilestones.includes(120),true);
  assert.equal(result.state.active?.milestone,150);
  assert.equal(result.effects.some((e)=>e.type==='oath_expired'),true);
});

test('oath HUD stays one compact line and snapshot restore preserves active objective safely', () => {
  const extension=createDefaultExtensionState(9);
  extension.oaths={...createDefaultLongRunOathState(),active:{id:'oath-120-slayer',milestone:120,kind:'slayer',title:'소탕 서약',startedAtMs:1,deadlineMs:2,target:100,progress:44,baselineCoreHp:1000,coreDamage:0}};
  const line=oathHudLine(extension.oaths,120*60_000);
  assert.match(line,/44\/100/);
  assert.ok(line.length<50);
  const restored=restoreExtension(serializeExtension(extension),1);
  assert.equal(restored.oaths.active?.progress,44);
  const legacyPayload=structuredClone(extension); delete legacyPayload.oaths;
  assert.deepEqual(restoreExtension(legacyPayload,1).oaths,createDefaultLongRunOathState());
});
