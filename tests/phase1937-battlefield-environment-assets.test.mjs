import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATTLEFIELD_ENVIRONMENT_ATLAS,
  BATTLEFIELD_ENVIRONMENT_MAP_IDS,
  battlefieldEnvironmentSprite,
  battlefieldEnvironmentIconStyle,
  battlefieldTerrainMaterial,
  auditBattlefieldEnvironmentAtlas,
} from '../dist/game/battlefield-environment-assets.js';

test('Phase 1937 maps all three battlefields across three evolution stages to unique static cells', () => {
  assert.deepEqual(BATTLEFIELD_ENVIRONMENT_MAP_IDS,['ruinedGate','frozenFen','crystalQuarry']);
  const keys=[];
  for (const mapId of BATTLEFIELD_ENVIRONMENT_MAP_IDS) for (const stage of [0,1,2]) {
    const sprite=battlefieldEnvironmentSprite(mapId,stage);
    keys.push(`${sprite.sx}:${sprite.sy}`);
    assert.equal(sprite.animated,false);
    assert.equal(sprite.motionAmplitude,0);
    assert.equal(sprite.textFallbackPreserved,true);
    assert.match(battlefieldEnvironmentIconStyle(mapId,stage),/battlefield-environments\.png/);
  }
  assert.equal(new Set(keys).size,9);
  const audit=auditBattlefieldEnvironmentAtlas();
  assert.equal(audit.passed,true);
  assert.equal(audit.outOfBounds.length,0);
  assert.equal(BATTLEFIELD_ENVIRONMENT_ATLAS.columns,3);
  assert.equal(BATTLEFIELD_ENVIRONMENT_ATLAS.rows,3);
});

test('Phase 1940 terrain material identity is presentation-only and distinct per map',()=>{
  const materials=BATTLEFIELD_ENVIRONMENT_MAP_IDS.map(battlefieldTerrainMaterial);
  assert.equal(new Set(materials.map(x=>x.wallFill)).size,3);
  assert.equal(new Set(materials.map(x=>x.poolCenter)).size,3);
  assert.ok(materials.every(x=>x.presentationOnly===true));
});
