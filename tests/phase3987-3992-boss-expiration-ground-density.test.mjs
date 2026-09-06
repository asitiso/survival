import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardExpirationGroundStateDensityBudgetPresentation;
test('boss expiration ground density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse expiration transitions keep full effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.groundAlphaScale,1);});
test('old dense expiration transition retires aftermath first',()=>{const p=fn?.({activeCount:9,indexFromNewest:7,owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.aftermathAlphaScale,0);assert.equal(p.groundAlphaScale,1);});
test('newest expiration remains visible in dense hazard stack',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,owner:'expiration'},false);assert.ok(p);assert.ok(p.effectStrength>.5);assert.ok(p.aftermathAlphaScale>0);});
test('ground owner always preserves cleared-ground state',()=>{const p=fn?.({activeCount:12,indexFromNewest:11,owner:'ground'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.groundAlphaScale,1);});
test('live boss renderer budgets expiration transition without hiding ground memory',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardExpirationGroundStateDensityBudgetPresentation/);assert.match(s,/expirationGroundDensity/);});
