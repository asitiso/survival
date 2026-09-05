import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultMasteryProfile, grantMasteryXp } from '../dist/domain/mastery-profile.js';
import { lobbyMasteryCards } from '../dist/ui/lobby.js';

test('lobby mastery cards show all four heroes with bounded progress', () => {
  let profile = defaultMasteryProfile();
  profile = grantMasteryXp(profile, 'arkan', 120);
  const cards = lobbyMasteryCards(profile);
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map((card) => card.heroId), ['arkan', 'seria', 'kain', 'edric']);
  assert.ok(cards.every((card) => card.level >= 1 && card.level <= 20));
  assert.ok(cards.every((card) => card.progress >= 0 && card.progress <= 1));
});

test('game wires mastery load save trait unlock reward and result presentation', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  for (const token of [
    'loadMasteryProfile',
    'saveMasteryProfile',
    'masteryXpForRun',
    'grantMasteryXp',
    'masteryProfile.heroes[heroId].level',
    'masteryLevel:',
  ]) assert.ok(source.includes(token), `missing mastery integration token ${token}`);
});
