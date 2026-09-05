import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RUN_CONTRACT_RECALL_IDS,
  activeRunContractBoonRecall,
  auditRunContractBoonRecallAtlas,
  runContractRecallIcon,
} from '../dist/game/run-contract-boon-recall-assets.js';

test('phase 2045 reuses all five contract cells as static accept outcome and boon recall identities',()=>{
  assert.deepEqual([...RUN_CONTRACT_RECALL_IDS],['slayer','warden','arcane','hunter','survivor']);
  const atlas=auditRunContractBoonRecallAtlas();
  assert.equal(atlas.contractCount,5); assert.equal(atlas.coverage,1); assert.equal(atlas.uniqueCellCount,5); assert.deepEqual(atlas.outOfBounds,[]); assert.equal(atlas.passed,true);
  for(const id of RUN_CONTRACT_RECALL_IDS){
    const icon=runContractRecallIcon(id);
    assert.equal(icon.atlasSrc,'./assets/ui/deep-run-decision-icons.png');
    assert.equal(icon.acceptToastIdentitySupported,true); assert.equal(icon.outcomeToastIdentitySupported,true); assert.equal(icon.activeBoonIdentitySupported,true);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0); assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
  }
  const recall=activeRunContractBoonRecall([{family:'hunter',expiresAtMs:190_000}],100_001);
  assert.equal(recall?.family,'hunter'); assert.equal(recall?.remainingSeconds,90); assert.equal(activeRunContractBoonRecall([{family:'hunter',expiresAtMs:190_000}],190_000),null);
});
