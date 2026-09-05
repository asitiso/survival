import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/hero-ascension-projection-identity-audit.js',import.meta.url);

test('phase 2253 audits exactly 60 deterministic hero ascension projection samples',async()=>{
  assert.equal(fs.existsSync(url),true,'hero ascension projection audit module must exist');
  const {auditHeroAscensionProjectionIdentityAssets}=await import(url.href);const a=auditHeroAscensionProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.modifierIdentityCount,8);assert.equal(a.directionIdentityCount,3);
  assert.equal(a.modifierCoverage,1);assert.equal(a.directionCoverage,1);assert.equal(a.modifierUniqueCellCount,8);assert.equal(a.directionUniqueCellCount,3);
  assert.deepEqual(a.milestones,[35,50,65]);assert.equal(a.maxSelections,3);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);
  assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
