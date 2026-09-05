function guidance(choice, context) {
    if (choice.kind === 'fusion') {
        const remaining = Math.max(0, 2 - Math.max(0, Math.floor(context.activeFusionCount)));
        return { badge: '빌드 융합', hint: remaining <= 1 ? '완성 빌드 연결' : '핵심 시너지 연결', score: 100 };
    }
    if (choice.kind === 'relic') {
        if (context.activeRelic)
            return { badge: '유물 교체', hint: '현재 유물과 교체', score: 68 };
        return { badge: '첫 유물', hint: '새 유물 즉시 장착', score: 88 };
    }
    if (choice.id === 'meteorStorm' || choice.id === 'blackHole')
        return { badge: '궁극기 성장', hint: '보스 화력 직접 상승', score: 80 };
    return { badge: '기본 성장', hint: '안정적인 전투 강화', score: 58 };
}
export function guideBossRewardChoices(choices, context) {
    const described = choices.map((choice, index) => ({ choice, index, ...guidance(choice, context) }));
    let bestIndex = -1, bestScore = Number.NEGATIVE_INFINITY;
    for (const entry of described) {
        if (entry.score > bestScore) {
            bestScore = entry.score;
            bestIndex = entry.index;
        }
    }
    return described.map(({ choice, index, badge, hint }) => ({ ...choice, badge, hint, best: index === bestIndex }));
}
