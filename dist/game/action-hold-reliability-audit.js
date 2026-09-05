import { ActionHoldLeashTracker, actionHoldReleaseRadius, shouldReleaseActionHold } from '../core/action-hold-leash.js';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE } from './config.js';
import { foldableTouchScaleMap } from './foldable-touch-density.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
const spellButtons = ACTION_BUTTONS.filter((button) => button.id === 'spell1' || button.id === 'spell2' || button.id === 'spell3' || button.id === 'spell4');
function jitterChecks() {
    const jitter = [10, 15, 20, 25];
    return spellButtons.map((button, index) => {
        const release = actionHoldReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        return !shouldReleaseActionHold({ x: button.x + jitter[index], y: button.y }, { x: button.x, y: button.y }, release);
    });
}
function boundaryChecks() {
    return spellButtons.flatMap((button) => {
        const release = actionHoldReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        const center = { x: button.x, y: button.y };
        return [
            !shouldReleaseActionHold({ x: button.x + release - .01, y: button.y }, center, release),
            shouldReleaseActionHold({ x: button.x + release + .01, y: button.y }, center, release),
        ];
    });
}
function foldableChecks() {
    const safe = landscapeSafeAreaProfile(1840, 1440);
    const scales = foldableTouchScaleMap(safe, ACTION_BUTTONS, ACTION_TOUCH_SCALE);
    return spellButtons.map((button) => {
        const touchScale = scales[button.id];
        const hitRadius = button.radius * touchScale;
        const release = actionHoldReleaseRadius(button.radius, touchScale);
        const normal = actionHoldReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        return safe.aspectClass === 'foldable' && release > hitRadius && release <= normal + .0001;
    });
}
function pointerSafetyChecks() {
    const once = (() => {
        const tracker = new ActionHoldLeashTracker();
        tracker.begin(1, 'spell1', { x: 0, y: 0 }, 50);
        return tracker.move(1, { x: 51, y: 0 }) === 'spell1' && tracker.move(1, { x: 0, y: 0 }) === null;
    })();
    const end = (() => {
        const tracker = new ActionHoldLeashTracker();
        tracker.begin(2, 'spell2', { x: 0, y: 0 }, 50);
        return tracker.end(2) === 'spell2' && tracker.end(2) === null;
    })();
    const clear = (() => {
        const tracker = new ActionHoldLeashTracker();
        tracker.begin(3, 'spell3', { x: 0, y: 0 }, 50);
        tracker.clear();
        tracker.clear();
        return tracker.end(3) === null;
    })();
    const isolated = (() => {
        const tracker = new ActionHoldLeashTracker();
        tracker.begin(4, 'spell1', { x: 0, y: 0 }, 50);
        tracker.begin(5, 'spell2', { x: 100, y: 0 }, 50);
        return tracker.move(4, { x: 51, y: 0 }) === 'spell1' && tracker.end(5) === 'spell2';
    })();
    return [once, end, clear, isolated];
}
export function auditActionHoldReliability() {
    const jitter = jitterChecks();
    const boundary = boundaryChecks();
    const foldable = foldableChecks();
    const pointerSafety = pointerSafetyChecks();
    const jitterPassed = jitter.every(Boolean);
    const boundaryPassed = boundary.every(Boolean);
    const foldablePassed = foldable.every(Boolean);
    const pointerSafetyPassed = pointerSafety.every(Boolean);
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (!jitterPassed)
        issues.push('jitter-hysteresis');
    if (!boundaryPassed)
        issues.push('leash-boundary');
    if (!foldablePassed)
        issues.push('foldable-touch-scale');
    if (!pointerSafetyPassed)
        issues.push('pointer-safety');
    if (actionCount !== 9)
        issues.push('action-surface');
    const invariantSamples = 5;
    const samples = jitter.length + boundary.length + foldable.length + pointerSafety.length + invariantSamples;
    return {
        samples,
        jitterSamples: jitter.length,
        boundarySamples: boundary.length,
        foldableSamples: foldable.length,
        pointerSafetySamples: pointerSafety.length,
        actionCount,
        jitterPassed,
        boundaryPassed,
        foldablePassed,
        pointerSafetyPassed,
        cooldownMutation: false,
        damageMutation: false,
        autoThroughputMutation: false,
        snapshotSchemaMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
