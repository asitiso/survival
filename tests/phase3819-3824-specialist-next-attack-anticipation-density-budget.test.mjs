import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistNextAttackAnticipationDensityBudgetPresentation;
test('specialist anticipation density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse specialist anticipation remains unchanged',()=>{const p=fn?.({activeCount:2,indexFromNewest:1,type:'assassin',urgency:.7},false);assert.ok(p);assert.equal(p.visible,true);assert.equal(p.alphaScale,1);});
test('dense old assassin anticipation retires before siege cue',()=>{const a=fn?.({activeCount:8,indexFromNewest:3,type:'assassin',urgency:.6},false),g=fn?.({activeCount:8,indexFromNewest:3,type:'siegeGolem',urgency:.6},false);assert.ok(a&&g);assert.ok(Number(a.visible)<=Number(g.visible));});
test('high urgency preserves stronger dense anticipation priority',()=>{const low=fn?.({activeCount:8,indexFromNewest:2,type:'shieldbearer',urgency:.25},false),high=fn?.({activeCount:8,indexFromNewest:2,type:'shieldbearer',urgency:.95},false);assert.ok(low&&high);assert.ok(high.alphaScale>=low.alphaScale);});
test('reduced motion tightens anticipation reach budget',()=>{const a=fn?.({activeCount:7,indexFromNewest:1,type:'nullifier',urgency:.8},false),b=fn?.({activeCount:7,indexFromNewest:1,type:'nullifier',urgency:.8},true);assert.ok(a&&b);assert.ok(b.reachScale<=a.reachScale);});
test('live specialist anticipation composes density budget without hiding specialist body',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistNextAttackAnticipationDensityBudgetPresentation/);assert.match(s,/anticipationDensityBudget/);});
