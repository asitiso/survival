import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHeroMeterState,updateHeroMeter,heroMeterModifiers } from '../dist/game/hero-meters.js';
import { analyzeArcaneCombo } from '../dist/game/arcane-combos.js';
import { fieldEventModifiers } from '../dist/game/field-events.js';
import { missionTargetForDanger } from '../dist/game/run-missions.js';
import { threatDirectiveAt,threatDirectiveModifiers } from '../dist/game/threat-directives.js';
import { FUSION_IDS } from '../dist/game/spell-fusions.js';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const close=(a,b)=>Math.abs(a-b)<1e-9;

test('phase 2090-2097 Game connects hero meter and arcane combo identities plus existing tactical and fusion icons to HUD and toast surfaces',()=>{
  assert.match(source,/HERO_METER_IDENTITY_ATLAS/);
  assert.match(source,/ARCANE_COMBO_IDENTITY_ATLAS/);
  assert.match(source,/initializeHeroMeterIdentityAtlas/);
  assert.match(source,/initializeArcaneComboIdentityAtlas/);
  assert.match(source,/drawHeroMeterIdentityHud\(ctx/);
  assert.match(source,/drawArcaneComboIdentityHud\(ctx/);
  assert.match(source,/eventToastHeroMeterId/);
  assert.match(source,/eventToastArcaneComboFamily/);
  assert.match(source,/eventToastTacticalStatusIconId/);
  assert.match(source,/eventToastBuildIdentityId/);
  assert.match(source,/drawHeroMeterToastIcon\(ctx/);
  assert.match(source,/drawArcaneComboToastIcon\(ctx/);
  assert.match(source,/drawTacticalStatusToastIcon\(ctx/);
  assert.match(source,/drawBuildIdentityToastIcon\(ctx/);
  assert.match(source,/융합 발동[^\n]+fusionId/);
  assert.match(source,/미션 시작[^\n]+transition\.started\.id/);
  assert.match(source,/전투 지시[^\n]+nextThreat\.id/);
  assert.match(source,/전장 목표[^\n]+objectiveTransition\.started\.id/);
});

test('phase 2090-2097 hero meter combo tactical and fusion gameplay contracts remain unchanged',()=>{
  const durations={arkan:7,seria:6.5,kain:5.5,edric:6};
  for(const [heroId,duration] of Object.entries(durations)){
    const base={...createHeroMeterState(heroId),charge:.999};
    const activated=updateHeroMeter(base,0,{casts:1,chilledHits:1,moving:true,preventedDamageRatio:1});
    assert.equal(activated.activated,true);assert.ok(close(activated.state.activeTimer,duration));assert.equal(activated.state.charge,0);
  }
  assert.deepEqual(heroMeterModifiers({heroId:'arkan',charge:0,activeTimer:1}),{spellPowerMultiplier:1.22,cooldownMultiplier:1,areaMultiplier:1.15,coreDamageTakenMultiplier:1,arkanExplosionChanceBonus:.14,arkanExplosionRadiusMultiplier:1.3,shatterRadius:0,shatterDamageMultiplier:1,kainChainBonus:0});
  const combo=analyzeArcaneCombo({heroId:'arkan',evolvedSpells:['fireBolt'],legendaryIds:['arcane-staff'],relicId:'ember-crown',traitId:null,synergyIds:['ember-dominion'],meterActive:true,coreHpRatio:1,objectiveStreak:2});
  assert.equal(combo.family,'inferno-chain');assert.equal(combo.tier,3);assert.equal(combo.label,'ASCENDANCY');assert.ok(close(combo.powerMultiplier,1.12));assert.ok(close(combo.cooldownMultiplier,.94));assert.ok(close(combo.areaMultiplier,1.12));
  assert.deepEqual(fieldEventModifiers({id:'manaStorm',name:'',description:'',duration:25,remaining:10,startedAt:0,accent:''}),{cooldownMultiplier:.68,spawnPressureMultiplier:1.5,eliteIntervalMultiplier:1,goldMultiplier:1});
  assert.equal(missionTargetForDanger('massacre',1),45);assert.equal(missionTargetForDanger('eliteHunt',11),5);assert.equal(missionTargetForDanger('goldRush',11),900);
  const directive=threatDirectiveAt(480);assert.equal(directive?.id,'swarmFront');assert.ok(close(threatDirectiveModifiers(directive).spawnPressureMultiplier,1.18));
  assert.equal(FUSION_IDS.length,6);
});
