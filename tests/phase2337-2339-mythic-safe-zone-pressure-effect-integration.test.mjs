import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2337 Game loads the SAFE pressure effect atlas and reuses the existing SAFE zone seam',()=>{
  assert.match(source,/MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS/);assert.match(source,/mythicSafeZonePressureEffectIdentityIcon/);assert.match(source,/initializeMythicSafeZonePressureEffectIdentityAtlas\(\)/);
  assert.match(source,/mythicSafeZonePressureEffectIdentityAtlasImage/);assert.match(source,/mythicSafeZonePressureEffectIdentityAtlasReady/);
  assert.match(source,/safeZoneLabelAnchor/);assert.match(source,/drawMythicSafeZoneLifecycleIcon/,'existing lifecycle identity must remain');
});

test('phase 2338 renders at most two effective modifier helpers beside the existing SAFE zone label',()=>{
  assert.match(source,/projectMythicSafeZonePressureEffects\(boss\.bossArchetype\?\?'inferno',safeZone,destroyedRatio\)/);
  assert.match(source,/projection\.primaryEffects\.slice\(0,2\)/);assert.match(source,/drawMythicSafeZonePressureHelpers\(ctx/);assert.match(source,/mythicSafeZonePressureEffectIdentityIcon\(effect\.effectId\)/);
  assert.match(source,/safeZoneLabelAnchor\.x/);assert.match(source,/safeZoneLabelAnchor\.y/,'helpers must stay on the local SAFE-zone seam instead of adding a global HUD row');
});

test('phase 2339 SAFE pressure helpers yield to critical attention Last Law and imminent boss specials',()=>{
  assert.match(source,/hideMythicSafeZonePressureIdentity\(boss,lawActive\)/);assert.match(source,/heroCritical\|\|coreCritical\|\|lawActive\|\|\(boss\.specialTimer\?\?99\)<=1\.2/);
  assert.match(source,/if\(this\.hideMythicSafeZonePressureIdentity\(boss,lawActive\)\)return/);
});

test('phase 2339 text fallback remains available when the SAFE pressure atlas is not ready',()=>{
  assert.match(source,/if\(this\.mythicSafeZonePressureEffectIdentityAtlasReady&&this\.mythicSafeZonePressureEffectIdentityAtlasImage\)/);
  assert.match(source,/fillText\(effect\.label/);
});
