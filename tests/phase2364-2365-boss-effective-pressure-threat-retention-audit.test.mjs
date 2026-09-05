import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/boss-effective-pressure-threat-retention-audit.js',import.meta.url);

test('phase 2364-2365 threat-retention audit contains exactly sixty-four deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'threat-retention audit module must exist');
  const {auditBossEffectivePressureThreatRetention}=await import(auditUrl.href);const a=auditBossEffectivePressureThreatRetention();
  assert.equal(a.samples.length,64);assert.equal(a.mixedCases,24);assert.equal(a.threatOnlyCases,12);assert.equal(a.opportunityOnlyCases,12);assert.equal(a.invariantCases,16);
  assert.equal(a.actionCount,9);assert.equal(a.newAtlasCount,0);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2364-2365 audit proves threat preservation, max-two, compatibility, and deterministic tie order',async()=>{
  const {auditBossEffectivePressureThreatRetention}=await import(auditUrl.href);const a=auditBossEffectivePressureThreatRetention();
  assert.equal(a.mixedThreatRetentionPassed,true);assert.equal(a.maxTwoPassed,true);assert.equal(a.noThreatCompatibilityPassed,true);assert.equal(a.stableTieOrderPassed,true);assert.equal(a.existingAtlasReusePassed,true);
});
