import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { thermalBudgetPolicy, auditThermalBudget } from '../dist/game/endless/thermal-budget-director.js';

test('phase 311 thermal policy moves from cool to warm to hot under sustained presentation pressure',()=>{
  const cool=thermalBudgetPolicy({elapsedSeconds:600,fps:60,adaptivePressure:.2,frameGovernorTier:'full',deviceClass:'high'});
  const warm=thermalBudgetPolicy({elapsedSeconds:7200,fps:48,adaptivePressure:.58,frameGovernorTier:'reduced',deviceClass:'mid'});
  const hot=thermalBudgetPolicy({elapsedSeconds:28800,fps:34,adaptivePressure:.92,frameGovernorTier:'minimal',deviceClass:'low'});
  assert.equal(cool.tier,'cool');
  assert.equal(warm.tier,'warm');
  assert.equal(hot.tier,'hot');
  assert.ok(cool.visualDensityMultiplier>warm.visualDensityMultiplier);
  assert.ok(warm.visualDensityMultiplier>hot.visualDensityMultiplier);
});

test('phase 312 thermal relief is presentation-only and preserves danger/logic',()=>{
  for(const tier of ['full','reduced','minimal']){
    const p=thermalBudgetPolicy({elapsedSeconds:28800,fps:30,adaptivePressure:1,frameGovernorTier:tier,deviceClass:'low'});
    assert.equal(p.telegraphMultiplier,1);
    assert.equal(p.enemyLogicMultiplier,1);
    assert.ok(p.particleCapMultiplier>=.62&&p.particleCapMultiplier<=1);
    assert.ok(p.trailCapMultiplier>=.56&&p.trailCapMultiplier<=1);
    assert.ok(p.audioVoiceMultiplier>=.72&&p.audioVoiceMultiplier<=1);
  }
});

test('phase 313 thermal audit keeps low mid and high device enemy logic intact while reducing decoration first',()=>{
  const audit=auditThermalBudget();
  assert.deepEqual(audit.devices.map((d)=>d.deviceClass),['low','mid','high']);
  assert.ok(audit.devices.every((d)=>d.logicPreserved));
  assert.ok(audit.devices.every((d)=>d.telegraphsPreserved));
  assert.ok(audit.devices.every((d)=>d.presentationFirst));
  assert.equal(audit.passed,true);
});

test('phase 314 game composes thermal policy into adaptive visual density and particle/trail trim only',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/thermalBudgetPolicy\(/);
  assert.match(source,/visualDensity: adaptive\.visualDensity \* governor\.visualDensity \* thermal\.visualDensityMultiplier/);
  assert.match(source,/governor\.particleCap \* comfort\.vfxDensity \* thermal\.particleCapMultiplier/);
  assert.match(source,/governor\.trailCap \* comfort\.vfxDensity \* thermal\.trailCapMultiplier/);
  assert.match(source,/governor\.telegraphCap/);
  assert.doesNotMatch(source,/governor\.telegraphCap \* thermal/);
});
