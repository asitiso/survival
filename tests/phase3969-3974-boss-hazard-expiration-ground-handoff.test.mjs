import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as life from '../dist/game/boss-hazard-lifecycle-owner-rendering.js';
const fn=life.bossHazardExpirationGroundStateHandoffPresentation;
test('boss expiration ground-state handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('expiration owner preserves aftermath and suppresses ground residue',()=>{const p=fn?.({owner:'expiration',aftermathLife:.92,memoryLife:.98},false,false);assert.ok(p);assert.equal(p.owner,'expiration');assert.equal(p.groundAlphaScale,0);});
test('handoff shares aftermath and ground without double-brightness',()=>{const p=fn?.({owner:'handoff',aftermathLife:.48,memoryLife:.68},false,false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.aftermathAlphaScale>0&&p.groundAlphaScale>0);assert.ok(p.aftermathAlphaScale+p.groundAlphaScale<=1.3);});
test('ground owner retires aftermath completely',()=>{const p=fn?.({owner:'ground',aftermathLife:0,memoryLife:.4},false,false);assert.ok(p);assert.equal(p.owner,'ground');assert.equal(p.aftermathAlphaScale,0);assert.equal(p.groundAlphaScale,1);});
test('reduced flash lowers aftermath transition without hiding ground',()=>{const a=fn?.({owner:'handoff',aftermathLife:.4,memoryLife:.6},false,false),b=fn?.({owner:'handoff',aftermathLife:.4,memoryLife:.6},false,true);assert.ok(a&&b);assert.ok(b.aftermathAlphaScale<=a.aftermathAlphaScale);assert.ok(b.groundAlphaScale>0);});
test('live boss renderer composes expiration ground handoff',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardExpirationGroundStateHandoffPresentation/);assert.match(s,/expirationGroundHandoff/);});
