import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLeaderboardEntries, leaderboardComparison, rankLeaderboard } from '../dist/domain/leaderboard.js';

const entry = (overrides = {}) => ({
  displayName: '마도사',
  heroId: 'arkan',
  survivedSeconds: 300,
  level: 10,
  kills: 50,
  threatLevel: 0,
  endedAt: '2026-09-13T00:00:00.000Z',
  ...overrides,
});

test('leaderboard ranks survival first, then kills, level, and earlier completion', () => {
  const ranked = rankLeaderboard([
    entry({ displayName: 'later', survivedSeconds: 300, kills: 50, level: 10, endedAt: '2026-09-13T00:02:00.000Z' }),
    entry({ displayName: 'kills', survivedSeconds: 300, kills: 51 }),
    entry({ displayName: 'seconds', survivedSeconds: 301, kills: 1 }),
    entry({ displayName: 'level', survivedSeconds: 300, kills: 50, level: 11 }),
    entry({ displayName: 'earlier', survivedSeconds: 300, kills: 50, level: 10, endedAt: '2026-09-13T00:01:00.000Z' }),
  ]);

  assert.deepEqual(ranked.map(({ rank, displayName }) => [rank, displayName]), [
    [1, 'seconds'], [2, 'kills'], [3, 'level'], [4, 'earlier'], [5, 'later'],
  ]);
  assert.ok(compareLeaderboardEntries(ranked[0], ranked[1]) < 0);
});

test('leaderboard comparison reports the player rank and the next attainable survival gap', () => {
  const mine = entry({ displayName: '나', survivedSeconds: 300, kills: 45, level: 9 });
  const comparison = leaderboardComparison([
    entry({ displayName: '1위', survivedSeconds: 420, kills: 1 }),
    entry({ displayName: '바로 위', survivedSeconds: 330, kills: 1 }),
    entry({ displayName: '아래', survivedSeconds: 299, kills: 99 }),
  ], mine);

  assert.deepEqual(comparison, { rank: 3, leaderGapSeconds: 120, nextRankGapSeconds: 30 });
});

test('leaderboard comparison keeps a zero second gap for score tie-breakers', () => {
  const mine = entry({ survivedSeconds: 300, kills: 40, level: 10 });
  const comparison = leaderboardComparison([
    entry({ survivedSeconds: 300, kills: 41, level: 1 }),
  ], mine);

  assert.equal(comparison?.rank, 2);
  assert.equal(comparison?.nextRankGapSeconds, 0);
});
