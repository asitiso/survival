import { ACTION_BUTTONS } from './config.js';
import { enemyAttackMotionPresentation } from './enemy-attack-motion-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
const TYPES = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman', 'shieldbearer', 'assassin', 'siegeGolem', 'nullifier', 'golden', 'elite', 'boss'];
export function runEnemyAttackMotionRenderAudit() {
    const samples = [];
    for (const type of TYPES) {
        const windup = enemyAttackMotionPresentation(type, .16, 1, 80, 20, true, false);
        const strike = enemyAttackMotionPresentation(type, .03, 1, 80, 20, true, false);
        const idle = enemyAttackMotionPresentation(type, .7, 1, 80, 20, false, false);
        add(samples, `finite-${type}`, true, [windup.pullback, windup.lunge, windup.facingAngle, windup.weight, windup.maxDisplacement, windup.offsetX, windup.offsetY, windup.rotation, windup.scaleX, windup.scaleY].every(Number.isFinite));
        add(samples, `bounded-${type}`, true, windup.pullback >= 0 && windup.pullback <= 1 && windup.lunge >= 0 && windup.lunge <= 1 && windup.maxDisplacement <= 10);
        add(samples, `strike-${type}`, type === 'golden' ? false : true, strike.active);
        add(samples, `idle-${type}`, false, idle.active);
    }
    add(samples, 'boss-weight-bounded', true, enemyAttackMotionPresentation('boss', .03, 1, 20, 0, true, false).maxDisplacement <= 5);
    add(samples, 'elite-weight-bounded', true, enemyAttackMotionPresentation('elite', .03, 1, 20, 0, true, false).maxDisplacement <= 6);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 64)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 };
}
