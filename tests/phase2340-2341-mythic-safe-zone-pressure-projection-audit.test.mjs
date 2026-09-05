import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const auditUrl=new URL('../dist/game/endless/mythic-safe-zone-pressure-projection-identity-audit.js',import.meta.url);
const pressureSource=new URL('../src/game/endless/mythic-safe-zone-pressure.ts',import.meta.url);
const snapshotSource=new URL('../src/game/endless/snapshot.ts',import.meta.url);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

test('phase 2340-2341 deterministic SAFE pressure projection audit contains exactly ninety-six samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'SAFE pressure projection audit module must exist');
  const {auditMythicSafeZonePressureProjectionIdentityAssets}=await import(auditUrl.href);const a=auditMythicSafeZonePressureProjectionIdentityAssets();
  assert.equal(a.samples.length,96);assert.equal(a.archetypeCount,6);assert.equal(a.phaseCount,4);assert.equal(a.destroyedRatioCount,3);assert.equal(a.identityCount,4);assert.equal(a.actionCount,9);
  assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2340-2341 audit covers every Mythic archetype phase and weakpoint relief state with max-two salience',async()=>{
  const {auditMythicSafeZonePressureProjectionIdentityAssets}=await import(auditUrl.href);const a=auditMythicSafeZonePressureProjectionIdentityAssets();
  assert.equal(a.archetypeCoverageComplete,true);assert.equal(a.phaseCoverageComplete,true);assert.equal(a.destroyedRatioCoverageComplete,true);assert.equal(a.identityCoverageComplete,true);assert.equal(a.maxPrimaryEffects,2);
});

test('phase 2340-2341 freezes authoritative SAFE pressure gameplay and snapshot schema sources',()=>{
  assert.equal(sha(pressureSource),'979e5b8422ce23c5ea261f33aa30f9233c7b2c96aa6431e457b568becbf6eea6');
  assert.equal(sha(snapshotSource),'9e1b6cb99ea51a2062cc6caa7189b43c55e44fe0d05dbf77e7e21c179451ad02');
});
