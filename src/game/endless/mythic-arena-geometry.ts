import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';

export type MythicArenaGeometryShape = 'ring'|'pockets'|'corridor'|'orbit'|'cross'|'clock';
export type MythicArenaGeometryId = 'solar-ring'|'brood-pockets'|'iron-corridor'|'void-orbit'|'twin-cross'|'broken-clock';

export interface MythicArenaGeometryProfile {
  id: MythicArenaGeometryId;
  shape: MythicArenaGeometryShape;
  placementRadius: number;
  rotationRate: number;
  safeGapRadians: number;
  pressure: number;
}

interface BaseGeometry extends MythicArenaGeometryProfile {}

const BASE:Record<BossArchetype,BaseGeometry>={
  inferno:{id:'solar-ring',shape:'ring',placementRadius:176,rotationRate:.32,safeGapRadians:.42,pressure:1.12},
  summoner:{id:'brood-pockets',shape:'pockets',placementRadius:210,rotationRate:-.18,safeGapRadians:.48,pressure:1.08},
  juggernaut:{id:'iron-corridor',shape:'corridor',placementRadius:128,rotationRate:0,safeGapRadians:.58,pressure:1.14},
  abyssWitch:{id:'void-orbit',shape:'orbit',placementRadius:232,rotationRate:.72,safeGapRadians:.46,pressure:1.1},
  twinMaw:{id:'twin-cross',shape:'cross',placementRadius:154,rotationRate:-.44,safeGapRadians:.38,pressure:1.16},
  timeEater:{id:'broken-clock',shape:'clock',placementRadius:196,rotationRate:-.62,safeGapRadians:.52,pressure:1.09},
};

export const MYTHIC_ARENA_GEOMETRY_IDS:readonly MythicArenaGeometryId[]=['solar-ring','brood-pockets','iron-corridor','void-orbit','twin-cross','broken-clock'];

export function mythicArenaGeometryProfile(archetype:BossArchetype,destroyedWeakpointRatio:number):MythicArenaGeometryProfile{
  const base=BASE[archetype];
  const relief=clamp(Number.isFinite(destroyedWeakpointRatio)?destroyedWeakpointRatio:0,0,1);
  return {
    ...base,
    placementRadius:clamp(base.placementRadius*(1-relief*.12),80,260),
    rotationRate:clamp(base.rotationRate*(1-relief*.35),-1.2,1.2),
    safeGapRadians:clamp(base.safeGapRadians+relief*.34,.32,1.05),
    pressure:clamp(base.pressure-relief*.28,.72,1.18),
  };
}
