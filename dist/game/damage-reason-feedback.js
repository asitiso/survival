const LABELS = {
    contact: '근접 공격', projectile: '투사체 피격', explosion: '폭발 피격', arena: '위험지대', strain: '과부하 피해',
};
const DENSITY_GUARD_SECONDS = .22;
const SEVERITY_RANK = { normal: 0, heavy: 1, critical: 2 };
function dwellSeconds(severity) { return severity === 'critical' ? 1.15 : severity === 'heavy' ? .95 : .72; }
export function damageReasonCue(source, amount, maxHp) {
    const ratio = Math.max(0, amount) / Math.max(1, maxHp);
    const severity = ratio >= .32 ? 'critical' : ratio >= .12 ? 'heavy' : 'normal';
    return { source, label: LABELS[source], severity };
}
export function recordDamageReason(previous, source, amount, maxHp, nowSeconds) {
    const cue = damageReasonCue(source, amount, maxHp);
    const active = Boolean(previous && previous.expiresAt > nowSeconds);
    const merge = Boolean(active && previous?.source === source);
    if (active && previous && !merge) {
        const shownAt = previous.expiresAt - dwellSeconds(previous.severity);
        const insideDensityGuard = nowSeconds - shownAt < DENSITY_GUARD_SECONDS;
        if (insideDensityGuard && SEVERITY_RANK[cue.severity] <= SEVERITY_RANK[previous.severity])
            return previous;
    }
    const total = merge && previous ? previous.amount + Math.max(0, amount) : Math.max(0, amount);
    const mergedCue = damageReasonCue(source, total, maxHp);
    return { ...mergedCue, amount: total, expiresAt: nowSeconds + dwellSeconds(mergedCue.severity) };
}
export function advanceDamageReason(state, nowSeconds) { return state && state.expiresAt > nowSeconds ? state : null; }
