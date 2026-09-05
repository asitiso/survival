import type { HeroId } from '../game/hero-profiles.js';
import type { MapId } from '../game/map-layouts.js';
import { clampThreatLevel, type ThreatLevel } from './threat-level.js';
import type { KeyValueStorage } from './meta-rewards.js';
import { decodeBuildCapsule } from './build-capsule.js';

export interface RunRecordInput {
  heroId: HeroId;
  mapId: MapId;
  threatLevel: number;
  seconds: number;
  kills: number;
  bosses: number;
  danger: number;
  tacticalBonus?: number | undefined;
  buildCapsule?: string | undefined;
}

export interface RunRecordSummary extends RunRecordInput {
  threatLevel: ThreatLevel;
  score: number;
}

export interface RunRecordsState {
  version: 1;
  bests: Record<string, RunRecordSummary>;
  recent: RunRecordSummary[];
}

const KEY = 'arcane-last-stand.run-records';

function safeInt(value: number): number { return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)); }
function key(heroId: HeroId, mapId: MapId, threatLevel: number): string { return `${heroId}|${mapId}|${clampThreatLevel(threatLevel)}`; }

export function calculateRunScore(input: RunRecordInput): number {
  const seconds = safeInt(input.seconds);
  const kills = safeInt(input.kills);
  const bosses = safeInt(input.bosses);
  const danger = Math.max(1, safeInt(input.danger));
  const threat = clampThreatLevel(input.threatLevel);
  const tacticalBonus = Math.min(12000, safeInt(input.tacticalBonus ?? 0));
  return seconds * 3 + kills * 2 + bosses * 950 + Math.max(0, danger - 1) * 180 + threat * 700 + tacticalBonus;
}

export function defaultRunRecords(): RunRecordsState { return { version: 1, bests: {}, recent: [] }; }

function summary(input: RunRecordInput): RunRecordSummary {
  const clean: RunRecordInput = {
    heroId: input.heroId,
    mapId: input.mapId,
    threatLevel: clampThreatLevel(input.threatLevel),
    seconds: safeInt(input.seconds),
    kills: safeInt(input.kills),
    bosses: safeInt(input.bosses),
    danger: Math.max(1, safeInt(input.danger)),
    ...(safeInt(input.tacticalBonus ?? 0) > 0 ? { tacticalBonus: Math.min(12000, safeInt(input.tacticalBonus ?? 0)) } : {}),
    ...(typeof input.buildCapsule === 'string' && decodeBuildCapsule(input.buildCapsule) ? { buildCapsule: input.buildCapsule } : {}),
  };
  return { ...clean, threatLevel: clampThreatLevel(clean.threatLevel), score: calculateRunScore(clean) };
}

export function recordRun(state: RunRecordsState, input: RunRecordInput): { state: RunRecordsState; summary: RunRecordSummary; newRecord: boolean } {
  const nextSummary = summary(input);
  const recordKey = key(nextSummary.heroId, nextSummary.mapId, nextSummary.threatLevel);
  const previous = state.bests[recordKey];
  const newRecord = !previous || nextSummary.score > previous.score;
  const bests = newRecord ? { ...state.bests, [recordKey]: nextSummary } : { ...state.bests };
  return {
    state: { version: 1, bests, recent: [nextSummary, ...state.recent].slice(0, 10) },
    summary: nextSummary,
    newRecord,
  };
}

export function bestRecordFor(state: RunRecordsState, heroId: HeroId, mapId: MapId, threatLevel: number): RunRecordSummary | null {
  return state.bests[key(heroId, mapId, threatLevel)] ?? null;
}

function isHero(value: unknown): value is HeroId { return value === 'arkan' || value === 'seria' || value === 'kain' || value === 'edric'; }
function isMap(value: unknown): value is MapId { return value === 'ruinedGate' || value === 'frozenFen' || value === 'crystalQuarry'; }
function sanitizeSummary(raw: unknown): RunRecordSummary | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const source = raw as Record<string, unknown>;
  if (!isHero(source.heroId) || !isMap(source.mapId)) return null;
  return summary({
    heroId: source.heroId,
    mapId: source.mapId,
    threatLevel: Number(source.threatLevel ?? 0),
    seconds: Number(source.seconds ?? 0),
    kills: Number(source.kills ?? 0),
    bosses: Number(source.bosses ?? 0),
    danger: Number(source.danger ?? 1),
    tacticalBonus: Number(source.tacticalBonus ?? 0),
    ...(typeof source.buildCapsule === 'string' ? { buildCapsule:source.buildCapsule } : {}),
  });
}

export function loadRunRecords(storage: KeyValueStorage): RunRecordsState {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return defaultRunRecords();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const recentRaw = Array.isArray(parsed.recent) ? parsed.recent : [];
    const recent = recentRaw.map(sanitizeSummary).filter((item): item is RunRecordSummary => item !== null).slice(0, 10);
    const bests: Record<string, RunRecordSummary> = {};
    const bestRaw = typeof parsed.bests === 'object' && parsed.bests !== null ? parsed.bests as Record<string, unknown> : {};
    for (const value of Object.values(bestRaw)) {
      const item = sanitizeSummary(value);
      if (item) bests[key(item.heroId, item.mapId, item.threatLevel)] = item;
    }
    return { version: 1, bests, recent };
  } catch {
    return defaultRunRecords();
  }
}

export function saveRunRecords(storage: KeyValueStorage, state: RunRecordsState): void {
  try { storage.setItem(KEY, JSON.stringify({ version: 1, bests: state.bests, recent: state.recent.slice(0, 10) })); }
  catch { /* optional persistence */ }
}
