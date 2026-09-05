import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { RUN_TRAITS } from '../dist/game/run-traits.js';
import { masteryTraitId } from '../dist/game/mastery-unlocks.js';
import { heroBuildCombinationCheckpoints, auditHeroBuildCombinations } from '../dist/game/hero-build-combination-audit.js';

test('phase 363 matrix covers 4 heroes x 5 legal traits x 4 archetypes x 3 threats',()=>{
  const points=heroBuildCombinationCheckpoints();
  assert.equal(points.length,240);
  for(const hero of HERO_PROFILES){
    const heroPoints=points.filter((point)=>point.heroId===hero.id);
    assert.equal(heroPoints.length,60);
    const traits=[...new Set(heroPoints.map((point)=>point.traitId))].sort();
    const expected=[...RUN_TRAITS.map((trait)=>trait.id),masteryTraitId(hero.id)].sort();
    assert.deepEqual(traits,expected);
  }
});

test('phase 364 matrix keeps every metric finite and threat pressure monotonic',()=>{
  const points=heroBuildCombinationCheckpoints();
  assert.ok(points.every((point)=>point.offenseIndex>0&&point.survivalIndex>0&&point.coreGuardIndex>0&&point.economyIndex>0&&point.viabilityIndex>0&&point.releaseMargin>0));
  for(const hero of HERO_PROFILES){
    for(const trait of [...RUN_TRAITS.map((entry)=>entry.id),masteryTraitId(hero.id)]){
      for(const archetype of ['burst','cycle','domain','fortress']){
        const group=points.filter((point)=>point.heroId===hero.id&&point.traitId===trait&&point.archetype===archetype).sort((a,b)=>a.threat-b.threat);
        assert.equal(group.length,3);
        assert.ok(group[0].releaseMargin>group[1].releaseMargin&&group[1].releaseMargin>group[2].releaseMargin);
      }
    }
  }
});

test('phase 365 combination audit bounds legal viability without flattening build roles',()=>{
  const audit=auditHeroBuildCombinations();
  assert.equal(audit.passed,true);
  assert.ok(audit.maxViabilitySpread>1.05&&audit.maxViabilitySpread<=1.55);
  assert.ok(audit.minReleaseMargin>=0.62);
  assert.ok(audit.maxReleaseMargin<=1.75);
  assert.ok(audit.archetypeDistinctness>=1.06);
});

test('phase 366 no hero-trait-archetype combination becomes a release trap at threat five',()=>{
  const audit=auditHeroBuildCombinations();
  const threatFive=audit.checkpoints.filter((point)=>point.threat===5);
  assert.equal(threatFive.length,80);
  assert.ok(threatFive.every((point)=>point.releaseMargin>=0.62));
  assert.equal(audit.trapCount,0);
});
