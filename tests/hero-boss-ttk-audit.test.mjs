import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { auditHeroBossTtk, heroBossTtkCheckpoints } from '../dist/game/hero-boss-ttk-audit.js';

test('phase 347 hero boss TTK audit creates four heroes times six real boss cadence points',()=>{
  const points=heroBossTtkCheckpoints();
  assert.equal(points.length,24);
  for(const hero of HERO_PROFILES)assert.equal(points.filter((point)=>point.heroId===hero.id).length,6);
  assert.deepEqual([...new Set(points.map((point)=>point.ordinal))],[0,1,2,3,4,5]);
});

test('phase 348 each boss keeps hero clear-time spread bounded without flattening role identity',()=>{
  const audit=auditHeroBossTtk();
  assert.equal(audit.heroSpreadBounded,true);
  assert.ok(audit.maxHeroTtkSpread>1.10&&audit.maxHeroTtkSpread<=1.30);
  for(const boss of audit.bosses)assert.ok(boss.maxTtk/boss.minTtk<=1.30);
});

test('phase 349 every hero keeps adjacent first-six boss TTK growth readable and clear windows bounded',()=>{
  const audit=auditHeroBossTtk();
  assert.equal(audit.adjacentGrowthBounded,true);
  assert.equal(audit.clearWindowsBounded,true);
  assert.ok(audit.maxAdjacentBossRatio<=1.35);
  assert.ok(audit.checkpoints.every((point)=>point.clearSeconds>=15&&point.clearSeconds<=75));
});

test('phase 350 bosses four through six remain neutral under the existing early boss easing contract',()=>{
  const audit=auditHeroBossTtk();
  assert.equal(audit.lateNeutral,true);
  assert.equal(audit.passed,true);
  assert.ok(audit.checkpoints.filter((point)=>point.ordinal>=3).every((point)=>point.healthMultiplier===1&&point.damageMultiplier===1));
});
