import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDefaultWorldState, shouldEvolveWorld, evolveWorld, getWorldModifiers } from '../dist/game/endless/world-evolution.js';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

const legacy=(elapsedMs,overrides={})=>({heroId:'arkan',elapsedMs,level:30,threat:5,kills:500,bossesDefeated:6,elitesDefeated:40,gold:5000,xp:10000,guardianCoreHp:900,guardianCoreMaxHp:1000,fate:'none',spellFusionCount:0,mapEvolutionRank:0,masteryLevel:10,deviceClass:'high',...overrides});
const close=(a,b)=>Math.abs(a-b)<1e-9;
const expectModifiers=(actual,expected)=>{ for(const [key,value] of Object.entries(expected)) assert.ok(close(actual[key],value),`${key}: ${actual[key]} != ${value}`); }; 

test('phase 2072-2075 Game connects world evolution toast and persistent recall beside battlefield identity without a new HUD row',()=>{
  assert.match(source,/WORLD_EVOLUTION_IDENTITY_ATLAS/);
  assert.match(source,/initializeWorldEvolutionIdentityAtlas/);
  assert.match(source,/eventToastWorldEvolution/);
  assert.match(source,/drawWorldEvolutionToastIcon\(ctx/);
  assert.match(source,/drawWorldEvolutionRecall\(ctx/);
  assert.match(source,/drawBattlefieldIdentityHud\(ctx/);
  assert.match(source,/this\.endlessState\.world\.current/);
  assert.match(source,/worldEvolutionIdentityIcon/);
});

test('phase 2072-2075 world evolution timing, no-repeat pick, node plan, and modifiers remain unchanged',()=>{
  const state=createDefaultWorldState();
  assert.equal(shouldEvolveWorld(state,8*60_000-1),false);
  assert.equal(shouldEvolveWorld(state,8*60_000),true);
  const first=evolveWorld(legacy(8*60_000,{fate:'guardian',spellFusionCount:1}),state,{seed:42,cursor:0});
  assert.notEqual(first.state.current,'calm');
  const second=evolveWorld(legacy(16*60_000,{fate:'guardian',spellFusionCount:1}),first.state,first.rng);
  assert.notEqual(second.state.current,first.state.current);
  assert.equal(first.state.evolutionCount,1);
  assert.equal(second.state.evolutionCount,2);
  const expectedKind={stormfront:'safe_corridor',ruins:'barricade',mana_bloom:'mana_well',blood_moon:'volatile_zone',sanctuary:'sanctuary_zone'};
  assert.ok(first.state.nodes.length>=1&&first.state.nodes.length<=2);
  assert.ok(first.state.nodes.every(node=>node.kind===expectedKind[first.state.current]));
  expectModifiers(getWorldModifiers('stormfront',5),{spawnMultiplier:1.105,projectileMultiplier:1.2,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1});
  expectModifiers(getWorldModifiers('ruins',5),{spawnMultiplier:.96,projectileMultiplier:1,eliteMultiplier:1.13,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1.245});
  expectModifiers(getWorldModifiers('mana_bloom',5),{spawnMultiplier:1.02,projectileMultiplier:1,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1.13,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:.9,siegePressureMultiplier:1});
  expectModifiers(getWorldModifiers('blood_moon',5),{spawnMultiplier:1.205,projectileMultiplier:1,eliteMultiplier:1.27,goldMultiplier:1.245,masteryMultiplier:1.18,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1});
  expectModifiers(getWorldModifiers('sanctuary',5),{spawnMultiplier:.92,projectileMultiplier:.94,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1.35,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1});
});
