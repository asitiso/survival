import type { FateModifiers, FatePathId } from './fate-paths.js';
import { fatePathDefinition } from './fate-paths.js';

export interface FatePressureInput {
  enemySpeedMultiplier: number;
  spawnPressureMultiplier: number;
  eliteIntervalMultiplier: number;
  bossVariantBonus: number;
}

export function composeFatePressure<T extends FatePressureInput>(base: T, fate: FateModifiers): T {
  return {
    ...base,
    enemySpeedMultiplier: Math.min(1.9, base.enemySpeedMultiplier * fate.enemySpeedMultiplier),
    spawnPressureMultiplier: Math.min(1.95, base.spawnPressureMultiplier * fate.spawnPressureMultiplier),
    eliteIntervalMultiplier: Math.max(0.55, base.eliteIntervalMultiplier * fate.eliteIntervalMultiplier),
    bossVariantBonus: Math.min(2, base.bossVariantBonus + Math.round(fate.bossVariantBonus)),
  };
}

export function fateRewardMultipliers(fate: FateModifiers): Pick<FateModifiers, 'xpMultiplier' | 'goldMultiplier' | 'shopTokenMultiplier' | 'coreDamageTakenMultiplier' | 'objectiveRewardMultiplier'> {
  return {
    xpMultiplier: fate.xpMultiplier,
    goldMultiplier: fate.goldMultiplier,
    shopTokenMultiplier: fate.shopTokenMultiplier,
    coreDamageTakenMultiplier: fate.coreDamageTakenMultiplier,
    objectiveRewardMultiplier: fate.objectiveRewardMultiplier,
  };
}

export function fateHudSummary(paths: readonly FatePathId[]): string {
  if (paths.length === 0) return '운명 미선택';
  return paths.slice(0, 3).map((id) => fatePathDefinition(id).name.replace('의 길', '')).join(' · ');
}
