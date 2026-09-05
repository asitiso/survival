export function eightTwelveHourHudFocus(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 8 * 3600)
        return { active: false, routineBuildLabelCap: 4, statusMaxChars: 64, showRoutineAutoText: true, preserveFinalForm: true, preserveMythic: true, preserveCritical: true, preserveBossDanger: true, maxProjectileCues: 6, keepCriticalBars: true, keepDangerTelegraphs: true };
    const critical = input.heroCritical || input.coreCritical;
    const danger = critical || input.bossActive || input.mythicActive;
    return {
        active: true,
        routineBuildLabelCap: input.completeBuild ? 0 : 2,
        statusMaxChars: input.mythicActive ? 30 : danger ? 32 : 34,
        showRoutineAutoText: false,
        preserveFinalForm: input.finalFormActive,
        preserveMythic: input.mythicActive,
        preserveCritical: critical,
        preserveBossDanger: input.bossActive || input.mythicActive || critical,
        maxProjectileCues: input.mythicActive ? 4 : danger ? 3 : 1,
        keepCriticalBars: true,
        keepDangerTelegraphs: true,
    };
}
export function eightTwelveHourBuildLabels(labels, policy) {
    if (!policy.active)
        return labels.slice(0, policy.routineBuildLabelCap);
    if (policy.routineBuildLabelCap > 0)
        return labels.slice(0, policy.routineBuildLabelCap);
    if (policy.preserveFinalForm) {
        const signature = labels.find(label => label.startsWith('SIGNATURE'));
        if (signature)
            return [signature];
        const final = labels.find(label => label.startsWith('최종형'));
        return final ? [final] : [];
    }
    return [];
}
