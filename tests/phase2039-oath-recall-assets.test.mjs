import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEEP_RUN_DECISION_ATLAS, deepRunDecisionIdentityIcon } from '../dist/game/deep-run-decision-identity-assets.js';
import { LONG_RUN_OATH_RECALL_IDS, auditLongRunOathRecallAtlas, longRunOathRecallIcon, longRunOathKindFromTitle, longRunOathTitle } from '../dist/game/long-run-oath-recall-assets.js';

const expected=['slayer','elite_hunt','boss_hunt','arcane_flow','core_guard','endure'];

test('phase 2039 oath recall reuses the existing deep-run decision atlas with six unique static sprites',()=>{
  assert.deepEqual([...LONG_RUN_OATH_RECALL_IDS],expected);
  assert.deepEqual(DEEP_RUN_DECISION_ATLAS,{src:'./assets/ui/deep-run-decision-icons.png',columns:7,rows:5,cellSize:96,width:672,height:480});
  assert.equal(fs.existsSync(new URL('../assets/ui/deep-run-decision-icons.png',import.meta.url)),true);
  const cells=new Set();
  for(const id of LONG_RUN_OATH_RECALL_IDS){
    const raw=deepRunDecisionIdentityIcon({kind:'oath',id}); cells.add(`${raw.sx}:${raw.sy}`);
    const icon=longRunOathRecallIcon(id);
    assert.equal(icon.id,id); assert.equal(icon.atlasSrc,DEEP_RUN_DECISION_ATLAS.src);
    assert.equal(icon.sx,raw.sx); assert.equal(icon.sy,raw.sy); assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.startToastIdentitySupported,true); assert.equal(icon.activeRecallIdentitySupported,true); assert.equal(icon.outcomeToastIdentitySupported,true); assert.equal(icon.maxVisibleRecallIcons,1);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0); assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    const title=longRunOathTitle(id); assert.ok(title.length>0); assert.equal(longRunOathKindFromTitle(title),id);
  }
  assert.equal(cells.size,6); assert.equal(longRunOathKindFromTitle('알 수 없는 서약'),null);
  const audit=auditLongRunOathRecallAtlas();
  assert.equal(audit.itemCount,6); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
