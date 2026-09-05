export interface ArcaneShardRunInput {
  seconds: number;
  bosses: number;
  danger: number;
  kills: number;
  threatLevel?: number | undefined;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'arcane-last-stand.shards';

export function calculateArcaneShards(input: ArcaneShardRunInput): number {
  const seconds = Math.max(0, Number.isFinite(input.seconds) ? input.seconds : 0);
  const bosses = Math.max(0, Number.isFinite(input.bosses) ? Math.floor(input.bosses) : 0);
  const danger = Math.max(1, Number.isFinite(input.danger) ? Math.floor(input.danger) : 1);
  const kills = Math.max(0, Number.isFinite(input.kills) ? Math.floor(input.kills) : 0);
  const survivalReward = Math.floor(seconds / 60) * 2;
  const bossReward = bosses * 8;
  const dangerReward = Math.max(0, danger - 1) * 2;
  const killReward = Math.floor(kills / 500);
  const threat = Math.max(0, Math.min(5, Math.floor(Number.isFinite(input.threatLevel) ? input.threatLevel ?? 0 : 0)));
  const threatMultiplier = 1 + threat * 0.17;
  return Math.max(1, Math.floor((survivalReward + bossReward + dangerReward + killReward) * threatMultiplier));
}

export function loadArcaneShards(storage: KeyValueStorage): number {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return 0;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.floor(value);
  } catch {
    return 0;
  }
}

export function saveArcaneShards(storage: KeyValueStorage, amount: number): void {
  try {
    const safe = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    storage.setItem(STORAGE_KEY, String(safe));
  } catch {
    // Storage can be unavailable in privacy/sandbox modes; gameplay still continues.
  }
}
