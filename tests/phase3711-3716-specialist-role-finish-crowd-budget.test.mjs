import test from 'node:test';import assert from 'node:assert/strict';
import { specialistImpactFinishDensityBudgetPresentation } from '../dist/game/specialist-impact-finish-density-budget-rendering.js';
const p=(type,index=0,count=8)=>specialistImpactFinishDensityBudgetPresentation({activeCount:count,indexFromNewest:index,type,life:.75},false,false);
test('dense assassin tangent finish gets smaller capacity than siege golem',()=>{assert.ok(p('assassin').capacity<p('siegeGolem').capacity);});
test('dense nullifier counter-tangent finish stays tightly capped',()=>{assert.ok(p('nullifier').capacity<=p('shieldbearer').capacity);});
test('siege golem preserves heavy normal finish capacity',()=>{assert.ok(p('siegeGolem').capacity>=4);});
test('sparse packs remain unchanged across specialist roles',()=>{for(const type of ['shieldbearer','assassin','siegeGolem','nullifier'])assert.equal(p(type,1,2).capacity,2);});
test('newest tangent finish always keeps one slot',()=>{assert.equal(p('assassin',0,9).visible,true);assert.equal(p('nullifier',0,9).visible,true);});
test('old tangent finish retires before same-index siege finish',()=>{const a=p('assassin',3,9),g=p('siegeGolem',3,9);assert.equal(a.visible,false);assert.equal(g.visible,true);});
