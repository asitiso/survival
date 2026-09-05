export function deepRunDecisionAttention(input) {
    const count = Math.max(0, Math.min(3, Math.floor(Number.isFinite(input.ascensionCount) ? input.ascensionCount : 0)));
    const dangerPriority = Boolean(input.mythicActive || input.heroCritical || input.coreCritical);
    const progressActive = Boolean(input.activeContract || input.activeOath);
    const maxAscensionIcons = (dangerPriority ? 0 : input.bossActive ? Math.min(1, count) : progressActive ? Math.min(2, count) : count);
    return {
        dangerPriority,
        showContractProgress: Boolean(input.activeContract),
        showOathProgress: Boolean(input.activeOath),
        showAscensionRecall: maxAscensionIcons > 0,
        maxAscensionIcons,
        preserveCriticalBars: true,
        preserveDangerTelegraphs: true,
    };
}
