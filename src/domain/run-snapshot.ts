import type { EquipmentState, EquippedItem } from './types.js';
import type { HeroId } from '../game/hero-profiles.js';
import type { RunTraitId } from '../game/run-traits.js';
import type { ThreatLevel } from './threat-level.js';
import type { SpellId } from '../game/spells.js';
import type { RelicId } from '../game/relics.js';
import { FUSION_IDS, type FusionId } from '../game/spell-fusions.js';
import type { FatePathId } from '../game/fate-paths.js';
import type { MapId } from '../game/map-layouts.js';
import type { MapEvolutionStage } from '../game/map-evolution.js';
import { restoreExtension, serializeExtension } from '../game/endless/snapshot.js';
import { decodeBuildCapsule } from './build-capsule.js';
import { MAX_RUN_DURATION_SECONDS } from './run-duration.js';

export interface SnapshotStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RunSnapshot {
  version: 1;
  savedAt: number;
  heroId: HeroId;
  traitId: RunTraitId | null;
  threatLevel: ThreatLevel;
  elapsed: number;
  hero: { level: number; xp: number; xpNext: number; hp: number; maxHp: number; coins: number; kills: number };
  coreHp: number;
  spellLevels: Record<SpellId, number>;
  equipment: EquipmentState;
  relic: RelicId | null;
  fusions: FusionId[];
  fateChoices: FatePathId[];
  map: { id: MapId; evolutionStage: MapEvolutionStage };
  progression: { bossesKilled: number; goldEarned: number; shopTokens: number };
  endless?: string;
  replayCapsule?: string;
}

const KEY = 'arcane-last-stand.run-snapshot';
const BACKUP_KEY = 'arcane-last-stand.run-snapshot.backup';
const HERO_IDS = new Set<HeroId>(['arkan', 'seria', 'kain', 'edric']);
const TRAIT_IDS = new Set<RunTraitId>(['destruction','rapidCasting','goldSense','guardianOath','infernalPact','glacialFocus','stormPursuit','bastionVow']);
const RELIC_IDS = new Set<RelicId>(['abyss-eye','chrono-shard','guardian-heart','ember-crown','winter-heart','storm-core','oath-seal','inferno-heart','summoner-sigil','juggernaut-core','phoenix-brand','zero-crystal','storm-crown','citadel-sigil']);
const FATE_IDS = new Set<FatePathId>(['frenzy','golden','guardian']);
const MAP_IDS = new Set<MapId>(['ruinedGate','frozenFen','crystalQuarry']);
const SPELL_IDS: SpellId[] = ['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

function num(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
function int(value: unknown, min: number, max: number): number { return Math.floor(num(value, min, max)); }
function record(value: unknown): Record<string, unknown> { return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}; }

function sanitizeItem(raw: unknown): EquippedItem | null {
  if (raw === null || raw === undefined) return null;
  const o = record(raw);
  const kind = o.kind === 'weapon' || o.kind === 'armor' ? o.kind : null;
  if (!kind || typeof o.id !== 'string' || typeof o.name !== 'string') return null;
  return { id: o.id.slice(0, 64), kind, name: o.name.slice(0, 64), rank: int(o.rank, 1, 5), power: num(o.power, 0, 1000), legendary: o.legendary === true };
}

export function sanitizeRunSnapshot(raw: unknown): RunSnapshot | null {
  const o = record(raw);
  if (o.version !== 1) return null;
  if (!HERO_IDS.has(o.heroId as HeroId)) return null;
  const traitId = o.traitId === null ? null : TRAIT_IDS.has(o.traitId as RunTraitId) ? o.traitId as RunTraitId : null;
  const hero = record(o.hero); const spells = record(o.spellLevels); const equipment = record(o.equipment); const map = record(o.map); const progression = record(o.progression);
  if (!MAP_IDS.has(map.id as MapId)) return null;
  const spellLevels = {} as Record<SpellId, number>;
  for (const id of SPELL_IDS) spellLevels[id] = int(spells[id], 1, 10);
  const fusions = Array.isArray(o.fusions) ? o.fusions.filter((id): id is FusionId => FUSION_IDS.includes(id as FusionId)).slice(0, 2) : [];
  const fateChoices = Array.isArray(o.fateChoices) ? o.fateChoices.filter((id): id is FatePathId => FATE_IDS.has(id as FatePathId)).slice(0, 3) : [];
  const relic = o.relic === null ? null : RELIC_IDS.has(o.relic as RelicId) ? o.relic as RelicId : null;
  const safe: RunSnapshot = {
    version: 1,
    savedAt: int(o.savedAt, 0, Number.MAX_SAFE_INTEGER),
    heroId: o.heroId as HeroId,
    traitId,
    threatLevel: int(o.threatLevel, 0, 5) as ThreatLevel,
    elapsed: num(o.elapsed, 0, MAX_RUN_DURATION_SECONDS),
    hero: {
      level: int(hero.level, 1, 999), xp: num(hero.xp, 0, 1e9), xpNext: num(hero.xpNext, 1, 1e9),
      hp: num(hero.hp, 0, 1e6), maxHp: num(hero.maxHp, 1, 1e6), coins: int(hero.coins, 0, 1e9), kills: int(hero.kills, 0, 1e8),
    },
    coreHp: num(o.coreHp, 0, 1e6),
    spellLevels,
    equipment: {
      coins: int(equipment.coins, 0, 1e9), weapon: sanitizeItem(equipment.weapon), armor: sanitizeItem(equipment.armor), healingPotions: int(equipment.healingPotions, 0, 99),
    },
    relic,
    fusions: [...new Set(fusions)].slice(0, 2),
    fateChoices: fateChoices.slice(0, 3),
    map: { id: map.id as MapId, evolutionStage: int(map.evolutionStage, 0, 2) as MapEvolutionStage },
    progression: { bossesKilled: int(progression.bossesKilled, 0, 999), goldEarned: int(progression.goldEarned, 0, 1e9), shopTokens: int(progression.shopTokens, 0, 99) },
    ...(typeof o.endless === 'string'
      ? { endless: serializeExtension(restoreExtension(o.endless.length <= 24_000 ? o.endless : '')) }
      : {}),
    ...(typeof o.replayCapsule === 'string' && o.replayCapsule.length <= 160 && decodeBuildCapsule(o.replayCapsule)
      ? { replayCapsule: o.replayCapsule }
      : {}),
  };
  return safe;
}

function parseStoredRunSnapshot(raw: string | null): RunSnapshot | null {
  if (raw === null) return null;
  try { return sanitizeRunSnapshot(JSON.parse(raw)); } catch { return null; }
}

export function saveRunSnapshot(storage: SnapshotStorage, snapshot: RunSnapshot): void {
  const safe = sanitizeRunSnapshot(snapshot);
  if (!safe) return;
  let previousRaw: string | null = null;
  try { previousRaw = storage.getItem(KEY); } catch { /* primary write can still succeed */ }
  if (parseStoredRunSnapshot(previousRaw)) {
    try { storage.setItem(BACKUP_KEY, previousRaw as string); } catch { /* backup is best-effort */ }
  }
  try { storage.setItem(KEY, JSON.stringify(safe)); } catch { /* keep the previous valid checkpoint */ }
}
export function loadRunSnapshot(storage: SnapshotStorage): RunSnapshot | null {
  let primary: RunSnapshot | null = null;
  try { primary = parseStoredRunSnapshot(storage.getItem(KEY)); } catch { /* isolate primary read failure */ }
  if (primary) return primary;
  try { return parseStoredRunSnapshot(storage.getItem(BACKUP_KEY)); } catch { return null; }
}
export function clearRunSnapshot(storage: SnapshotStorage): void {
  try { storage.removeItem(KEY); } catch { /* isolate primary removal failure */ }
  try { storage.removeItem(BACKUP_KEY); } catch { /* optional */ }
}
