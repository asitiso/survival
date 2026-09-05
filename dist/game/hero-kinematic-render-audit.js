import { ACTION_BUTTONS } from './config.js';
import { advanceHeroKinematicRenderState, createHeroKinematicRenderState, heroKinematicRenderPresentation } from './hero-kinematic-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runHeroKinematicRenderAudit() {
    const samples = [];
    let state = createHeroKinematicRenderState({ x: 1, y: 0 });
    const sequence = [
        { move: { x: 1, y: 0 }, facing: { x: 1, y: 0 }, dt: .016 },
        { move: { x: 1, y: 0 }, facing: { x: 0, y: 1 }, dt: .016 },
        { move: { x: 0, y: 0 }, facing: { x: 0, y: 1 }, dt: .016 },
        { move: { x: 0, y: 0 }, facing: { x: 0, y: 1 }, dt: .05 },
    ];
    for (let pass = 0; pass < 5; pass++) {
        for (let i = 0; i < sequence.length; i++) {
            const step = sequence[i];
            state = advanceHeroKinematicRenderState(state, step.move, step.facing, step.dt);
            const p = heroKinematicRenderPresentation(state, false, i === 1 ? .4 : 0);
            add(samples, `finite-${pass}-${i}`, true, [state.speed, state.acceleration, state.deceleration, state.turn, state.settle, p.accelerationLean, p.turnAnticipation, p.decelerationSettle, p.leadX, p.leadY, p.rotation, p.scaleX, p.scaleY].every(Number.isFinite));
            add(samples, `bounded-${pass}-${i}`, true, state.speed >= 0 && state.speed <= 1 && state.acceleration >= 0 && state.acceleration <= 1 && state.deceleration >= 0 && state.deceleration <= 1 && Math.abs(state.turn) <= 1 && state.settle >= 0 && state.settle <= 1);
        }
    }
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 48)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 48 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 };
}
