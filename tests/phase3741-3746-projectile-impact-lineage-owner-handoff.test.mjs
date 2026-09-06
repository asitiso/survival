import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactLineageOwnerHandoffPresentation;
test('lineage owner handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('active primary impact keeps source ownership',()=>{const p=fn?.({sourceActive:true,secondaryActive:true,ttl:.12,maxTtl:.14},false);assert.ok(p);assert.equal(p.owner,'source');});
test('secondary lineage inherits after primary retires',()=>{const p=fn?.({sourceActive:false,secondaryActive:true,ttl:.1,maxTtl:.14},false);assert.ok(p);assert.equal(p.owner,'secondary');assert.ok(p.alphaScale>0);});
test('late orphaned secondary lineage settles before retirement',()=>{const p=fn?.({sourceActive:false,secondaryActive:true,ttl:.01,maxTtl:.14},false);assert.ok(p);assert.ok(['settle','retired'].includes(p.owner));assert.ok(p.alphaScale<.5);});
test('empty lineage retires completely',()=>{const p=fn?.({sourceActive:false,secondaryActive:false,ttl:0,maxTtl:.14},false);assert.ok(p);assert.equal(p.owner,'retired');assert.equal(p.alphaScale,0);});
test('live secondary lineage label composes explicit owner handoff',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactLineageOwnerHandoffPresentation/);assert.match(s,/primaryImpactLineageKeys/);});
