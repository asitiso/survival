export function calculateTacticalScoreBonus(recap) {
    const completed = Math.max(0, Math.floor(recap.objectivesCompleted));
    const streak = Math.max(0, Math.floor(recap.bestObjectiveStreak));
    const nodes = Math.max(0, Math.floor(recap.bossNodesDestroyed));
    const tier = Math.max(0, Math.min(3, Math.floor(recap.highestComboTier)));
    return Math.min(12000, completed * 480 + streak * 260 + nodes * 340 + tier * 1200);
}
export function tacticalRecapLines(recap) {
    const lines = [`전장 목표 ${Math.max(0, Math.floor(recap.objectivesCompleted))}회 · 최고 연속 ${Math.max(0, Math.floor(recap.bestObjectiveStreak))}`, `보스 약점 파괴 ${Math.max(0, Math.floor(recap.bossNodesDestroyed))}개`];
    if (recap.highestComboTier > 0)
        lines.push(`ARCANE ${recap.highestComboTier >= 3 ? 'ASCENDANCY' : recap.highestComboTier === 2 ? 'SURGE' : 'LINK'} · ${recap.highestComboName}`);
    if (recap.objectivesFailed > 0)
        lines.push(`목표 실패 ${Math.max(0, Math.floor(recap.objectivesFailed))}회`);
    return lines.slice(0, 4);
}
