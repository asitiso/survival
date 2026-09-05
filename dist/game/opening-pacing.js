function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function rounded(value) { return Math.round(value * 10000) / 10000; }
export function openingCombatPacing(elapsedSeconds) {
    const s = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    if (s < 120)
        return { band: 'ignition', spawnPressureMultiplier: 1.12, eliteIntervalMultiplier: .96, rewardMultiplier: 1.08, shopIntervalMultiplier: 1, enemyBudgetMultiplier: 1 };
    if (s < 300)
        return { band: 'momentum', spawnPressureMultiplier: 1.09, eliteIntervalMultiplier: .92, rewardMultiplier: 1.07, shopIntervalMultiplier: 1, enemyBudgetMultiplier: 1 };
    if (s < 600) {
        const t = (s - 300) / 300;
        return {
            band: 'escalation',
            spawnPressureMultiplier: rounded(lerp(1.06, 1.012, t)),
            eliteIntervalMultiplier: rounded(lerp(.88, .994, t)),
            rewardMultiplier: rounded(lerp(1.05, 1.006, t)),
            shopIntervalMultiplier: 1,
            enemyBudgetMultiplier: 1,
        };
    }
    return { band: 'standard', spawnPressureMultiplier: 1, eliteIntervalMultiplier: 1, rewardMultiplier: 1, shopIntervalMultiplier: 1, enemyBudgetMultiplier: 1 };
}
