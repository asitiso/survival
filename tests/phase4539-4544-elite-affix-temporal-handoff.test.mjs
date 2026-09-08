import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-cue-arbitration.js');

const affixes = ['swift', 'frenzied'];
const strikeInput = {
  affixes,
  dt: 0,
  swiftPhase: 'strike',
  frenziedPhase: 'active',
  event: { affixId: 'swift', kind: 'strike' },
};

function swiftStrikeOwner() {
  return arbitration.advanceEliteAffixCueOwnership(undefined, strikeInput);
}

test('phase 4539 a Swift strike owner is held through the immediate next-frame Frenzied activity', () => {
  const strike = swiftStrikeOwner();
  const next = arbitration.advanceEliteAffixCueOwnership(strike, {
    affixes,
    dt: 0.07,
    swiftPhase: 'recovery',
    frenziedPhase: 'active',
  });
  assert.equal(next.owner, 'swift');
  assert.ok(next.holdTtl > 0);
});

test('phase 4540 release time keeps the prior owner stable after the hard hold expires', () => {
  const strike = swiftStrikeOwner();
  const releasing = arbitration.advanceEliteAffixCueOwnership(strike, {
    affixes,
    dt: 0.18,
    swiftPhase: 'approach',
    frenziedPhase: 'entered',
  });
  assert.equal(releasing.owner, 'swift');
  assert.equal(releasing.holdTtl, 0);
  assert.ok(releasing.releaseTtl > 0);
});

test('phase 4541 after hold and release expire the strongest live affix may take ownership', () => {
  const strike = swiftStrikeOwner();
  const settled = arbitration.advanceEliteAffixCueOwnership(strike, {
    affixes,
    dt: 0.30,
    swiftPhase: 'approach',
    frenziedPhase: 'entered',
  });
  assert.equal(settled.owner, 'frenzied');
  assert.equal(settled.eventPriority, 1);
});

test('phase 4542 a new important event can hand off immediately even during another owner hold', () => {
  const strike = swiftStrikeOwner();
  const threshold = arbitration.advanceEliteAffixCueOwnership(strike, {
    affixes,
    dt: 0.02,
    swiftPhase: 'recovery',
    frenziedPhase: 'entered',
    event: { affixId: 'frenzied', kind: 'thresholdEntry' },
  });
  assert.equal(threshold.owner, 'frenzied');
  assert.equal(threshold.eventPriority, 3);
  assert.ok(threshold.holdTtl > 0);
});

test('phase 4543 ordinary responses do not create owner flicker during an important release', () => {
  const strike = swiftStrikeOwner();
  const releasing = arbitration.advanceEliteAffixCueOwnership(strike, {
    affixes,
    dt: 0.18,
    swiftPhase: 'approach',
    frenziedPhase: 'active',
  });
  const response = arbitration.advanceEliteAffixCueOwnership(releasing, {
    affixes,
    dt: 0,
    swiftPhase: 'approach',
    frenziedPhase: 'active',
    event: { affixId: 'frenzied', kind: 'response' },
  });
  assert.equal(response.owner, 'swift');
  assert.equal(response.eventPriority, 3);
});

test('phase 4544 secondary affix presentation remains visible but alpha and motion are restrained', () => {
  assert.equal(typeof arbitration.eliteAffixCueLayerPresentation, 'function');
  const state = swiftStrikeOwner();
  const input = {
    activeEliteCount: 2,
    indexFromPriority: 0,
    priorityTarget: true,
    activeAttack: true,
    higherPriorityCue: false,
    battlefieldStress: 0.35,
    reducedMotion: false,
    reducedFlash: false,
  };
  const primary = arbitration.eliteAffixCueLayerPresentation(state, 'swift', input);
  const secondary = arbitration.eliteAffixCueLayerPresentation(state, 'frenzied', input);
  assert.equal(primary.primary, true);
  assert.equal(secondary.primary, false);
  assert.equal(secondary.visible, true);
  assert.ok(secondary.alphaScale < primary.alphaScale);
  assert.ok(secondary.alphaScale <= 0.48);
  assert.ok(secondary.motionScale < primary.motionScale);
});
