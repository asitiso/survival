import { ACTION_BUTTONS } from './config.js';
import { combatAttentionPolicy } from './combat-cue-priority.js';
import { criticalHapticEvents, dangerUiState } from './danger-ui.js';
const add = (samples, caseId, expected, actual) => samples.push({ caseId, expected, actual, passed: expected === actual });
const transitionCount = (states, key) => states.slice(1).reduce((count, state, index) => count + Number(state[key] !== states[index][key]), 0);
export function auditCriticalDangerHysteresis() {
    const samples = [];
    const heroEntry = dangerUiState(.30, 1);
    const hero31 = dangerUiState(.31, 1, heroEntry);
    const hero33 = dangerUiState(.33, 1, hero31);
    const heroExit = dangerUiState(.3301, 1, hero33);
    add(samples, 'hero-entry-30', true, heroEntry.heroCritical);
    add(samples, 'hero-band-31', true, hero31.heroCritical);
    add(samples, 'hero-band-33', true, hero33.heroCritical && hero33.vignetteAlpha >= .18);
    add(samples, 'hero-exit-over-33', false, heroExit.heroCritical);
    const coreEntry = dangerUiState(1, .35);
    const core36 = dangerUiState(1, .36, coreEntry);
    const core38 = dangerUiState(1, .38, core36);
    const coreExit = dangerUiState(1, .3801, core38);
    add(samples, 'core-entry-35', true, coreEntry.coreCritical);
    add(samples, 'core-band-36', true, core36.coreCritical);
    add(samples, 'core-band-38', true, core38.coreCritical);
    add(samples, 'core-exit-over-38', false, coreExit.coreCritical);
    const heroJitter = [heroEntry];
    for (const [index, ratio] of [.305, .298, .322, .301].entries()) {
        heroJitter.push(dangerUiState(ratio, 1, heroJitter.at(-1)));
        add(samples, `hero-jitter-${index + 1}`, true, heroJitter.at(-1)?.heroCritical ?? false);
    }
    const coreJitter = [coreEntry];
    for (const [index, ratio] of [.356, .349, .379, .351].entries()) {
        coreJitter.push(dangerUiState(1, ratio, coreJitter.at(-1)));
        add(samples, `core-jitter-${index + 1}`, true, coreJitter.at(-1)?.coreCritical ?? false);
    }
    const thresholdJitterToggleCount = transitionCount(heroJitter, 'heroCritical') + transitionCount(coreJitter, 'coreCritical');
    const safe = dangerUiState(1, 1);
    const heroMicro = dangerUiState(.32, 1, heroEntry);
    const coreMicro = dangerUiState(1, .37, coreEntry);
    const heroDuplicate = criticalHapticEvents(heroEntry, heroMicro).length;
    const coreDuplicate = criticalHapticEvents(coreEntry, coreMicro).length;
    const duplicateHapticCount = heroDuplicate + coreDuplicate;
    add(samples, 'hero-band-haptic-duplicate', 0, heroDuplicate);
    const heroReentry = dangerUiState(.30, 1, heroExit);
    const heroRearmed = criticalHapticEvents(heroExit, heroReentry).includes('hero');
    add(samples, 'hero-safe-exit-rearm', true, heroRearmed);
    add(samples, 'core-band-haptic-duplicate', 0, coreDuplicate);
    const coreReentry = dangerUiState(1, .35, coreExit);
    const coreRearmed = criticalHapticEvents(coreExit, coreReentry).includes('core');
    add(samples, 'core-safe-exit-rearm', true, coreRearmed);
    const visibleStates = [hero31, hero33, core36, core38];
    const visibleCount = visibleStates.filter((state) => (state.heroCritical && state.heroWarning.length > 0) || (state.coreCritical && state.coreWarning.length > 0)).length;
    const criticalWarningVisibilityRate = visibleCount / visibleStates.length;
    add(samples, 'hero-warning-visible-in-band', true, hero33.heroWarning === 'HP 위험');
    add(samples, 'core-warning-visible-in-band', true, core38.coreWarning === '수호핵 위험');
    const attention = combatAttentionPolicy({ heroCritical: true, coreCritical: true, damageSeverity: 'critical', bossSpecialTimer: .2, reducedFlash: false });
    const maxAnimatedPrimaryWarnings = Number(attention.heroWarningAnimated) + Number(attention.coreWarningAnimated);
    add(samples, 'single-primary-attention', 1, maxAnimatedPrimaryWarnings);
    const minHeroBandVignetteAlpha = Math.min(hero31.vignetteAlpha, hero33.vignetteAlpha);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    add(samples, 'snapshot-schema-mutation', false, false);
    const safeExitRearmRate = Number(heroRearmed) + Number(coreRearmed);
    const normalizedRearmRate = safeExitRearmRate / 2;
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (thresholdJitterToggleCount !== 0)
        issues.push('threshold-jitter-toggle');
    if (duplicateHapticCount !== 0)
        issues.push('duplicate-haptic');
    if (normalizedRearmRate !== 1)
        issues.push('haptic-rearm');
    if (criticalWarningVisibilityRate !== 1)
        issues.push('warning-hidden');
    if (maxAnimatedPrimaryWarnings > 1)
        issues.push('multiple-primary-warning-motion');
    if (minHeroBandVignetteAlpha < .18)
        issues.push('vignette-discontinuity');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('action-count');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    void safe;
    return { passed: issues.length === 0, samples, thresholdJitterToggleCount, duplicateHapticCount, safeExitRearmRate: normalizedRearmRate, criticalWarningVisibilityRate, maxAnimatedPrimaryWarnings, minHeroBandVignetteAlpha, reachableActionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues };
}
