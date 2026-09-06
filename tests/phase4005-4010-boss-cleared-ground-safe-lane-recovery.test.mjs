import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossClearedGroundSafeLaneRecoveryCoherencePresentation;
test('boss cleared ground safe lane recovery helper exists',()=>assert.equal(typeof fn,'function'));
test('fresh cleared memory owns ground while lane stays muted',()=>{const p=fn?.({memoryLife:.9,safeLaneConfidence:.8,nearLane:true,hazardOccluded:false},false);assert.ok(p);assert.equal(p.owner,'ground');assert.ok(p.groundAlphaScale>p.safeLaneAlphaScale);});
test('aging memory hands ownership to safe lane',()=>{const p=fn?.({memoryLife:.28,safeLaneConfidence:.82,nearLane:true,hazardOccluded:false},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.safeLaneAlphaScale>.45);});
test('retired memory restores canonical safe lane',()=>{const p=fn?.({memoryLife:0,safeLaneConfidence:.9,nearLane:true,hazardOccluded:false},false);assert.ok(p);assert.equal(p.owner,'safe-lane');assert.equal(p.safeLaneAlphaScale,1);});
test('active hazard occlusion prevents cleared memory from boosting lane',()=>{const p=fn?.({memoryLife:.5,safeLaneConfidence:.9,nearLane:true,hazardOccluded:true},false);assert.ok(p);assert.ok(p.safeLaneAlphaScale<=.55);});
test('live safe lane draw composes cleared ground recovery coherence',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossClearedGroundSafeLaneRecoveryCoherencePresentation/);assert.match(s,/clearedGroundSafeLaneRecovery/);});
