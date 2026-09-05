export function bossSafeResponseWindowConfirmation(input) {
    let reason = 'confirmed';
    if (input.ackBossId !== input.bossId)
        reason = 'boss-mismatch';
    else if (input.ackCycle === null || input.currentCycle !== input.ackCycle + 1)
        reason = 'cycle-not-advanced';
    else if (!Number.isFinite(input.specialTimer) || input.specialTimer < 1.35)
        reason = 'special-not-reset';
    else if (input.heroCritical || input.coreCritical || input.damageSeverity === 'critical' || input.damageSeverity === 'heavy')
        reason = 'critical-state';
    else if (input.dangerProjectileCount > 0)
        reason = 'incoming-danger';
    return { confirmed: reason === 'confirmed', label: '대응 여유', visualSeconds: .62, claimsGlobalSafety: false, reason };
}
