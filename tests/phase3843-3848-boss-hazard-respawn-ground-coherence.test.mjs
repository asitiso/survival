import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnGroundCoherencePresentation;
test('boss hazard respawn ground coherence helper exists',()=>assert.equal(typeof fn,'function'));
test('far next hazard leaves cleared-ground memory untouched',()=>{const p=fn?.({memoryLife:.7,aftermathActive:false,nextHazardDistance:240,nextHazardRadius:60,nextHazardTelegraph:.7},false);assert.ok(p);assert.equal(p.owner,'memory');assert.equal(p.memoryAlphaScale,1);assert.equal(p.telegraphAlphaScale,1);});
test('near repeated hazard creates a single handoff owner',()=>{const p=fn?.({memoryLife:.7,aftermathActive:false,nextHazardDistance:55,nextHazardRadius:70,nextHazardTelegraph:.8},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.memoryAlphaScale<1);assert.ok(p.telegraphAlphaScale<=1);});
test('urgent near respawn retires stale memory in favor of spawn',()=>{const p=fn?.({memoryLife:.5,aftermathActive:false,nextHazardDistance:34,nextHazardRadius:70,nextHazardTelegraph:.12},false);assert.ok(p);assert.equal(p.owner,'spawn');assert.equal(p.memoryAlphaScale,0);assert.equal(p.telegraphAlphaScale,1);});
test('active aftermath prevents duplicate ground-memory emphasis',()=>{const p=fn?.({memoryLife:.8,aftermathActive:true,nextHazardDistance:60,nextHazardRadius:70,nextHazardTelegraph:.8},false);assert.ok(p);assert.ok(p.memoryAlphaScale<=.35);});
test('live boss hazard rendering composes respawn ground coherence',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnGroundCoherencePresentation/);assert.match(s,/respawnGroundCoherence/);});
