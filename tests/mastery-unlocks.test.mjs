import test from 'node:test';
import assert from 'node:assert/strict';
import {
  masteryMilestones,
  masteryRelicId,
  masteryTraitId,
  masteryUnlockSummary,
} from '../dist/game/mastery-unlocks.js';
import { relicCandidates } from '../dist/game/relics.js';
import { traitChoiceCards } from '../dist/ui/trait-select.js';

test('each hero has five bounded mastery milestones ending at level twenty', () => {
  for (const heroId of ['arkan', 'seria', 'kain', 'edric']) {
    const milestones = masteryMilestones(heroId);
    assert.deepEqual(milestones.map((entry) => entry.level), [3, 6, 10, 15, 20]);
    assert.equal(new Set(milestones.map((entry) => entry.kind)).size, 5);
  }
});

test('hero-specific mastery trait unlocks at level six without changing base four choices', () => {
  assert.equal(traitChoiceCards().length, 4);
  const traitId = masteryTraitId('arkan');
  assert.equal(traitChoiceCards('arkan', 5).some((entry) => entry.id === traitId), false);
  assert.equal(traitChoiceCards('arkan', 6).some((entry) => entry.id === traitId), true);
  assert.equal(traitChoiceCards('seria', 6).some((entry) => entry.id === traitId), false);
});

test('mastery relic enters only the matching hero pool at level fifteen', () => {
  const relicId = masteryRelicId('kain');
  const deterministic = () => 0.5;
  assert.equal(relicCandidates('kain', null, deterministic, null, 14).includes(relicId), false);
  assert.equal(relicCandidates('kain', null, deterministic, null, 15).includes(relicId), true);
  assert.equal(relicCandidates('arkan', null, deterministic, null, 20).includes(relicId), false);
});

test('mastery summary reveals evolution fusion trait relic and title breadth progressively', () => {
  const early = masteryUnlockSummary('edric', 5);
  const maxed = masteryUnlockSummary('edric', 20);
  assert.equal(early.length, 1);
  assert.equal(maxed.length, 5);
  assert.ok(maxed.some((entry) => entry.kind === 'fusion'));
  assert.ok(maxed.some((entry) => entry.kind === 'title'));
});
