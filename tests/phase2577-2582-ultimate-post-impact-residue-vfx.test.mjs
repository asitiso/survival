import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const spellSource=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2577 ultimate post-impact residue atlas covers four heroes x two ultimates',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/ultimate-post-impact-residue-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/ultimate-post-impact-residue-vfx-assets.js');
  const audit=mod.auditUltimatePostImpactResidueVfxAtlas();
  assert.equal(audit.heroCount,4);assert.equal(audit.kindCount,2);assert.equal(audit.itemCount,8);assert.equal(audit.uniqueCellCount,8);assert.equal(audit.passed,true);
});

test('phase 2578 meteor residue is queued at each real meteor impact without changing damage math',()=>{
  assert.match(spellSource,/queueUltimatePostImpactResidue\(meteor\.heroId,'meteorStorm',meteor\.pos,meteor\.radius/);
  assert.match(spellSource,/world\.enemies\.damage\(enemy, meteor\.damage, meteor\.pos, 'ultimate'\)/);
  assert.doesNotMatch(spellSource,/meteorResidueDamage/);
});

test('phase 2579 black hole residue is queued only from the real expired hole position and radius',()=>{
  assert.match(spellSource,/if \(hole\.ttl <= 0\).*queueUltimatePostImpactResidue\(hole\.heroId,'blackHole',hole\.pos,hole\.radius/s);
  assert.match(spellSource,/this\.holes = this\.holes\.filter\(\(h\) => h\.ttl > 0\)/);
  assert.doesNotMatch(spellSource,/blackHoleResidueTick/);
});

test('phase 2580 residue renderer uses real radius ttl and hero-specific atlas cells',()=>{
  assert.match(spellSource,/ultimatePostImpactResidueVfxSprite\(cue\.heroId,cue\.kind\)/);
  assert.match(spellSource,/cue\.radius \* 2\./);
  assert.match(spellSource,/cue\.ttl \/ cue\.maxTtl/);
});

test('phase 2581 residue queue is bounded resettable fail-open and reduced-flash aware',()=>{
  assert.match(spellSource,/ultimatePostImpactResidues\.length > 16/);
  assert.match(spellSource,/this\.ultimatePostImpactResidues = \[\]/);
  assert.match(gameSource,/initializeUltimatePostImpactResidueVfxAtlas/);
  assert.match(spellSource,/reducedFlash \? 0\.30 : 0\.56/);
});

test('phase 2582 ultimate residue audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/ultimate-post-impact-residue-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/ultimate-post-impact-residue-vfx-audit.js'),audit=mod.runUltimatePostImpactResidueVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/ultimatePostImpactResidueVfxPassed/);assert.match(candidateSource,/ultimatePostImpactResidueVfxPassed/);assert.match(candidateSource,/ultimate-post-impact-residue-vfx/);
});
