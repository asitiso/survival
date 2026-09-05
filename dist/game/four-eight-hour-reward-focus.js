function finalFormRelevant(choice) { const text = `${choice.title} ${choice.description} ${choice.badge ?? ''} ${choice.hint ?? ''}`.toLowerCase(); return text.includes('final form') || text.includes('최종형') || text.includes('signature'); }
export function focusFourEightHourBossRewards(choices, context) {
    const elapsed = Number.isFinite(context.elapsedSeconds) ? Math.max(0, context.elapsedSeconds) : 0;
    const preserveFullDetails = context.finalFormActive && choices.some(finalFormRelevant);
    if (elapsed < 14400 || !context.completeBuild || preserveFullDetails)
        return { choices: choices.map(choice => ({ ...choice })), compact: false, preserveFullDetails, subtitle: preserveFullDetails ? 'Final Form 성장 · 세부 효과 확인' : '유물 1개 또는 보스 성장 2개 중 선택', autoSelect: false, estimatedReadReduction: 0 };
    const growthIndex = choices.findIndex(choice => choice.kind !== 'relic');
    const focused = choices.map((choice, index) => growthIndex >= 0 && index === growthIndex ? { ...choice, best: true, badge: '유지', hint: '완성 빌드 · 유지 성장' } : { ...choice, best: false });
    return { choices: focused, compact: true, preserveFullDetails: false, subtitle: '완성 빌드 · 유지 성장 1개만 확인', autoSelect: false, estimatedReadReduction: .58 };
}
