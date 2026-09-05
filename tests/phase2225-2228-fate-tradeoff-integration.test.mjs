import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const select=fs.readFileSync(new URL('../src/ui/fate-select.ts',import.meta.url),'utf8');
const tradeoff=fs.readFileSync(new URL('../src/game/fate-tradeoff-identity.ts',import.meta.url),'utf8');
const paths=fs.readFileSync(new URL('../src/game/fate-paths.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2225-2226 fate cards use actual before-after composed modifiers and show one benefit plus one cost',()=>{
  assert.match(select,/currentChoices:\s*readonly FatePathId\[\]/);
  assert.match(select,/fateChoiceImpact\(currentChoices,path\.id\)/);
  assert.match(select,/fate-benefit-vector-icon/);
  assert.match(select,/fate-cost-vector-icon/);
  assert.match(tradeoff,/composeFateModifiers\(currentPaths\)/);
  assert.match(tradeoff,/composeFateModifiers\(\[\.\.\.currentPaths,candidate\]\)/);
});

test('phase 2227 selected fate toast carries actual cumulative impact helpers',()=>{
  assert.match(game,/eventToastFateImpact/);
  assert.match(game,/fateChoiceImpact\(before,id\)/);
  assert.match(game,/drawFateTradeoffToastIcons/);
});

test('phase 2228 fate recall shows strongest cumulative benefit and cost without a new row',()=>{
  assert.match(game,/drawFateCumulativeImpactRecall/);
  assert.match(game,/fateCumulativeImpact\(ids\)/);
  assert.match(game,/if \(row\.fateIds\)[\s\S]*drawFatePathRecall[\s\S]*drawFateCumulativeImpactRecall/);
  assert.match(game,/hideFateImpactHelperIdentity/);
  assert.match(game,/bossSpecialTimer\s*<=\s*1\.2/);
});

test('phase 2225-2228 keeps fate gameplay and snapshot schema frozen',()=>{
  assert.match(paths,/spawnPressureMultiplier:\s*1\.14/);
  assert.match(paths,/eliteIntervalMultiplier:\s*0\.90/);
  assert.match(paths,/xpMultiplier:\s*1\.18/);
  assert.match(paths,/bossVariantBonus:\s*0\.25/);
  assert.match(paths,/enemySpeedMultiplier:\s*1\.08/);
  assert.match(paths,/goldMultiplier:\s*1\.22/);
  assert.match(paths,/shopTokenMultiplier:\s*1\.18/);
  assert.match(paths,/coreDamageTakenMultiplier:\s*0\.82/);
  assert.match(paths,/objectiveRewardMultiplier:\s*1\.06/);
  assert.match(paths,/Math\.min\(1\.45/);assert.match(paths,/Math\.max\(0\.72/);assert.match(paths,/Math\.min\(1\.35/);
  assert.doesNotMatch(snapshot,/fateBenefitVector|fateCostVector|eventToastFateImpact/);
});
