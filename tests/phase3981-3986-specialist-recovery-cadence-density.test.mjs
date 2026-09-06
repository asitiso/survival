import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistRecoveryLocomotionCadenceDensityBudgetPresentation;
test('specialist recovery cadence density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse recovery cadence transitions keep full effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,type:'shieldbearer',owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.bodyAlphaScale,1);});
test('assassin recovery cadence transition retires before siege in dense crowd',()=>{const a=fn?.({activeCount:10,indexFromNewest:3,type:'assassin',owner:'handoff'},false),s=fn?.({activeCount:10,indexFromNewest:3,type:'siegeGolem',owner:'handoff'},false);assert.ok(a&&s);assert.ok(a.capacity<s.capacity);});
test('old transition returns to canonical locomotion instead of hiding body',()=>{const p=fn?.({activeCount:12,indexFromNewest:9,type:'nullifier',owner:'handoff'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.bodyAlphaScale,1);assert.equal(p.canonicalCadenceScale,1);});
test('locomotion owner needs no density transition',()=>{const p=fn?.({activeCount:12,indexFromNewest:11,type:'shieldbearer',owner:'locomotion'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.canonicalCadenceScale,1);});
test('live specialist renderer budgets cadence transition without hiding body',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistRecoveryLocomotionCadenceDensityBudgetPresentation/);assert.match(s,/specialistRecoveryCadenceDensity/);});
