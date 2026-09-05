import test from 'node:test';
import assert from 'node:assert/strict';
import { nextStartScreen } from '../dist/domain/meta-flow.js';

test('boot always opens the meta lobby before hero selection', () => {
  assert.equal(nextStartScreen('boot'), 'lobby');
});

test('lobby continue opens hero selection', () => {
  assert.equal(nextStartScreen('lobbyContinue'), 'hero');
});

test('hero selection moves directly to run trait choice', () => {
  assert.equal(nextStartScreen('heroChosen'), 'trait');
});

test('same hero retry skips lobby and hero selection but still allows a new trait', () => {
  assert.equal(nextStartScreen('retrySameHero'), 'trait');
});

test('results can return to lobby for shard spending', () => {
  assert.equal(nextStartScreen('returnLobby'), 'lobby');
});

test('trait selection begins combat', () => {
  assert.equal(nextStartScreen('traitChosen'), 'combat');
});

test('lobby cards expose only four bounded upgrades and disable capped tracks', async () => {
  const { lobbyUpgradeCards } = await import('../dist/ui/lobby.js');
  const profile = { version: 1, shards: 999, upgrades: { vitality: 5, power: 2, bankroll: 0, magnet: 4 } };
  const cards = lobbyUpgradeCards(profile);
  assert.equal(cards.length, 4);
  assert.equal(cards.find((card) => card.id === 'vitality').canBuy, false);
  assert.equal(cards.find((card) => card.id === 'magnet').canBuy, false);
  assert.equal(cards.find((card) => card.id === 'power').level, 2);
});

test('trait choice cards preserve all four run tradeoffs for one-tap selection', async () => {
  const { traitChoiceCards } = await import('../dist/ui/trait-select.js');
  const cards = traitChoiceCards();
  assert.equal(cards.length, 4);
  assert.equal(cards[0].id, 'destruction');
  assert.ok(cards.every((card) => card.description.includes('·')));
});

test('game integration wires lobby profile trait setup and run start composition before combat', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  for (const token of ['LobbyOverlay', 'TraitSelectOverlay', 'loadMetaProfile', 'purchaseMetaUpgrade', 'composeRunStartStats']) {
    assert.ok(source.includes(token), `missing integration token ${token}`);
  }
});

test('results offer same-condition retry and lobby return instead of one forced restart path', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/ui/results.ts', import.meta.url), 'utf8');
  assert.ok(source.includes('같은 조건으로 재도전'));
  assert.ok(source.includes('로비로 돌아가기'));
});
