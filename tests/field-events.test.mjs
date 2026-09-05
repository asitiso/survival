import test from 'node:test';
import assert from 'node:assert/strict';
import { FieldEventDirector, fieldEventModifiers, FIELD_EVENT_SPECS } from '../dist/game/field-events.js';

function sequence(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)] ?? 0;
}

test('field event first becomes eligible at seventy five seconds', () => {
  const director = new FieldEventDirector(() => 0);
  assert.equal(director.update(1, 74, 90).started, null);
  const transition = director.update(1, 75, 90);
  assert.equal(transition.started?.id, 'goldenGoblin');
  assert.equal(director.active?.id, 'goldenGoblin');
});

test('field event does not begin inside the twelve second boss warning window', () => {
  const director = new FieldEventDirector(() => 0);
  const blocked = director.update(1, 80, 10);
  assert.equal(blocked.started, null);
  assert.equal(director.active, null);
  const allowed = director.update(1, 81, 20);
  assert.equal(allowed.started?.id, 'goldenGoblin');
});

test('active field event prevents overlap and expires at its defined duration', () => {
  const director = new FieldEventDirector(() => 0);
  const first = director.update(1, 75, 60).started;
  assert.ok(first);
  const midway = director.update(first.duration - 1, 75 + first.duration - 1, 60);
  assert.equal(midway.started, null);
  assert.equal(midway.ended, null);
  assert.equal(director.active?.id, first.id);
  const expired = director.update(1.1, 75 + first.duration + 0.1, 60);
  assert.equal(expired.ended?.id, first.id);
  assert.equal(director.active, null);
});

test('field event selection avoids immediately repeating the previous event', () => {
  const director = new FieldEventDirector(sequence([0, 0, 0, 0]));
  const first = director.update(1, 75, 90).started;
  assert.equal(first?.id, 'goldenGoblin');
  director.completeActive(90);
  const nextAt = director.nextEventAt;
  const second = director.update(1, nextAt + 0.01, 90).started;
  assert.ok(second);
  assert.notEqual(second.id, first.id);
});

test('field event modifiers materially change combat without permanent state', () => {
  const mana = fieldEventModifiers({ ...FIELD_EVENT_SPECS.manaStorm, remaining: 10, startedAt: 100 });
  const gold = fieldEventModifiers({ ...FIELD_EVENT_SPECS.goldenNight, remaining: 10, startedAt: 100 });
  const elite = fieldEventModifiers({ ...FIELD_EVENT_SPECS.eliteRush, remaining: 10, startedAt: 100 });
  assert.ok(mana.cooldownMultiplier <= 0.7);
  assert.ok(mana.spawnPressureMultiplier >= 1.4);
  assert.ok(gold.goldMultiplier >= 2);
  assert.ok(gold.eliteIntervalMultiplier < 1);
  assert.ok(elite.spawnPressureMultiplier > 1);
  assert.ok(elite.eliteIntervalMultiplier < gold.eliteIntervalMultiplier);
  assert.deepEqual(fieldEventModifiers(null), {
    cooldownMultiplier: 1,
    spawnPressureMultiplier: 1,
    eliteIntervalMultiplier: 1,
    goldMultiplier: 1,
  });
});

test('event arena positions stay away from screen edges for chase and crate objectives', async () => {
  const { fieldEventArenaPosition } = await import('../dist/game/field-events.js');
  const p = fieldEventArenaPosition(() => 0);
  const q = fieldEventArenaPosition(() => 0.999);
  for (const pos of [p, q]) {
    assert.ok(pos.x >= 250 && pos.x <= 1350);
    assert.ok(pos.y >= 180 && pos.y <= 760);
  }
});

test('elite rush count scales modestly with danger and remains bounded', async () => {
  const { eliteRushCount } = await import('../dist/game/field-events.js');
  assert.ok(eliteRushCount(8) > eliteRushCount(1));
  assert.ok(eliteRushCount(999) <= 12);
});
