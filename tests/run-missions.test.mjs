import test from 'node:test';
import assert from 'node:assert/strict';
import { RunMissionDirector, missionTargetForDanger, missionProgress } from '../dist/game/run-missions.js';

const snap = (overrides = {}) => ({ kills: 100, eliteKills: 2, goldEarned: 500, danger: 1, ...overrides });

test('first mission starts at 105 seconds but is suppressed in the boss safety window', () => {
  const director = new RunMissionDirector(() => 0);
  assert.equal(director.update(1, 104, snap(), 30).started, null);
  assert.equal(director.update(1, 105, snap(), 10).started, null);
  const started = director.update(1, 105, snap(), 30).started;
  assert.equal(started.id, 'massacre');
  assert.equal(started.remaining, 30);
});

test('mission targets scale gently with danger and stay bounded', () => {
  assert.ok(missionTargetForDanger('massacre', 10) > missionTargetForDanger('massacre', 1));
  assert.ok(missionTargetForDanger('massacre', 99) <= 120);
  assert.ok(missionTargetForDanger('eliteHunt', 99) <= 5);
  assert.ok(missionTargetForDanger('goldRush', 99) <= 900);
});

test('massacre progress uses kill delta from mission start and grants a shop token on completion', () => {
  const director = new RunMissionDirector(() => 0);
  const start = director.update(0, 105, snap(), 30).started;
  const target = start.target;
  assert.equal(missionProgress(start, snap()), 0);
  assert.equal(director.update(1, 106, snap({ kills: 100 + target - 1 }), 30).completed, null);
  const done = director.update(1, 107, snap({ kills: 100 + target }), 30).completed;
  assert.equal(done.id, 'massacre');
  assert.deepEqual(done.reward, { kind: 'shopToken', amount: 1 });
  assert.equal(director.active, null);
});

test('elite hunt and gold rush track their own delta counters and rewards', () => {
  const elite = new RunMissionDirector(() => 0.40);
  const eliteStart = elite.update(0, 105, snap(), 30).started;
  assert.equal(eliteStart.id, 'eliteHunt');
  const eliteDone = elite.update(1, 106, snap({ eliteKills: 2 + eliteStart.target }), 30).completed;
  assert.deepEqual(eliteDone.reward, { kind: 'gold', amount: 320 });

  const gold = new RunMissionDirector(() => 0.90);
  const goldStart = gold.update(0, 105, snap(), 30).started;
  assert.equal(goldStart.id, 'goldRush');
  const goldDone = gold.update(1, 106, snap({ goldEarned: 500 + goldStart.target }), 30).completed;
  assert.deepEqual(goldDone.reward, { kind: 'potion', amount: 1 });
});

test('expired mission has no penalty and schedules a bounded later attempt', () => {
  const director = new RunMissionDirector(() => 0);
  const started = director.update(0, 105, snap(), 30).started;
  const failed = director.update(started.remaining + 0.1, 136, snap(), 30).failed;
  assert.equal(failed.id, 'massacre');
  assert.equal(director.active, null);
  assert.ok(director.nextMissionAt >= 216);
  assert.ok(director.nextMissionAt <= 246);
});

test('director never overlaps missions and reset restores the first mission schedule', () => {
  const director = new RunMissionDirector(() => 0);
  director.update(0, 105, snap(), 30);
  assert.ok(director.active);
  assert.equal(director.update(0, 200, snap(), 30).started, null);
  director.reset();
  assert.equal(director.active, null);
  assert.equal(director.nextMissionAt, 105);
});
