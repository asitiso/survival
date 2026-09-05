import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/boss-effective-pressure-hidden-threat-audit.js',import.meta.url);

test('phase 2380-2381 hidden-threat audit contains exactly sixty-four deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'hidden-threat audit module must exist');
  const {auditBossEffectivePressureHiddenThreatCount}=await import(auditUrl.href);const a=auditBossEffectivePressureHiddenThreatCount();
  assert.equal(a.samples.length,64);assert.equal(a.threeThreatCases,16);assert.equal(a.fourThreatCases,16);assert.equal(a.compatibilityCases,16);assert.equal(a.invariantCases,16);
  assert.equal(a.actionCount,9);assert.equal(a.newAtlasCount,0);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2380-2381 audit proves hidden count, label, max-two and atlas reuse',async()=>{
  const {auditBossEffectivePressureHiddenThreatCount}=await import(auditUrl.href);const a=auditBossEffectivePressureHiddenThreatCount();
  assert.equal(a.threeThreatCountPassed,true);assert.equal(a.fourThreatCountPassed,true);assert.equal(a.zeroHiddenCompatibilityPassed,true);assert.equal(a.hiddenLabelPassed,true);assert.equal(a.maxTwoPassed,true);assert.equal(a.existingAtlasReusePassed,true);
});
