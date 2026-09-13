import type { HeroId } from '../game/hero-profiles.js';
import { supabaseClient } from './supabase-client.js';

export interface CloudRunRecord {
  runKey: string;
  heroId: HeroId;
  survivedSeconds: number;
  level: number;
  kills: number;
  goldEarned: number;
  bossesKilled: number;
}

interface RunHistoryClient {
  from(table: 'run_records'): {
    upsert(row: Record<string, unknown>, options: { onConflict: string }): PromiseLike<{ error: unknown | null }>;
  };
}

export class CloudRunHistory {
  constructor(private readonly client: () => RunHistoryClient | null = supabaseClient) {}

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
    }, { onConflict: 'user_id,run_key' });
    if (error) throw new Error('Failed to save cloud run history');
  }
}
