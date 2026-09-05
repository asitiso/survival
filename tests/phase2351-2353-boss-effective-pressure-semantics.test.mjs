import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

const one=(effectId,multiplier)=>({
  bossDamageTakenMultiplier:effectId==='boss-vulnerability'?multiplier:1,
  specialCadenceMultiplier:effectId==='special-cadence'?multiplier:1,
  summonCountMultiplier:effectId==='summon-pressure'?multiplier:1,
  dashDistanceMultiplier:effectId==='dash-distance'?multiplier:1,
});

test('phase 2351 maps every final boss pressure channel to explicit threat or opportunity semantics',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true);
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const cases=[
    ['special-cadence',.8,'threat','위험'],['special-cadence',1.2,'opportunity','기회'],
    ['summon-pressure',1.2,'threat','위험'],['summon-pressure',.8,'opportunity','기회'],
    ['dash-distance',1.2,'threat','위험'],['dash-distance',.8,'opportunity','기회'],
    ['boss-vulnerability',.8,'threat','위험'],['boss-vulnerability',1.2,'opportunity','기회'],
  ];
  for(const [effectId,multiplier,impact,impactLabel] of cases){
    const p=projectBossEffectivePressure(one(effectId,multiplier));const effect=p.primaryEffects[0];
    assert.equal(effect.effectId,effectId);assert.equal(effect.impact,impact);assert.equal(effect.impactLabel,impactLabel);
  }
});

test('phase 2352 keeps the prior numeric label stable and adds a compact semantic label separately',async()=>{
  const {projectBossEffectivePressure,bossEffectivePressureSemanticHint}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:.68,summonCountMultiplier:.88,dashDistanceMultiplier:.9});
  assert.equal(p.primaryEffects[0].label,'특수주기 -32%');
  assert.equal(p.primaryEffects[0].semanticLabel,'특수주기 -32% · 위험');
  assert.equal(p.primaryEffects[1].semanticLabel,'보스피해 +18% · 기회');
  assert.equal(bossEffectivePressureSemanticHint(p,2),'특수주기 -32% · 위험 / 보스피해 +18% · 기회');
});

test('phase 2353 neutral and non-finite values never fabricate threat or opportunity',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:Number.NaN,specialCadenceMultiplier:Number.POSITIVE_INFINITY,summonCountMultiplier:1,dashDistanceMultiplier:1});
  assert.deepEqual(p.primaryEffects,[]);
  assert.ok(p.effects.every(effect=>effect.impact==='neutral'&&effect.impactLabel==='중립'));
});
