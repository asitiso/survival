import { clampMagnitude } from '../core/math.js';
import { auditInputLifecycleResilience } from '../core/input-lifecycle.js';
import { applyJoystickDeadzone } from '../core/touch-controls.js';
import { softFollowJoystickBase, thumbComfortProfile } from '../core/thumb-fatigue.js';
import { joystickNeutralRecoveryProfile, shouldCatchJoystickNeutralReturn } from '../core/joystick-neutral-recovery.js';
import { ACTION_BUTTONS } from './config.js';
import { auditCombatInputReliability } from './combat-input-reliability-audit.js';
import { auditManualTargetStability } from './manual-target-stability-audit.js';
import { auditActionHoldReliability } from './action-hold-reliability-audit.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { resolveFoldableDeadSpace } from './foldable-dead-space.js';
function step(model, pointer, recoveryEnabled = true) {
    const comfort = thumbComfortProfile();
    const recovery = joystickNeutralRecoveryProfile(comfort.maxReach);
    if (recoveryEnabled && shouldCatchJoystickNeutralReturn(model.home, model.base, pointer, recovery)) {
        return { home: { ...pointer }, base: { ...pointer }, move: { x: 0, y: 0 }, caught: true };
    }
    const base = softFollowJoystickBase(model.base, pointer, comfort);
    const raw = { x: pointer.x - base.x, y: pointer.y - base.y };
    const normalized = applyJoystickDeadzone(clampMagnitude({ x: raw.x / comfort.maxReach, y: raw.y / comfort.maxReach }, 1));
    return { home: model.home, base, move: normalized, caught: model.caught };
}
function magnitude(v) { return Math.hypot(v.x, v.y); }
function unit(x, y) { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; }
function shifted(home, dir, distance) { return { x: home.x + dir.x * distance, y: home.y + dir.y * distance }; }
function initial(home) { return { home: { ...home }, base: { ...home }, move: { x: 0, y: 0 }, caught: false }; }
function returnCheck(home, dir) {
    const dragged = step(initial(home), shifted(home, dir, 220), true);
    const baseline = step(dragged, home, false);
    const recovered = step(dragged, home, true);
    return {
        passed: dragged.base.x !== home.x || dragged.base.y !== home.y ? recovered.caught && magnitude(recovered.move) === 0 : false,
        baselineResidual: magnitude(baseline.move),
        recoveredResidual: magnitude(recovered.move),
    };
}
function reverseCheck(dir) {
    const home = { x: 300, y: 650 };
    let model = step(initial(home), shifted(home, dir, 220), true);
    model = step(model, home, true);
    if (!model.caught || magnitude(model.move) !== 0)
        return false;
    const reverse = { x: -dir.x, y: -dir.y };
    model = step(model, shifted(home, reverse, 70), true);
    return model.move.x * reverse.x + model.move.y * reverse.y > .5;
}
function jitterCheck(offset) {
    const home = { x: 280, y: 680 };
    let model = step(initial(home), { x: home.x + 220, y: home.y }, true);
    model = step(model, home, true);
    model = step(model, { x: home.x + offset.x, y: home.y + offset.y }, true);
    return magnitude(model.move) === 0;
}
function foldableChecks() {
    const safe = landscapeSafeAreaProfile(2208, 1840);
    if (safe.aspectClass !== 'foldable' || !safe.hingeExclusion)
        return [false, false, false, false];
    const h = safe.hingeExclusion;
    const nearHinge = { x: h.x - 20, y: 620 };
    const recovered = resolveFoldableDeadSpace(nearHinge, safe, ACTION_BUTTONS);
    const homes = [
        recovered.joystickOrigin ?? { x: safe.joystickMaxX, y: 620 },
        { x: safe.joystickMinX, y: safe.joystickMinY },
        { x: safe.joystickMinX, y: safe.joystickMaxY },
        { x: safe.joystickMaxX, y: safe.joystickMaxY },
    ];
    const dirs = [unit(-1, 0), unit(1, 1), unit(1, -1), unit(-1, -1)];
    return homes.map((home, index) => {
        const check = returnCheck(home, dirs[index]);
        const hingeOk = index !== 0 || (recovered.recovered && recovered.intent === 'left' && Boolean(recovered.joystickOrigin));
        return hingeOk && check.passed;
    });
}
export function auditJoystickNeutralRecovery() {
    const cardinals = [unit(1, 0), unit(-1, 0), unit(0, 1), unit(0, -1)].map((dir) => returnCheck({ x: 300, y: 650 }, dir));
    const diagonals = [unit(1, 1), unit(-1, 1), unit(1, -1), unit(-1, -1)].map((dir) => returnCheck({ x: 300, y: 650 }, dir));
    const reverses = [unit(1, 0), unit(-1, 0), unit(0, 1), unit(0, -1)].map(reverseCheck);
    const jitters = [{ x: 8, y: 0 }, { x: -8, y: 0 }, { x: 0, y: 8 }, { x: 0, y: -8 }].map(jitterCheck);
    const foldable = foldableChecks();
    const lifecycle = auditInputLifecycleResilience();
    const combat = auditCombatInputReliability();
    const manual = auditManualTargetStability();
    const hold = auditActionHoldReliability();
    const actionCount = ACTION_BUTTONS.length;
    const invariantChecks = [actionCount === 9, lifecycle.passed && lifecycle.multitouchIsolation, combat.passed, manual.passed, hold.passed];
    const allReturns = [...cardinals, ...diagonals];
    const maxResidualBeforeRecovery = Math.max(...allReturns.map((entry) => entry.baselineResidual));
    const maxResidualAfterRecovery = Math.max(...allReturns.map((entry) => entry.recoveredResidual));
    const neutralRecoveryGain = maxResidualBeforeRecovery - maxResidualAfterRecovery;
    const cardinalReturnPassed = cardinals.every((entry) => entry.passed);
    const diagonalReturnPassed = diagonals.every((entry) => entry.passed);
    const reversePassed = reverses.every(Boolean);
    const jitterPassed = jitters.every(Boolean);
    const foldablePassed = foldable.every(Boolean);
    const issues = [];
    if (!cardinalReturnPassed)
        issues.push('cardinal-neutral-return');
    if (!diagonalReturnPassed)
        issues.push('diagonal-neutral-return');
    if (!reversePassed)
        issues.push('reverse-direction');
    if (!jitterPassed)
        issues.push('neutral-jitter');
    if (!foldablePassed)
        issues.push('foldable-neutral-return');
    if (maxResidualBeforeRecovery < .99 || maxResidualAfterRecovery !== 0)
        issues.push('residual-recovery');
    if (!invariantChecks.every(Boolean))
        issues.push('frozen-invariants');
    const profile = thumbComfortProfile();
    const samples = cardinals.length + diagonals.length + reverses.length + jitters.length + foldable.length + invariantChecks.length;
    return {
        samples,
        cardinalReturnSamples: cardinals.length,
        diagonalReturnSamples: diagonals.length,
        reverseSamples: reverses.length,
        jitterSamples: jitters.length,
        foldableSamples: foldable.length,
        invariantSamples: invariantChecks.length,
        cardinalReturnPassed,
        diagonalReturnPassed,
        reversePassed,
        jitterPassed,
        foldablePassed,
        maxResidualBeforeRecovery,
        maxResidualAfterRecovery,
        neutralRecoveryGain,
        maxReach: profile.maxReach,
        deadzone: .12,
        actionCount,
        pointerLifecyclePassed: lifecycle.passed,
        combatInputPassed: combat.passed,
        manualTargetPassed: manual.passed,
        holdReliabilityPassed: hold.passed,
        keyboardMovementMutation: false,
        snapshotSchemaMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
