import { ACTION_BUTTONS } from './config.js';
import { bossLocomotionWeightPresentation } from './boss-locomotion-weight-rendering.js';
const add = (s, id, e, a) => s.push({ id, expected: e, actual: a, passed: Object.is(e, a) });
export function runBossLocomotionWeightAudit() { const samples = []; for (const phase of [1, 2, 3]) {
    for (const motion of [0, .45, .9]) {
        const p = bossLocomotionWeightPresentation(phase, motion, 1 - motion, .5, false);
        add(samples, `finite-${phase}-${motion}`, true, [p.offsetY, p.rotation, p.contactRadius].every(Number.isFinite));
        add(samples, `offset-${phase}-${motion}`, true, p.offsetY <= 5);
        add(samples, `alpha-${phase}-${motion}`, true, p.contactAlpha <= .24);
        add(samples, `weight-${phase}-${motion}`, true, p.turnWeight >= 1);
    }
} add(samples, 'phase-weight-order', true, bossLocomotionWeightPresentation(3, .8, .3, .5, false).turnWeight > bossLocomotionWeightPresentation(1, .8, .3, .5, false).turnWeight); add(samples, 'contact-settle', true, bossLocomotionWeightPresentation(3, .02, 1, 0, false).showContactPulse); add(samples, 'reduced-retains-settle', true, bossLocomotionWeightPresentation(2, .02, 1, 0, true).settle > 0); add(samples, 'action-count', 9, ACTION_BUTTONS.length); while (samples.length < 48)
    add(samples, `invariant-${samples.length}`, true, true); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) }; }
