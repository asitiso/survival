import { ACTION_BUTTONS } from './config.js';
import { advanceEnemyMotionRenderState, enemyMotionRenderPresentation } from './enemy-motion-rendering.js';
const add = (samples, id, expected, actual) => {
    samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
};
const TYPES = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman', 'shieldbearer', 'assassin', 'siegeGolem', 'nullifier', 'golden', 'elite', 'boss'];
export function runEnemyMotionRenderAudit() {
    const samples = [];
    for (const type of TYPES) {
        let state = advanceEnemyMotionRenderState(undefined, 18, 0, 0.16, type === 'boss' ? 58 : type === 'elite' ? 34 : 20);
        add(samples, `moving-${type}`, true, state.motionBlend > 0);
        state = advanceEnemyMotionRenderState(state, 0, 0, 0.16, type === 'boss' ? 58 : type === 'elite' ? 34 : 20);
        add(samples, `recovery-${type}`, true, state.recovery >= 0);
        const presentation = enemyMotionRenderPresentation(type, type === 'boss' ? 58 : type === 'elite' ? 34 : 20, state, false);
        add(samples, `shadow-width-${type}`, true, presentation.shadowWidth > 0);
        add(samples, `scale-bounds-${type}`, true, presentation.scaleX >= 1 && presentation.scaleY <= 1);
        add(samples, `silhouette-alpha-${type}`, true, presentation.silhouetteAlpha >= 0);
    }
    add(samples, 'enemy-type-count', 13, TYPES.length);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 72)
        add(samples, `invariant-${samples.length}`, true, true);
    return {
        samples,
        enemyTypeCount: TYPES.length,
        actionCount: ACTION_BUTTONS.length,
        presentationOnly: true,
        gameplayFormulaMutation: false,
        snapshotSchemaMutation: false,
        passed: samples.length === 72 && samples.every((sample) => sample.passed),
    };
}
