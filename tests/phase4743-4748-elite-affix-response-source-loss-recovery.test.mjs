import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);
const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function handoffApi() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function arbitrationApi() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function present(overrides = {}) {
  return arbitrationApi().eliteAffixResponseCrossAffixPresentation({
    primary: true,
    importantEvent: false,
    primaryImportant: false,
    baseVisible: true,
    baseAlphaScale: 1,
    battlefieldStress: 0.4,
    higherPriorityCue: false,
    reducedFlash: false,
    handoffRole: 'incoming',
    handoffProgress: 0,
    handoffHasOutgoing: true,
    ...overrides,
  });
}

test('phase 4743 routine incoming response receives a stronger start floor when its outgoing trace is already gone', () => {
  assert.equal(handoffApi().eliteAffixResponseCrossAffixIncomingStart(false, false), 0.82);
});

test('phase 4744 important incoming response receives a near-immediate readability floor when no outgoing trace remains', () => {
  assert.equal(handoffApi().eliteAffixResponseCrossAffixIncomingStart(true, false), 0.96);
});

test('phase 4745 missing outgoing trace raises routine incoming alpha above an otherwise identical normal handoff', () => {
  const normal = present({ handoffHasOutgoing: true });
  const orphaned = present({ handoffHasOutgoing: false });
  assert.ok(orphaned.alphaScale > normal.alphaScale);
  assert.ok(orphaned.alphaScale < 1);
});

test('phase 4746 missing-outgoing recovery remains monotonic as the incoming primary settles', () => {
  const start = present({ handoffHasOutgoing: false, handoffProgress: 0 }).alphaScale;
  const middle = present({ handoffHasOutgoing: false, handoffProgress: 0.5 }).alphaScale;
  const end = present({ handoffHasOutgoing: false, handoffProgress: 1 }).alphaScale;
  assert.ok(start < middle && middle <= end);
});

test('phase 4747 Reduced Flash stays the final ceiling even when important source-loss recovery uses its stronger start floor', () => {
  const result = present({
    importantEvent: true,
    primaryImportant: true,
    reducedFlash: true,
    handoffHasOutgoing: false,
  });
  assert.ok(result.alphaScale > 0.68);
  assert.ok(result.alphaScale <= 0.72);
});

test('phase 4748 response runtime wires handoff hold and outgoing-presence compensation into final presentation', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /eliteAffixResponseCrossAffixHandoffHoldActive/);
  assert.match(runtimeSource, /eliteAffixResponseCrossAffixOutgoingPresent/);
  assert.match(runtimeSource, /handoffHasOutgoing/);
});
