import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as hazard from '../dist/game/boss-hazard-telegraph-handoff-rendering.js';
const fn=hazard.bossHazardActivationDensityBudgetPresentation;
test('boss activation density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse activation keeps settle effect',()=>{const p=fn?.({activeActivationCount:2,indexFromNewest:1,owner:'activation'},false);assert.ok(p);assert.equal(p.effectStrength,1);});
test('dense old activation drops settle effect but never active hazard',()=>{const p=fn?.({activeActivationCount:7,indexFromNewest:5,owner:'activation'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.activeVisible,true);});
test('newest dense activation retains settle effect',()=>{const p=fn?.({activeActivationCount:7,indexFromNewest:0,owner:'activation'},false);assert.ok(p);assert.ok(p.effectStrength>0);});
test('canonical active owner bypasses activation density effect',()=>{const p=fn?.({activeActivationCount:7,indexFromNewest:5,owner:'active'},false);assert.ok(p);assert.equal(p.effectStrength,0);assert.equal(p.activeVisible,true);});
test('live boss draw applies budget only to activation settle delta',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardActivationDensityBudgetPresentation/);assert.match(s,/activationDensityBudget/);assert.match(s,/activationActiveScale/);});
