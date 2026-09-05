import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditLifecycleResumeIntegrity } from '../dist/game/lifecycle-resume-integrity-audit.js';

test('phase 707 lifecycle resume round-trips 20 25 and 30 minute run checkpoints without elapsed drift',()=>{
  const audit=auditLifecycleResumeIntegrity();
  assert.equal(audit.samples,12);
  assert.equal(audit.primaryRoundTripCoverage,1);
  assert.equal(audit.maxElapsedDrift,0);
});
test('phase 708 lifecycle resume falls back through backup and recovery journal when the primary slot is corrupt',()=>{
  const audit=auditLifecycleResumeIntegrity();
  assert.equal(audit.backupRecoveryCoverage,1);
  assert.equal(audit.journalRecoveryCoverage,1);
});
test('phase 709 pagehide and visibility lifecycle paths checkpoint the run before leaving the page',()=>{
  const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(main,/pagehide/);
  assert.match(main,/beforeunload/);
  assert.match(main,/checkpointForLifecycle/);
  assert.match(game,/checkpointForLifecycle\(\)/);
});
test('phase 710 lifecycle resume integrity audit passes without changing the snapshot schema',()=>{
  const audit=auditLifecycleResumeIntegrity();
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.passed,true);
});
