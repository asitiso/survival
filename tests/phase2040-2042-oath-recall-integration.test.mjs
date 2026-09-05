import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { LONG_RUN_OATH_MILESTONES, advanceLongRunOaths, createDefaultLongRunOathState, longRunOathModifiers } from '../dist/game/endless/long-run-oaths.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

function legacy(minute,overrides={}){
  return {heroId:'arkan',elapsedMs:minute*60_000,level:90,threat:5,kills:3000,bossesDefeated:25,elitesDefeated:100,gold:9999,xp:9999,guardianCoreHp:1000,guardianCoreMaxHp:1000,fate:'frenzy',spellFusionCount:2,mapEvolutionRank:5,masteryLevel:20,deviceClass:'low',...overrides};
}

test('phase 2040-2042 Game reuses the deep-run atlas for oath start outcome toast and existing single-slot HUD recall while preserving text fallback',()=>{
  assert.match(source,/eventToastOathKind/);
  assert.match(source,/longRunOathKindFromTitle/);
  assert.match(source,/oath_started[\s\S]*showEventToast\(`\$\{effect\.milestone\}분 서약 · \$\{effect\.title\}`[\s\S]*longRunOathKindFromTitle\(effect\.title\)/);
  assert.match(source,/oath_completed[\s\S]*showEventToast\(`서약 완수 · \$\{effect\.title\} · \+\$\{effect\.rewardGold\}G`[\s\S]*longRunOathKindFromTitle\(effect\.title\)/);
  assert.match(source,/oath_failed[\s\S]*showEventToast\(`서약 실패 · \$\{effect\.title\}`[\s\S]*longRunOathKindFromTitle\(effect\.title\)/);
  assert.match(source,/oath_expired[\s\S]*showEventToast\(`서약 종료 · \$\{effect\.title\}`[\s\S]*longRunOathKindFromTitle\(effect\.title\)/);
  assert.match(source,/drawLongRunOathToastIcon\(ctx\)/);
  assert.match(source,/label\.startsWith\('서약'\)[\s\S]*drawDeepRunDecisionIdentityHud\(ctx,\{kind:'oath',id:this\.endlessState\.oaths\.active\.kind\}/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2040-2042 oath milestone choice target deadline failure reward boon and modifiers remain unchanged',()=>{
  assert.deepEqual([...LONG_RUN_OATH_MILESTONES],[120,150,180,240,300,360]);
  const expectedTarget={slayer:200,elite_hunt:18,boss_hunt:2,arcane_flow:100,core_guard:240000,endure:300000};
  const expectedDeadline={slayer:150,elite_hunt:150,boss_hunt:150,arcane_flow:150,core_guard:124,endure:125};
  const seen=new Set();
  for(let seed=0;seed<6;seed++){
    const started=advanceLongRunOaths(createDefaultLongRunOathState(),legacy(120),[],0,seed);
    const active=started.state.active; assert.ok(active); seen.add(active.kind);
    assert.equal(active.target,expectedTarget[active.kind]); assert.equal(active.deadlineMs,expectedDeadline[active.kind]*60_000);
  }
  assert.equal(seen.size,6);
  for(let seed=0;seed<12;seed++){
    const state={...createDefaultLongRunOathState(),history:['slayer','elite_hunt']};
    const started=advanceLongRunOaths(state,legacy(120),[],0,seed); assert.ok(started.state.active); assert.equal(['slayer','elite_hunt'].includes(started.state.active.kind),false);
  }
  const coreBase={...createDefaultLongRunOathState(),active:{id:'oath-150-core_guard',milestone:150,kind:'core_guard',title:'수호 서약',startedAtMs:150*60_000,deadlineMs:154*60_000,target:240000,progress:0,baselineCoreHp:1000,coreDamage:0}};
  const safe=advanceLongRunOaths(coreBase,legacy(151),[{type:'core_damaged',amount:120}],0,2); assert.ok(safe.state.active); assert.equal(safe.effects.some(e=>e.type==='oath_failed'),false);
  const failed=advanceLongRunOaths(coreBase,legacy(151),[{type:'core_damaged',amount:121}],0,2); assert.equal(failed.state.active,null); assert.equal(failed.effects.some(e=>e.type==='oath_failed'),true);
  const slayer={...createDefaultLongRunOathState(),active:{id:'oath-120-slayer',milestone:120,kind:'slayer',title:'소탕 서약',startedAtMs:120*60_000,deadlineMs:150*60_000,target:1,progress:0,baselineCoreHp:1000,coreDamage:0}};
  const done=advanceLongRunOaths(slayer,legacy(121),[{type:'enemy_killed'}],0,1); const reward=done.effects.find(e=>e.type==='oath_completed'); assert.ok(reward); assert.equal(reward.rewardGold,930); assert.equal(reward.coreHealPercent,0.08); assert.equal(done.state.boon?.expiresAtMs,121*60_000+90_000);
  assert.deepEqual(longRunOathModifiers({...createDefaultLongRunOathState(),boon:{kind:'prosperity',expiresAtMs:1000}},0),{goldMultiplier:1.16,spellPowerMultiplier:1,coreDamageTakenMultiplier:1,bossDamageMultiplier:1});
  assert.deepEqual(longRunOathModifiers({...createDefaultLongRunOathState(),boon:{kind:'power',expiresAtMs:1000}},0),{goldMultiplier:1,spellPowerMultiplier:1.09,coreDamageTakenMultiplier:1,bossDamageMultiplier:1});
  assert.deepEqual(longRunOathModifiers({...createDefaultLongRunOathState(),boon:{kind:'guard',expiresAtMs:1000}},0),{goldMultiplier:1,spellPowerMultiplier:1,coreDamageTakenMultiplier:0.88,bossDamageMultiplier:1});
  assert.deepEqual(longRunOathModifiers({...createDefaultLongRunOathState(),boon:{kind:'boss',expiresAtMs:1000}},0),{goldMultiplier:1,spellPowerMultiplier:1,coreDamageTakenMultiplier:1,bossDamageMultiplier:1.1});
  assert.equal(ACTION_BUTTONS.length,9);
});
