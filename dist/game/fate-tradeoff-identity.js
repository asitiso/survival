import { composeFateModifiers } from './fate-paths.js';
const relUp = (before, after) => before > 0 ? Math.max(0, (after - before) / before) : Math.max(0, after - before);
const relDown = (before, after) => before > 0 ? Math.max(0, (before - after) / before) : Math.max(0, before - after);
function chooseBenefit(before, after) {
    const entries = [
        { id: 'xp-growth', magnitude: relUp(before.xpMultiplier, after.xpMultiplier) },
        { id: 'gold-shop', magnitude: Math.max(relUp(before.goldMultiplier, after.goldMultiplier), relUp(before.shopTokenMultiplier, after.shopTokenMultiplier)) },
        { id: 'core-guard', magnitude: relDown(before.coreDamageTakenMultiplier, after.coreDamageTakenMultiplier) },
        { id: 'objective-reward', magnitude: relUp(before.objectiveRewardMultiplier, after.objectiveRewardMultiplier) },
    ];
    return entries.reduce((best, current) => current.magnitude > best.magnitude ? current : best, entries[0]);
}
function chooseCost(before, after) {
    const growthTax = Math.max(relDown(before.xpMultiplier, after.xpMultiplier), relDown(before.goldMultiplier, after.goldMultiplier), relDown(before.shopTokenMultiplier, after.shopTokenMultiplier));
    const entries = [
        { id: 'horde-pressure', magnitude: relUp(before.spawnPressureMultiplier, after.spawnPressureMultiplier) },
        { id: 'elite-frequency', magnitude: relDown(before.eliteIntervalMultiplier, after.eliteIntervalMultiplier) },
        { id: 'enemy-speed', magnitude: relUp(before.enemySpeedMultiplier, after.enemySpeedMultiplier) },
        { id: 'boss-variant', magnitude: Math.max(0, after.bossVariantBonus - before.bossVariantBonus) },
        { id: 'growth-tax', magnitude: growthTax },
    ];
    return entries.reduce((best, current) => current.magnitude > best.magnitude ? current : best, entries[0]);
}
function impact(before, after) { const benefit = chooseBenefit(before, after), cost = chooseCost(before, after); return { benefitId: benefit.id, costId: cost.id, benefitMagnitude: benefit.magnitude, costMagnitude: cost.magnitude, before, after }; }
export function fateChoiceImpact(currentPaths, candidate) { const before = composeFateModifiers(currentPaths); const after = composeFateModifiers([...currentPaths, candidate]); return impact(before, after); }
export function fateCumulativeImpact(paths) { const before = composeFateModifiers([]); const after = composeFateModifiers(paths); return impact(before, after); }
