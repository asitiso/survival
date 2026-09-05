import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/boss-effective-pressure-multi-threat-priority-audit.js',import.meta.url);

test('phase 2372-2373 multi-threat audit contains exactly sixty-four deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'multi-threat priority audit module must exist');
  const {auditBossEffectivePressureMultiThreatPriority}=await import(auditUrl.href);const a=auditBossEffectivePressureMultiThreatPriority();
  assert.equal(a.samples.length,64);assert.equal(a.twoThreatCases,24);assert.equal(a.threeThreatCases,12);assert.equal(a.compatibilityCases,12);assert.equal(a.invariantCases,16);
  assert.equal(a.actionCount,9);assert.equal(a.newAtlasCount,0);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2372-2373 audit proves dual-threat retention and prior compatibility',async()=>{
  const {auditBossEffectivePressureMultiThreatPriority}=await import(auditUrl.href);const a=auditBossEffectivePressureMultiThreatPriority();
  assert.equal(a.dualThreatRetentionPassed,true);assert.equal(a.strongestThreatOrderingPassed,true);assert.equal(a.oneThreatCompatibilityPassed,true);assert.equal(a.noThreatCompatibilityPassed,true);assert.equal(a.maxTwoPassed,true);assert.equal(a.existingAtlasReusePassed,true);
});
