import { directorSnapshot } from '../domain/director.js';
import { xpNeededForLevel } from '../domain/progression.js';
import { clampThreatLevel, threatLevelModifiers, type ThreatLevel } from '../domain/threat-level.js';

export const BALANCE_CHECKPOINTS = [600, 1200, 1800, 2700] as const;

export interface BalanceProjection {
  seconds: number;
  danger: number;
  estimatedLevel: number;
  xpToNextLevel: number;
  enemyBudget: number;
  spawnInterval: number;
  spawnPressure: number;
  elitePressure: number;
  enemySpeedMultiplier: number;
  bossVariantPressure: number;
  goldPerMinute: number;
  shardRewardMultiplier: number;
  heroDpsBand: { min: number; max: number };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function estimatedLevelAt(seconds: number): number {
  const time = Math.max(0, seconds);
  return Math.max(1, Math.min(140, Math.floor(4 + Math.sqrt(time) * 1.18 + time / 190)));
}

function heroDpsBand(level: number): { min: number; max: number } {
  const baseline = 72 + level * 8.2 + Math.pow(level, 1.18) * 3.4;
  return {
    min: Math.round(baseline * 0.78),
    max: Math.round(baseline * 1.48),
  };
}

export function projectBalanceAt(seconds: number, threat: number): BalanceProjection {
  const time = Math.max(0, seconds);
  const safeThreat = clampThreatLevel(threat);
  const director = directorSnapshot(time);
  const threatMods = threatLevelModifiers(safeThreat);
  const estimatedLevel = estimatedLevelAt(time);
  const timePressure = 1 + Math.min(0.22, time / 9000);
  const spawnPressure = clamp(threatMods.spawnPressureMultiplier * timePressure, 1, 1.6);
  const elitePressure = clamp((1 / threatMods.eliteIntervalMultiplier) * (1 + Math.min(0.32, time / 7200)), 1, 2.2);
  const bossVariantPressure = clamp(Math.floor(time / 900) + threatMods.bossVariantBonus, 0, 4);
  const goldPerMinute = Math.round(clamp(72 + director.danger * 24 + Math.sqrt(time) * 3.7, 40, 2500));

  return {
    seconds: time,
    danger: director.danger,
    estimatedLevel,
    xpToNextLevel: xpNeededForLevel(estimatedLevel),
    enemyBudget: director.enemyBudget,
    spawnInterval: director.spawnInterval,
    spawnPressure,
    elitePressure,
    enemySpeedMultiplier: threatMods.enemySpeedMultiplier,
    bossVariantPressure,
    goldPerMinute,
    shardRewardMultiplier: threatMods.shardMultiplier,
    heroDpsBand: heroDpsBand(estimatedLevel),
  };
}

export function balanceProjectionSeries(threat: ThreatLevel | number): BalanceProjection[] {
  return BALANCE_CHECKPOINTS.map((seconds) => projectBalanceAt(seconds, threat));
}
