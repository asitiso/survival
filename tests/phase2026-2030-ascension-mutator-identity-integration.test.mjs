import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDefaultAscensionState, advanceAscension, getAscensionTier } from '../dist/game/endless/ascension.js';
import { ascensionMutatorRuntimeModifiers } from '../dist/game/endless/ascension-mutator-runtime.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2026-2030 Game loads mutator atlas asynchronously and connects toast plus max-three active recall without replacing text',()=>{
  assert.match(source,/ASCENSION_MUTATOR_IDENTITY_ATLAS/);
  assert.match(source,/ascensionMutatorIdentityAtlasImage/);
  assert.match(source,/ascensionMutatorIdentityAtlasReady/);
  assert.match(source,/initializeAscensionMutatorIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*ASCENSION_MUTATOR_IDENTITY_ATLAS\.src/);
  assert.match(source,/showEventToast\(`승천 변이 · \$\{this\.endlessMutatorName\(effect\.mutator\)\}`[\s\S]*effect\.mutator/);
  assert.match(source,/drawAscensionMutatorToastIcon\(ctx\)/);
  assert.match(source,/drawAscensionMutatorRecall\(ctx,this\.endlessState\.ascension\.mutators,[^,]+,[^,]+,[^)]+\)/);
  assert.match(source,/visible=ids\.slice\(-Math\.min\(3,maxIcons\)\)/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2026-2030 tier milestones deterministic uniqueness and runtime mutator numbers stay unchanged',()=>{
  assert.equal(getAscensionTier(49*60_000+59_999),2); assert.equal(getAscensionTier(50*60_000),3);
  assert.equal(getAscensionTier(80*60_000),6); assert.equal(getAscensionTier(110*60_000),9); assert.equal(getAscensionTier(999*60_000),10);
  const a=advanceAscension(110*60_000,createDefaultAscensionState(),{seed:77,cursor:0});
  const b=advanceAscension(110*60_000,createDefaultAscensionState(),{seed:77,cursor:0});
  assert.deepEqual(a.state,b.state); assert.equal(a.state.mutators.length,3); assert.equal(new Set(a.state.mutators).size,3);
  assert.deepEqual(a.effects.filter(e=>e.type==='ascension_mutator').map(e=>e.mutator),a.state.mutators);
  assert.deepEqual(ascensionMutatorRuntimeModifiers(['accelerated_projectiles']),{projectileSpeedMultiplier:1.16,eliteHealthMultiplier:1,shopIntervalMultiplier:1,volatileDeath:{enabled:false,radius:0,damage:0}});
  assert.deepEqual(ascensionMutatorRuntimeModifiers(['reinforced_elites']),{projectileSpeedMultiplier:1,eliteHealthMultiplier:1.28,shopIntervalMultiplier:1,volatileDeath:{enabled:false,radius:0,damage:0}});
  assert.deepEqual(ascensionMutatorRuntimeModifiers(['scarce_shop']),{projectileSpeedMultiplier:1,eliteHealthMultiplier:1,shopIntervalMultiplier:1.18,volatileDeath:{enabled:false,radius:0,damage:0}});
  assert.deepEqual(ascensionMutatorRuntimeModifiers(['volatile_death']),{projectileSpeedMultiplier:1,eliteHealthMultiplier:1,shopIntervalMultiplier:1,volatileDeath:{enabled:true,radius:108,damage:64}});
});
