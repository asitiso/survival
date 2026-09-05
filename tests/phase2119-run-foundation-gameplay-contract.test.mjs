import test from 'node:test';
import assert from 'node:assert/strict';
import { runTraitBonuses } from '../dist/game/run-traits.js';
import { relicModifiers } from '../dist/game/relics.js';
import { createDefaultHeroAscensionState, advanceHeroAscension, selectHeroAscension, heroAscensionModifiers } from '../dist/game/endless/hero-ascension.js';

test('phase 2119 preserves run trait, relic, and ascension gameplay contracts',()=>{
  assert.deepEqual(runTraitBonuses('destruction'),{maxHpMultiplier:.92,spellPowerMultiplier:1.12,cooldownMultiplier:1,moveSpeedMultiplier:1,goldMultiplier:1,heroDamageTakenMultiplier:1,coreDamageTakenMultiplier:1});
  const relic=relicModifiers('winter-heart','seria'); assert.equal(relic.areaMultiplier,1.25); assert.equal(relic.cooldownMultiplier,.92);
  let state=createDefaultHeroAscensionState();
  assert.equal(advanceHeroAscension('arkan',34*60_000,state).offered,false);
  const offered=advanceHeroAscension('arkan',35*60_000,state); assert.equal(offered.offered,true); assert.equal(offered.state.pendingOffer?.options.length,3);
  state=selectHeroAscension(offered.state,offered.state.pendingOffer.options[0].optionId); assert.equal(state.selected.length,1); assert.equal(state.nextMilestoneIndex,1);
  const mods=heroAscensionModifiers(['wildfire-doctrine','solar-collapse','phoenix-cycle']); assert.equal(mods.spellPowerMultiplier,1.1); assert.equal(mods.areaMultiplier,1.09); assert.equal(mods.cooldownMultiplier,.92); assert.equal(mods.fusionPowerMultiplier,1.11); assert.equal(mods.bossDamageMultiplier,1.1);
});
