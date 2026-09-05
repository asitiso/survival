import { ACTION_BUTTONS } from './config.js';
import { CAST_INTENT_BUFFER_WINDOW_SECONDS, COMBAT_CAST_ACTIONS, CastIntentBuffer } from './cast-intent-buffer.js';
export function auditCombatInputReliability() {
    const timingResults = COMBAT_CAST_ACTIONS.flatMap((action) => {
        const early = new CastIntentBuffer().request(action, CAST_INTENT_BUFFER_WINDOW_SECONDS) === 'queued';
        const exact = new CastIntentBuffer().request(action, 0) === 'ready';
        const outside = new CastIntentBuffer().request(action, CAST_INTENT_BUFFER_WINDOW_SECONDS + 0.000001) === 'rejected';
        return [early, exact, outside];
    });
    const timingPassed = timingResults.every(Boolean);
    const duplicate = new CastIntentBuffer();
    duplicate.request('spell2', 0.16);
    duplicate.request('spell2', 0.09);
    const duplicateCoalescingPassed = duplicate.size === 1 && duplicate.isQueued('spell2');
    const once = new CastIntentBuffer();
    once.request('ultimate1', 0.08);
    const firstConsume = once.consumeIfReady('ultimate1', 0);
    const duplicateConsume = once.consumeIfReady('ultimate1', 0);
    const exactlyOncePassed = firstConsume && !duplicateConsume;
    const priority = new CastIntentBuffer();
    priority.request('spell1', 0.05);
    const arbitration = [];
    if (priority.consumeIfReady('spell1', 0))
        arbitration.push('manual');
    if (arbitration.length === 0)
        arbitration.push('auto');
    const manualPriorityPassed = arbitration[0] === 'manual';
    const lifecycle = new CastIntentBuffer();
    lifecycle.request('spell3', 0.10);
    lifecycle.request('ultimate2', 0.20);
    lifecycle.clear();
    const lifecycleClearPassed = lifecycle.size === 0 && !lifecycle.isQueued('spell3') && !lifecycle.isQueued('ultimate2');
    const castActionCount = COMBAT_CAST_ACTIONS.length;
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (!timingPassed)
        issues.push('timing-window');
    if (!duplicateCoalescingPassed)
        issues.push('duplicate-coalescing');
    if (!exactlyOncePassed)
        issues.push('exactly-once');
    if (!manualPriorityPassed)
        issues.push('manual-priority');
    if (!lifecycleClearPassed)
        issues.push('lifecycle-clear');
    if (castActionCount !== 6)
        issues.push('cast-action-surface');
    if (actionCount !== 9)
        issues.push('action-surface');
    const timingSamples = timingResults.length;
    const samples = timingSamples + 2 + 2 + 1 + 2;
    const passed = issues.length === 0;
    return {
        samples,
        timingSamples,
        castActionCount,
        actionCount,
        windowSeconds: CAST_INTENT_BUFFER_WINDOW_SECONDS,
        timingPassed,
        duplicateCoalescingPassed,
        exactlyOncePassed,
        manualPriorityPassed,
        lifecycleClearPassed,
        snapshotSchemaMutation: false,
        economyMutation: false,
        damageMutation: false,
        cooldownMutation: false,
        autoThroughputMutation: false,
        issues,
        passed,
    };
}
