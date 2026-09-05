import test from 'node:test';
import assert from 'node:assert/strict';
import { openingAutoReadyProfile, openingAutoCastIntent } from '../dist/game/opening-auto-ready.js';

test('phase 543 new runs start with AUTO ready so the first spell volley needs no setup tap',()=>{
  const p=openingAutoReadyProfile();
  assert.equal(p.initialAutoEnabled,true);
  assert.equal(p.savedOpeningTaps,1);
});

test('phase 544 holding a spell remains a manual cast and does not double fire through AUTO',()=>{
  assert.deepEqual(openingAutoCastIntent(true,true),{manualHeld:true,autoTriggered:false});
});

test('phase 545 players can still turn AUTO off and manual casting remains available',()=>{
  assert.deepEqual(openingAutoCastIntent(false,true),{manualHeld:true,autoTriggered:false});
  assert.deepEqual(openingAutoCastIntent(false,false),{manualHeld:false,autoTriggered:false});
});

test('phase 546 opening AUTO readiness reuses the existing action and adds no persisted state',()=>{
  const p=openingAutoReadyProfile();
  assert.equal(p.actionCount,9);
  assert.equal(p.newActionCount,0);
  assert.equal(p.snapshotMutation,false);
});
