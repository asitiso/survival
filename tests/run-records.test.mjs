import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultRunRecords, calculateRunScore, recordRun, bestRecordFor, loadRunRecords, saveRunRecords } from '../dist/domain/run-records.js';

const baseRun = { heroId: 'arkan', mapId: 'ruinedGate', threatLevel: 0, seconds: 600, kills: 900, bosses: 3, danger: 5 };

test('run score rewards survival kills bosses danger and threat', () => {
  const base = calculateRunScore(baseRun);
  assert.ok(base > 0);
  assert.ok(calculateRunScore({ ...baseRun, seconds: 900 }) > base);
  assert.ok(calculateRunScore({ ...baseRun, bosses: 5 }) > base);
  assert.ok(calculateRunScore({ ...baseRun, threatLevel: 4 }) > base);
});

test('records are separated by hero map and threat level and identify new records', () => {
  let state = defaultRunRecords();
  let out = recordRun(state, baseRun);
  assert.equal(out.newRecord, true);
  state = out.state;
  assert.equal(bestRecordFor(state, 'arkan', 'ruinedGate', 0)?.score, out.summary.score);
  const worse = recordRun(state, { ...baseRun, seconds: 300, kills: 200 });
  assert.equal(worse.newRecord, false);
  const other = recordRun(worse.state, { ...baseRun, heroId: 'seria' });
  assert.equal(other.newRecord, true);
});

test('recent run history is capped at ten newest entries', () => {
  let state = defaultRunRecords();
  for (let i = 0; i < 15; i++) state = recordRun(state, { ...baseRun, seconds: 500 + i }).state;
  assert.equal(state.recent.length, 10);
  assert.equal(state.recent[0].seconds, 514);
});

test('run records persist safely and malformed storage falls back to empty state', () => {
  const data = new Map();
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k,v) => data.set(k,String(v)) };
  const recorded = recordRun(defaultRunRecords(), baseRun).state;
  saveRunRecords(storage, recorded);
  assert.equal(loadRunRecords(storage).recent.length, 1);
  data.set('arcane-last-stand.run-records', '{bad');
  assert.deepEqual(loadRunRecords(storage), defaultRunRecords());
});
