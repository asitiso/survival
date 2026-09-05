import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
const moduleExists=fs.existsSync(new URL('../dist/game/world-vfx-priority-arbitration.js',import.meta.url));
const mod=moduleExists?await import('../dist/game/world-vfx-priority-arbitration.js'):null;

test('phase 2625 world VFX arbitration defines critical tactical informational decorative priority tiers',()=>{
  assert.ok(mod,'world-vfx-priority-arbitration module must exist');
  if(!mod)return;
  assert.deepEqual(mod.WORLD_VFX_PRIORITIES,['critical','tactical','informational','decorative']);
  const normal=mod.worldVfxPriorityPolicy('normal','high');
  assert.equal(normal.alpha.critical,1);assert.equal(normal.alpha.tactical,1);assert.equal(normal.alpha.informational,1);assert.equal(normal.alpha.decorative,1);
});

test('phase 2626 hero core and damage critical states fully suppress decorative world VFX',()=>{
  assert.ok(mod);if(!mod)return;
  for(const primary of ['hero-critical','core-critical','damage-critical']){
    const policy=mod.worldVfxPriorityPolicy(primary,'high');
    assert.equal(policy.alpha.critical,1);
    assert.equal(policy.alpha.decorative,0);
    assert.ok(policy.alpha.tactical>0&&policy.alpha.tactical<1);
    assert.ok(policy.maxLowPriorityLayers<=1);
  }
});

test('phase 2627 boss response heavy damage and countdown preserve tactical cues while attenuating low priority layers',()=>{
  assert.ok(mod);if(!mod)return;
  for(const primary of ['boss-response','damage-heavy','boss-countdown']){
    const policy=mod.worldVfxPriorityPolicy(primary,'high');
    assert.equal(policy.alpha.critical,1);
    assert.ok(policy.alpha.tactical>=0.7);
    assert.ok(policy.alpha.informational>0&&policy.alpha.informational<1);
    assert.ok(policy.alpha.decorative>=0&&policy.alpha.decorative<=0.25);
  }
});

test('phase 2628 live render computes one world VFX priority policy from the existing combat attention owner',()=>{
  assert.match(gameSource,/const worldVfxPriority=worldVfxPriorityPolicy\(combatAttention\.primary,this\.presentation\.quality\)/);
  assert.match(gameSource,/this\.activeWorldVfxPriorityPolicy=worldVfxPriority/);
  assert.match(gameSource,/private worldVfxLayerAlpha\(priority:WorldVfxPriority\):number/);
});

test('phase 2629 low priority aftermath and lifecycle layers consume arbitration alpha while critical projectile and danger paths remain outside suppression',()=>{
  assert.match(gameSource,/drawBattlefieldAtmosphereVfx[\s\S]{0,900}worldVfxLayerAlpha\('decorative'\)/);
  assert.match(gameSource,/drawMapEvolutionAftermathVfx[\s\S]{0,850}worldVfxLayerAlpha\('decorative'\)/);
  assert.match(gameSource,/drawFieldEventLifecycleWorldVfx[\s\S]{0,900}worldVfxLayerAlpha\('informational'\)/);
  assert.doesNotMatch(gameSource,/drawProjectileThreatVisibility[\s\S]{0,500}worldVfxLayerAlpha\('decorative'\)/);
  assert.doesNotMatch(gameSource,/drawDangerTelegraphs[\s\S]{0,500}worldVfxLayerAlpha\('decorative'\)/);
});

test('phase 2630 priority arbitration audit is deterministic release-bound and presentation-only',async()=>{
  const path=new URL('../src/game/world-vfx-priority-arbitration-audit.ts',import.meta.url);
  assert.equal(fs.existsSync(path),true);
  if(!fs.existsSync(new URL('../dist/game/world-vfx-priority-arbitration-audit.js',import.meta.url)))return;
  const auditMod=await import('../dist/game/world-vfx-priority-arbitration-audit.js'),audit=auditMod.runWorldVfxPriorityArbitrationAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/worldVfxPriorityArbitrationPassed/);assert.match(candidateSource,/worldVfxPriorityArbitrationPassed/);assert.match(candidateSource,/world-vfx-priority-arbitration/);
});
