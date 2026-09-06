import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactLineageDensityBudgetPresentation;
test('impact lineage density budget helper exists',()=>assert.equal(typeof fn,'function'));
test('sparse lineage labels keep full visibility',()=>{const p=fn?.({activeLineageCount:2,indexFromNewest:1,owner:'secondary',heldCount:3},false);assert.ok(p);assert.equal(p.visible,true);assert.equal(p.alphaScale,1);});
test('dense old settle label retires before secondary owner',()=>{const settle=fn?.({activeLineageCount:8,indexFromNewest:4,owner:'settle',heldCount:2},false),secondary=fn?.({activeLineageCount:8,indexFromNewest:4,owner:'secondary',heldCount:2},false);assert.ok(settle&&secondary);assert.ok(Number(secondary.visible)>=Number(settle.visible));});
test('high held count preserves stronger dense label priority',()=>{const low=fn?.({activeLineageCount:8,indexFromNewest:3,owner:'secondary',heldCount:2},false),high=fn?.({activeLineageCount:8,indexFromNewest:3,owner:'secondary',heldCount:6},false);assert.ok(low&&high);assert.ok(high.alphaScale>=low.alphaScale);});
test('reduced motion does not increase lineage label capacity',()=>{const a=fn?.({activeLineageCount:8,indexFromNewest:3,owner:'secondary',heldCount:3},false),b=fn?.({activeLineageCount:8,indexFromNewest:3,owner:'secondary',heldCount:3},true);assert.ok(a&&b);assert.ok(Number(b.visible)<=Number(a.visible));});
test('live lineage label composes density budget without hiding impact sprite',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileImpactLineageDensityBudgetPresentation/);assert.match(s,/lineageDensityBudget/);});
