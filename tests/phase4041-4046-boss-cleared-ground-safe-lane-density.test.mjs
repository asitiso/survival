import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation;
test('cleared ground safe lane density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse lane recovery transition keeps full effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.safeLaneAlphaScale,1);});
test('old dense ground transition retires without hiding safe lane',()=>{const p=fn?.({activeCount:10,indexFromNewest:8,owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.safeLaneAlphaScale,1);});
test('newest handoff remains visible in dense ground stack',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,owner:'handoff'},false);assert.ok(p);assert.ok(p.effectStrength>.5);});
test('safe lane owner always preserves canonical path',()=>{const p=fn?.({activeCount:12,indexFromNewest:11,owner:'safe-lane'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.safeLaneAlphaScale,1);});
test('live safe lane draw budgets cleared ground transition only',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation/);assert.match(s,/clearedGroundSafeLaneDensity/);});
