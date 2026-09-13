import type { HeroId } from '../game/hero-profiles.js';
import { clampThreatLevel, type ThreatLevel } from '../domain/threat-level.js';
import type { LeaderboardEntry } from '../domain/leaderboard.js';
import { supabaseClient } from './supabase-client.js';

export interface CloudRunRecord {
  runKey: string;
  heroId: HeroId;
  survivedSeconds: number;
  level: number;
  kills: number;
  goldEarned: number;
  bossesKilled: number;
  threatLevel: ThreatLevel;
}

interface RunHistoryClient {
  from(table: 'run_records'): {
    upsert(row: Record<string, unknown>, options: { onConflict: string }): PromiseLike<{ error: unknown | null }>;
    select(columns: string): {
      eq(column: string, value: unknown): {
        order(column: string, options: { ascending: boolean }): {
          limit(limit: number): PromiseLike<{ data: unknown; error: unknown | null }>;
        };
      };
    };
  };
  rpc(name: 'get_leaderboard', args: { p_threat_level: ThreatLevel; p_limit: number }): PromiseLike<{ data: unknown; error: unknown | null }>;
}

export class CloudRunHistory {
  constructor(private readonly client: () => RunHistoryClient | null = defaultRunHistoryClient) {}

  async save(userId: string | null, record: CloudRunRecord): Promise<void> {
    const supabase = this.client();
    if (!supabase || !userId) return;
    const { error } = await supabase.from('run_records').upsert({
      user_id: userId,
      run_key: record.runKey,
      hero_id: record.heroId,
      survived_seconds: Math.max(0, Math.floor(record.survivedSeconds)),
      level: Math.max(1, Math.floor(record.level)),
      kills: Math.max(0, Math.floor(record.kills)),
      gold_earned: Math.max(0, Math.floor(record.goldEarned)),
      bosses_killed: Math.max(0, Math.floor(record.bossesKilled)),
      threat_level: clampThreatLevel(record.threatLevel),
    }, { onConflict: 'user_id,run_key' });
    if (error) throw new Error('Failed to save cloud run history');
  }

  async loadLeaderboard(threatLevel: ThreatLevel, limit = 5): Promise<LeaderboardEntry[]> {
    const supabase = this.client();
    if (!supabase) return [];
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_threat_level: clampThreatLevel(threatLevel),
      p_limit: Math.max(1, Math.min(20, Math.floor(limit))),
    });
    if (error || !Array.isArray(data)) return [];
    return data.map((row) => leaderboardEntry(row)).filter((entry): entry is LeaderboardEntry => entry !== null);
  }

  async loadMine(userId: string | null, threatLevel: ThreatLevel): Promise<LeaderboardEntry | null> {
    const supabase = this.client();
    if (!supabase || !userId) return null;
    const { data, error } = await supabase.from('run_records').select('hero_id,survived_seconds,level,kills,threat_level,ended_at')
      .eq('user_id', userId)
      .order('survived_seconds', { ascending: false })
      .limit(50);
    if (error || !Array.isArray(data)) return null;
    return data
      .map((row) => leaderboardEntry(row))
      .filter((entry): entry is LeaderboardEntry => entry !== null)
      .filter((entry) => entry.threatLevel === clampThreatLevel(threatLevel))
      .sort((left, right) => right.survivedSeconds - left.survivedSeconds || right.kills - left.kills || right.level - left.level)[0] ?? null;
  }
}

function defaultRunHistoryClient(): RunHistoryClient | null {
  return supabaseClient() as unknown as RunHistoryClient | null;
}

function leaderboardEntry(value: unknown): LeaderboardEntry | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const heroId = row.hero_id;
  if (heroId !== 'arkan' && heroId !== 'seria' && heroId !== 'kain' && heroId !== 'edric') return null;
  const survivedSeconds = integer(row.survived_seconds, 0);
  const level = integer(row.level, 1);
  const kills = integer(row.kills, 0);
  const endedAt = typeof row.ended_at === 'string' ? row.ended_at : '';
  if (!endedAt) return null;
  return {
    displayName: typeof row.display_name === 'string' && row.display_name.trim() ? row.display_name.trim() : '나',
    heroId,
    survivedSeconds,
    level,
    kills,
    threatLevel: clampThreatLevel(typeof row.threat_level === 'number' ? row.threat_level : Number(row.threat_level)),
    endedAt,
  };
}

function integer(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(Number(value))) : fallback;
}
