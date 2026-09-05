import type { HeroId } from '../game/hero-profiles.js';
import type { MapId } from '../game/map-layouts.js';
import type { RunTraitId } from '../game/run-traits.js';
import type { ThreatLevel } from './threat-level.js';

export interface RetryBlueprintStorage {
  getItem(key:string): string|null;
  setItem(key:string,value:string): void;
  removeItem(key:string): void;
}

export interface RetryBlueprint {
  version:1;
  heroId:HeroId;
  traitId:RunTraitId|null;
  threatLevel:ThreatLevel;
  mapId:MapId;
  seed:number;
}

const KEY='arcane-last-stand.retry-blueprint.v1';
const HERO_IDS=new Set<HeroId>(['arkan','seria','kain','edric']);
const TRAIT_IDS=new Set<RunTraitId>(['destruction','rapidCasting','goldSense','guardianOath','infernalPact','glacialFocus','stormPursuit','bastionVow']);
const MAP_IDS=new Set<MapId>(['ruinedGate','frozenFen','crystalQuarry']);

export function sanitizeRetryBlueprint(raw:unknown):RetryBlueprint|null {
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) return null;
  const r=raw as Record<string,unknown>;
  if (!HERO_IDS.has(r.heroId as HeroId) || !MAP_IDS.has(r.mapId as MapId)) return null;
  const traitId=r.traitId===null ? null : TRAIT_IDS.has(r.traitId as RunTraitId) ? r.traitId as RunTraitId : undefined;
  if (traitId===undefined) return null;
  const threat=Number(r.threatLevel), seed=Number(r.seed);
  if (!Number.isFinite(threat) || threat<0 || threat>5 || !Number.isFinite(seed) || seed<0 || seed>0xffff_ffff) return null;
  return {version:1,heroId:r.heroId as HeroId,traitId,threatLevel:Math.floor(threat) as ThreatLevel,mapId:r.mapId as MapId,seed:Math.floor(seed)>>>0};
}

export function saveRetryBlueprint(storage:RetryBlueprintStorage, blueprint:RetryBlueprint):void {
  try { const safe=sanitizeRetryBlueprint(blueprint); if (safe) storage.setItem(KEY,JSON.stringify(safe)); } catch { /* optional persistence */ }
}
export function loadRetryBlueprint(storage:RetryBlueprintStorage):RetryBlueprint|null {
  try { const raw=storage.getItem(KEY); return raw ? sanitizeRetryBlueprint(JSON.parse(raw)) : null; } catch { return null; }
}
export function clearRetryBlueprint(storage:RetryBlueprintStorage):void { try { storage.removeItem(KEY); } catch { /* optional */ } }
