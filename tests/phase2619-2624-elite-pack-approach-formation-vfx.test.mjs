import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2619 elite pack approach formation atlas covers hero core targets x three threat states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/elite-pack-approach-formation-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/elite-pack-approach-formation-vfx-assets.js');
  const audit=mod.auditElitePackApproachFormationVfxAtlas();
  assert.equal(audit.targetCount,2);assert.equal(audit.stateCount,3);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2620 elite rush records only the ids it spawned and dominant target without changing spawn count',()=>{
  assert.match(gameSource,/const count = eliteRushCount\(danger\);[\s\S]{0,700}const eliteRushEnemyIds:number\[\]=\[\]/);
  assert.match(gameSource,/eliteRushEnemyIds\.push\(this\.enemies\.spawnEventEnemy\('elite', danger, target\)\)/);
  assert.match(gameSource,/queueElitePackApproachFormationVfx\(eliteRushEnemyIds,heroTargets>=coreTargets\?'hero':'core'\)/);
  assert.doesNotMatch(gameSource,/elitePackApproachDamageMultiplier|elitePackApproachSpeedMultiplier/);
});

test('phase 2621 elite pack cue derives its live centroid and spread from tracked living elites',()=>{
  assert.match(gameSource,/cue\.enemyIds\.map\(id=>this\.enemies\.enemies\.find\(enemy=>enemy\.alive&&enemy\.id===id\)\)\.filter/);
  assert.match(gameSource,/const centroid=\{x:members\.reduce\(\(sum,enemy\)=>sum\+enemy\.pos\.x,0\)\/members\.length,y:members\.reduce\(\(sum,enemy\)=>sum\+enemy\.pos\.y,0\)\/members\.length\}/);
  assert.match(gameSource,/Math\.max\(\.\.\.members\.map\(enemy=>Math\.hypot\(enemy\.pos\.x-centroid\.x,enemy\.pos\.y-centroid\.y\)\)\)/);
});

test('phase 2622 approach accent follows the live centroid to hero core target vector and formation remains around members',()=>{
  assert.match(gameSource,/const targetPos=cue\.target==='hero'\?this\.hero\.pos:this\.core\.pos/);
  assert.match(gameSource,/Math\.atan2\(dy,dx\)/);
  assert.match(gameSource,/elitePackApproachFormationVfxSprite\(cue\.target,'approach'\)/);
  assert.match(gameSource,/elitePackApproachFormationVfxSprite\(cue\.target,'formation'\)/);
});

test('phase 2623 elite pack cue is short bounded resettable reduced-flash aware and fail-open',()=>{
  assert.match(gameSource,/elitePackApproachFormationVfx\.length>3/);
  assert.match(gameSource,/this\.elitePackApproachFormationVfx=\[\]/);
  assert.match(gameSource,/maxTtl=4\.4/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.22:0\.42/);
  assert.match(gameSource,/if\(!this\.elitePackApproachFormationVfxAtlasReady\|\|!this\.elitePackApproachFormationVfxAtlasImage\)return/);
});

test('phase 2624 elite pack audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/elite-pack-approach-formation-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/elite-pack-approach-formation-vfx-audit.js'),audit=mod.runElitePackApproachFormationVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/elitePackApproachFormationVfxPassed/);assert.match(candidateSource,/elitePackApproachFormationVfxPassed/);assert.match(candidateSource,/elite-pack-approach-formation-vfx/);
});
