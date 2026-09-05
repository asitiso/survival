const NEUTRAL = { bossDamageTakenMultiplier: 1, specialCadenceMultiplier: 1, summonCountMultiplier: 1 };
export function mythicCounterplayModifiers(active, nodesAlive, nodesTotal) {
    if (!active || nodesTotal <= 0 || nodesAlive > 0)
        return { ...NEUTRAL };
    return { bossDamageTakenMultiplier: 1.12, specialCadenceMultiplier: 1.22, summonCountMultiplier: .82 };
}
