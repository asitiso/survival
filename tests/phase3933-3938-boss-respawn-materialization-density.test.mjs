import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnMaterializationDensityBudgetPresentation;
test('boss respawn materialization density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse materialization transitions keep full effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,owner:'footprint'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.persistentAlphaScale,1);});
test('dense old footprint transition retires before telegraph body',()=>{const p=fn?.({activeCount:8,indexFromNewest:5,owner:'footprint'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.telegraphAlphaScale,1);});
test('newest activation transition remains visible in dense hazard stack',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,owner:'activation'},false);assert.ok(p);assert.ok(p.effectStrength>.5);assert.equal(p.persistentAlphaScale,1);});
test('active hazard never loses persistent visibility to density budget',()=>{const p=fn?.({activeCount:12,indexFromNewest:11,owner:'active'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.persistentAlphaScale,1);});
test('live boss renderer budgets materialization decoration without dimming hazard',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnMaterializationDensityBudgetPresentation/);assert.match(s,/respawnMaterializationDensityBudget/);});
