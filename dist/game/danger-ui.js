export function dangerUiState(heroHpRatio, coreHpRatio, previous) {
    const heroRatio = Math.max(0, Math.min(1, heroHpRatio));
    const coreRatio = Math.max(0, Math.min(1, coreHpRatio));
    const heroCritical = previous?.heroCritical ? heroRatio <= 0.33 : heroRatio <= 0.30;
    const coreCritical = previous?.coreCritical ? coreRatio <= 0.38 : coreRatio <= 0.35;
    const vignetteAlpha = heroCritical
        ? Math.min(0.48, Math.max(0.18, 0.18 + ((0.30 - heroRatio) / 0.30) * 0.30))
        : 0;
    return {
        heroCritical,
        coreCritical,
        vignetteAlpha,
        heroWarning: heroCritical ? 'HP 위험' : '',
        coreWarning: coreCritical ? '수호핵 위험' : '',
    };
}
export function priorityThreatIds(enemies, heroPos, limit = 2) {
    const bossIds = enemies.filter((enemy) => enemy.alive && enemy.type === 'boss').map((enemy) => enemy.id);
    const tactical = enemies
        .filter((enemy) => enemy.alive && (enemy.type === 'bomber' || enemy.type === 'shaman'))
        .map((enemy) => ({ id: enemy.id, distance: Math.hypot(enemy.pos.x - heroPos.x, enemy.pos.y - heroPos.y) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.max(0, Math.floor(limit)))
        .map((entry) => entry.id);
    return [...bossIds, ...tactical];
}
export function criticalHapticEvents(previous, next) {
    const events = [];
    if (!previous.heroCritical && next.heroCritical)
        events.push('hero');
    if (!previous.coreCritical && next.coreCritical)
        events.push('core');
    return events;
}
