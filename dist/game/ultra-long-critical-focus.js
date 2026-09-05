export function ultraLongCriticalFocus(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 14400)
        return { criticalOnly: false, showAutoLabel: true, keepAutoRing: true, showWeakpointLabel: true, preserveBossCue: true, preserveDangerCue: true, maxProjectileCues: 6 };
    const critical = input.heroCritical || input.coreCritical;
    return { criticalOnly: critical || input.bossActive || input.mythicActive, showAutoLabel: false, keepAutoRing: true, showWeakpointLabel: input.bossActive, preserveBossCue: true, preserveDangerCue: true, maxProjectileCues: critical || input.bossActive ? 3 : 2 };
}
