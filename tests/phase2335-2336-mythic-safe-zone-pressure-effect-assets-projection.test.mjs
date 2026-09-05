import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mythicSafeZoneState } from '../dist/game/endless/mythic-safe-zone.js';
const assetsUrl=new URL('../dist/game/endless/mythic-safe-zone-pressure-effect-identity-assets.js',import.meta.url);
const projectionUrl=new URL('../dist/game/endless/mythic-safe-zone-pressure-projection.js',import.meta.url);

function zone(archetype,ms,destroyed=0){return mythicSafeZoneState(archetype,ms,1600,900,destroyed);}

test('phase 2335 provides four static Mythic SAFE pressure effect identities in one compact atlas',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'SAFE pressure effect identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS,['special-cadence','summon-pressure','dash-distance','boss-vulnerability']);
  assert.deepEqual(m.MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_ATLAS,{src:'./assets/ui/mythic-safe-zone-pressure-effect-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192});
  const a=m.auditMythicSafeZonePressureEffectIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,4);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS){const icon=m.mythicSafeZonePressureEffectIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.maxVisibleHelperIcons,2);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2336 projects the authoritative SAFE pressure multipliers without duplicating combat formulas',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'SAFE pressure projection module must exist');
  const m=await import(projectionUrl.href);
  const p=m.projectMythicSafeZonePressureEffects('inferno',zone('inferno',7000,0),0);
  assert.equal(p.phase,'collapsed');assert.equal(p.effects.length,4);assert.equal(p.maxPrimaryEffects,2);
  const cadence=p.effects.find(v=>v.effectId==='special-cadence');const summon=p.effects.find(v=>v.effectId==='summon-pressure');const dash=p.effects.find(v=>v.effectId==='dash-distance');
  assert.equal(cadence.after,0.804);assert.equal(cadence.deltaPercent,-19.6);assert.equal(cadence.label,'특수주기 -19.6%');
  assert.equal(summon.after,1.12);assert.equal(summon.deltaPercent,12);assert.equal(dash.after,1.12);assert.equal(dash.deltaPercent,12);
});

test('phase 2336 chooses only the two highest-magnitude SAFE effects with deterministic tie order',async()=>{
  const m=await import(projectionUrl.href);
  const p=m.projectMythicSafeZonePressureEffects('inferno',zone('inferno',7000,0),0);
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['special-cadence','summon-pressure']);
  const hint=m.mythicSafeZonePressureEffectHint(p,2);assert.equal(hint,'특수주기 -19.6% · 소환 +12%');assert.ok(hint.length<=27);
});

test('phase 2336 weakpoint destruction visibly projects pressure relief from the same authoritative function',async()=>{
  const m=await import(projectionUrl.href);
  const raw=m.projectMythicSafeZonePressureEffects('summoner',zone('summoner',7000,0),0);
  const cleared=m.projectMythicSafeZonePressureEffects('summoner',zone('summoner',7000,1),1);
  const rawCadence=raw.effects.find(v=>v.effectId==='special-cadence');const clearCadence=cleared.effects.find(v=>v.effectId==='special-cadence');
  const rawSummon=raw.effects.find(v=>v.effectId==='summon-pressure');const clearSummon=cleared.effects.find(v=>v.effectId==='summon-pressure');
  assert.ok(clearCadence.after>rawCadence.after);assert.ok(clearSummon.after<rawSummon.after);assert.equal(cleared.destroyedWeakpointRatio,1);
});
