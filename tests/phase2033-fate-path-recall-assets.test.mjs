import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DECISION_PATH_ICON_ATLAS, decisionPathIconSprite } from '../dist/game/decision-path-icon-assets.js';
import { FATE_PATH_RECALL_IDS, auditFatePathRecallAtlas, fatePathRecallIcon } from '../dist/game/fate-path-recall-assets.js';

const expected=['frenzy','golden','guardian'];

test('phase 2033 fate recall reuses the existing decision path atlas with three unique static canvas sprites',()=>{
  assert.deepEqual([...FATE_PATH_RECALL_IDS],expected);
  assert.deepEqual(DECISION_PATH_ICON_ATLAS,{src:'./assets/ui/decision-path-icons.png',columns:4,rows:3,cellSize:96,width:384,height:288});
  assert.equal(fs.existsSync(new URL('../assets/ui/decision-path-icons.png',import.meta.url)),true);
  const cells=new Set();
  for(const id of FATE_PATH_RECALL_IDS){
    const sprite=decisionPathIconSprite(id); assert.ok(sprite); cells.add(`${sprite.sx}:${sprite.sy}`);
    assert.equal(sprite.sw,96); assert.equal(sprite.sh,96);
    const icon=fatePathRecallIcon(id);
    assert.equal(icon.id,id); assert.deepEqual(icon.sprite,sprite); assert.equal(icon.atlasSrc,DECISION_PATH_ICON_ATLAS.src);
    assert.equal(icon.toastIdentitySupported,true); assert.equal(icon.activeRecallIdentitySupported,true); assert.equal(icon.maxVisibleRecallIcons,3);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0); assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
  }
  assert.equal(cells.size,3);
  assert.equal(decisionPathIconSprite('unknown'),null);
  const audit=auditFatePathRecallAtlas();
  assert.equal(audit.itemCount,3); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,3); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
