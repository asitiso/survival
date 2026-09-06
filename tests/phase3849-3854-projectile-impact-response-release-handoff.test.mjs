import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactResponseReleaseHandoffPresentation;
test('impact response release handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('canonical direction remains canonical through lifetime',()=>{const p=fn?.({responseOwner:'canonical',directionOwner:'source',ttl:.12,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'direction');assert.equal(p.directionAlphaScale,1);});
test('weakpoint response holds direction down through early life',()=>{const p=fn?.({responseOwner:'weakpoint',directionOwner:'source',ttl:.15,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'response');assert.ok(p.directionAlphaScale<1);});
test('late weakpoint response settles without direction rebound',()=>{const early=fn?.({responseOwner:'weakpoint',directionOwner:'source',ttl:.15,maxTtl:.18},false),late=fn?.({responseOwner:'weakpoint',directionOwner:'source',ttl:.02,maxTtl:.18},false);assert.ok(early&&late);assert.equal(late.owner,'settle');assert.ok(late.directionAlphaScale<=early.directionAlphaScale);});
test('retired direction stays retired regardless of response owner',()=>{const p=fn?.({responseOwner:'guard',directionOwner:'retired',ttl:.1,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'retired');assert.equal(p.directionAlphaScale,0);});
test('live impact direction composes response release handoff',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactResponseReleaseHandoffPresentation/);assert.match(s,/impactResponseRelease/);});
