import { clamp } from '../../core/math.js';
import type { DeviceClass } from './types.js';

export interface AdaptiveDirectorInput { fps:number; enemyCount:number; projectileCount:number; effectCount:number; coreRatio:number; heroHpRatio:number; deviceClass:DeviceClass; ascensionTier:number; }
export interface AdaptiveDirectorOutput { visualDensity:number; projectileVisualDensity:number; compositionPressureMultiplier:number; eliteIntervalMultiplier:number; telemetryPressure:number; }

export function evaluateAdaptiveDirector(input: AdaptiveDirectorInput): AdaptiveDirectorOutput {
  const devicePenalty = input.deviceClass === 'low' ? .22 : input.deviceClass === 'mid' ? .1 : 0;
  const fpsStress = clamp((50 - input.fps) / 30, 0, 1);
  const entityStress = clamp((input.enemyCount - 190) / 130, 0, 1);
  const projectileStress = clamp((input.projectileCount - 80) / 100, 0, 1);
  const effectStress = clamp((input.effectCount - 120) / 160, 0, 1);
  const stress = clamp(devicePenalty + fpsStress * .48 + entityStress * .18 + projectileStress * .12 + effectStress * .16, 0, 1);
  const survival = clamp(Math.min(input.coreRatio, input.heroHpRatio), 0, 1);
  const performanceBoost = input.fps >= 52 && survival >= .78 ? clamp((Math.max(0,input.ascensionTier)-2)*.01, 0, .06) : 0;
  const safetyRelief = survival < .3 ? .04 : survival < .5 ? .02 : 0;
  const compositionPressureMultiplier = clamp(1 + performanceBoost - safetyRelief, .94, 1.08);
  return {
    visualDensity: clamp(1 - stress * .58, .42, 1),
    projectileVisualDensity: clamp(1 - stress * .68, .32, 1),
    compositionPressureMultiplier,
    eliteIntervalMultiplier: clamp(1 / compositionPressureMultiplier, .9, 1.07),
    telemetryPressure: stress,
  };
}
