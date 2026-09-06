import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as stack from '../dist/game/threat-impact-depth-stack-rendering.js';

const critical=stack.criticalDepthLatchPresentation;
const telegraph=stack.bossTelegraphStackOrderPresentation;
const lane=stack.safeLaneEdgeClutterProtectionPresentation;
const reclaim=stack.canonicalBodyDepthReclaimPresentation;
const impact=stack.impactEdgeGhostRetirementPresentation;
const budget=stack.unifiedDepthStackBudgetPresentation;

test('Phase 4095 critical depth latch keeps critical layer fully readable through release',()=>{
  const active=critical?.({critical:true,release:.2,pressure:.95},false);
  const releasing=critical?.({critical:true,release:.85,pressure:.95},false);
  assert.ok(active&&releasing);
  assert.equal(active.criticalAlphaScale,1);
  assert.equal(releasing.criticalAlphaScale,1);
  assert.ok(active.secondaryAlphaScale<=releasing.secondaryAlphaScale);
});

test('Phase 4096 newest boss telegraph owns edge while older stack decoration yields',()=>{
  const primary=telegraph?.({activeCount:5,indexFromNewest:0,life:.9,critical:true},false);
  const older=telegraph?.({activeCount:5,indexFromNewest:3,life:.55,critical:false},false);
  assert.ok(primary&&older);
  assert.ok(primary.edgeAlphaScale>=.94);
  assert.ok(older.decorationAlphaScale<primary.decorationAlphaScale);
});

test('Phase 4097 safe lane keeps a strong floor near screen edge under clutter',()=>{
  const cluttered=lane?.({edgeProximity:.92,clutter:.95,confidence:.88,critical:true},false);
  const calm=lane?.({edgeProximity:.1,clutter:.1,confidence:.88,critical:false},false);
  assert.ok(cluttered&&calm);
  assert.ok(cluttered.safeLaneAlphaScale>=1);
  assert.ok(cluttered.pathAlphaFloor>=.92);
  assert.ok(cluttered.secondaryAlphaScale<calm.secondaryAlphaScale);
});

test('Phase 4098 canonical body reclaims depth before decorative overlay',()=>{
  const transition=reclaim?.({release:.35,pressure:.9,owner:'recovery'},false);
  const settled=reclaim?.({release:.95,pressure:.1,owner:'canonical'},false);
  assert.ok(transition&&settled);
  assert.equal(transition.bodyAlphaScale,1);
  assert.equal(settled.bodyAlphaScale,1);
  assert.ok(settled.overlayAlphaScale>=transition.overlayAlphaScale);
});

test('Phase 4099 old impact edge retires without a ghost rebound',()=>{
  const fresh=impact?.({life:.85,neighborCount:5,critical:false},false);
  const old=impact?.({life:.12,neighborCount:5,critical:false},false);
  assert.ok(fresh&&old);
  assert.ok(old.edgeAlphaScale<fresh.edgeAlphaScale);
  assert.ok(old.fillAlphaScale<=old.edgeAlphaScale);
});

test('Phase 4100 unified depth stack protects critical safe lane and canonical body first',()=>{
  const dense=budget?.({criticalCount:2,bossTelegraphCount:3,safeLaneVisible:true,secondaryCount:14,pressure:.95},false,false);
  const calm=budget?.({criticalCount:0,bossTelegraphCount:0,safeLaneVisible:false,secondaryCount:2,pressure:.1},false,false);
  assert.ok(dense&&calm);
  assert.equal(dense.criticalAlphaScale,1);
  assert.equal(dense.canonicalBodyAlphaScale,1);
  assert.ok(dense.safeLaneAlphaScale>=1);
  assert.ok(dense.secondaryAlphaScale<calm.secondaryAlphaScale);
});

test('Phase 4095-4100 live battlefield renderers consume depth stack helpers',()=>{
  const enemies=fs.readFileSync('src/game/enemies.ts','utf8');
  const spells=fs.readFileSync('src/game/spells.ts','utf8');
  const game=fs.readFileSync('src/game/game.ts','utf8');
  assert.match(enemies,/criticalDepthLatchPresentation/);
  assert.match(game,/bossTelegraphStackOrderPresentation/);
  assert.match(game,/safeLaneEdgeClutterProtectionPresentation/);
  assert.match(enemies,/canonicalBodyDepthReclaimPresentation/);
  assert.match(spells,/impactEdgeGhostRetirementPresentation/);
  assert.match(enemies+spells+game,/unifiedDepthStackBudgetPresentation/);
});
