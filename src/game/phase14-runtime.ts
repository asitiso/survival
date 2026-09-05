import type { ThreatLevelModifiers } from '../domain/threat-level.js';
import type { RegularEnemyWeights } from './threat-directives.js';

export interface ExistingEnemyPressure {
  enemySpeedMultiplier: number;
  spawnPressureMultiplier: number;
  eliteIntervalMultiplier: number;
  regularWeights?: RegularEnemyWeights | undefined;
}

export interface ThreatComposedPressure extends ExistingEnemyPressure {
  bossVariantBonus: 0 | 1 | 2;
}

export function composeThreatPressure(base: ExistingEnemyPressure, threat: ThreatLevelModifiers): ThreatComposedPressure {
  return {
    enemySpeedMultiplier: base.enemySpeedMultiplier * threat.enemySpeedMultiplier,
    spawnPressureMultiplier: base.spawnPressureMultiplier * threat.spawnPressureMultiplier,
    eliteIntervalMultiplier: base.eliteIntervalMultiplier * threat.eliteIntervalMultiplier,
    ...(base.regularWeights ? { regularWeights: base.regularWeights } : {}),
    bossVariantBonus: threat.bossVariantBonus,
  };
}
