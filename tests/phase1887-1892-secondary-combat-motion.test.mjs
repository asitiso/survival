import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1887 exports a single-owner secondary combat motion policy',async()=>{
  const mod=await import('../dist/game/combat-cue-priority.js');
  assert.equal(typeof mod.secondaryCombatMotionPolicy,'function');
  const policy=mod.secondaryCombatMotionPolicy({
    combatPrimary:'normal',reducedFlash:false,
    hasBossHazard:true,hasPriorityThreat:true,hasSupplyCrate:true,hasFieldNode:true,hasFreezeStatus:true,coreVisible:true,
  });
  assert.equal(policy.owner,'boss-hazard');
  assert.equal(policy.bossHazardMotionAmplitude>0,true);
  assert.equal(policy.priorityThreatMotionAmplitude,0);
  assert.equal(policy.supplyCrateMotionAmplitude,0);
  assert.equal(policy.fieldNodeMotionAmplitude,0);
  assert.equal(policy.freezeStatusMotionAmplitude,0);
  assert.equal(policy.coreAmbientMotionAmplitude,0);
});

test('phase 1887 priority threat rings consume secondary motion ownership',()=>{
  assert.match(source,/secondaryCombatMotionPolicy/);
  assert.match(source,/primaryThreatId/);
  assert.match(source,/priorityThreatMotionAmplitude/);
});

test('phase 1888 freeze rings keep one animated focus and steady secondary rings',()=>{
  assert.match(source,/primaryFrozenEnemyId/);
  assert.match(source,/freezeStatusMotionAmplitude/);
});

test('phase 1889 supply crate reuses tactical supply icon and secondary motion',()=>{
  assert.match(source,/tacticalStatusIconPresentation\('supplyDrop'\)/);
  assert.match(source,/supplyCrateMotionAmplitude/);
});

test('phase 1890 boss arena telegraph animates only its primary hazard',()=>{
  assert.match(source,/primaryTelegraphHazardId/);
  assert.match(source,/bossHazardMotionAmplitude/);
});

test('phase 1891 endless field nodes use one motion owner',()=>{
  assert.match(source,/primaryFieldNodeId/);
  assert.match(source,/fieldNodeMotionAmplitude/);
});

test('phase 1892 core ambient ring yields motion to higher secondary cues',()=>{
  assert.match(source,/coreAmbientMotionAmplitude/);
});

test('reduced flash and non-normal combat attention suppress all secondary motion',async()=>{
  const mod=await import('../dist/game/combat-cue-priority.js');
  assert.equal(typeof mod.secondaryCombatMotionPolicy,'function');
  const flags={hasBossHazard:true,hasPriorityThreat:true,hasSupplyCrate:true,hasFieldNode:true,hasFreezeStatus:true,coreVisible:true};
  for(const input of [
    {combatPrimary:'hero-critical',reducedFlash:false},
    {combatPrimary:'core-critical',reducedFlash:false},
    {combatPrimary:'damage-critical',reducedFlash:false},
    {combatPrimary:'boss-response',reducedFlash:false},
    {combatPrimary:'damage-heavy',reducedFlash:false},
    {combatPrimary:'boss-countdown',reducedFlash:false},
    {combatPrimary:'normal',reducedFlash:true},
  ]){
    const p=mod.secondaryCombatMotionPolicy({...input,...flags});
    assert.equal(p.owner,'none');
    assert.deepEqual([
      p.bossHazardMotionAmplitude,p.priorityThreatMotionAmplitude,p.supplyCrateMotionAmplitude,
      p.fieldNodeMotionAmplitude,p.freezeStatusMotionAmplitude,p.coreAmbientMotionAmplitude,
    ],[0,0,0,0,0,0]);
  }
});

test('phase 1887 priority threat renderer is present in the live render path',()=>{
  const calls=source.match(/this\.drawPriorityThreats\(ctx,\s*secondaryMotion\)/g)??[];
  assert.ok(calls.length>=1,'drawPriorityThreats must be called by render');
});
