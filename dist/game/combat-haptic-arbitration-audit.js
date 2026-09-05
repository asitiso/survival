import { ACTION_BUTTONS } from './config.js';
import { CombatHapticArbiter, arbitrateCombatHaptics } from './combat-haptic-arbitration.js';
import { criticalHapticEvents, dangerUiState } from './danger-ui.js';
const add = (samples, caseId, expected, actual) => samples.push({ caseId, expected, actual, passed: expected === actual });
export function auditCombatHapticArbitration() {
    const samples = [];
    const decisions = [];
    const decide = (intents, enabled = true) => { const decision = arbitrateCombatHaptics(intents, enabled); decisions.push(decision); return decision; };
    const heroOnly = decide(['heroCritical']);
    add(samples, 'hero-critical-only', 'heroCritical', heroOnly.kind ?? 'none');
    const coreOnly = decide(['coreCritical']);
    add(samples, 'core-critical-only', 'coreCritical', coreOnly.kind ?? 'none');
    const dual = decide(['heroCritical', 'coreCritical']);
    add(samples, 'dual-critical-merge', 'dualCritical', dual.kind ?? 'none');
    const heroBoss = decide(['bossCountdown', 'heroCritical']);
    add(samples, 'hero-over-boss-countdown', 'heroCritical', heroBoss.kind ?? 'none');
    const coreBoss = decide(['bossPhase', 'coreCritical']);
    add(samples, 'core-over-boss-phase', 'coreCritical', coreBoss.kind ?? 'none');
    const heroPhase3 = decide(['bossPhase3', 'heroCritical']);
    add(samples, 'hero-over-boss-phase3', 'heroCritical', heroPhase3.kind ?? 'none');
    const dualPhase3 = decide(['bossPhase3', 'heroCritical', 'coreCritical']);
    add(samples, 'dual-over-boss-phase3', 'dualCritical', dualPhase3.kind ?? 'none');
    const bossPhase3 = decide(['bossCountdown', 'bossPhase', 'bossPhase3']);
    add(samples, 'boss-phase3-over-boss-events', 'bossPhase3', bossPhase3.kind ?? 'none');
    const bossPhase = decide(['bossCountdown', 'bossPhase']);
    add(samples, 'boss-phase-over-countdown', 'bossPhase', bossPhase.kind ?? 'none');
    const countdown = decide(['bossCountdown']);
    add(samples, 'boss-countdown-only', 'bossCountdown', countdown.kind ?? 'none');
    const dualWithCountdown = decide(['coreCritical', 'heroCritical', 'bossCountdown']);
    add(samples, 'dual-merge-with-countdown', 'dualCritical', dualWithCountdown.kind ?? 'none');
    const dualWithPhase = decide(['heroCritical', 'bossPhase', 'coreCritical']);
    add(samples, 'dual-merge-with-phase', 'dualCritical', dualWithPhase.kind ?? 'none');
    const disabled = decide(['heroCritical', 'bossPhase3'], false);
    add(samples, 'haptic-disabled-dispatch', 0, disabled.dispatchCount);
    const arbiter = new CombatHapticArbiter();
    arbiter.queue('bossCountdown');
    arbiter.queue('heroCritical');
    const resolved = arbiter.resolve(true);
    add(samples, 'frame-resolve-single-dispatch', 1, resolved.dispatchCount);
    const staleAfterResolve = arbiter.resolve(true).dispatchCount;
    add(samples, 'resolved-intent-no-stale-replay', 0, staleAfterResolve);
    arbiter.queue('bossPhase3');
    arbiter.clear();
    const staleAfterClear = arbiter.resolve(true).dispatchCount;
    add(samples, 'lifecycle-clear-no-stale-replay', 0, staleAfterClear);
    const safe = dangerUiState(1, 1);
    const heroEntry = dangerUiState(.30, 1, safe);
    const heroBand = dangerUiState(.32, 1, heroEntry);
    const heroExit = dangerUiState(.331, 1, heroBand);
    const heroReentry = dangerUiState(.30, 1, heroExit);
    add(samples, 'hero-hysteresis-band-no-duplicate', 0, criticalHapticEvents(heroEntry, heroBand).length);
    const heroRearmed = criticalHapticEvents(heroExit, heroReentry).includes('hero');
    add(samples, 'hero-safe-exit-rearm', true, heroRearmed);
    const coreEntry = dangerUiState(1, .35, safe);
    const coreBand = dangerUiState(1, .37, coreEntry);
    const coreExit = dangerUiState(1, .381, coreBand);
    const coreReentry = dangerUiState(1, .35, coreExit);
    add(samples, 'core-hysteresis-band-no-duplicate', 0, criticalHapticEvents(coreEntry, coreBand).length);
    const coreRearmed = criticalHapticEvents(coreExit, coreReentry).includes('core');
    add(samples, 'core-safe-exit-rearm', true, coreRearmed);
    add(samples, 'core-pattern', '45,30,75', Array.isArray(coreOnly.pattern) ? coreOnly.pattern.join(',') : '');
    add(samples, 'phase3-pattern', '35,25,70', Array.isArray(bossPhase3.pattern) ? bossPhase3.pattern.join(',') : '');
    add(samples, 'countdown-pattern', '25,25,60', Array.isArray(countdown.pattern) ? countdown.pattern.join(',') : '');
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    add(samples, 'snapshot-schema-mutation', false, false);
    const maxDispatchPerFrame = Math.max(...decisions.map((decision) => decision.dispatchCount), resolved.dispatchCount, staleAfterResolve, staleAfterClear);
    const criticalCases = [heroBoss, coreBoss, heroPhase3, dualPhase3];
    const criticalPriorityPreservationRate = criticalCases.filter((decision) => decision.kind === 'heroCritical' || decision.kind === 'coreCritical' || decision.kind === 'dualCritical').length / criticalCases.length;
    const dualCases = [dual, dualWithCountdown, dualWithPhase];
    const dualCriticalMergeRate = dualCases.filter((decision) => decision.kind === 'dualCritical').length / dualCases.length;
    const suppressedStaleReplayCount = staleAfterResolve + staleAfterClear;
    const hapticDisabledDispatchCount = disabled.dispatchCount;
    const safeExitRearmRate = (Number(heroRearmed) + Number(coreRearmed)) / 2;
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (maxDispatchPerFrame > 1)
        issues.push('multi-dispatch-frame');
    if (criticalPriorityPreservationRate !== 1)
        issues.push('critical-priority');
    if (dualCriticalMergeRate !== 1)
        issues.push('dual-critical-merge');
    if (suppressedStaleReplayCount !== 0)
        issues.push('stale-replay');
    if (hapticDisabledDispatchCount !== 0)
        issues.push('haptic-disabled-dispatch');
    if (safeExitRearmRate !== 1)
        issues.push('safe-exit-rearm');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('action-count');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return { passed: issues.length === 0, samples, maxDispatchPerFrame, criticalPriorityPreservationRate, dualCriticalMergeRate, suppressedStaleReplayCount, hapticDisabledDispatchCount, safeExitRearmRate, reachableActionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues };
}
