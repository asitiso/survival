import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('phase 2102-2108 Game connects synergy activation/recall and legendary shop item identities to combat surfaces',()=>{
  assert.match(source,/SYNERGY_IDENTITY_ATLAS/);assert.match(source,/SHOP_ITEM_ATLAS/);assert.match(source,/initializeSynergyIdentityAtlas/);assert.match(source,/initializeLegendaryAwakeningAtlas/);
  assert.match(source,/syncSynergyIdentityTracker/);assert.match(source,/시너지 활성/);assert.match(source,/drawSynergyIdentityHud\(ctx/);assert.match(source,/drawSynergyToastIcon\(ctx/);
  assert.match(source,/activeLegendaryAwakeningRecall/);assert.match(source,/drawLegendaryAwakeningRecall\(ctx/);assert.match(source,/drawLegendaryAwakeningToastIcon\(ctx/);
  assert.match(source,/eventToastSynergyId/);assert.match(source,/eventToastLegendaryItemId/);assert.match(source,/legendaryProcIdentity\(proc/);
});
