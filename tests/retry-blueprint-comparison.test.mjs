import test from 'node:test';
import assert from 'node:assert/strict';

import { saveRetryBlueprint, loadRetryBlueprint, clearRetryBlueprint } from '../dist/domain/retry-blueprint.js';
import { compareRunResult } from '../dist/domain/run-comparison.js';
import { appendRunHistory, loadRunHistory } from '../dist/domain/run-history.js';

function storage() {
  const map = new Map();
  return { map, getItem:(k)=>map.get(k)??null, setItem:(k,v)=>map.set(k,v), removeItem:(k)=>map.delete(k) };
}

test('phase 53 retry blueprint stores only deterministic run-start choices', () => {
  const s = storage();
  saveRetryBlueprint(s, {version:1,heroId:'seria',traitId:'glacialFocus',threatLevel:4,mapId:'frozenFen',seed:0x12345678});
  assert.deepEqual(loadRetryBlueprint(s), {version:1,heroId:'seria',traitId:'glacialFocus',threatLevel:4,mapId:'frozenFen',seed:0x12345678});
  const raw = [...s.map.values()][0];
  assert.ok(raw.length < 220);
  assert.equal(raw.includes('spellLevels'), false);
});

test('retry blueprint sanitizes invalid data and can be cleared without throwing', () => {
  const s = storage();
  s.setItem('arcane-last-stand.retry-blueprint.v1', JSON.stringify({version:1,heroId:'bad',traitId:'bad',threatLevel:99,mapId:'bad',seed:-1}));
  assert.equal(loadRetryBlueprint(s), null);
  assert.doesNotThrow(()=>clearRetryBlueprint(s));
});

test('phase 55 run history keeps legacy entries and optional build identity fields', () => {
  const s = storage();
  appendRunHistory(s,{runCode:'ARC-OLD',heroId:'arkan',seconds:600,threat:2,score:1000});
  appendRunHistory(s,{runCode:'ARC-NEW',heroId:'arkan',seconds:900,threat:2,score:1600,mapId:'ruinedGate',bosses:5,archetype:'burst',finalForm:'solar-sovereign'});
  const history=loadRunHistory(s);
  assert.equal(history.length,2);
  assert.equal(history[1].mapId,undefined);
  assert.equal(history[0].mapId,'ruinedGate');
  assert.equal(history[0].bosses,5);
  assert.equal(history[0].archetype,'burst');
  assert.equal(history[0].finalForm,'solar-sovereign');
});

test('phase 56 comparison reports previous and personal-best deltas only for matching hero and threat', () => {
  const history=[
    {runCode:'ARC-1',heroId:'arkan',seconds:900,threat:3,score:1800,mapId:'ruinedGate'},
    {runCode:'ARC-2',heroId:'seria',seconds:5000,threat:3,score:99999,mapId:'ruinedGate'},
    {runCode:'ARC-3',heroId:'arkan',seconds:1200,threat:3,score:2200,mapId:'frozenFen'},
  ];
  const comparison=compareRunResult({heroId:'arkan',threat:3,seconds:1000,score:2000,mapId:'ruinedGate'},history);
  assert.equal(comparison.previousSecondsDelta,100);
  assert.equal(comparison.previousScoreDelta,200);
  assert.equal(comparison.bestSecondsDelta,-200);
  assert.equal(comparison.bestScoreDelta,-200);
});

test('phase 57 comparison summary stays compact and useful when no baseline exists', () => {
  const comparison=compareRunResult({heroId:'kain',threat:5,seconds:7200,score:12000,mapId:'crystalQuarry'},[]);
  assert.deepEqual(comparison.lines,[]);
  assert.equal(comparison.previousSecondsDelta,null);
  assert.equal(comparison.bestScoreDelta,null);
});
