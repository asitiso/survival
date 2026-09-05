import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBossArenaMutation,bossArenaMutationModifiers } from '../dist/game/endless/boss-arena-mutations.js';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const close=(a,b)=>Math.abs(a-b)<1e-9;

test('phase 2080-2083 Game keeps boss arena mutation identity visible for normal and mythic encounters without a new HUD row',()=>{
  assert.match(source,/BOSS_ARENA_MUTATION_IDENTITY_ATLAS/);
  assert.match(source,/initializeBossArenaMutationIdentityAtlas/);
  assert.match(source,/eventToastBossArenaMutation/);
  assert.match(source,/drawBossArenaMutationToastIcon\(ctx/);
  assert.match(source,/drawBossArenaMutationRecall\(ctx/);
  assert.match(source,/createBossArenaMutation\(/);
  assert.match(source,/mythic\.active[\s\S]{0,420}mutation\?\.kind/);
});

test('phase 2080-2083 boss arena mutation tier, deterministic kind, intensity and modifiers remain unchanged',()=>{
  assert.equal(createBossArenaMutation('inferno',1,2),null);
  const a=createBossArenaMutation('inferno',4,7);const b=createBossArenaMutation('inferno',4,7);assert.deepEqual(a,b);assert.ok(a);
  assert.equal(a.tier,4);assert.ok(close(a.intensity,.57));
  assert.equal(createBossArenaMutation('inferno',99,7).tier,10);assert.equal(createBossArenaMutation('inferno',-4,7),null);
  const t10=createBossArenaMutation('timeEater',10,11);assert.ok(t10);assert.ok(close(t10.intensity,.9));
  const m=bossArenaMutationModifiers({...a,kind:'rotating_front'});assert.ok(close(m.cadenceMultiplier,1-.57*.22));assert.ok(close(m.telegraphMultiplier,1-.57*.12));assert.ok(close(m.damageMultiplier,1+.57*.12));assert.equal(m.maxHazards,6);assert.ok(close(m.orbitOffsetRadians,.4+.57*.7));
  const high=bossArenaMutationModifiers({...t10,kind:'shrinking_sanctum'});assert.equal(high.maxHazards,8);assert.ok(close(high.radiusMultiplier,1.08-.9*.22));assert.ok(close(high.telegraphMultiplier,1.08-.9*.1));
});
