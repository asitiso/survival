import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IDS=['goldenGoblin','supplyDrop','manaStorm','goldenNight','eliteRush','riftSeal','beaconDefense','cursedAltar','massacre','eliteHunt','goldRush','swarmFront','ironMarch','artilleryLine','hexConvoy'];

test('phase 1873 tactical status atlas exists and covers fifteen tactical identities',async()=>{
  assert.equal(fs.existsSync(new URL('../assets/ui/tactical-status-icons.png',import.meta.url)),true);
  const assets=await import('../dist/game/tactical-status-icon-assets.js');
  const audit=assets.auditTacticalStatusIconAtlas(IDS);
  assert.equal(audit.itemCount,15);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,15);
  assert.equal(audit.missing.length,0);
  assert.equal(audit.outOfBounds.length,0);
  assert.equal(assets.TACTICAL_STATUS_ICON_ATLAS.columns,4);
  assert.equal(assets.TACTICAL_STATUS_ICON_ATLAS.rows,4);
  assert.equal(assets.TACTICAL_STATUS_ICON_ATLAS.cellSize,96);
  assert.equal(assets.TACTICAL_STATUS_ICON_ATLAS.width,384);
  assert.equal(assets.TACTICAL_STATUS_ICON_ATLAS.height,384);
});

test('tactical status icons are steady, compact and fallback-safe',async()=>{
  const assets=await import('../dist/game/tactical-status-icon-assets.js');
  for(const id of IDS){
    const p=assets.tacticalStatusIconPresentation(id);
    assert.equal(p.visible,true);
    assert.equal(p.animated,false);
    assert.equal(p.motionAmplitude,0);
    assert.ok(p.size<=30);
    assert.ok(p.compactSize<=24);
    assert.ok(p.sprite.sw>0&&p.sprite.sh>0);
  }
  assert.equal(assets.tacticalStatusIconPresentation('unknown').visible,false);
});
