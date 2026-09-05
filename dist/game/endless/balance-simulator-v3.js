import { clamp } from '../../core/math.js';
import { getAscensionModifiers, getAscensionTier } from './ascension.js';
import { evaluatePerformanceBudget } from './performance-budget.js';
const CHECKPOINTS = [10, 20, 30, 45, 60, 90, 120, 180];
function round(value, digits = 3) { const f = 10 ** digits; return Math.round(value * f) / f; }
function checkpoint(minute, threatInput, deviceClass, forcedTier) {
    const threat = clamp(threatInput, 0, 5);
    const ascensionTier = forcedTier ?? getAscensionTier(minute * 60_000);
    const ascension = getAscensionModifiers(ascensionTier);
    const budget = evaluatePerformanceBudget({ deviceClass, threat, ascensionTier });
    const latePressure = 1 + threat * .1 + Math.min(.65, minute / 240);
    const enemyDemand = Math.round((55 + minute * 1.8) * latePressure * ascension.spawnBudgetMultiplier);
    const projectileDemand = Math.round((28 + minute * .8) * (1 + threat * .055) * (1 + ascensionTier * .02));
    const effectDemand = Math.round((20 + minute * .42) * (1 + threat * .04) * (1 + ascensionTier * .014));
    const expectedEnemyBudget = Math.min(budget.enemyLogicCap, enemyDemand);
    const expectedProjectileBudget = Math.min(budget.projectileCap, projectileDemand);
    const expectedEffectBudget = Math.min(budget.effectCap, effectDemand);
    const killCapacity = Math.max(1.25, expectedEnemyBudget / 28) * 45;
    const target = Math.min(120, 30 + (threat + ascensionTier * .4) * 6);
    return {
        minute, threat, ascensionTier,
        enemyHealthMultiplier: round(ascension.enemyHealthMultiplier),
        enemyDamageMultiplier: round(ascension.enemyDamageMultiplier),
        expectedEnemyBudget, expectedProjectileBudget, expectedEffectBudget,
        expectedGoldPerMinute: Math.round((60 + minute * 4.8) * (1 + threat * .065) * ascension.goldMultiplier),
        expectedHeroLevel: Math.max(1, Math.round(1 + Math.pow(minute, .82) * 2.1)),
        mythicEligible: minute >= 60 && threat >= 4,
        contractFeasible: target <= killCapacity,
        withinPerformanceGuard: expectedEnemyBudget <= budget.enemyLogicCap && expectedProjectileBudget <= budget.projectileCap && expectedEffectBudget <= budget.effectCap,
        performanceBudget: budget,
    };
}
export function simulateBalanceV3(input = {}) {
    const threat = input.threat ?? 5;
    const deviceClass = input.deviceClass ?? 'mid';
    return {
        checkpoints: CHECKPOINTS.map((minute) => checkpoint(minute, threat, deviceClass)),
        ascensionXGuard: checkpoint(180, threat, deviceClass, 10),
    };
}
