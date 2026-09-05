import test from 'node:test';
import assert from 'node:assert/strict';
import { spellEvolutionTier,spellEvolution } from '../dist/game/spell-evolutions.js';
const close=(a,b)=>Math.abs(a-b)<1e-9;
test('phase 2112-2116 spell evolution level boundaries names and combat multipliers remain unchanged',()=>{
  assert.equal(spellEvolutionTier(4),0);assert.equal(spellEvolutionTier(5),1);assert.equal(spellEvolutionTier(9),1);assert.equal(spellEvolutionTier(10),2);
  const a1=spellEvolution('arkan','fireBolt',5);assert.equal(a1.name,'폭렬 화염탄');assert.ok(close(a1.damageMultiplier,1.134));assert.equal(a1.projectileBonus,1);assert.equal(a1.splashRadiusBonus,18);assert.ok(close(a1.splashDamageBonus,.16));
  const a2=spellEvolution('arkan','fireBolt',10);assert.equal(a2.name,'지옥성 폭렬탄');assert.ok(close(a2.damageMultiplier,1.298));assert.equal(a2.projectileBonus,2);assert.equal(a2.splashRadiusBonus,42);assert.ok(close(a2.splashDamageBonus,.36));
  const s2=spellEvolution('seria','frostNova',10);assert.equal(s2.name,'절대동결 파동');assert.ok(close(s2.areaMultiplier,1.3407));assert.ok(close(s2.slowFactorMultiplier,.78));assert.ok(close(s2.slowDurationMultiplier,1.3));
  const k2=spellEvolution('kain','chainLightning',10);assert.equal(k2.name,'무한 전류망');assert.equal(k2.jumpBonus,5);assert.ok(close(k2.cooldownMultiplier,.7392));
  const e2=spellEvolution('edric','blackHole',10);assert.equal(e2.name,'영겁의 시간감옥');assert.ok(close(e2.areaMultiplier,1.3068));assert.ok(close(e2.pullMultiplier,1.28));
});
