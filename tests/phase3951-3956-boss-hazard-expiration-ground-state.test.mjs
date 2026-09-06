import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardPersistentExpirationGroundStatePresentation;
test('boss persistent expiration ground-state helper exists',()=>assert.equal(typeof fn,'function'));
test('fresh expiration starts with aftermath ownership',()=>{const p=fn?.({aftermathTtl:.76,aftermathMaxTtl:.78,memoryTtl:1.23,memoryMaxTtl:1.25},false,false);assert.ok(p);assert.equal(p.owner,'expiration');assert.ok(p.aftermathAlphaScale>p.groundAlphaScale);});
test('mid aftermath shares ownership with ground state',()=>{const p=fn?.({aftermathTtl:.36,aftermathMaxTtl:.78,memoryTtl:.82,memoryMaxTtl:1.25},false,false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.aftermathAlphaScale>0&&p.groundAlphaScale>0);});
test('after aftermath retires ground memory remains authoritative',()=>{const p=fn?.({aftermathTtl:0,aftermathMaxTtl:.78,memoryTtl:.48,memoryMaxTtl:1.25},false,false);assert.ok(p);assert.equal(p.owner,'ground');assert.equal(p.aftermathAlphaScale,0);assert.equal(p.groundAlphaScale,1);});
test('reduced flash lowers aftermath but preserves ground owner',()=>{const a=fn?.({aftermathTtl:.3,aftermathMaxTtl:.78,memoryTtl:.7,memoryMaxTtl:1.25},false,false),b=fn?.({aftermathTtl:.3,aftermathMaxTtl:.78,memoryTtl:.7,memoryMaxTtl:1.25},false,true);assert.ok(a&&b);assert.equal(a.owner,b.owner);assert.ok(b.aftermathAlphaScale<=a.aftermathAlphaScale);});
test('live boss aftermath and cleared-ground renderers share expiration ground owner',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardPersistentExpirationGroundStatePresentation/);assert.match(s,/expirationGroundState/);});
