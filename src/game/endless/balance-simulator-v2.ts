import { clamp } from '../../core/math.js';

function roundTo(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
import type { DeviceClass } from './types.js';
import { getAscensionModifiers, getAscensionTier } from './ascension.js';
import { evaluatePerformanceBudget, type PerformanceBudget } from './performance-budget.js';

export interface BalanceSimulationInput {
  threat?: number;
  deviceClass?: DeviceClass;
}

export interface BalanceCheckpoint {
  minute: number;
  threat: number;
  ascensionTier: number;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  spawnBudgetMultiplier: number;
  eliteBudgetMultiplier: number;
  expectedEnemyBudget: number;
  expectedProjectileBudget: number;
  expectedEffectBudget: number;
  expectedGoldPerMinute: number;
  expectedHeroLevel: number;
  contractFeasible: boolean;
  withinPerformanceGuard: boolean;
  performanceBudget: PerformanceBudget;
}

export interface BalanceSimulationResult {
  checkpoints: BalanceCheckpoint[];
  ascensionXGuard: BalanceCheckpoint;
}

const CHECKPOINTS = [10, 20, 30, 45, 60, 90] as const;

function simulateCheckpoint(minute: number, threatInput: number, deviceClass: DeviceClass, forcedAscensionTier?: number): BalanceCheckpoint {
  const threat = clamp(threatInput, 0, 5);
  const ascensionTier = forcedAscensionTier ?? getAscensionTier(minute * 60_000);
  const ascension = getAscensionModifiers(ascensionTier);
  const budget = evaluatePerformanceBudget({ deviceClass, threat, ascensionTier });
  const runPressure = 1 + threat * 0.11 + Math.min(0.55, minute / 180);

  // Simulator models *active* entities/effects, not spawn requests. Values are clamped to
  // the runtime caps so a higher difficulty increases composition quality before object count.
  const enemyDemand = Math.round((52 + minute * 1.65) * runPressure * ascension.spawnBudgetMultiplier);
  const projectileDemand = Math.round((28 + minute * 0.72) * (1 + threat * 0.06) * (1 + ascensionTier * 0.018));
  const effectDemand = Math.round((20 + minute * 0.38) * (1 + threat * 0.04) * (1 + ascensionTier * 0.012));

  const expectedEnemyBudget = Math.min(budget.enemyLogicCap, enemyDemand);
  const expectedProjectileBudget = Math.min(budget.projectileCap, projectileDemand);
  const expectedEffectBudget = Math.min(budget.effectCap, effectDemand);

  const expectedKillsPerSecond = Math.max(1.25, expectedEnemyBudget / 27);
  const toughestKillContract = Math.min(120, 30 + (threat + ascensionTier * 0.4) * 6);
  const killCapacityIn45Seconds = expectedKillsPerSecond * 45;
  const contractFeasible = toughestKillContract <= killCapacityIn45Seconds;
  const withinPerformanceGuard =
    expectedEnemyBudget <= budget.enemyLogicCap &&
    expectedProjectileBudget <= budget.projectileCap &&
    expectedEffectBudget <= budget.effectCap;

  return {
    minute,
    threat,
    ascensionTier,
    enemyHealthMultiplier: roundTo(ascension.enemyHealthMultiplier),
    enemyDamageMultiplier: roundTo(ascension.enemyDamageMultiplier),
    spawnBudgetMultiplier: roundTo(ascension.spawnBudgetMultiplier),
    eliteBudgetMultiplier: roundTo(ascension.eliteBudgetMultiplier),
    expectedEnemyBudget,
    expectedProjectileBudget,
    expectedEffectBudget,
    expectedGoldPerMinute: Math.round((55 + minute * 4.5) * (1 + threat * 0.07) * ascension.goldMultiplier),
    expectedHeroLevel: Math.max(1, Math.round(1 + Math.pow(minute, 0.82) * 2.1)),
    contractFeasible,
    withinPerformanceGuard,
    performanceBudget: budget,
  };
}

export function simulateBalanceV2(input: BalanceSimulationInput = {}): BalanceSimulationResult {
  const threat = input.threat ?? 5;
  const deviceClass = input.deviceClass ?? 'mid';
  const checkpoints = CHECKPOINTS.map((minute) => simulateCheckpoint(minute, threat, deviceClass));
  // Tier X is intentionally tested independently of wall-clock because endless runs can stay
  // numerically capped forever after reaching X.
  const ascensionXGuard = simulateCheckpoint(120, threat, deviceClass, 10);
  return { checkpoints, ascensionXGuard };
}
