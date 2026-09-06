import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnMaterializationOwnershipPresentation;
test('boss respawn materialization ownership helper exists',()=>assert.equal(typeof fn,'function'));
test('memory handoff yields to footprint while launch footprint is visible',()=>{const p=fn?.({respawnOwner:'handoff',footprintOwner:'footprint',activationOwner:'telegraph',footprintProgress:.25},false);assert.ok(p);assert.equal(p.owner,'footprint');assert.ok(p.memoryAlphaScale<1);assert.ok(p.footprintAlphaScale>0);});
test('telegraph owns after footprint settles',()=>{const p=fn?.({respawnOwner:'handoff',footprintOwner:'telegraph',activationOwner:'telegraph',footprintProgress:.88},false);assert.ok(p);assert.equal(p.owner,'telegraph');assert.equal(p.telegraphAlphaScale,1);});
test('activation owns materialization once hazard becomes active',()=>{const p=fn?.({respawnOwner:'spawn',footprintOwner:'active',activationOwner:'activation',footprintProgress:1},false);assert.ok(p);assert.equal(p.owner,'activation');assert.ok(p.activeAlphaScale>0&&p.activeAlphaScale<1);});
test('persistent active owner preserves full hazard visibility',()=>{const p=fn?.({respawnOwner:'spawn',footprintOwner:'active',activationOwner:'active',footprintProgress:1},false);assert.ok(p);assert.equal(p.owner,'active');assert.equal(p.activeAlphaScale,1);});
test('live boss hazard renderer composes respawn materialization owner',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnMaterializationOwnershipPresentation/);assert.match(s,/respawnMaterializationOwner/);});
