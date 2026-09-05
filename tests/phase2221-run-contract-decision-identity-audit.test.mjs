import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/run-contract-decision-identity-audit.js',import.meta.url);
test('phase 2221 audits exactly 60 deterministic run contract decision identity samples',async()=>{
  assert.equal(fs.existsSync(url),true,'run contract decision audit module must exist');
  const {auditRunContractDecisionIdentityAssets}=await import(url.href);const a=auditRunContractDecisionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.requirementIdentityCount,5);assert.equal(a.boonIdentityCount,5);assert.equal(a.requirementCoverage,1);assert.equal(a.boonCoverage,1);assert.equal(a.requirementUniqueCellCount,5);assert.equal(a.boonUniqueCellCount,5);
  assert.deepEqual(a.offerScheduleMinutes,[4,9,14,19,26]);assert.deepEqual(a.contractDurations,[45,30,40,60,20]);assert.equal(a.wardenAllowedCoreLossRatio,.2);assert.equal(a.survivorHeroDamageFailsImmediately,true);assert.equal(a.boonDurationSeconds,90);assert.deepEqual(a.paceThresholds,{onTrackMinDelta:-.08,catchUpMinDelta:-.25});assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayContractMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
