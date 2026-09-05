import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/critical-danger-hysteresis-audit.js',import.meta.url);

test('phase 1575 deterministic danger hysteresis audit locks stable warnings, haptics, and attention',async()=>{
  assert.equal(fs.existsSync(moduleUrl),true,'critical danger hysteresis audit module must exist');
  const { auditCriticalDangerHysteresis }=await import(moduleUrl.href);
  const audit=auditCriticalDangerHysteresis();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.length,25);
  assert.equal(audit.thresholdJitterToggleCount,0);
  assert.equal(audit.duplicateHapticCount,0);
  assert.equal(audit.safeExitRearmRate,1);
  assert.equal(audit.criticalWarningVisibilityRate,1);
  assert.ok(audit.maxAnimatedPrimaryWarnings<=1);
  assert.ok(audit.minHeroBandVignetteAlpha>=0.18);
  assert.equal(audit.reachableActionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
