import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as death from '../dist/game/enemy-hit-death-transition-rendering.js';
const fn=death.enemyFinisherDeathAfterglowDensityBudgetPresentation;
test('finisher afterglow density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse death transitions keep full effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,tier:'heavy',owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.bodyAlphaScale,1);});
test('critical deaths keep more capacity than normal deaths',()=>{const c=fn?.({activeCount:10,indexFromNewest:3,tier:'critical',owner:'handoff'},false),n=fn?.({activeCount:10,indexFromNewest:3,tier:'normal',owner:'handoff'},false);assert.ok(c&&n);assert.ok(c.capacity>=n.capacity);});
test('old dense afterglow retires decoration without hiding body',()=>{const p=fn?.({activeCount:12,indexFromNewest:10,tier:'normal',owner:'afterglow'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.bodyAlphaScale,1);});
test('newest critical afterglow remains readable in crowd',()=>{const p=fn?.({activeCount:12,indexFromNewest:0,tier:'critical',owner:'afterglow'},false);assert.ok(p);assert.ok(p.effectStrength>.5);});
test('live finisher renderer budgets transition decoration only',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/enemyFinisherDeathAfterglowDensityBudgetPresentation/);assert.match(s,/deathAfterglowDensity/);});
