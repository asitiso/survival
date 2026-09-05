import test from 'node:test';
import assert from 'node:assert/strict';
import { BattlefieldObjectiveDirector, objectiveDefinition } from '../dist/game/battlefield-objectives.js';

function sequence(values) { let i = 0; return () => values[Math.min(i++, values.length - 1)] ?? 0; }

test('battlefield objectives begin at 150 seconds and respect boss warning safety', () => {
  const director = new BattlefieldObjectiveDirector(() => 0);
  assert.equal(director.update(1, 149, 30).started, null);
  assert.equal(director.update(1, 150, 8).started, null);
  const started = director.update(1, 151, 30).started;
  assert.equal(started?.id, 'riftSeal');
  assert.equal(director.active?.id, 'riftSeal');
});

test('director never overlaps an active objective and reschedules after completion', () => {
  const director = new BattlefieldObjectiveDirector(() => 0);
  const first = director.update(0, 150, 30).started;
  assert.ok(first);
  assert.equal(director.update(1, 170, 30).started, null);
  const completed = director.completeActive(171);
  assert.equal(completed?.id, first.id);
  assert.equal(director.active, null);
  assert.ok(director.nextObjectiveAt >= 256 && director.nextObjectiveAt <= 286);
});

test('objective selection avoids immediately repeating the same objective', () => {
  const director = new BattlefieldObjectiveDirector(sequence([0, 0, 0, 0]));
  const first = director.update(0, 150, 30).started;
  director.completeActive(160);
  const second = director.update(0, director.nextObjectiveAt + 0.01, 30).started;
  assert.ok(second);
  assert.notEqual(second.id, first.id);
});

test('objective definitions are short, bounded, and materially different', () => {
  const rift = objectiveDefinition('riftSeal');
  const beacon = objectiveDefinition('beaconDefense');
  const altar = objectiveDefinition('cursedAltar');
  assert.equal(rift.duration, 34);
  assert.equal(beacon.duration, 28);
  assert.equal(altar.duration, 22);
  assert.notEqual(rift.accent, beacon.accent);
  assert.notEqual(beacon.accent, altar.accent);
  for (const spec of [rift, beacon, altar]) assert.ok(spec.name.length <= 8);
});
