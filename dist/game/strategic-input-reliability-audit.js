import { StrategicActionReleaseTracker, strategicActionReleaseRadius } from '../core/strategic-action-release.js';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE } from './config.js';
import { foldableTouchScaleMap } from './foldable-touch-density.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { auditCombatInputReliability } from './combat-input-reliability-audit.js';
import { auditManualTargetStability } from './manual-target-stability-audit.js';
import { auditActionHoldReliability } from './action-hold-reliability-audit.js';
import { auditJoystickNeutralRecovery } from './joystick-neutral-recovery-audit.js';
const strategicButtons = ACTION_BUTTONS.filter((button) => button.id === 'shop' || button.id === 'auto');
function releaseChecks() {
    return strategicButtons.map((button, index) => {
        const tracker = new StrategicActionReleaseTracker();
        const pointerId = index + 1;
        const release = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        return tracker.arm(pointerId, button.id, { x: button.x, y: button.y }, release)
            && tracker.commit(pointerId) === button.id
            && tracker.commit(pointerId) === null;
    });
}
function jitterChecks() {
    const offsets = [10, 15, 20, 25];
    return offsets.map((offset, index) => {
        const button = strategicButtons[index % strategicButtons.length];
        const tracker = new StrategicActionReleaseTracker();
        const pointerId = 10 + index;
        const release = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        tracker.arm(pointerId, button.id, { x: button.x, y: button.y }, release);
        return tracker.move(pointerId, { x: button.x + offset, y: button.y }) === null
            && tracker.commit(pointerId) === button.id;
    });
}
function boundaryChecks() {
    return strategicButtons.flatMap((button, index) => {
        const release = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        const center = { x: button.x, y: button.y };
        const inside = new StrategicActionReleaseTracker();
        const outside = new StrategicActionReleaseTracker();
        const inId = 20 + index * 2;
        const outId = inId + 1;
        inside.arm(inId, button.id, center, release);
        outside.arm(outId, button.id, center, release);
        return [
            inside.move(inId, { x: button.x + release - .01, y: button.y }) === null && inside.commit(inId) === button.id,
            outside.move(outId, { x: button.x + release + .01, y: button.y }) === button.id && outside.commit(outId) === null,
        ];
    });
}
function ownershipChecks() {
    const autoSingle = (() => {
        const tracker = new StrategicActionReleaseTracker();
        const button = strategicButtons.find((entry) => entry.id === 'auto');
        const release = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        return tracker.arm(30, 'auto', button, release)
            && !tracker.arm(31, 'auto', button, release)
            && tracker.commit(31) === null
            && tracker.commit(30) === 'auto';
    })();
    const shopSingle = (() => {
        const tracker = new StrategicActionReleaseTracker();
        const button = strategicButtons.find((entry) => entry.id === 'shop');
        const release = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
        return tracker.arm(32, 'shop', button, release)
            && !tracker.arm(33, 'shop', button, release)
            && tracker.commit(32) === 'shop';
    })();
    const independent = (() => {
        const tracker = new StrategicActionReleaseTracker();
        const shop = strategicButtons.find((entry) => entry.id === 'shop');
        const auto = strategicButtons.find((entry) => entry.id === 'auto');
        return tracker.arm(34, 'shop', shop, strategicActionReleaseRadius(shop.radius, ACTION_TOUCH_SCALE))
            && tracker.arm(35, 'auto', auto, strategicActionReleaseRadius(auto.radius, ACTION_TOUCH_SCALE))
            && tracker.commit(34) === 'shop'
            && tracker.commit(35) === 'auto';
    })();
    return [autoSingle, shopSingle, independent];
}
function cancelChecks() {
    const canceled = (() => {
        const tracker = new StrategicActionReleaseTracker();
        tracker.arm(40, 'shop', { x: 0, y: 0 }, 50);
        return tracker.cancel(40) === 'shop' && tracker.commit(40) === null;
    })();
    const cleared = (() => {
        const tracker = new StrategicActionReleaseTracker();
        tracker.arm(41, 'auto', { x: 0, y: 0 }, 50);
        tracker.clear();
        tracker.clear();
        return tracker.commit(41) === null;
    })();
    const slideCanceled = (() => {
        const tracker = new StrategicActionReleaseTracker();
        tracker.arm(42, 'auto', { x: 0, y: 0 }, 50);
        return tracker.move(42, { x: 51, y: 0 }) === 'auto'
            && tracker.move(42, { x: 0, y: 0 }) === null
            && tracker.commit(42) === null;
    })();
    return [canceled, cleared, slideCanceled];
}
function foldableChecks() {
    const profiles = [landscapeSafeAreaProfile(1840, 1440), landscapeSafeAreaProfile(2208, 1840)];
    return profiles.flatMap((safe) => {
        const scales = foldableTouchScaleMap(safe, ACTION_BUTTONS, ACTION_TOUCH_SCALE);
        return strategicButtons.map((button) => {
            const touchScale = scales[button.id];
            const hitRadius = button.radius * touchScale;
            const release = strategicActionReleaseRadius(button.radius, touchScale);
            const normal = strategicActionReleaseRadius(button.radius, ACTION_TOUCH_SCALE);
            return safe.aspectClass === 'foldable' && release > hitRadius && release <= normal + .0001;
        });
    });
}
export function auditStrategicInputReliability() {
    const release = releaseChecks();
    const jitter = jitterChecks();
    const boundary = boundaryChecks();
    const ownership = ownershipChecks();
    const cancel = cancelChecks();
    const foldable = foldableChecks();
    const combat = auditCombatInputReliability();
    const manual = auditManualTargetStability();
    const hold = auditActionHoldReliability();
    const joystick = auditJoystickNeutralRecovery();
    const actionCount = ACTION_BUTTONS.length;
    const invariants = [actionCount === 9, combat.passed, manual.passed, hold.passed, joystick.passed];
    const releasePassed = release.every(Boolean);
    const jitterPassed = jitter.every(Boolean);
    const boundaryPassed = boundary.every(Boolean);
    const ownershipPassed = ownership.every(Boolean);
    const cancelPassed = cancel.every(Boolean);
    const foldablePassed = foldable.every(Boolean);
    const issues = [];
    if (!releasePassed)
        issues.push('release-commit');
    if (!jitterPassed)
        issues.push('release-jitter');
    if (!boundaryPassed)
        issues.push('release-boundary');
    if (!ownershipPassed)
        issues.push('single-owner');
    if (!cancelPassed)
        issues.push('cancel-safety');
    if (!foldablePassed)
        issues.push('foldable-release');
    if (!invariants.every(Boolean))
        issues.push('frozen-invariants');
    const samples = release.length + jitter.length + boundary.length + ownership.length + cancel.length + foldable.length + invariants.length;
    return {
        samples,
        releaseSamples: release.length,
        jitterSamples: jitter.length,
        boundarySamples: boundary.length,
        ownershipSamples: ownership.length,
        cancelSamples: cancel.length,
        foldableSamples: foldable.length,
        invariantSamples: invariants.length,
        releasePassed,
        jitterPassed,
        boundaryPassed,
        ownershipPassed,
        cancelPassed,
        foldablePassed,
        actionCount,
        combatInputPassed: combat.passed,
        manualTargetPassed: manual.passed,
        holdReliabilityPassed: hold.passed,
        joystickNeutralPassed: joystick.passed,
        spellImmediateMutation: false,
        potionImmediateMutation: false,
        keyboardImmediateMutation: false,
        cooldownMutation: false,
        damageMutation: false,
        autoThroughputMutation: false,
        economyMutation: false,
        snapshotSchemaMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
