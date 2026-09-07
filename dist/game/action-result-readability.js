const PROFILES = {
    normalHit: { priority: 0, alpha: .11, radius: 13, lineWidth: 1.15, rayCount: 0, connectorAlpha: .055, pulseAmplitude: .4 },
    weakpointHit: { priority: 1, alpha: .20, radius: 18, lineWidth: 1.45, rayCount: 2, connectorAlpha: .12, pulseAmplitude: .8 },
    guardBreak: { priority: 2, alpha: .30, radius: 23, lineWidth: 1.9, rayCount: 4, connectorAlpha: .16, pulseAmplitude: 1.4 },
    weakpointBreak: { priority: 3, alpha: .36, radius: 27, lineWidth: 2.2, rayCount: 6, connectorAlpha: .19, pulseAmplitude: 1.8 },
    bossStagger: { priority: 4, alpha: .39, radius: 30, lineWidth: 2.35, rayCount: 6, connectorAlpha: .20, pulseAmplitude: 2 },
    enemyKill: { priority: 5, alpha: .42, radius: 31, lineWidth: 2.4, rayCount: 7, connectorAlpha: .21, pulseAmplitude: 2.1 },
};
export function actionResultMinimumGap(kind) {
    if (kind === 'normalHit')
        return .18;
    if (kind === 'weakpointHit')
        return .14;
    return .02;
}
export function actionResultPresentation(input) {
    const profile = PROFILES[input.kind];
    const distance = Number.isFinite(input.sourceDistance) ? Math.max(0, input.sourceDistance ?? 0) : 0;
    const connectorDistanceScale = distance <= 44 ? 0 : Math.min(1, (distance - 44) / 120);
    return {
        visible: true,
        priority: profile.priority,
        alpha: profile.alpha,
        radius: profile.radius,
        lineWidth: profile.lineWidth,
        rayCount: profile.rayCount,
        connectorAlpha: profile.connectorAlpha * connectorDistanceScale,
        pulseAmplitude: profile.pulseAmplitude,
    };
}
