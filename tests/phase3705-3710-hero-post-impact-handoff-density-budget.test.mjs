import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as budget from '../dist/game/hero-travel-bridge-density-budget-rendering.js';
const fn=budget.heroPostImpactHandoffDensityBudgetPresentation;
test('post-impact density helper exists',()=>{assert.equal(typeof fn,'function');});
test('sparse continuing projectiles keep handoff effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,life:.8,evolutionTier:0},false);assert.ok(p);assert.equal(p.apply,true);});
test('dense volley drops old handoff effects without hiding projectile',()=>{const p=fn?.({activeCount:10,indexFromNewest:8,life:.8,evolutionTier:0},false);assert.ok(p);assert.equal(p.apply,false);assert.equal(p.effectStrength,0);});
test('newest dense projectile retains handoff effect',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,life:.8,evolutionTier:0},false);assert.ok(p);assert.equal(p.apply,true);});
test('reduced motion tightens post-impact effect capacity',()=>{const a=fn?.({activeCount:8,indexFromNewest:3,life:.8,evolutionTier:0},false),b=fn?.({activeCount:8,indexFromNewest:3,life:.8,evolutionTier:0},true);assert.ok(a&&b);assert.ok(Number(b.apply)<=Number(a.apply));});
test('live hero render applies density budget to transition effect only',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/heroPostImpactHandoffDensityBudgetPresentation/);assert.match(s,/postImpactBudget\.apply/);assert.match(s,/postImpactSpriteScale/);});
