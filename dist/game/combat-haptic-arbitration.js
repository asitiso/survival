const PATTERNS = {
    heroCritical: 45,
    coreCritical: [45, 30, 75],
    dualCritical: [45, 30, 75, 30, 45],
    bossPhase3: [35, 25, 70],
    bossPhase: 45,
    bossCountdown: [25, 25, 60],
};
export function arbitrateCombatHaptics(intents, enabled = true) {
    if (!enabled || intents.length === 0)
        return { kind: null, pattern: null, dispatchCount: 0, acknowledged: [] };
    const set = new Set(intents);
    if (set.has('heroCritical') && set.has('coreCritical')) {
        return { kind: 'dualCritical', pattern: PATTERNS.dualCritical, dispatchCount: 1, acknowledged: ['heroCritical', 'coreCritical'] };
    }
    const priority = ['heroCritical', 'coreCritical', 'bossPhase3', 'bossPhase', 'bossCountdown'];
    const kind = priority.find((candidate) => set.has(candidate)) ?? null;
    if (!kind)
        return { kind: null, pattern: null, dispatchCount: 0, acknowledged: [] };
    return { kind, pattern: PATTERNS[kind], dispatchCount: 1, acknowledged: [kind] };
}
export class CombatHapticArbiter {
    intents = [];
    get pendingCount() { return this.intents.length; }
    queue(intent) { this.intents.push(intent); }
    clear() { this.intents.length = 0; }
    resolve(enabled = true) {
        const decision = arbitrateCombatHaptics(this.intents, enabled);
        this.clear();
        return decision;
    }
}
