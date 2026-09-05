import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { rasterReleaseQualityGate } from '../dist/game/render-raster-release-gate.js';

test('phase 855-856 release freeze includes visual effects safety evidence',()=>{
  const audit=auditReleaseFreeze();
  assert.equal(audit.visualEffectsPassed,true);
  assert.equal(audit.visualEffectsSamples,72);
});

test('phase 857 raster release gate includes visual effects safety',()=>{
  const gate=rasterReleaseQualityGate();
  assert.equal(gate.visualEffectsPassed,true);
});

test('phase 858 raster release gate fails closed when visual effects evidence is false',()=>{
  const gate=rasterReleaseQualityGate({visualEffectsPassed:false});
  assert.equal(gate.ok,false);
  assert.ok(gate.issues.includes('visual-effects'));
});
