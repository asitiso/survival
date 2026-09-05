import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  DEEP_RUN_DECISION_ATLAS,
  DEEP_RUN_ASCENSION_IDS,
  DEEP_RUN_CONTRACT_IDS,
  DEEP_RUN_OATH_IDS,
  deepRunDecisionIdentityIcon,
  auditDeepRunDecisionIdentityAtlas,
} from '../dist/game/deep-run-decision-identity-assets.js';

test('phase 1945 deep-run atlas covers 24 ascensions, 5 contracts, and 6 oaths with unique bounded cells', () => {
  assert.equal(DEEP_RUN_ASCENSION_IDS.length, 24);
  assert.equal(DEEP_RUN_CONTRACT_IDS.length, 5);
  assert.equal(DEEP_RUN_OATH_IDS.length, 6);
  assert.deepEqual(DEEP_RUN_DECISION_ATLAS, {
    src:'./assets/ui/deep-run-decision-icons.png', columns:7, rows:5, cellSize:96, width:672, height:480,
  });
  const audit = auditDeepRunDecisionIdentityAtlas();
  assert.equal(audit.itemCount, 35);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 35);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  assert.equal(fs.existsSync(new URL('../assets/ui/deep-run-decision-icons.png', import.meta.url)), true);
});

test('phase 1945 every deep-run identity is static, non-blocking, and keeps text fallback', () => {
  const ids = [
    ...DEEP_RUN_ASCENSION_IDS.map(id => ({kind:'ascension', id})),
    ...DEEP_RUN_CONTRACT_IDS.map(id => ({kind:'contract', id})),
    ...DEEP_RUN_OATH_IDS.map(id => ({kind:'oath', id})),
  ];
  const cells = new Set();
  for (const identity of ids) {
    const icon = deepRunDecisionIdentityIcon(identity);
    cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.animated, false);
    assert.equal(icon.motionAmplitude, 0);
    assert.equal(icon.textFallbackPreserved, true);
    assert.equal(icon.loadFailureBlocksGameplay, false);
    assert.equal(icon.sw, 96);
    assert.equal(icon.sh, 96);
  }
  assert.equal(cells.size, 35);
});
