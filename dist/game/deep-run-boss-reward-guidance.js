export function reduceDeepRunBossRewardDecision(choices, context) {
    const elapsed = Number.isFinite(context.elapsedSeconds) ? Math.max(0, context.elapsedSeconds) : 0;
    if (elapsed < 3600 || elapsed > 7200 || !context.activeRelic || context.activeFusionCount < 2)
        return choices.map(choice => ({ ...choice }));
    const growthIndex = choices.findIndex(choice => choice.kind !== 'relic');
    if (growthIndex < 0)
        return choices.map(choice => ({ ...choice, best: false }));
    return choices.map((choice, index) => index === growthIndex ? { ...choice, best: true, badge: '유지 추천', hint: '완성 빌드 유지 · 교체 판단 생략' } : { ...choice, best: false });
}
