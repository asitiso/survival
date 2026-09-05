import type { HeroId } from '../game/hero-profiles.js';
import type { SnapshotStorage } from './run-snapshot.js';
import type { ThreatLevel } from './threat-level.js';
import type { MapId } from '../game/map-layouts.js';
import type { BuildArchetype } from '../game/endless/build-overdrive.js';
import type { HeroFinalFormId } from '../game/endless/final-form.js';
import { decodeBuildCapsule } from './build-capsule.js';
import { MAX_RUN_DURATION_SECONDS } from './run-duration.js';

export interface RunHistoryEntry {
  runCode:string;
  heroId:HeroId;
  seconds:number;
  threat:ThreatLevel;
  score:number;
  mapId?:MapId;
  bosses?:number;
  archetype?:BuildArchetype;
  finalForm?:HeroFinalFormId;
  buildCapsule?:string;
}

const KEY='arcane-last-stand.run-history.v1';
const HERO_IDS=new Set<HeroId>(['arkan','seria','kain','edric']);
const MAP_IDS=new Set<MapId>(['ruinedGate','frozenFen','crystalQuarry']);
const ARCHETYPES=new Set<BuildArchetype>(['burst','cycle','domain','fortress']);
const FINAL_FORMS=new Set<HeroFinalFormId>(['solar-sovereign','phoenix-lord','volcanic-archon','absolute-empress','winter-warden','crystal-oracle','thunder-tyrant','tempest-runner','storm-oracle','radiant-king','oath-guardian','light-pilgrim']);
function safeEntry(raw:unknown):RunHistoryEntry|null {
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) return null;
  const r=raw as Record<string,unknown>;
  if (typeof r.runCode!=='string' || !r.runCode.startsWith('ARC-') || !HERO_IDS.has(r.heroId as HeroId)) return null;
  const seconds=Number(r.seconds), threat=Number(r.threat), score=Number(r.score);
  if (![seconds,threat,score].every(Number.isFinite)) return null;
  return { runCode:r.runCode.slice(0,24), heroId:r.heroId as HeroId, seconds:Math.max(0,Math.min(MAX_RUN_DURATION_SECONDS,seconds)), threat:Math.max(0,Math.min(5,Math.floor(threat))) as ThreatLevel, score:Math.max(0,Math.floor(score)),
    ...(MAP_IDS.has(r.mapId as MapId)?{mapId:r.mapId as MapId}:{}),
    ...(Number.isFinite(Number(r.bosses))?{bosses:Math.max(0,Math.min(999,Math.floor(Number(r.bosses))))}:{}),
    ...(ARCHETYPES.has(r.archetype as BuildArchetype)?{archetype:r.archetype as BuildArchetype}:{}),
    ...(FINAL_FORMS.has(r.finalForm as HeroFinalFormId)?{finalForm:r.finalForm as HeroFinalFormId}:{}),
    ...(typeof r.buildCapsule==='string' && decodeBuildCapsule(r.buildCapsule)?{buildCapsule:r.buildCapsule}:{}),
  };
}
export function loadRunHistory(storage:SnapshotStorage):RunHistoryEntry[] {
  try {
    const raw=storage.getItem(KEY); if (!raw) return [];
    const parsed=JSON.parse(raw); if (!Array.isArray(parsed)) return [];
    return parsed.map(safeEntry).filter((v):v is RunHistoryEntry=>Boolean(v)).slice(0,5);
  } catch { return []; }
}
export function appendRunHistory(storage:SnapshotStorage, entry:RunHistoryEntry):RunHistoryEntry[] {
  const safe=safeEntry(entry); if (!safe) return loadRunHistory(storage);
  const next=[safe,...loadRunHistory(storage).filter((item)=>item.runCode!==safe.runCode)].slice(0,5);
  try { storage.setItem(KEY,JSON.stringify(next)); } catch { /* optional */ }
  return next;
}
