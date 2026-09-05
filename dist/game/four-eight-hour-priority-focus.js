export function fourEightHourPriorityFocus(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 14400)
        return { active: false, routineBuildLabelCap: 4, preserveFinalForm: true, preserveMythic: true, preserveBossDanger: true, maxProjectileCues: 6 };
    const danger = input.heroCritical || input.coreCritical || input.bossActive || input.mythicActive;
    return { active: true, routineBuildLabelCap: input.completeBuild ? 0 : 2, preserveFinalForm: input.finalFormActive, preserveMythic: input.mythicActive, preserveBossDanger: input.bossActive || input.mythicActive || input.heroCritical || input.coreCritical, maxProjectileCues: danger ? input.mythicActive ? 4 : 3 : 2 };
}
export function priorityBuildLabels(labels, policy) {
    if (!policy.active)
        return labels.slice(0, policy.routineBuildLabelCap);
    if (policy.routineBuildLabelCap > 0)
        return labels.slice(0, policy.routineBuildLabelCap);
    if (policy.preserveFinalForm) {
        const final = labels.find(label => label.startsWith('SIGNATURE') || label.startsWith('최종형'));
        return final ? [final] : [];
    }
    return [];
}
