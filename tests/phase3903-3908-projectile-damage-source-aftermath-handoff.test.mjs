import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactDamageSourceAftermathHandoffPresentation;
test('damage-source aftermath handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('response owner keeps aftermath suppressed early',()=>{const p=fn?.({owner:'response',ttl:.15,maxTtl:.18,sourceClass:'projectile'},false);assert.ok(p);assert.equal(p.owner,'response');assert.ok(p.aftermathAlphaScale<.5);});
test('source aftermath owns middle life without dimming impact sprite entirely',()=>{const p=fn?.({owner:'projectile-aftermath',ttl:.08,maxTtl:.18,sourceClass:'projectile'},false);assert.ok(p);assert.equal(p.owner,'aftermath');assert.ok(p.aftermathAlphaScale>0);assert.ok(p.impactSpriteAlphaScale>.35);});
test('late aftermath settles to canonical impact residue',()=>{const p=fn?.({owner:'explosion-aftermath',ttl:.02,maxTtl:.14,sourceClass:'explosion'},false);assert.ok(p);assert.equal(p.owner,'canonical');assert.ok(p.aftermathAlphaScale<.5);assert.equal(p.impactSpriteAlphaScale,1);});
test('retired aftermath stays fully retired',()=>{const p=fn?.({owner:'retired',ttl:0,maxTtl:.14,sourceClass:'projectile'},false);assert.ok(p);assert.equal(p.owner,'retired');assert.equal(p.aftermathAlphaScale,0);});
test('live projectile renderer composes aftermath handoff before draw',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactDamageSourceAftermathHandoffPresentation/);assert.match(s,/impactDamageSourceAftermathHandoff/);});
