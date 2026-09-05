import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/mythic-tactic-attack-link-projection-audit.js',import.meta.url);

test('phase 2388-2389 tactic-link projection audit contains exactly sixty-four deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'tactic-link projection audit module must exist');
  const {auditMythicTacticAttackLinkProjection}=await import(auditUrl.href);const a=auditMythicTacticAttackLinkProjection();
  assert.equal(a.samples.length,64);assert.equal(a.channelCases,30);assert.equal(a.topTwoCases,6);assert.equal(a.lifecycleCases,24);assert.equal(a.invariantCases,4);
  assert.equal(a.actionCount,9);assert.equal(a.newAtlasCount,0);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2388-2389 audit proves source accuracy top-two ordering lifecycle fail-closed and atlas reuse',async()=>{
  const {auditMythicTacticAttackLinkProjection}=await import(auditUrl.href);const a=auditMythicTacticAttackLinkProjection();
  assert.equal(a.sourceAccuracyPassed,true);assert.equal(a.topTwoPassed,true);assert.equal(a.lifecyclePassed,true);assert.equal(a.existingAtlasReusePassed,true);
});
