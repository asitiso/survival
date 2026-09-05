import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const modifierUrl=new URL('../dist/game/spell-evolution-modifier-identity-assets.js',import.meta.url);
const tierUrl=new URL('../dist/game/spell-evolution-tier-delta-identity-assets.js',import.meta.url);

test('phase 2263 provides eight static spell evolution modifier identities',async()=>{
  assert.equal(fs.existsSync(modifierUrl),true,'spell evolution modifier identity module must exist');
  const m=await import(modifierUrl.href);
  assert.deepEqual(m.SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS,['damage','area','projectile','chain','cadence','duration','control','pierce']);
  assert.deepEqual(m.SPELL_EVOLUTION_MODIFIER_IDENTITY_ATLAS,{src:'./assets/ui/spell-evolution-modifier-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  const a=m.auditSpellEvolutionModifierIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,8);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS){const icon=m.spellEvolutionModifierIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2264 provides exactly two real next-tier delta identities',async()=>{
  assert.equal(fs.existsSync(tierUrl),true,'spell evolution tier delta identity module must exist');
  const m=await import(tierUrl.href);
  assert.deepEqual(m.SPELL_EVOLUTION_TIER_DELTA_IDS,['awaken','final']);
  assert.deepEqual(m.SPELL_EVOLUTION_TIER_DELTA_ATLAS,{src:'./assets/ui/spell-evolution-tier-delta-icons.png',columns:2,rows:1,cellSize:96,width:192,height:96});
  assert.equal(m.spellEvolutionTierDeltaIdentityIcon('awaken').label,'1차 진화');
  assert.equal(m.spellEvolutionTierDeltaIdentityIcon('final').label,'최종 진화');
  const a=m.auditSpellEvolutionTierDeltaIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,2);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
