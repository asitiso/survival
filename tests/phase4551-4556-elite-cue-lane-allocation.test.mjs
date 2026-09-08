import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

function laneInput(overrides = {}) {
  return {
    enemyId: 101,
    priorityIndex: 0,
    activeEliteCount: 4,
    priorityTarget: false,
    activeAttack: false,
    importantEvent: false,
    battlefieldStress: 0.25,
    ...overrides,
  };
}

test('phase 4551 low-stress elite crowds expose five deterministic presentation lanes', () => {
  assert.equal(lanes.eliteAffixCueLaneSlotCount(4, 0.25), 5);
  const allocated = Array.from({ length: 5 }, (_, priorityIndex) =>
    lanes.eliteAffixCueDesiredLane(laneInput({ priorityIndex })),
  );
  assert.deepEqual(allocated, [0, -1, 1, -2, 2]);
});

test('phase 4552 a lone elite keeps its cue centered instead of adding decorative displacement', () => {
  assert.equal(lanes.eliteAffixCueLaneSlotCount(1, 0), 1);
  assert.equal(lanes.eliteAffixCueDesiredLane(laneInput({ activeEliteCount: 1, priorityIndex: 4 })), 0);
});

test('phase 4553 priority targets retain a real lane when their raw crowd index falls outside the active lane budget', () => {
  const lane = lanes.eliteAffixCueDesiredLane(laneInput({
    activeEliteCount: 9,
    battlefieldStress: 0.94,
    priorityIndex: 7,
    priorityTarget: true,
  }));
  assert.notEqual(lane, 0);
  assert.ok(Math.abs(lane) <= 1);
});

test('phase 4554 active attacks receive the same bounded lane preservation as other priority combat cues', () => {
  const lane = lanes.eliteAffixCueDesiredLane(laneInput({
    activeEliteCount: 8,
    battlefieldStress: 0.88,
    priorityIndex: 6,
    activeAttack: true,
  }));
  assert.notEqual(lane, 0);
  assert.ok(Math.abs(lane) <= 1);
});

test('phase 4555 passive overflow crowds collapse instead of widening the battlefield presentation footprint', () => {
  const lane = lanes.eliteAffixCueDesiredLane(laneInput({
    activeEliteCount: 10,
    battlefieldStress: 1,
    priorityIndex: 8,
  }));
  assert.equal(lane, 0);
});

test('phase 4556 lane allocation is presentation-only and returns scalar lane ownership without world coordinates', () => {
  const result = lanes.eliteAffixCueDesiredLane(laneInput({ priorityIndex: 2 }));
  assert.equal(typeof result, 'number');
  assert.equal(result, 1);
});
