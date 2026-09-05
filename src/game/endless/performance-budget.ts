import { clamp } from '../../core/math.js';
import type { DeviceClass } from './types.js';

export type VisualQuality = 'full' | 'reduced' | 'minimal';

export interface PerformanceBudgetInput {
  deviceClass: DeviceClass;
  threat: number;
  ascensionTier: number;
}

export interface PerformanceBudget {
  deviceClass: DeviceClass;
  enemyLogicCap: number;
  projectileCap: number;
  effectCap: number;
  fieldNodeCap: number;
  simulationEventCap: number;
  visualQuality: VisualQuality;
  pressure: number;
}

interface BaseBudget {
  enemyLogicCap: number;
  projectileCap: number;
  effectCap: number;
  fieldNodeCap: number;
}

const BASE: Record<DeviceClass, BaseBudget> = {
  low: { enemyLogicCap: 220, projectileCap: 90, effectCap: 60, fieldNodeCap: 4 },
  mid: { enemyLogicCap: 320, projectileCap: 150, effectCap: 100, fieldNodeCap: 8 },
  high: { enemyLogicCap: 420, projectileCap: 220, effectCap: 150, fieldNodeCap: 12 },
};

export function evaluatePerformanceBudget(input: PerformanceBudgetInput): PerformanceBudget {
  const base = BASE[input.deviceClass];
  const threatPressure = clamp(input.threat, 0, 5) / 5;
  const ascensionPressure = clamp(input.ascensionTier, 0, 10) / 10;
  const pressure = clamp(threatPressure * 0.4 + ascensionPressure * 0.6, 0, 1);

  // Combat logic is preserved first. Cosmetic/effect density is sacrificed earlier.
  const projectileCap = Math.max(24, Math.floor(base.projectileCap * (1 - pressure * 0.1)));
  const effectCap = Math.max(18, Math.floor(base.effectCap * (1 - pressure * 0.4)));
  const fieldNodeCap = Math.max(2, Math.floor(base.fieldNodeCap * (1 - pressure * 0.5)));

  const visualQuality: VisualQuality = pressure >= 0.72 ? 'minimal' : pressure >= 0.38 ? 'reduced' : 'full';

  return {
    deviceClass: input.deviceClass,
    enemyLogicCap: base.enemyLogicCap,
    projectileCap,
    effectCap,
    fieldNodeCap,
    simulationEventCap: base.enemyLogicCap * 2,
    visualQuality,
    pressure,
  };
}
