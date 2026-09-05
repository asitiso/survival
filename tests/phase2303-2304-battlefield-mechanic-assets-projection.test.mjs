import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const assetsUrl=new URL('../dist/game/battlefield-mechanic-identity-assets.js',import.meta.url);
const projectionUrl=new URL('../dist/game/battlefield-mechanic-projection.js',import.meta.url);

test('phase 2303 provides three mechanic and three stage identities in one static atlas',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'battlefield mechanic identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.BATTLEFIELD_MECHANIC_IDS,['wall','slow','crystal']);
  assert.deepEqual(m.BATTLEFIELD_STAGE_IDS,['stage0','stage1','stage2']);
  assert.deepEqual(m.BATTLEFIELD_MECHANIC_ATLAS,{src:'./assets/ui/battlefield-mechanic-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const a=m.auditBattlefieldMechanicIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,6);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of [...m.BATTLEFIELD_MECHANIC_IDS,...m.BATTLEFIELD_STAGE_IDS]){const icon=m.battlefieldMechanicIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2304 derives dominant battlefield mechanic from the actual evolved layout',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'battlefield mechanic projection module must exist');
  const m=await import(projectionUrl.href);
  assert.equal(m.projectBattlefieldMechanics('ruinedGate',0).dominantMechanic,'wall');
  assert.equal(m.projectBattlefieldMechanics('frozenFen',0).dominantMechanic,'slow');
  assert.equal(m.projectBattlefieldMechanics('crystalQuarry',0).dominantMechanic,'crystal');
  assert.equal(m.projectBattlefieldMechanics('crystalQuarry',2).stageIdentity,'stage2');
});

test('phase 2304 evolution impact compares authoritative previous and next evolved layouts',async()=>{
  const m=await import(projectionUrl.href);
  const gate=m.projectBattlefieldEvolutionImpact('ruinedGate',2);assert.equal(gate.stage,2);assert.ok(gate.changes.some(v=>v.id==='crystal'));assert.ok(gate.changes.length<=2);
  const fen=m.projectBattlefieldEvolutionImpact('frozenFen',1);assert.ok(fen.changes.some(v=>v.id==='slow'));
  const quarry=m.projectBattlefieldEvolutionImpact('crystalQuarry',1);assert.ok(quarry.changes.some(v=>v.id==='crystal'));
  assert.match(m.battlefieldEvolutionImpactHint(fen),/둔화/);
});


test('phase 2304 evolution toast hint stays compact enough for the existing 420px event toast',async()=>{
  const m=await import(projectionUrl.href);const {mapEvolutionLabel}=await import(new URL('../dist/game/map-evolution.js',import.meta.url).href);
  for(const mapId of ['ruinedGate','frozenFen','crystalQuarry'])for(const stage of [1,2]){const text=`${mapEvolutionLabel(mapId,stage)} · ${m.battlefieldEvolutionImpactHint(m.projectBattlefieldEvolutionImpact(mapId,stage))}`;assert.ok(text.length<=30,`${mapId}:${stage} is too long: ${text}`);}
});
