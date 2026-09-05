import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/boss-effective-pressure-semantic-audit.js',import.meta.url);

test('phase 2356-2357 semantic audit contains exactly sixty-four deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'semantic audit module must exist');
  const {auditBossEffectivePressureSemantics}=await import(auditUrl.href);const a=auditBossEffectivePressureSemantics();
  assert.equal(a.samples.length,64);assert.equal(a.channelCount,4);assert.equal(a.threatCases,16);assert.equal(a.opportunityCases,16);assert.equal(a.neutralCases,16);
  assert.equal(a.actionCount,9);assert.equal(a.newAtlasCount,0);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2356-2357 semantic audit proves inverse-sign channels are interpreted correctly and text remains primary',async()=>{
  const {auditBossEffectivePressureSemantics}=await import(auditUrl.href);const a=auditBossEffectivePressureSemantics();
  assert.equal(a.semanticCoverageComplete,true);assert.equal(a.signInversionCoverageComplete,true);assert.equal(a.textSemanticLabelPassed,true);assert.equal(a.existingAtlasReusePassed,true);
});
