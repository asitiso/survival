import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardRespawnMaterializationSettlePresentation;
test('boss respawn materialization settle helper exists',()=>assert.equal(typeof fn,'function'));
test('footprint phase preserves transition and suppresses persistent fill',()=>{const p=fn?.({owner:'footprint',activationTtl:0,activationMaxTtl:.08,ttl:5},false);assert.ok(p);assert.equal(p.owner,'footprint');assert.equal(p.persistentAlphaScale,0);});
test('telegraph phase keeps persistent hazard hidden',()=>{const p=fn?.({owner:'telegraph',activationTtl:0,activationMaxTtl:.08,ttl:5},false);assert.ok(p);assert.equal(p.owner,'telegraph');assert.equal(p.persistentAlphaScale,0);});
test('activation crossfades materialization into persistent hazard',()=>{const p=fn?.({owner:'activation',activationTtl:.04,activationMaxTtl:.08,ttl:5},false);assert.ok(p);assert.equal(p.owner,'activation');assert.ok(p.materializationAlphaScale>0&&p.persistentAlphaScale>0);assert.ok(p.persistentAlphaScale<1);});
test('active owner hands full visibility to persistent hazard',()=>{const p=fn?.({owner:'active',activationTtl:0,activationMaxTtl:.08,ttl:5},false);assert.ok(p);assert.equal(p.owner,'active');assert.equal(p.materializationAlphaScale,0);assert.equal(p.persistentAlphaScale,1);});
test('live boss renderer composes materialization settle into active alpha',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardRespawnMaterializationSettlePresentation/);assert.match(s,/respawnMaterializationSettle/);});
