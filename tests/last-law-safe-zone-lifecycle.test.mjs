import test from 'node:test';
import assert from 'node:assert/strict';
import { lastLawSafeZoneLifecycle } from '../dist/game/endless/last-law-safe-zone-lifecycle.js';
import { mythicSafeZoneState } from '../dist/game/endless/mythic-safe-zone.js';

test('normal mythic lifecycle preserves the exact phase 222/282 nine-second timing',()=>{
  const p=lastLawSafeZoneLifecycle(false,.4);
  assert.deepEqual(p,{active:false,cycleMs:9000,stableEndMs:4800,collapseEndMs:6200,collapsedEndMs:7800,reformEndMs:9000,radiusMultiplier:1});
  assert.deepEqual([1000,5400,6800,8200].map((t)=>mythicSafeZoneState('inferno',t,1600,900,.4,p).phase),['stable','collapse','collapsed','reform']);
});

test('active last law compresses the safe-zone cycle but keeps readable breathing-room floors',()=>{
  const raw=lastLawSafeZoneLifecycle(true,0);
  assert.ok(raw.cycleMs>=7000&&raw.cycleMs<9000);
  assert.ok(raw.stableEndMs>=3000);
  assert.ok(raw.collapseEndMs>raw.stableEndMs);
  assert.ok(raw.collapsedEndMs>raw.collapseEndMs);
  assert.ok(raw.reformEndMs-raw.collapsedEndMs>=600);
  assert.ok(raw.radiusMultiplier>=.88&&raw.radiusMultiplier<=1.08);
});

test('destroyed weakpoints restore bounded safe-zone time and radius during last law',()=>{
  const raw=lastLawSafeZoneLifecycle(true,0);
  const cleared=lastLawSafeZoneLifecycle(true,1);
  assert.ok(cleared.cycleMs>raw.cycleMs);
  assert.ok(cleared.stableEndMs>raw.stableEndMs);
  assert.ok(cleared.collapsedEndMs-cleared.collapseEndMs < raw.collapsedEndMs-raw.collapseEndMs);
  assert.ok(cleared.radiusMultiplier>raw.radiusMultiplier);
  assert.ok(cleared.cycleMs<=9000);
});

test('safe-zone state uses the supplied last-law lifecycle for phase and radius',()=>{
  const p=lastLawSafeZoneLifecycle(true,.5);
  const normal=mythicSafeZoneState('summoner',4300,1600,900,.5);
  const law=mythicSafeZoneState('summoner',4300,1600,900,.5,p);
  assert.notEqual(law.phase,normal.phase);
  assert.ok(law.radius<=normal.radius*1.08);
  assert.equal(law.cycleIndex,0);
});
