import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossClearedGroundSafeLaneRecoveryHandoffPresentation;
test('cleared ground safe lane handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('ground owner keeps lane secondary',()=>{const p=fn?.({owner:'ground',memoryLife:.85,safeLaneConfidence:.8,hazardOccluded:false},false);assert.ok(p);assert.equal(p.owner,'ground');assert.ok(p.groundAlphaScale>p.safeLaneAlphaScale);});
test('handoff owner shares lane and ground within budget',()=>{const p=fn?.({owner:'handoff',memoryLife:.35,safeLaneConfidence:.85,hazardOccluded:false},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.groundAlphaScale>0&&p.safeLaneAlphaScale>0);assert.ok(p.groundAlphaScale+p.safeLaneAlphaScale<=1.4);});
test('safe lane owner restores full path alpha',()=>{const p=fn?.({owner:'safe-lane',memoryLife:0,safeLaneConfidence:.9,hazardOccluded:false},false);assert.ok(p);assert.equal(p.safeLaneAlphaScale,1);});
test('hazard occlusion caps handoff lane recovery',()=>{const a=fn?.({owner:'handoff',memoryLife:.3,safeLaneConfidence:.9,hazardOccluded:false},false),b=fn?.({owner:'handoff',memoryLife:.3,safeLaneConfidence:.9,hazardOccluded:true},false);assert.ok(a&&b);assert.ok(b.safeLaneAlphaScale<a.safeLaneAlphaScale);});
test('live safe lane draw composes cleared ground handoff',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossClearedGroundSafeLaneRecoveryHandoffPresentation/);assert.match(s,/clearedGroundSafeLaneHandoff/);});
