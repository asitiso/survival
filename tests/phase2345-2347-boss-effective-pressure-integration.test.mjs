import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EnemyManager } from '../dist/game/enemies.js';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

const applied={bossDamageTakenMultiplier:1.22,specialCadenceMultiplier:.76,summonCountMultiplier:1.31,dashDistanceMultiplier:.93};

test('phase 2345 EnemyManager exposes a defensive copy of the modifiers actually used by boss combat',()=>{
  const enemies=new EnemyManager();enemies.setBossEncounterModifiers(applied);const first=enemies.getBossEncounterModifiers();
  assert.deepEqual(first,applied);first.specialCadenceMultiplier=99;assert.equal(enemies.getBossEncounterModifiers().specialCadenceMultiplier,.76);
});

test('phase 2346 Game renders one unified final-pressure strip from EnemyManager instead of recalculating subsystem formulas',()=>{
  assert.match(source,/projectBossEffectivePressure/);assert.match(source,/drawBossEffectivePressureRecall\(ctx,boss\)/);
  assert.match(source,/this\.enemies\.getBossEncounterModifiers\(\)/);assert.match(source,/projection\.primaryEffects\.slice\(0,2\)/);
  assert.match(source,/mythicSafeZonePressureEffectIdentityIcon\(effect\.effectId\)/,'the existing four effect identities should be reused instead of adding another atlas');
});

test('phase 2346 final-pressure strip yields to critical attention imminent specials and Last Law',()=>{
  assert.match(source,/hideBossEffectivePressureRecall\(boss\)/);assert.match(source,/heroCritical\|\|coreCritical\|\|\(boss\.specialTimer\?\?99\)<=1\.2/);
  assert.match(source,/bossEffectivePressureLastLawActive\(boss\)/);assert.match(source,/if\(this\.hideBossEffectivePressureRecall\(boss\)\)return/);
});

test('phase 2347 prior Nemesis and SAFE numeric helpers remain source-compatible but yield when unified final pressure is available',()=>{
  assert.match(source,/drawNemesisAdaptationEffectRecall\(ctx,boss,adaptations,y,size\)/);assert.match(source,/drawMythicSafeZonePressureHelpers\(ctx,boss,pressureProjection/);
  assert.match(source,/preferBossEffectivePressureSummary\(boss\)/);assert.match(source,/preferBossEffectivePressureSummary\(boss,lawActive\)/);
});
