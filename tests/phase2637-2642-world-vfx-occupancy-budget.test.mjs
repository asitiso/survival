import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
const moduleExists=fs.existsSync(new URL('../dist/game/world-vfx-occupancy-budget.js',import.meta.url));
const mod=moduleExists?await import('../dist/game/world-vfx-occupancy-budget.js'):null;

test('phase 2637 occupancy resolver ranks candidates by priority and enforces large-area count and coverage caps',()=>{
  assert.ok(mod,'world-vfx-occupancy-budget module must exist');if(!mod)return;
  const result=mod.resolveWorldVfxOccupancy({quality:'high',combatPrimary:'normal',viewportArea:1280*720,candidates:[
    {id:'decor',priority:'decorative',area:260000},{id:'info',priority:'informational',area:180000},{id:'tactical',priority:'tactical',area:160000},{id:'small',priority:'tactical',area:40000}
  ]});
  assert.equal(result.allowedIds.includes('tactical'),true);assert.ok(result.coverage<=result.maxCoverage+1e-9);assert.ok(result.allowedIds.length<=result.maxLargeAreaEffects);
});

test('phase 2638 pressured combat states lower occupancy budget before hiding tactical cues',()=>{
  assert.ok(mod);if(!mod)return;
  const normal=mod.worldVfxOccupancyLimits('high','normal');
  const critical=mod.worldVfxOccupancyLimits('high','hero-critical');
  assert.ok(critical.maxCoverage<normal.maxCoverage);assert.ok(critical.maxLargeAreaEffects<=normal.maxLargeAreaEffects);
});

test('phase 2639 lower presentation quality uses stricter occupancy caps with deterministic ordering',()=>{
  assert.ok(mod);if(!mod)return;
  const high=mod.worldVfxOccupancyLimits('high','normal'),low=mod.worldVfxOccupancyLimits('low','normal');
  assert.ok(low.maxCoverage<high.maxCoverage);assert.ok(low.maxLargeAreaEffects<high.maxLargeAreaEffects);
  const candidates=[{id:'a',priority:'tactical',area:80000},{id:'b',priority:'informational',area:80000}];
  assert.deepEqual(mod.resolveWorldVfxOccupancy({quality:'medium',combatPrimary:'normal',viewportArea:1280*720,candidates}).allowedIds,mod.resolveWorldVfxOccupancy({quality:'medium',combatPrimary:'normal',viewportArea:1280*720,candidates}).allowedIds);
});

test('phase 2640 game derives occupancy candidates only from presentation queues and never changes their TTL or gameplay lifetime',()=>{
  assert.match(gameSource,/private currentWorldVfxOccupancyPolicy\(combatPrimary:CombatAttentionPrimary\):WorldVfxOccupancyResult/);
  assert.match(gameSource,/objectiveActivationMaterializationVfx\.length/);
  assert.match(gameSource,/objectiveCompletionCeremonyVfx\.length/);
  assert.match(gameSource,/objectiveFailureDissolveVfx\.length/);
  assert.match(gameSource,/fieldEventLifecycleWorldVfx\.length/);
  assert.match(gameSource,/bossArenaTransitionWorldVfx\.length/);
  assert.match(gameSource,/mapEvolutionAftermathVfx\.length/);
  assert.doesNotMatch(gameSource,/currentWorldVfxOccupancyPolicy[\s\S]{0,1800}ttl\s*[-+]?=/);
});

test('phase 2641 draw layers honor occupancy allow-list while critical projectile telegraphs remain unbudgeted',()=>{
  assert.match(gameSource,/this\.activeWorldVfxOccupancyPolicy=this\.currentWorldVfxOccupancyPolicy\(combatAttention\.primary\)/);
  assert.match(gameSource,/private worldVfxLayerAllowed\(id:WorldVfxOccupancyId\):boolean/);
  assert.match(gameSource,/drawBossArenaTransitionWorldVfx[\s\S]{0,260}worldVfxLayerAllowed\('boss-arena-transition'\)/);
  assert.match(gameSource,/drawMapEvolutionAftermathVfx[\s\S]{0,260}worldVfxLayerAllowed\('map-evolution-aftermath'\)/);
  assert.doesNotMatch(gameSource,/drawProjectileThreatVisibility[\s\S]{0,500}worldVfxLayerAllowed/);
  assert.doesNotMatch(gameSource,/drawDangerTelegraphs[\s\S]{0,500}worldVfxLayerAllowed/);
});

test('phase 2642 occupancy budget audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/world-vfx-occupancy-budget-audit.ts',import.meta.url)),true);
  if(!fs.existsSync(new URL('../dist/game/world-vfx-occupancy-budget-audit.js',import.meta.url)))return;
  const auditMod=await import('../dist/game/world-vfx-occupancy-budget-audit.js'),audit=auditMod.runWorldVfxOccupancyBudgetAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/worldVfxOccupancyBudgetPassed/);assert.match(candidateSource,/worldVfxOccupancyBudgetPassed/);assert.match(candidateSource,/world-vfx-occupancy-budget/);
});
