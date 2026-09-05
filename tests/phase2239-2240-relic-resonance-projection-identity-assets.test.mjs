import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const impactUrl=new URL('../dist/game/relic-resonance-impact-identity-assets.js',import.meta.url);
const tierUrl=new URL('../dist/game/relic-resonance-tier-identity-assets.js',import.meta.url);

test('phase 2239 provides three static relic resonance replacement-impact identities',async()=>{
  assert.equal(fs.existsSync(impactUrl),true,'relic resonance impact identity module must exist');
  const m=await import(impactUrl.href);
  assert.deepEqual(m.RELIC_RESONANCE_IMPACT_IDENTITY_IDS,['tier-up','steady','tier-down']);
  assert.deepEqual(m.RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS,{src:'./assets/ui/relic-resonance-impact-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96});
  for(const id of m.RELIC_RESONANCE_IMPACT_IDENTITY_IDS){const icon=m.relicResonanceImpactIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditRelicResonanceImpactIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,3);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});

test('phase 2240 provides four static projected resonance-tier identities',async()=>{
  assert.equal(fs.existsSync(tierUrl),true,'relic resonance tier identity module must exist');
  const m=await import(tierUrl.href);
  assert.deepEqual(m.RELIC_RESONANCE_TIER_IDENTITY_IDS,['dormant','tier1','tier2','tier3']);
  assert.deepEqual(m.RELIC_RESONANCE_TIER_IDENTITY_ATLAS,{src:'./assets/ui/relic-resonance-tier-icons.png',columns:4,rows:1,cellSize:96,width:384,height:96});
  assert.equal(m.relicResonanceTierIdentityForTier(0),'dormant');assert.equal(m.relicResonanceTierIdentityForTier(1),'tier1');assert.equal(m.relicResonanceTierIdentityForTier(2),'tier2');assert.equal(m.relicResonanceTierIdentityForTier(3),'tier3');
  const a=m.auditRelicResonanceTierIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,4);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
