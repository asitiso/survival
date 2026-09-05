import { getAscensionTier } from './ascension.js';
import { evaluatePerformanceBudget } from './performance-budget.js';
const CHECKPOINTS = [240, 300, 360, 480];
const BASE_EFFECT_CAP = { low: 60, mid: 100, high: 150 };
const BASE_PROJECTILE_CAP = { low: 90, mid: 150, high: 220 };
export function auditEightHourRun(deviceClass = 'low', threat = 5) {
    const checkpoints = CHECKPOINTS.map((minute) => {
        const ascensionTier = getAscensionTier(minute * 60_000);
        const budget = evaluatePerformanceBudget({ deviceClass, threat, ascensionTier });
        const enemyDemand = Math.round(110 + minute * 1.85 + threat * 20 + ascensionTier * 10);
        const projectileDemand = Math.round(58 + minute * .72 + threat * 6 + ascensionTier * 5);
        const effectDemand = Math.round(42 + minute * .48 + threat * 4 + ascensionTier * 3);
        const simulatedEnemies = Math.min(enemyDemand, budget.enemyLogicCap);
        const simulatedProjectiles = Math.min(projectileDemand, budget.projectileCap);
        const simulatedEffects = Math.min(effectDemand, budget.effectCap);
        return {
            minute, ascensionTier, enemyDemand, projectileDemand, effectDemand,
            enemyLogicCap: budget.enemyLogicCap, projectileCap: budget.projectileCap, effectCap: budget.effectCap,
            simulatedEnemies, simulatedProjectiles, simulatedEffects, visualQuality: budget.visualQuality,
            withinGuard: simulatedEnemies <= budget.enemyLogicCap && simulatedProjectiles <= budget.projectileCap && simulatedEffects <= budget.effectCap,
        };
    });
    const last = checkpoints.at(-1);
    const effectReduction = 1 - last.effectCap / BASE_EFFECT_CAP[deviceClass];
    const projectileReduction = 1 - last.projectileCap / BASE_PROJECTILE_CAP[deviceClass];
    const presentationFirst = effectReduction > projectileReduction && checkpoints.every((point) => point.enemyLogicCap === checkpoints[0].enemyLogicCap);
    const estimatedTransientEntities = last.simulatedEnemies + last.simulatedProjectiles + last.simulatedEffects;
    return { deviceClass, threat, checkpoints, presentationFirst, estimatedTransientEntities, passed: presentationFirst && checkpoints.every((point) => point.withinGuard) };
}
