export const FATE_CHECKPOINTS = [360, 720, 1080];
const NEUTRAL = {
    spawnPressureMultiplier: 1,
    enemySpeedMultiplier: 1,
    eliteIntervalMultiplier: 1,
    xpMultiplier: 1,
    goldMultiplier: 1,
    shopTokenMultiplier: 1,
    coreDamageTakenMultiplier: 1,
    bossVariantBonus: 0,
    objectiveRewardMultiplier: 1,
};
const PATHS = {
    frenzy: {
        id: 'frenzy', name: '광란의 길', accent: '#ff6f62', description: '더 많은 적과 정예를 상대하고 경험치를 더 얻습니다.',
        modifiers: { ...NEUTRAL, spawnPressureMultiplier: 1.14, eliteIntervalMultiplier: 0.90, xpMultiplier: 1.18, bossVariantBonus: 0.25, objectiveRewardMultiplier: 1.08 },
    },
    golden: {
        id: 'golden', name: '황금의 길', accent: '#ffd45f', description: '적이 빨라지는 대신 금화와 상점 기회가 크게 늘어납니다.',
        modifiers: { ...NEUTRAL, enemySpeedMultiplier: 1.08, goldMultiplier: 1.22, shopTokenMultiplier: 1.18, bossVariantBonus: 0.15, objectiveRewardMultiplier: 1.12 },
    },
    guardian: {
        id: 'guardian', name: '수호의 길', accent: '#7ee2c1', description: '수호핵 피해를 줄이는 대신 공격적 성장 보상이 조금 줄어듭니다.',
        modifiers: { ...NEUTRAL, xpMultiplier: 0.98, goldMultiplier: 0.96, coreDamageTakenMultiplier: 0.82, objectiveRewardMultiplier: 1.06 },
    },
};
export function fatePathDefinition(id) { return PATHS[id]; }
export function allFatePaths() { return Object.values(PATHS); }
export function fateCheckpointIndex(elapsed, choicesMade) {
    if (choicesMade < 0 || choicesMade >= FATE_CHECKPOINTS.length)
        return -1;
    return elapsed >= FATE_CHECKPOINTS[choicesMade] ? choicesMade : -1;
}
export function composeFateModifiers(paths) {
    const out = { ...NEUTRAL };
    for (const id of paths.slice(0, 3)) {
        const mod = PATHS[id].modifiers;
        out.spawnPressureMultiplier = Math.min(1.45, out.spawnPressureMultiplier * mod.spawnPressureMultiplier);
        out.enemySpeedMultiplier = Math.min(1.25, out.enemySpeedMultiplier * mod.enemySpeedMultiplier);
        out.eliteIntervalMultiplier = Math.max(0.72, out.eliteIntervalMultiplier * mod.eliteIntervalMultiplier);
        out.xpMultiplier = Math.min(1.40, out.xpMultiplier * mod.xpMultiplier);
        out.goldMultiplier = Math.min(1.55, out.goldMultiplier * mod.goldMultiplier);
        out.shopTokenMultiplier = Math.min(1.45, out.shopTokenMultiplier * mod.shopTokenMultiplier);
        out.coreDamageTakenMultiplier = Math.max(0.65, out.coreDamageTakenMultiplier * mod.coreDamageTakenMultiplier);
        out.bossVariantBonus = Math.min(1, out.bossVariantBonus + mod.bossVariantBonus);
        out.objectiveRewardMultiplier = Math.min(1.35, out.objectiveRewardMultiplier * mod.objectiveRewardMultiplier);
    }
    return out;
}
