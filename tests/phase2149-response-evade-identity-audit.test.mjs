import test from 'node:test'; import assert from 'node:assert/strict';
import { auditResponseEvadeIdentityAssets } from '../dist/game/response-evade-identity-asset-audit.js';

test('phase 2149 audits exactly 60 deterministic response and perfect evade identity samples',()=>{
  const a=auditResponseEvadeIdentityAssets();
  assert.equal(a.samples.length,60); assert.equal(a.responseIdentityCount,6); assert.equal(a.evadeIdentityCount,5);
  assert.equal(a.responseCoverage,1); assert.equal(a.evadeCoverage,1); assert.equal(a.responseUniqueCellCount,6); assert.equal(a.evadeUniqueCellCount,5);
  assert.equal(a.acknowledgementOnlyCoverage,1); assert.equal(a.successClaimRate,0); assert.equal(a.flowIdentityCoverage,1); assert.equal(a.finisherFinalFormReuseCoverage,1);
  assert.equal(a.iconMotionAmplitude,0); assert.equal(a.gameplayContractMutation,false); assert.equal(a.actionCount,9); assert.equal(a.snapshotSchemaMutation,false);
  assert.deepEqual(a.issues,[]); assert.equal(a.passed,true);
});
