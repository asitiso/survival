import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactDamageSourceAftermathPresentation;
test('damage-source aftermath helper exists',()=>assert.equal(typeof fn,'function'));
test('guard response owns early impact before projectile aftermath',()=>{const p=fn?.({responseOwner:'guard',secondaryKind:undefined,ttl:.16,maxTtl:.18},false,false);assert.ok(p);assert.equal(p.owner,'response');assert.equal(p.sourceClass,'projectile');assert.ok(p.responseAlphaScale>p.aftermathAlphaScale);});
test('late primary impact hands to projectile aftermath',()=>{const p=fn?.({responseOwner:'guard',secondaryKind:undefined,ttl:.04,maxTtl:.18},false,false);assert.ok(p);assert.equal(p.owner,'projectile-aftermath');assert.ok(p.aftermathAlphaScale>p.responseAlphaScale);assert.ok(p.lineLengthScale>0);});
test('splash aftermath uses explosion ring identity',()=>{const p=fn?.({responseOwner:'canonical',secondaryKind:'splash',ttl:.05,maxTtl:.14},false,false);assert.ok(p);assert.equal(p.sourceClass,'explosion');assert.equal(p.owner,'explosion-aftermath');assert.ok(p.ringRadiusScale>0);});
test('expired impact retires aftermath identity',()=>{const p=fn?.({responseOwner:'weakpoint',secondaryKind:'chain',ttl:0,maxTtl:.14},false,false);assert.ok(p);assert.equal(p.owner,'retired');assert.equal(p.aftermathAlphaScale,0);});
test('live projectile renderer composes damage-source aftermath',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactDamageSourceAftermathPresentation/);assert.match(s,/impactDamageSourceAftermath/);});
