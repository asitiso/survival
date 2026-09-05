import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IDS=['destruction','rapidCasting','goldSense','guardianOath','infernalPact','glacialFocus','stormPursuit','bastionVow','frenzy','golden','guardian'];

test('phase 1867 decision path atlas covers run traits and fate paths', async () => {
  assert.equal(fs.existsSync(new URL('../assets/ui/decision-path-icons.png', import.meta.url)), true);
  const assets=await import('../dist/game/decision-path-icon-assets.js');
  const audit=assets.auditDecisionPathIconAtlas(IDS);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,11);
  assert.equal(audit.missing.length,0);
  assert.equal(audit.outOfBounds.length,0);
  assert.equal(assets.DECISION_PATH_ICON_ATLAS.columns,4);
  assert.equal(assets.DECISION_PATH_ICON_ATLAS.rows,3);
  assert.equal(assets.DECISION_PATH_ICON_ATLAS.cellSize,96);
});

test('decision path icons are presentation-only and compact', async () => {
  const assets=await import('../dist/game/decision-path-icon-assets.js');
  for(const id of IDS){
    const p=assets.decisionPathIconPresentation(id);
    assert.equal(p.visible,true);
    assert.equal(p.animated,false);
    assert.equal(p.motionAmplitude,0);
    assert.ok(p.size<=52);
    assert.ok(p.compactSize<=40);
  }
  assert.equal(assets.decisionPathIconPresentation('unknown').visible,false);
});
