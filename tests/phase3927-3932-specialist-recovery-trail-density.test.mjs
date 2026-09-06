import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistRecoveryTrailDensityBudgetPresentation;
test('specialist recovery trail density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse recovery trails keep full silhouette effect',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,type:'assassin',owner:'handoff',recoveryBlend:.55},false);assert.ok(p);assert.equal(p.effectStrength,1);assert.equal(p.bodyAlphaScale,1);});
test('dense assassin recovery trail retires before siege trail',()=>{const a=fn?.({activeCount:9,indexFromNewest:3,type:'assassin',owner:'handoff',recoveryBlend:.55},false),s=fn?.({activeCount:9,indexFromNewest:3,type:'siegeGolem',owner:'handoff',recoveryBlend:.55},false);assert.ok(a&&s);assert.ok(a.capacity<s.capacity);assert.ok(a.effectStrength<=s.effectStrength);});
test('newest recovery handoff remains readable in crowd',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,type:'nullifier',owner:'handoff',recoveryBlend:.68},false);assert.ok(p);assert.ok(p.effectStrength>.55);});
test('locomotion owner retires recovery decoration without hiding body',()=>{const p=fn?.({activeCount:10,indexFromNewest:0,type:'shieldbearer',owner:'locomotion',recoveryBlend:1},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.bodyAlphaScale,1);});
test('live specialist silhouette budgets recovery trail decoration only',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistRecoveryTrailDensityBudgetPresentation/);assert.match(s,/specialistRecoveryTrailDensityBudget/);});
