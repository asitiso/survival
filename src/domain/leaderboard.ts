import type { HeroId } from '../game/hero-profiles.js';
import type { ThreatLevel } from './threat-level.js';

export interface LeaderboardEntry {
  displayName: string;
  heroId: HeroId;
  survivedSeconds: number;
  level: number;
  kills: number;
  threatLevel: ThreatLevel;
  endedAt: string;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
}

export interface LeaderboardComparison {
  rank: number;
  leaderGapSeconds: number;
  nextRankGapSeconds: number | null;
}

export function compareLeaderboardEntries(left: LeaderboardEntry, right: LeaderboardEntry): number {
  if (left.survivedSeconds !== right.survivedSeconds) return right.survivedSeconds - left.survivedSeconds;
  if (left.kills !== right.kills) return right.kills - left.kills;
  if (left.level !== right.level) return right.level - left.level;
  return Date.parse(left.endedAt) - Date.parse(right.endedAt);
}

export function rankLeaderboard(entries: readonly LeaderboardEntry[]): RankedLeaderboardEntry[] {
  return [...entries]
    .sort(compareLeaderboardEntries)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function leaderboardComparison(
  entries: readonly LeaderboardEntry[],
  mine: LeaderboardEntry | null,
): LeaderboardComparison | null {
  if (!mine) return null;
  const ranked = rankLeaderboard(entries);
  const ahead = ranked.filter((entry) => compareLeaderboardEntries(entry, mine) < 0);
  const leader = ranked[0];
  const next = ahead.at(-1);
  return {
    rank: ahead.length + 1,
    leaderGapSeconds: Math.max(0, (leader?.survivedSeconds ?? mine.survivedSeconds) - mine.survivedSeconds),
    nextRankGapSeconds: next ? Math.max(0, next.survivedSeconds - mine.survivedSeconds) : null,
  };
}
