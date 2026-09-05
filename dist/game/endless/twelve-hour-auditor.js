import { getAscensionTier } from './ascension.js';
import { advanceMobileFrameGovernor, createDefaultMobileFrameGovernorState, mobileFrameGovernorPolicy } from './mobile-frame-governor.js';
import { evaluatePerformanceBudget } from './performance-budget.js';
const CHECKPOINTS = [480, 600, 720];
const BASE_EFFECT_CAP = { low: 60, mid: 100, high: 150 };
const BASE_PROJECTILE_CAP = { low: 90, mid: 150, high: 220 };
export function auditTwelveHourRun(deviceClass = 'low', threat = 5) {
    let governor = createDefaultMobileFrameGovernorState();
    for (let i = 0; i < 180; i += 1)
        governor = advanceMobileFrameGovernor(governor, { fps: 32, adaptivePressure: .95 });
    const governorPolicy = mobileFrameGovernorPolicy(governor.tier);
    const checkpoints = CHECKPOINTS.map((minute) => {
        const ascensionTier = getAscensionTier(minute * 60_000);
        const budget = evaluatePerformanceBudget({ deviceClass, threat, ascensionTier });
        const enemyDemand = Math.round(130 + minute * 1.9 + threat * 20 + ascensionTier * 10);
        const projectileDemand = Math.round(70 + minute * .78 + threat * 6 + ascensionTier * 5);
        const effectDemand = Math.round(50 + minute * .55 + threat * 4 + ascensionTier * 3);
        const projectileCap = Math.max(18, Math.floor(budget.projectileCap * governorPolicy.projectileVisualDensity));
        const effectCap = Math.max(12, Math.floor(budget.effectCap * governorPolicy.visualDensity));
        const simulatedEnemies = Math.min(enemyDemand, budget.enemyLogicCap);
        const simulatedProjectiles = Math.min(projectileDemand, projectileCap);
        const simulatedEffects = Math.min(effectDemand, effectCap);
        return {
            minute, ascensionTier, enemyDemand, projectileDemand, effectDemand,
            enemyLogicCap: budget.enemyLogicCap, projectileCap, effectCap,
            simulatedEnemies, simulatedProjectiles, simulatedEffects, visualQuality: budget.visualQuality, governorTier: governor.tier,
            withinGuard: simulatedEnemies <= budget.enemyLogicCap && simulatedProjectiles <= projectileCap && simulatedEffects <= effectCap,
        };
    });
    const last = checkpoints.at(-1);
    const effectReduction = 1 - last.effectCap / BASE_EFFECT_CAP[deviceClass];
    const projectileReduction = 1 - last.projectileCap / BASE_PROJECTILE_CAP[deviceClass];
    const presentationFirst = effectReduction > projectileReduction && checkpoints.every((point) => point.enemyLogicCap === checkpoints[0].enemyLogicCap);
    const maxTransientEntities = Math.max(...checkpoints.map((point) => point.simulatedEnemies + point.simulatedProjectiles + point.simulatedEffects));
    return { deviceClass, threat, checkpoints, presentationFirst, maxTransientEntities, passed: presentationFirst && checkpoints.every((point) => point.withinGuard) };
}
