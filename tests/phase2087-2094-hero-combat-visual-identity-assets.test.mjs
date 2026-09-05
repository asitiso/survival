import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_METER_IDENTITY_IDS,HERO_METER_IDENTITY_ATLAS,heroMeterIdentityIcon,auditHeroMeterIdentityAtlas } from '../dist/game/hero-meter-identity-assets.js';
import { ARCANE_COMBO_IDENTITY_IDS,ARCANE_COMBO_IDENTITY_ATLAS,arcaneComboIdentityIcon,arcaneComboTierBadge,auditArcaneComboIdentityAtlas } from '../dist/game/arcane-combo-identity-assets.js';

test('phase 2087-2094 provides eight static unique hero meter and arcane combo identities across two 2x2 atlases',()=>{
  assert.deepEqual(HERO_METER_IDENTITY_IDS,['arkan','seria','kain','edric']);
  assert.deepEqual(HERO_METER_IDENTITY_ATLAS,{src:'./assets/ui/hero-meter-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192});
  const meterIcons=HERO_METER_IDENTITY_IDS.map(heroMeterIdentityIcon);
  assert.equal(new Set(meterIcons.map(v=>`${v.sx}:${v.sy}`)).size,4);
  for(const icon of meterIcons){assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const meterAudit=auditHeroMeterIdentityAtlas();assert.equal(meterAudit.coverage,1);assert.equal(meterAudit.uniqueCellCount,4);assert.deepEqual(meterAudit.outOfBounds,[]);assert.equal(meterAudit.passed,true);

  assert.deepEqual(ARCANE_COMBO_IDENTITY_IDS,['inferno-chain','frozen-control','storm-velocity','guardian-fortress']);
  assert.deepEqual(ARCANE_COMBO_IDENTITY_ATLAS,{src:'./assets/ui/arcane-combo-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192});
  const comboIcons=ARCANE_COMBO_IDENTITY_IDS.map(arcaneComboIdentityIcon);
  assert.equal(new Set(comboIcons.map(v=>`${v.sx}:${v.sy}`)).size,4);
  for(const icon of comboIcons){assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  assert.deepEqual([1,2,3].map(arcaneComboTierBadge),['I','II','III']);
  const comboAudit=auditArcaneComboIdentityAtlas();assert.equal(comboAudit.coverage,1);assert.equal(comboAudit.uniqueCellCount,4);assert.deepEqual(comboAudit.outOfBounds,[]);assert.equal(comboAudit.passed,true);
});
