export function applyMissionRewardToState(state, reward) {
    const equipmentState = {
        coins: state.equipmentState.coins,
        weapon: state.equipmentState.weapon ? { ...state.equipmentState.weapon } : null,
        armor: state.equipmentState.armor ? { ...state.equipmentState.armor } : null,
        healingPotions: state.equipmentState.healingPotions,
    };
    let shopTokens = state.shopTokens;
    let goldEarned = state.goldEarned;
    if (reward.kind === 'shopToken')
        shopTokens += reward.amount;
    else if (reward.kind === 'gold') {
        equipmentState.coins += reward.amount;
        goldEarned += reward.amount;
    }
    else if (reward.kind === 'potion')
        equipmentState.healingPotions += reward.amount;
    return { shopTokens, equipmentState, goldEarned };
}
export function composeEnemyPressure(event, catastrophe, threat) {
    return {
        enemySpeedMultiplier: catastrophe.enemySpeedMultiplier * threat.enemySpeedMultiplier,
        spawnPressureMultiplier: event.spawnPressureMultiplier * catastrophe.spawnPressureMultiplier * threat.spawnPressureMultiplier,
        eliteIntervalMultiplier: event.eliteIntervalMultiplier * catastrophe.eliteIntervalMultiplier * threat.eliteIntervalMultiplier,
        regularWeights: threat.regularWeights,
    };
}
