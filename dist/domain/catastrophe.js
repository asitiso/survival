const ROTATION = [
    { id: 'goldenNight', name: '황금의 밤', description: '모든 금화 획득량 ×2' },
    { id: 'frenzy', name: '적의 광분', description: '적 이동속도 +22%' },
    { id: 'arcaneSurge', name: '마력 폭주', description: '마법 쿨타임 -18% · 적 이동속도 +10%' },
    { id: 'redMoon', name: '붉은 달', description: '적 밀도와 정예 출현 증가' },
    { id: 'guardianGrace', name: '수호의 은총', description: '수호핵 피해 -22% · 적 밀도 소폭 증가' },
];
const NEUTRAL = {
    goldMultiplier: 1,
    enemySpeedMultiplier: 1,
    cooldownMultiplier: 1,
    spawnPressureMultiplier: 1,
    eliteIntervalMultiplier: 1,
    coreDamageMultiplier: 1,
};
export function catastropheAt(seconds) {
    if (seconds < 1200)
        return null;
    const index = Math.floor((seconds - 1200) / 180) % ROTATION.length;
    return ROTATION[index] ?? null;
}
export function catastropheModifiers(catastrophe) {
    if (!catastrophe)
        return { ...NEUTRAL };
    switch (catastrophe.id) {
        case 'goldenNight':
            return { ...NEUTRAL, goldMultiplier: 2 };
        case 'frenzy':
            return { ...NEUTRAL, enemySpeedMultiplier: 1.22 };
        case 'arcaneSurge':
            return { ...NEUTRAL, cooldownMultiplier: 0.82, enemySpeedMultiplier: 1.10 };
        case 'redMoon':
            return { ...NEUTRAL, spawnPressureMultiplier: 1.32, eliteIntervalMultiplier: 0.58 };
        case 'guardianGrace':
            return { ...NEUTRAL, coreDamageMultiplier: 0.78, spawnPressureMultiplier: 1.08 };
    }
}
