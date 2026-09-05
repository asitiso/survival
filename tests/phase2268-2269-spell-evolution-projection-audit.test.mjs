import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/spell-evolution-projection-identity-audit.js',import.meta.url);

test('phase 2268-2269 audits exactly 60 deterministic spell evolution projection samples and frozen contracts',async()=>{
  assert.equal(fs.existsSync(url),true,'spell evolution projection audit module must exist');
  const {auditSpellEvolutionProjectionIdentityAssets}=await import(url.href);const a=auditSpellEvolutionProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.modifierIdentityCount,8);assert.equal(a.tierDeltaIdentityCount,2);
  assert.equal(a.modifierCoverage,1);assert.equal(a.tierDeltaCoverage,1);assert.equal(a.modifierUniqueCellCount,8);assert.equal(a.tierDeltaUniqueCellCount,2);
  assert.equal(a.heroCount,4);assert.equal(a.spellCount,6);assert.deepEqual(a.transitionLevels,[4,9]);assert.equal(a.evolutionNameCombinationCount,48);assert.equal(a.actionCount,9);
  assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
