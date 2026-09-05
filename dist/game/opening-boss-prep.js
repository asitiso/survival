export function openingBossPrepAssist(input) {
    if (input.elapsedSeconds > 180 || input.bossCountdown <= 0 || input.bossCountdown > 12)
        return null;
    if (input.shopTokens > 0)
        return { actionId: 'shop', label: '준비', accent: '#ffd36a' };
    if (input.hpRatio < .72 && input.potions > 0)
        return { actionId: 'potion', label: '준비', accent: '#79f0ad' };
    return null;
}
