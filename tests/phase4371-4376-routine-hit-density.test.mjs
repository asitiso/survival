import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readabilityModule=import('../dist/game/damage-number-readability.js').catch(()=>({}));

async function presentation(input){
  const mod=await readabilityModule;
  assert.equal(typeof mod.damageNumberPresentation,'function','damageNumberPresentation must exist');
  return mod.damageNumberPresentation(input);
}

test('Phase 4371-4376 routine normal damage yields alpha and capacity as battlefield density rises',async()=>{
  const calm=await presentation({tier:'normal',battlefieldStress:0,clusterIndex:0});
  const dense=await presentation({tier:'normal',battlefieldStress:1,clusterIndex:0});
  assert.ok(calm.alpha>dense.alpha,'normal damage alpha must yield under dense combat');
  assert.ok(calm.maxVisible>dense.maxVisible,'normal damage capacity must shrink under dense combat');
  assert.equal(calm.visible,true);
});

test('Phase 4371-4376 heavy and critical damage remain readable under maximum density',async()=>{
  const normal=await presentation({tier:'normal',battlefieldStress:1,clusterIndex:0});
  const heavy=await presentation({tier:'heavy',battlefieldStress:1,clusterIndex:0});
  const critical=await presentation({tier:'critical',battlefieldStress:1,clusterIndex:0});
  assert.equal(heavy.visible,true);
  assert.equal(critical.visible,true);
  assert.ok(heavy.alpha>normal.alpha);
  assert.ok(critical.alpha>=heavy.alpha);
  assert.ok(heavy.maxVisible>=normal.maxVisible);
  assert.ok(critical.maxVisible>=heavy.maxVisible);
});

test('Phase 4371-4376 routine normal hits beyond dense-cluster capacity are suppressed before meaningful hits',async()=>{
  const denseFirst=await presentation({tier:'normal',battlefieldStress:1,clusterIndex:0});
  const denseOverflow=await presentation({tier:'normal',battlefieldStress:1,clusterIndex:denseFirst.maxVisible});
  const criticalOverflow=await presentation({tier:'critical',battlefieldStress:1,clusterIndex:99});
  assert.equal(denseOverflow.visible,false,'overflow routine damage should disappear');
  assert.equal(criticalOverflow.visible,true,'critical damage must not be suppressed by routine capacity');
});

test('Phase 4371-4376 CombatFeedbackSystem consumes the damage-number readability policy',()=>{
  const source=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  assert.match(source,/damageNumberPresentation/);
  assert.match(source,/clusterIndex/);
  assert.match(source,/battlefieldStress/);
});
