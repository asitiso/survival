import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const ascension=fs.readFileSync(new URL('../src/game/endless/ascension.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2314 draws the ninety second ascension forecast inside the existing status panel without a new hud row',()=>{
  assert.match(game,/drawWorldEvolutionRecall[\s\S]{0,420}drawAscensionTierForecast/);
  assert.match(game,/drawAscensionTierForecast\([\s\S]{0,900}projectAscensionTierForecast/);
  assert.match(game,/projection\.visible/);assert.match(game,/primaryPressureIds\.slice\(0,2\)/);
  assert.match(game,/statusPanel\.x\s*\+\s*statusPanel\.width\s*-\s*128/);
});

test('phase 2315 suppresses forecast and toast helper identities during critical combat attention',()=>{
  assert.match(game,/hideAscensionTierPressureIdentity\(\)[\s\S]{0,300}heroCritical[\s\S]{0,160}coreCritical[\s\S]{0,180}1\.2/);
  assert.match(game,/drawAscensionTierForecast[\s\S]{0,450}hideAscensionTierPressureIdentity\(\)/);
  assert.match(game,/drawAscensionTierPressureToastIcons[\s\S]{0,400}hideAscensionTierPressureIdentity\(\)/);
});

test('phase 2316 tier and mutator toasts reuse the authoritative outcome projection and clear stale state on unrelated toasts',()=>{
  assert.match(game,/effect\.type === 'ascension_tier'[\s\S]{0,180}showAscensionTierEventToast/);
  assert.match(game,/showAscensionTierEventToast[\s\S]{0,650}projectAscensionTierOutcome/);
  assert.match(game,/effect\.type === 'ascension_mutator'[\s\S]{0,300}showAscensionMutatorEventToast/);
  const body=game.match(/private showEventToast\([\s\S]*?\n  }\n\n  private showHeroMeterEventToast/)?.[0]??'';assert.match(body,/eventToastAscensionTierProjection\s*=\s*null/);
});

test('phase 2316 freezes ascension cadence modifiers rng actions and snapshot schema',()=>{
  assert.match(ascension,/elapsedMs < 30 \* 60_000/);assert.match(ascension,/10 \* 60_000/);assert.match(ascension,/Math\.min\(10/);
  assert.match(ascension,/tier \* 0\.1/);assert.match(ascension,/tier \* 0\.07/);assert.match(ascension,/tier \* 0\.06/);assert.match(ascension,/tier \* 0\.05/);assert.match(ascension,/tier \* 0\.04/);
  assert.match(ascension,/MUTATOR_TIERS = new Set\(\[3, 6, 9\]\)/);assert.doesNotMatch(snapshot,/ascensionTierForecast|ascensionTierPressureProjection/);
});

test('phase 2316 catch-up mutator toast reuses the immediately preceding tier projection instead of final catch-up state',()=>{
  const helper=game.match(/private showAscensionMutatorEventToast\([\s\S]*?\n  }\n/)?.[0]??'';
  assert.match(helper,/this\.eventToastAscensionTierProjection\s*\?\?\s*projectAscensionTierOutcome/);
});
