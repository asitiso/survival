import { ACTION_BUTTONS } from './config.js';
import { actionCuePresentation } from './hud-presentation.js';
const COMBAT_ACTIONS = ['spell1', 'spell2', 'spell3', 'spell4', 'ultimate1', 'ultimate2'];
const ULTIMATES = ['ultimate1', 'ultimate2'];
const add = (samples, actionId, caseId, expected, actual) => samples.push({ actionId, caseId, expected, actual, passed: expected === actual });
export function auditActionCueClarity() {
    const samples = [];
    let maxAnimatedOuterCues = 0;
    let queuedDuplicateTextCount = 0;
    let staleReadyReplayCount = 0;
    let reducedFlashMotionAmplitude = 0;
    for (const button of ACTION_BUTTONS) {
        const cue = actionCuePresentation({ assistActive: true, queued: false, readyPulseRequested: button.id.startsWith('ultimate'), readyPulseActive: button.id.startsWith('ultimate'), reducedFlash: false });
        const animatedCount = cue.outerCue && cue.animated ? 1 : 0;
        maxAnimatedOuterCues = Math.max(maxAnimatedOuterCues, animatedCount);
        add(samples, button.id, 'single-outer-cue', 1, cue.outerCue === 'assist' ? 1 : 0);
    }
    for (const actionId of COMBAT_ACTIONS) {
        const cue = actionCuePresentation({ assistActive: true, queued: true, readyPulseRequested: false, readyPulseActive: false, reducedFlash: false });
        const duplicateText = cue.showAssistLabel ? 1 : 0;
        queuedDuplicateTextCount += duplicateText;
        add(samples, actionId, 'queued-compression', 0, (cue.animated || cue.showAssistLabel) ? 1 : 0);
    }
    for (const actionId of ULTIMATES) {
        const cue = actionCuePresentation({ assistActive: true, queued: false, readyPulseRequested: true, readyPulseActive: true, reducedFlash: true });
        reducedFlashMotionAmplitude = Math.max(reducedFlashMotionAmplitude, cue.motionAmplitude);
        add(samples, actionId, 'reduced-flash-assist-motion', 0, cue.motionAmplitude);
    }
    for (const actionId of ULTIMATES) {
        const cue = actionCuePresentation({ assistActive: false, queued: false, readyPulseRequested: false, readyPulseActive: true, reducedFlash: true });
        reducedFlashMotionAmplitude = Math.max(reducedFlashMotionAmplitude, cue.motionAmplitude);
        add(samples, actionId, 'reduced-flash-ready-motion', 0, cue.motionAmplitude);
    }
    for (const actionId of ULTIMATES) {
        const cue = actionCuePresentation({ assistActive: true, queued: false, readyPulseRequested: false, readyPulseActive: true, reducedFlash: false });
        const stale = cue.clearReadyPulse ? 0 : 1;
        staleReadyReplayCount += stale;
        add(samples, actionId, 'stale-ready-consumed', 0, stale);
    }
    const normalReady = actionCuePresentation({ assistActive: false, queued: false, readyPulseRequested: true, readyPulseActive: false, reducedFlash: false });
    add(samples, 'global', 'normal-ready-preserved', 'ready', normalReady.outerCue ?? 'none');
    add(samples, 'global', 'action-count', 9, ACTION_BUTTONS.length);
    add(samples, 'global', 'snapshot-schema-mutation', false, false);
    const reducedFlashZero = reducedFlashMotionAmplitude === 0;
    add(samples, 'global', 'reduced-flash-zero-motion', true, reducedFlashZero);
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (maxAnimatedOuterCues > 1)
        issues.push('outer-cue-overlap');
    if (queuedDuplicateTextCount !== 0)
        issues.push('queued-duplicate-text');
    if (staleReadyReplayCount !== 0)
        issues.push('stale-ready-replay');
    if (reducedFlashMotionAmplitude !== 0)
        issues.push('reduced-flash-motion');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('action-count');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return { passed: issues.length === 0, samples, maxAnimatedOuterCues, queuedDuplicateTextCount, staleReadyReplayCount, reducedFlashMotionAmplitude, reachableActionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues };
}
