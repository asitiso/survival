import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactDamageSourceAftermathDensityBudgetPresentation;
test('damage-source aftermath density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse aftermath keeps full decorative effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,owner:'aftermath',sourceClass:'projectile'},false);assert.ok(p);assert.equal(p.effectVisible,true);assert.equal(p.aftermathAlphaScale,1);});
test('dense explosion aftermath uses tighter capacity than projectile',()=>{const e=fn?.({activeCount:9,indexFromNewest:3,owner:'aftermath',sourceClass:'explosion'},false),p=fn?.({activeCount:9,indexFromNewest:3,owner:'aftermath',sourceClass:'projectile'},false);assert.ok(e&&p);assert.ok(e.capacity<p.capacity);});
test('newest aftermath remains visible in dense volley',()=>{const p=fn?.({activeCount:12,indexFromNewest:0,owner:'aftermath',sourceClass:'projectile'},false);assert.ok(p);assert.equal(p.effectVisible,true);assert.ok(p.aftermathAlphaScale>.5);});
test('canonical owner preserves impact sprite while retiring decoration',()=>{const p=fn?.({activeCount:12,indexFromNewest:8,owner:'canonical',sourceClass:'explosion'},false);assert.ok(p);assert.equal(p.effectVisible,false);assert.equal(p.impactSpriteAlphaScale,1);});
test('live projectile renderer budgets damage-source aftermath only',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactDamageSourceAftermathDensityBudgetPresentation/);assert.match(s,/impactDamageSourceAftermathDensityBudget/);});
