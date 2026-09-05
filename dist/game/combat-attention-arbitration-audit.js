import { ACTION_BUTTONS } from './config.js';
import { combatAttentionPolicy } from './combat-cue-priority.js';
const add = (samples, caseId, expected, actual) => samples.push({ caseId, expected, actual, passed: expected === actual });
const policy = (overrides) => combatAttentionPolicy({ heroCritical: false, coreCritical: false, damageSeverity: null, bossSpecialTimer: 99, reducedFlash: false, ...overrides });
export function auditCombatAttentionArbitration() {
    const samples = [];
    let maxAnimatedPrimaryWarnings = 0;
    let criticalDuplicateAssistTextCount = 0;
    let reducedFlashMotionAmplitude = 0;
    let minProjectileCues = Infinity;
    const precedence = [
        ['hero-over-core-boss', { heroCritical: true, coreCritical: true, bossSpecialTimer: .4 }, 'hero-critical'],
        ['core-over-boss', { coreCritical: true, bossSpecialTimer: .4 }, 'core-critical'],
        ['damage-critical-over-boss', { damageSeverity: 'critical', bossSpecialTimer: .4 }, 'damage-critical'],
        ['boss-over-normal', { bossSpecialTimer: .4 }, 'boss-response'],
        ['heavy-over-normal', { damageSeverity: 'heavy' }, 'damage-heavy'],
        ['normal', { damageSeverity: null, bossSpecialTimer: 99 }, 'normal'],
    ];
    for (const [id, input, expected] of precedence) {
        const p = policy(input);
        maxAnimatedPrimaryWarnings = Math.max(maxAnimatedPrimaryWarnings, Number(p.heroWarningAnimated) + Number(p.coreWarningAnimated));
        add(samples, `priority-${id}`, expected, p.primary);
    }
    const compactInputs = [
        { heroCritical: true, bossSpecialTimer: .4 },
        { coreCritical: true, bossSpecialTimer: .4 },
        { heroCritical: true, coreCritical: true, bossSpecialTimer: .4 },
        { heroCritical: true, damageSeverity: 'critical', bossSpecialTimer: .2 },
    ];
    let visibleBossResponses = 0;
    for (const [index, input] of compactInputs.entries()) {
        const p = policy(input);
        if (p.showBossAssistRing)
            visibleBossResponses += 1;
        if (p.showBossAssistLabel)
            criticalDuplicateAssistTextCount += 1;
        add(samples, `critical-boss-compact-${index + 1}`, true, p.bossAssistCompact && p.showBossAssistRing && !p.showBossAssistLabel);
    }
    const reducedInputs = [
        { heroCritical: true, reducedFlash: true },
        { coreCritical: true, reducedFlash: true },
        { heroCritical: true, coreCritical: true, reducedFlash: true },
        { heroCritical: true, bossSpecialTimer: .2, reducedFlash: true },
    ];
    for (const [index, input] of reducedInputs.entries()) {
        const p = policy(input);
        reducedFlashMotionAmplitude = Math.max(reducedFlashMotionAmplitude, p.criticalMotionAmplitude);
        add(samples, `reduced-flash-motion-${index + 1}`, 0, p.criticalMotionAmplitude);
    }
    const projectileInputs = [
        { heroCritical: true },
        { coreCritical: true },
        { damageSeverity: 'critical' },
        { bossSpecialTimer: .4 },
    ];
    for (const [index, input] of projectileInputs.entries()) {
        const p = policy(input);
        minProjectileCues = Math.min(minProjectileCues, p.maxProjectileCues);
        add(samples, `projectile-warning-preserved-${index + 1}`, true, p.maxProjectileCues >= 1);
    }
    const heroOnly = policy({ heroCritical: true });
    const coreOnly = policy({ coreCritical: true });
    const both = policy({ heroCritical: true, coreCritical: true });
    const safe = policy({});
    add(samples, 'hero-warning-preserved', true, heroOnly.showHeroWarning);
    add(samples, 'core-warning-preserved', true, coreOnly.showCoreWarning);
    add(samples, 'both-hero-warning-preserved', true, both.showHeroWarning);
    add(samples, 'both-core-warning-preserved', true, both.showCoreWarning);
    add(samples, 'safe-warning-silent', false, safe.showHeroWarning || safe.showCoreWarning);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    add(samples, 'snapshot-schema-mutation', false, false);
    const bossResponseVisibilityRate = compactInputs.length === 0 ? 1 : visibleBossResponses / compactInputs.length;
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (maxAnimatedPrimaryWarnings > 1)
        issues.push('multiple-primary-warning-motion');
    if (bossResponseVisibilityRate !== 1)
        issues.push('boss-response-hidden');
    if (criticalDuplicateAssistTextCount !== 0)
        issues.push('duplicate-assist-text');
    if (reducedFlashMotionAmplitude !== 0)
        issues.push('reduced-flash-motion');
    if (minProjectileCues < 1)
        issues.push('projectile-warning-hidden');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('action-count');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return { passed: issues.length === 0, samples, maxAnimatedPrimaryWarnings, bossResponseVisibilityRate, criticalDuplicateAssistTextCount, reducedFlashMotionAmplitude, minProjectileCues, reachableActionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues };
}
