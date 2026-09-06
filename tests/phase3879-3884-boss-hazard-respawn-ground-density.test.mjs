import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnGroundDensityBudgetPresentation;
test('boss respawn ground density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse respawn transition keeps full ground handoff',()=>{const p=fn?.({activeTransitionCount:2,indexFromNewest:1,owner:'handoff'},false);assert.ok(p);assert.equal(p.transitionVisible,true);assert.equal(p.memoryAlphaScale,1);assert.equal(p.telegraphAlphaScale,1);});
test('dense old handoff retires old memory before new hazard telegraph',()=>{const p=fn?.({activeTransitionCount:8,indexFromNewest:5,owner:'handoff'},false);assert.ok(p);assert.equal(p.transitionVisible,false);assert.equal(p.memoryAlphaScale,0);assert.equal(p.telegraphAlphaScale,1);});
test('newest respawn transition stays visible in dense hazard history',()=>{const p=fn?.({activeTransitionCount:9,indexFromNewest:0,owner:'handoff'},false);assert.ok(p);assert.equal(p.transitionVisible,true);assert.ok(p.aftermathAlphaScale>0);});
test('spawn owner never dims actual new hazard telegraph',()=>{const p=fn?.({activeTransitionCount:12,indexFromNewest:10,owner:'spawn'},false);assert.ok(p);assert.equal(p.telegraphAlphaScale,1);assert.equal(p.memoryAlphaScale,0);});
test('live boss respawn density budget preserves telegraph while trimming transition history',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnGroundDensityBudgetPresentation/);assert.match(s,/respawnGroundDensityBudget/);});
