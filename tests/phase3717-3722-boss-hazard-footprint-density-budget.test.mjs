import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as hazard from '../dist/game/boss-hazard-telegraph-handoff-rendering.js';
const fn=hazard.bossHazardFootprintDensityBudgetPresentation;
test('sparse materialization footprints all remain visible',()=>{assert.equal(typeof fn,'function');const p=fn?.({activeCount:2,indexFromNewest:1,progress:.3},false,false);assert.ok(p);assert.equal(p.visible,true);});
test('dense hazard spawn hides old footprint accents',()=>{const p=fn?.({activeCount:7,indexFromNewest:5,progress:.3},false,false);assert.ok(p);assert.equal(p.visible,false);});
test('newest hazard footprint wins dense capacity',()=>{const p=fn?.({activeCount:7,indexFromNewest:0,progress:.3},false,false);assert.ok(p);assert.equal(p.visible,true);});
test('reduced motion tightens footprint capacity',()=>{const a=fn?.({activeCount:6,indexFromNewest:2,progress:.4},false,false),b=fn?.({activeCount:6,indexFromNewest:2,progress:.4},true,false);assert.ok(a&&b);assert.ok(Number(b.visible)<=Number(a.visible));});
test('reduced flash lowers footprint budget alpha without changing slot',()=>{const a=fn?.({activeCount:4,indexFromNewest:1,progress:.4},false,false),b=fn?.({activeCount:4,indexFromNewest:1,progress:.4},false,true);assert.ok(a&&b);assert.equal(a.visible,b.visible);assert.ok(b.alphaScale<a.alphaScale);});
test('live boss arena computes footprint rank and gates only footprint draw',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/bossHazardFootprintDensityBudgetPresentation/);assert.match(s,/hazardFootprintBudget\.visible/);assert.match(s,/activeHazardFootprints/);});
