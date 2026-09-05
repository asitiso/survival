import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/action-cue-clarity-audit.js',import.meta.url);

test('phase 1495 deterministic action cue clarity audit locks single-focus invariants',async()=>{
  assert.equal(fs.existsSync(moduleUrl),true,'action cue clarity audit module must exist');
  const { auditActionCueClarity }=await import(moduleUrl.href);
  const audit=auditActionCueClarity();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.length,25);
  assert.equal(audit.maxAnimatedOuterCues,1);
  assert.equal(audit.queuedDuplicateTextCount,0);
  assert.equal(audit.staleReadyReplayCount,0);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.equal(audit.reachableActionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
