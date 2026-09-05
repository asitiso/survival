import type { KeyValueStorage } from './meta-rewards.js';
import { clampThreatLevel, type ThreatLevel } from './threat-level.js';

export interface ThreatProfile {
  version: 1;
  unlocked: ThreatLevel;
  selected: ThreatLevel;
}

const KEY = 'arcane-last-stand.threat-profile';

export function defaultThreatProfile(): ThreatProfile {
  return { version: 1, unlocked: 0, selected: 0 };
}

function sanitize(raw: unknown): ThreatProfile {
  const source = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
  const unlocked = clampThreatLevel(Number(source.unlocked ?? 0));
  const selected = Math.min(unlocked, clampThreatLevel(Number(source.selected ?? 0))) as ThreatLevel;
  return { version: 1, unlocked, selected };
}

export function loadThreatProfile(storage: KeyValueStorage): ThreatProfile {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return defaultThreatProfile();
    return sanitize(JSON.parse(raw));
  } catch {
    return defaultThreatProfile();
  }
}

export function saveThreatProfile(storage: KeyValueStorage, profile: ThreatProfile): void {
  try { storage.setItem(KEY, JSON.stringify(sanitize(profile))); }
  catch { /* optional persistence */ }
}

export function selectThreatLevel(profile: ThreatProfile, requested: number): ThreatProfile {
  const safe = sanitize(profile);
  return { ...safe, selected: Math.min(safe.unlocked, clampThreatLevel(requested)) as ThreatLevel };
}

export function unlockThreatLevel(profile: ThreatProfile, requestedUnlocked: number): ThreatProfile {
  const safe = sanitize(profile);
  const unlocked = Math.max(safe.unlocked, clampThreatLevel(requestedUnlocked)) as ThreatLevel;
  return { ...safe, unlocked, selected: Math.min(unlocked, safe.selected) as ThreatLevel };
}
