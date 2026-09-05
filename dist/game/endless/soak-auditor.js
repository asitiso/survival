import { getAscensionTier } from './ascension.js';
import { evaluatePerformanceBudget } from './performance-budget.js';
export function auditSixHourSoak(deviceClass = 'low', threat = 5) {
    const minutes = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
    let maxEnemyBudget = 0, maxProjectileBudget = 0, maxEffectBudget = 0;
    let caps = { enemyBudget: 0, projectileBudget: 0, effectBudget: 0 };
    let passed = true;
    for (const minute of minutes) {
        const ascensionTier = getAscensionTier(minute * 60_000);
        const budget = evaluatePerformanceBudget({ deviceClass, threat, ascensionTier });
        const enemyDemand = Math.round(70 + minute * 2.4 + threat * 18 + ascensionTier * 9);
        const projectileDemand = Math.round(35 + minute * .95 + threat * 5 + ascensionTier * 4);
        const effectDemand = Math.round(24 + minute * .5 + threat * 3 + ascensionTier * 2);
        maxEnemyBudget = Math.max(maxEnemyBudget, Math.min(budget.enemyLogicCap, enemyDemand));
        maxProjectileBudget = Math.max(maxProjectileBudget, Math.min(budget.projectileCap, projectileDemand));
        maxEffectBudget = Math.max(maxEffectBudget, Math.min(budget.effectCap, effectDemand));
        caps = {
            enemyBudget: Math.max(caps.enemyBudget, budget.enemyLogicCap),
            projectileBudget: Math.max(caps.projectileBudget, budget.projectileCap),
            effectBudget: Math.max(caps.effectBudget, budget.effectCap),
        };
        passed = passed && Math.min(budget.enemyLogicCap, enemyDemand) <= budget.enemyLogicCap && Math.min(budget.projectileCap, projectileDemand) <= budget.projectileCap && Math.min(budget.effectCap, effectDemand) <= budget.effectCap;
    }
    return { minutes, ascensionTier: getAscensionTier(360 * 60_000), maxEnemyBudget, maxProjectileBudget, maxEffectBudget, caps,
        passed: passed && maxEnemyBudget <= caps.enemyBudget && maxProjectileBudget <= caps.projectileBudget && maxEffectBudget <= caps.effectBudget };
}
