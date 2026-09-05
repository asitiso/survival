import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { deriveRelicResonance } from '../dist/game/endless/relic-resonance.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2052-2054 Game adds resonance tier toast and build-strip badge with stale-state and text fallback guards',()=>{
  assert.match(source,/eventToastRelicResonance/);
  assert.match(source,/lastRelicResonanceTier/);
  assert.match(source,/updateRelicResonanceRecall\(\)/);
  assert.match(source,/relicResonanceTierBadge\(current\.tier\)[\s\S]*공명 \$\{badge\.label\}/);
  assert.match(source,/drawRelicResonanceToastIcon\(ctx\)/);
  assert.match(source,/drawRelicResonanceTierBadge\(ctx/);
  assert.match(source,/drawBuildIdentityStrip[\s\S]*currentRelicResonance\(\)/);
  assert.match(source,/!this\.activeRelic[\s\S]*lastRelicResonanceTier = 0/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2052-2054 resonance score thresholds modifiers and action count remain unchanged',()=>{
  const tier0=deriveRelicResonance({heroId:'arkan',relicId:'winter-heart',fusionCount:1,fateChoiceCount:1,ascensionSelections:0});
  const tier1=deriveRelicResonance({heroId:'arkan',relicId:'winter-heart',fusionCount:2,fateChoiceCount:0,ascensionSelections:0});
  const tier2=deriveRelicResonance({heroId:'arkan',relicId:'winter-heart',fusionCount:2,fateChoiceCount:3,ascensionSelections:0});
  const tier3=deriveRelicResonance({heroId:'arkan',relicId:'winter-heart',fusionCount:2,fateChoiceCount:3,ascensionSelections:3});
  const capped=deriveRelicResonance({heroId:'seria',relicId:'winter-heart',fusionCount:99,fateChoiceCount:99,ascensionSelections:99});
  assert.deepEqual([tier0.tier,tier1.tier,tier2.tier,tier3.tier],[0,1,2,3]); assert.equal(capped.score,16); assert.equal(capped.tier,3);
  assert.deepEqual(tier1.modifiers,{spellPowerMultiplier:1.05,cooldownMultiplier:0.97,areaMultiplier:1.035,goldMultiplier:1.04,coreDamageTakenMultiplier:0.975});
  assert.deepEqual(tier2.modifiers,{spellPowerMultiplier:1.1,cooldownMultiplier:0.94,areaMultiplier:1.07,goldMultiplier:1.08,coreDamageTakenMultiplier:0.95});
  assert.deepEqual(tier3.modifiers,{spellPowerMultiplier:1.15,cooldownMultiplier:0.91,areaMultiplier:1.105,goldMultiplier:1.12,coreDamageTakenMultiplier:0.925});
  assert.equal(ACTION_BUTTONS.length,9);
});
