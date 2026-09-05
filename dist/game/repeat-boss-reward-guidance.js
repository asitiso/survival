export function reduceRepeatBossRewardDecision(choices, context) {
    const elapsed = Number.isFinite(context.elapsedSeconds) ? Math.max(0, context.elapsedSeconds) : 0;
    if (elapsed < 1800 || elapsed > 3600 || !context.activeRelic || context.activeFusionCount < 2)
        return choices.map(choice => ({ ...choice }));
    const growthIndex = choices.findIndex(choice => choice.kind !== 'relic');
    if (growthIndex < 0)
        return choices.map(choice => ({ ...choice }));
    return choices.map((choice, index) => index === growthIndex ? { ...choice, best: true, badge: '유지 추천', hint: '완성 빌드 유지 · 교체 판단 최소화' } : { ...choice, best: false });
}
