import test from 'node:test';
import assert from 'node:assert/strict';
import { auditThermalWorstCase, thermalWorstCaseCheckpoints } from '../dist/game/endless/thermal-worst-case-audit.js';

test('phase 355 thermal worst-case audit covers low mid high devices at two eight and twelve hours',()=>{
  const points=thermalWorstCaseCheckpoints();
  assert.equal(points.length,9);
  assert.deepEqual([...new Set(points.map((point)=>point.deviceClass))],['low','mid','high']);
  assert.deepEqual([...new Set(points.map((point)=>point.hours))],[2,8,12]);
});

test('phase 356 worst thermal state preserves enemy logic and all danger telegraph slots',()=>{
  const audit=auditThermalWorstCase();
  assert.equal(audit.logicPreserved,true);
  assert.equal(audit.telegraphsPreserved,true);
  assert.ok(audit.checkpoints.every((point)=>point.enemyLogicMultiplier===1&&point.telegraphCap===24));
});

test('phase 357 composed VFX budgets respect minimal governor ceilings and readable floors',()=>{
  const audit=auditThermalWorstCase();
  assert.equal(audit.vfxBudgetsBounded,true);
  assert.ok(audit.checkpoints.every((point)=>point.particleCap>=48&&point.particleCap<=64));
  assert.ok(audit.checkpoints.every((point)=>point.trailCap>=20&&point.trailCap<=28));
  assert.ok(audit.checkpoints.every((point)=>point.visualDensity>0&&point.visualDensity<=1));
});

test('phase 358 twelve-hour presentation pressure never increases decorative density over two-hour pressure',()=>{
  const audit=auditThermalWorstCase();
  assert.equal(audit.longRunDegradesPresentationFirst,true);
  assert.equal(audit.passed,true);
  for(const deviceClass of ['low','mid','high']){
    const points=audit.checkpoints.filter((point)=>point.deviceClass===deviceClass).sort((a,b)=>a.hours-b.hours);
    assert.ok(points[2].visualDensity<=points[0].visualDensity);
    assert.ok(points[2].projectileVisualDensity<=points[0].projectileVisualDensity);
  }
});
