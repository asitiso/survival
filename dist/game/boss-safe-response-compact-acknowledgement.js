export function bossSafeResponseCompactAcknowledgement(input) {
    if (!input.active || input.heroCritical || input.coreCritical)
        return { mode: 'hidden', showLabel: false, label: '대응 여유', ringAlpha: 0, claimsGlobalSafety: false };
    const compact = input.quality === 'low' || input.actionAssistVisible || input.responseAckVisible;
    const ringAlpha = input.quality === 'high' ? .78 : input.quality === 'medium' ? .68 : .58;
    return { mode: compact ? 'compact' : 'full', showLabel: !compact, label: '대응 여유', ringAlpha, claimsGlobalSafety: false };
}
