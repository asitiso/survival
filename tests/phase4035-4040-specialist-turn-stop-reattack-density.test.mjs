import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistTurnStopReattackDensityBudgetPresentation;
test('specialist rhythm density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse specialist rhythm keeps full transition',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,type:'shieldbearer',owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.bodyAlphaScale,1);});
test('assassin rhythm uses tighter crowd capacity than siege golem',()=>{const a=fn?.({activeCount:10,indexFromNewest:3,type:'assassin',owner:'handoff'},false),g=fn?.({activeCount:10,indexFromNewest:3,type:'siegeGolem',owner:'handoff'},false);assert.ok(a&&g);assert.ok(a.capacity<g.capacity);});
test('old transition returns to canonical cadence without hiding body',()=>{const p=fn?.({activeCount:12,indexFromNewest:9,type:'nullifier',owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.bodyAlphaScale,1);assert.equal(p.canonicalCadenceScale,1);});
test('locomotion owner needs no transition budget',()=>{const p=fn?.({activeCount:12,indexFromNewest:11,type:'shieldbearer',owner:'locomotion'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.canonicalCadenceScale,1);});
test('live specialist renderer budgets rhythm transition only',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistTurnStopReattackDensityBudgetPresentation/);assert.match(s,/specialistTurnStopDensity/);});
