import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const modifierUrl=new URL('../dist/game/hero-ascension-modifier-identity-assets.js',import.meta.url);
const directionUrl=new URL('../dist/game/hero-ascension-build-direction-identity-assets.js',import.meta.url);

test('phase 2247 provides eight static hero ascension modifier identities',async()=>{
  assert.equal(fs.existsSync(modifierUrl),true,'hero ascension modifier identity module must exist');
  const m=await import(modifierUrl.href);
  assert.deepEqual(m.HERO_ASCENSION_MODIFIER_IDENTITY_IDS,['spell-power','cooldown','area','move-speed','hero-guard','core-guard','fusion-power','boss-damage']);
  assert.deepEqual(m.HERO_ASCENSION_MODIFIER_IDENTITY_ATLAS,{src:'./assets/ui/hero-ascension-modifier-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  for(const id of m.HERO_ASCENSION_MODIFIER_IDENTITY_IDS){const icon=m.heroAscensionModifierIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditHeroAscensionModifierIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,8);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});

test('phase 2248 provides three static ascension build-direction identities',async()=>{
  assert.equal(fs.existsSync(directionUrl),true,'hero ascension direction identity module must exist');
  const m=await import(directionUrl.href);
  assert.deepEqual(m.HERO_ASCENSION_BUILD_DIRECTION_IDS,['expand','hybrid','focus']);
  assert.deepEqual(m.HERO_ASCENSION_BUILD_DIRECTION_ATLAS,{src:'./assets/ui/hero-ascension-build-direction-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96});
  assert.equal(m.heroAscensionBuildDirectionIdentityIcon('expand').label,'확장');
  assert.equal(m.heroAscensionBuildDirectionIdentityIcon('hybrid').label,'혼합');
  assert.equal(m.heroAscensionBuildDirectionIdentityIcon('focus').label,'집중');
  const a=m.auditHeroAscensionBuildDirectionIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,3);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
