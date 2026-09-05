import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLobbyResultIdentityAssets } from '../dist/game/lobby-result-identity-asset-audit.js';

test('phase 1885 lobby/result identity audit is presentation-only and deterministic',()=>{
  const audit=auditLobbyResultIdentityAssets();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,32);
  assert.equal(audit.heroCoverage,1);
  assert.equal(audit.metaCoverage,1);
  assert.equal(audit.resultCoverage,1);
  assert.equal(audit.maxMotionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.purchaseLogicMutation,false);
  assert.equal(audit.resultLogicMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.actionCount,9);
});
