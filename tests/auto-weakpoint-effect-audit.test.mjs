import test from 'node:test';
import assert from 'node:assert/strict';
import { auditAutoWeakpointEffect } from '../dist/game/auto-weakpoint-effect-audit.js';

test('phase 503 weakpoint effect audit covers direct and area spells across offset nodes',()=>{
  const audit=auditAutoWeakpointEffect();
  assert.ok(audit.samples.length>=24);
  assert.deepEqual(new Set(audit.samples.map((s)=>s.spellId)),new Set(['fireBolt','chainLightning','flameField','meteorStorm','blackHole']));
});
test('phase 504 AUTO weakpoint aim materially improves expected weakpoint contact',()=>{
  const audit=auditAutoWeakpointEffect();
  assert.ok(audit.averageContactGain>=.18);
  assert.ok(audit.minAutoContact>=.92);
});
test('phase 505 direct spells receive the largest weakpoint benefit without nerfing area spells',()=>{
  const audit=auditAutoWeakpointEffect();
  assert.ok(audit.directSpellGain>audit.areaSpellGain);
  assert.ok(audit.areaSpellGain>=0);
});
test('phase 506 weakpoint effect audit passes with no regression issues',()=>{
  const audit=auditAutoWeakpointEffect();
  assert.equal(audit.passed,true);
  assert.deepEqual(audit.issues,[]);
});
