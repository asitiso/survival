import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as hazard from '../dist/game/boss-hazard-telegraph-handoff-rendering.js';
const fn=hazard.bossHazardPersistentActivationSettlePresentation;
test('persistent hazard activation settle helper exists',()=>assert.equal(typeof fn,'function'));
test('fresh activation starts below full active alpha',()=>{const p=fn?.({telegraph:0,ttl:4,activationTtl:.08,activationMaxTtl:.08},false);assert.ok(p);assert.ok(p.activeAlphaScale<1&&p.activeAlphaScale>0);});
test('activation settle converges to full active ownership',()=>{const a=fn?.({telegraph:0,ttl:4,activationTtl:.06,activationMaxTtl:.08},false),b=fn?.({telegraph:0,ttl:4,activationTtl:.005,activationMaxTtl:.08},false);assert.ok(a&&b);assert.ok(b.activeAlphaScale>a.activeAlphaScale);});
test('telegraph phase does not activate persistent settle',()=>{const p=fn?.({telegraph:.2,ttl:4,activationTtl:.08,activationMaxTtl:.08},false);assert.ok(p);assert.equal(p.activeAlphaScale,0);});
test('expired hazard is fully retired',()=>{const p=fn?.({telegraph:0,ttl:0,activationTtl:0,activationMaxTtl:.08},false);assert.ok(p);assert.equal(p.owner,'retired');});
test('boss arena stores presentation-only activation ttl and live draw consumes it',()=>{const a=fs.readFileSync('src/game/boss-arena.ts','utf8'),g=fs.readFileSync('src/game/game.ts','utf8');assert.match(a,/visualActivationTtl/);assert.match(g,/bossHazardPersistentActivationSettlePresentation/);assert.match(g,/activationSettle/);});
