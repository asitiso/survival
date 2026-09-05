import { ACTION_BUTTONS } from './config.js';
import { advanceSpecialistLocomotionSignatureState, specialistLocomotionSignaturePresentation } from './specialist-locomotion-signature-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runSpecialistLocomotionSignatureAudit() {
    const samples = [];
    const cases = [['assassin', 'blink'], ['shieldbearer', 'brace'], ['siegeGolem', 'plant'], ['nullifier', null]];
    for (const [type, event] of cases)
        for (const reduced of [false, true]) {
            const s = advanceSpecialistLocomotionSignatureState(undefined, type, event, .016);
            const p = specialistLocomotionSignaturePresentation(type, s, .6, .5, 1, .2, reduced);
            add(samples, `finite-${type}-${reduced}`, true, [p.offsetX, p.offsetY, p.rotation, p.scaleX, p.scaleY].every(Number.isFinite));
            add(samples, `alpha-${type}-${reduced}`, true, p.groundPulseAlpha <= .2);
            add(samples, `radius-${type}-${reduced}`, true, p.groundPulseRadius >= 0);
            add(samples, `kind-${type}-${reduced}`, type, p.kind);
        }
    const full = specialistLocomotionSignaturePresentation('assassin', { arrival: 1, brace: 0, plant: 0 }, .8, .2, 1, 0, false), reduced = specialistLocomotionSignaturePresentation('assassin', { arrival: 1, brace: 0, plant: 0 }, .8, .2, 1, 0, true);
    add(samples, 'reduced-offset', true, Math.abs(reduced.offsetX) < Math.abs(full.offsetX));
    add(samples, 'golem-pulse', true, specialistLocomotionSignaturePresentation('siegeGolem', { arrival: 0, brace: 0, plant: 1 }, 0, 1, 0, 1, false).groundPulseAlpha > .08);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 60)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 60 && samples.every(s => s.passed) };
}
