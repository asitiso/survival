import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2329 Game loads adaptation effect atlas and keeps existing nemesis adaptation identity recall',()=>{
  assert.match(source,/NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS/);assert.match(source,/nemesisAdaptationEffectIdentityIcon/);assert.match(source,/initializeNemesisAdaptationEffectIdentityAtlas\(\)/);
  assert.match(source,/nemesisAdaptationEffectIdentityAtlasImage/);assert.match(source,/nemesisAdaptationEffectIdentityAtlasReady/);
  assert.match(source,/drawNemesisAdaptationRecall\(ctx,boss,3\)/);assert.match(source,/nemesisAdaptationIdentityIcon\(adaptation\.kind\)/,'existing adaptation icons must remain');
});

test('phase 2330 boss recall draws at most two effective modifier helpers below existing adaptation icons',()=>{
  assert.match(source,/projectNemesisAdaptationEffects\(adaptations\)/);assert.match(source,/projection\.primaryEffects\.slice\(0,2\)/);
  assert.match(source,/drawNemesisAdaptationEffectRecall\(ctx/);assert.match(source,/nemesisAdaptationEffectIdentityIcon\(effect\.effectId\)/);
  assert.match(source,/y\+size\+2/,'effect helpers should sit below existing adaptation recall rather than creating a HUD row');
});

test('phase 2330 helper effects yield to critical combat attention without removing existing adaptation recall',()=>{
  assert.match(source,/hideNemesisAdaptationEffectIdentity\(boss/);assert.match(source,/heroCritical\|\|coreCritical\|\|bossSpecialTimer<=1\.2/);
  assert.match(source,/if\(!this\.hideNemesisAdaptationEffectIdentity\(boss\)\)/);
  assert.match(source,/adaptations\.forEach/,'existing recall path must still draw adaptations');
});

test('phase 2331 nemesis learning toast preserves frozen prefix while appending authoritative effective modifier hint and helpers',()=>{
  assert.match(source,/nemesisAdaptationLearningToastLabel/);
  assert.match(source,/nemesisAdaptationLearningToastLabel\(effect\.adaptations\.length,projection\)/);assert.match(source,/drawNemesisAdaptationEffectToastIcons\(ctx/);
  assert.match(source,/eventToastNemesisAdaptations/);assert.match(source,/projectNemesisAdaptationEffects\(this\.eventToastNemesisAdaptations\)/);
});
