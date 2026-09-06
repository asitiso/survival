import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileDamageSourceEnemyReactionDensityBudgetPresentation;
test('enemy reaction density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse reaction handoffs keep full transition effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,reactionOwner:'hit',handoffOwner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.impactSpriteAlphaScale,1);});
test('dense death reactions use tighter capacity than hits',()=>{const d=fn?.({activeCount:9,indexFromNewest:3,reactionOwner:'death',handoffOwner:'death'},false),h=fn?.({activeCount:9,indexFromNewest:3,reactionOwner:'hit',handoffOwner:'handoff'},false);assert.ok(d&&h);assert.ok(d.capacity<h.capacity);});
test('old dense hit transition retires without hiding impact sprite',()=>{const p=fn?.({activeCount:12,indexFromNewest:9,reactionOwner:'hit',handoffOwner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.impactSpriteAlphaScale,1);});
test('newest death reaction remains readable in crowd',()=>{const p=fn?.({activeCount:12,indexFromNewest:0,reactionOwner:'death',handoffOwner:'death'},false);assert.ok(p);assert.ok(p.effectStrength>.5);});
test('live projectile renderer budgets reaction transition decoration only',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileDamageSourceEnemyReactionDensityBudgetPresentation/);assert.match(s,/impactDamageSourceReactionDensity/);});
