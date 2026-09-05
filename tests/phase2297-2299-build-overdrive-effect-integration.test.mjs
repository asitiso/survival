import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/build-overdrive-effect-projection.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const overdrive=fs.readFileSync(new URL('../src/game/endless/build-overdrive.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2297 derives archetype effect projection from authoritative overdriveModifiers values',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'build overdrive effect projection module must exist');
  const m=await import(projectionUrl.href);
  const state={charge:0,activeUntilMs:12000,activations:1};
  const burst=m.projectBuildOverdriveEffects(state,'burst',1000);
  assert.equal(burst.active,true);assert.equal(burst.archetype,'burst');assert.deepEqual(burst.effects.map(v=>v.id),['spellPower','bossDamage','fusionPower']);
  assert.deepEqual(burst.effects.map(v=>v.value),[1.2,1.18,1.08]);
  assert.equal(m.buildOverdriveEffectProjectionHint(burst),'마법 화력 +20% · 보스 피해 +18% · 융합 위력 +8%');
  const inactive=m.projectBuildOverdriveEffects({charge:80,activeUntilMs:0,activations:0},'burst',1000);assert.equal(inactive.active,false);assert.deepEqual(inactive.effects,[]);
});

test('phase 2297 maps all four archetypes to their actual frozen modifier profiles',async()=>{
  const m=await import(projectionUrl.href);const state={charge:0,activeUntilMs:12000,activations:1};
  const cycle=m.projectBuildOverdriveEffects(state,'cycle',1000);assert.deepEqual(cycle.effects.map(v=>[v.id,v.value]),[['cooldown',.8],['fusionPower',1.12]]);
  const domain=m.projectBuildOverdriveEffects(state,'domain',1000);assert.deepEqual(domain.effects.map(v=>[v.id,v.value]),[['area',1.22],['spellPower',1.1]]);
  const fortress=m.projectBuildOverdriveEffects(state,'fortress',1000);assert.deepEqual(fortress.effects.map(v=>[v.id,v.value]),[['coreGuard',.82],['heroGuard',.84],['spellPower',1.06]]);
});

test('phase 2297 activation toast label stays compact while preserving the top two real effects',async()=>{
  const m=await import(projectionUrl.href);const state={charge:0,activeUntilMs:12000,activations:1};const p=m.projectBuildOverdriveEffects(state,'burst',1000);
  const label=m.buildOverdriveActivationToastLabel('폭발',p);assert.equal(label,'OD · 폭발 · 화력+20% · 보스+18%');assert.ok(label.length<=30);
});

test('phase 2298 active build identity HUD adds at most two effect helpers beside the existing readiness slot',()=>{
  assert.match(game,/drawBuildOverdriveEffectRecall\(/);
  assert.match(game,/projectBuildOverdriveEffects\(state,archetype,elapsedMs\)/);
  assert.match(game,/projection\.effects\.slice\(0,2\)/);
  assert.match(game,/drawBuildOverdriveRecall[\s\S]{0,700}drawBuildOverdriveEffectRecall/);
});

test('phase 2299 activation toast uses the same projection and clears stale effect state on unrelated event toasts',()=>{
  assert.match(game,/overdrive\.activations > previousOverdriveActivations[\s\S]{0,600}showBuildOverdriveActivationToast/);
  assert.match(game,/showBuildOverdriveActivationToast[\s\S]{0,500}projectBuildOverdriveEffects/);
  assert.match(game,/eventToastBuildOverdriveProjection\s*=\s*null/);
  const body=game.match(/private showEventToast\([\s\S]*?\n  }\n\n  private showHeroMeterEventToast/)?.[0]??'';
  assert.match(body,/this\.eventToastBuildOverdriveProjection\s*=\s*null/);
});

test('phase 2299 is presentation-only and freezes overdrive charge, duration, modifiers, actions and snapshot schema',()=>{
  assert.match(overdrive,/spell_cast'\) return event\.fusion \? 5 : 2/);assert.match(overdrive,/enemy_killed'\) return event\.elite \? 3 : 1/);assert.match(overdrive,/boss_defeated'\) return 20/);assert.match(overdrive,/now \+ 12_000/);
  assert.match(overdrive,/spellPowerMultiplier=1\.2/);assert.match(overdrive,/bossDamageMultiplier=1\.18/);assert.match(overdrive,/fusionPowerMultiplier=1\.08/);assert.match(overdrive,/cooldownMultiplier=\.8/);assert.match(overdrive,/areaMultiplier=1\.22/);assert.match(overdrive,/coreDamageTakenMultiplier=\.82/);
  assert.doesNotMatch(snapshot,/buildOverdriveEffectProjection|overdriveEffectIdentity/);
});
