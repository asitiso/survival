import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const evolution=fs.readFileSync(new URL('../src/game/map-evolution.ts',import.meta.url),'utf8');
const layouts=fs.readFileSync(new URL('../src/game/map-layouts.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2305 overlays mechanic and stage identity inside the existing battlefield thumbnail without a new hud row',()=>{
  assert.match(game,/drawBattlefieldIdentityHud[\s\S]{0,260}drawBattlefieldMechanicRecall/);
  assert.match(game,/drawBattlefieldMechanicRecall\([\s\S]{0,500}projectBattlefieldMechanics/);
  assert.match(game,/battlefieldMechanicIdentityIcon\(projection\.dominantMechanic\)/);
  assert.match(game,/battlefieldMechanicIdentityIcon\(projection\.stageIdentity\)/);
});

test('phase 2306 map evolution toast uses actual projection delta and clears stale mechanic state on unrelated toasts',()=>{
  assert.match(game,/updateEvolution\(this\.elapsed\)[\s\S]{0,260}showBattlefieldEvolutionToast/);
  assert.match(game,/showBattlefieldEvolutionToast[\s\S]{0,650}projectBattlefieldEvolutionImpact/);
  assert.match(game,/battlefieldEvolutionImpactHint/);
  assert.match(game,/eventToastBattlefieldEvolutionProjection\s*=\s*null/);
  const body=game.match(/private showEventToast\([\s\S]*?\n  }\n\n  private showHeroMeterEventToast/)?.[0]??'';assert.match(body,/this\.eventToastBattlefieldEvolutionProjection\s*=\s*null/);
});

test('phase 2307 freezes map timing geometry mechanics actions and snapshot schema',()=>{
  assert.match(evolution,/if \(t >= 960\) return 2/);assert.match(evolution,/if \(t >= 480\) return 1/);
  assert.match(layouts,/slowFactor: 0\.58/);assert.match(layouts,/threshold: 5, blastRadius: 175, blastDamage: 205/);
  assert.doesNotMatch(snapshot,/battlefieldMechanicProjection|battlefieldMechanicIdentity|evolutionImpact/);
});
