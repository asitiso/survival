import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactDirectionOwnerHandoffPresentation;
test('impact direction owner handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('primary impact direction keeps source ownership',()=>{const p=fn?.({secondaryKind:undefined,sourceActive:true,ttl:.12,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'source');assert.equal(p.alphaScale,1);});
test('secondary direction yields while source impact is still active',()=>{const p=fn?.({secondaryKind:'chain',sourceActive:true,ttl:.1,maxTtl:.14},false);assert.ok(p);assert.equal(p.owner,'source');assert.ok(p.alphaScale<1);});
test('secondary direction takes ownership after source retires',()=>{const p=fn?.({secondaryKind:'chain',sourceActive:false,ttl:.1,maxTtl:.14},false);assert.ok(p);assert.equal(p.owner,'secondary');assert.ok(p.alphaScale>.65);});
test('late secondary direction settles toward retirement',()=>{const p=fn?.({secondaryKind:'splash',sourceActive:false,ttl:.01,maxTtl:.14},false);assert.ok(p);assert.ok(['settle','retired'].includes(p.owner));assert.ok(p.alphaScale<.5);});
test('live impact direction composes source/secondary owner handoff',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactDirectionOwnerHandoffPresentation/);assert.match(s,/impactDirectionOwner/);});
