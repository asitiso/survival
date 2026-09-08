import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const arbitration = await import('../dist/game/elite-affix-cue-arbitration.js');

const densePassiveInput = {
  activeEliteCount: 8,
  indexFromPriority: 6,
  priorityTarget: false,
  activeAttack: false,
  higherPriorityCue: false,
  battlefieldStress: 0.92,
  reducedMotion: false,
  reducedFlash: false,
};

const passiveState = {
  owner: 'commander',
  holdTtl: 0,
  releaseTtl: 0,
  eventPriority: 1,
};

test('phase 4545 distant passive multi-affix decoration yields first under dense battlefield stress', () => {
  const primary = arbitration.eliteAffixCueLayerPresentation(passiveState, 'commander', densePassiveInput);
  const secondary = arbitration.eliteAffixCueLayerPresentation(passiveState, 'regenerating', densePassiveInput);
  assert.equal(primary.visible, false);
  assert.equal(secondary.visible, false);
  assert.ok(primary.alphaScale <= 0.18);
  assert.ok(secondary.alphaScale <= 0.18);
});

test('phase 4546 core-near or otherwise priority-target elites preserve their primary affix cue', () => {
  const priority = arbitration.eliteAffixCueLayerPresentation(passiveState, 'commander', {
    ...densePassiveInput,
    priorityTarget: true,
  });
  assert.equal(priority.visible, true);
  assert.ok(priority.alphaScale >= 0.45);
});

test('phase 4547 an actual strike owner survives dense suppression even at the back of the crowd', () => {
  const strikeState = arbitration.advanceEliteAffixCueOwnership(undefined, {
    affixes: ['swift', 'frenzied'],
    dt: 0,
    swiftPhase: 'strike',
    frenziedPhase: 'active',
    event: { affixId: 'swift', kind: 'strike' },
  });
  const strike = arbitration.eliteAffixCueLayerPresentation(strikeState, 'swift', {
    ...densePassiveInput,
    indexFromPriority: 7,
    battlefieldStress: 1,
  });
  assert.equal(strike.visible, true);
  assert.ok(strike.alphaScale >= 0.55);
});

test('phase 4548 higher-priority battlefield cues suppress routine affix layers while important events remain subordinate', () => {
  const passive = arbitration.eliteAffixCueLayerPresentation(passiveState, 'commander', {
    ...densePassiveInput,
    indexFromPriority: 0,
    priorityTarget: true,
    higherPriorityCue: true,
  });
  assert.equal(passive.visible, false);

  const thresholdState = arbitration.advanceEliteAffixCueOwnership(undefined, {
    affixes: ['frenzied', 'armored'],
    dt: 0,
    frenziedPhase: 'entered',
    event: { affixId: 'frenzied', kind: 'thresholdEntry' },
  });
  const threshold = arbitration.eliteAffixCueLayerPresentation(thresholdState, 'frenzied', {
    ...densePassiveInput,
    indexFromPriority: 0,
    priorityTarget: true,
    higherPriorityCue: true,
  });
  assert.equal(threshold.visible, true);
  assert.ok(threshold.alphaScale <= 0.52);
});

test('phase 4549 Reduced Motion and Reduced Flash preserve ownership while reducing motion and flash strength', () => {
  const state = arbitration.advanceEliteAffixCueOwnership(undefined, {
    affixes: ['manaShield', 'commander'],
    dt: 0,
    event: { affixId: 'manaShield', kind: 'shieldBreak' },
  });
  const normal = arbitration.eliteAffixCueLayerPresentation(state, 'manaShield', {
    ...densePassiveInput,
    indexFromPriority: 0,
    priorityTarget: true,
  });
  const reduced = arbitration.eliteAffixCueLayerPresentation(state, 'manaShield', {
    ...densePassiveInput,
    indexFromPriority: 0,
    priorityTarget: true,
    reducedMotion: true,
    reducedFlash: true,
  });
  assert.equal(reduced.visible, true);
  assert.equal(reduced.primary, true);
  assert.equal(reduced.motionScale, 0);
  assert.ok(reduced.alphaScale < normal.alphaScale);
});

test('phase 4550 EnemyManager wires event ownership, elite priority ranking, and layer scales without filtering identity icons', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /advanceEliteAffixCueOwnership/);
  assert.match(source, /eliteAffixCueLayerPresentation/);
  assert.match(source, /eliteAffixCueOwnership\?:\s*EliteAffixCueOwnershipState/);
  assert.match(source, /activeAffixElites/);
  assert.match(source, /eliteAffixCuePriorityRank/);
  assert.match(source, /signalEliteAffixCueEvent/);
  assert.match(source, /'swift'\s*,\s*'strike'/);
  assert.match(source, /'manaShield'\s*,\s*'shieldBreak'/);
  assert.match(source, /'frenzied'\s*,\s*'thresholdEntry'/);
  assert.match(source, /affixLayer\.alphaScale/);
  assert.match(source, /responseLayer\.responseAlphaScale/);
  assert.match(source, /index < enemy\.eliteAffixes\.length && index < 2/);
});
