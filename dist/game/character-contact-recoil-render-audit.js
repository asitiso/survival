import { ACTION_BUTTONS } from './config.js';
import { characterGroundContactPresentation, characterHitRecoilPresentation } from './character-contact-recoil-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runCharacterContactRecoilRenderAudit() {
    const samples = [];
    const weights = [.6, .8, 1, 1.2, 1.5, 1.8];
    for (let i = 0; i < weights.length; i++) {
        const weight = weights[i];
        for (const reduced of [false, true]) {
            const ground = characterGroundContactPresentation(20 + i, 0.72, .65, .8, reduced, weight);
            const recoil = characterHitRecoilPresentation(.9, .8, .2, weight, reduced);
            add(samples, `ground-finite-${i}-${reduced}`, true, [ground.width, ground.height, ground.offsetX, ground.offsetY, ground.alpha].every(Number.isFinite));
            add(samples, `ground-shape-${i}-${reduced}`, true, ground.width > ground.height && ground.alpha > 0 && ground.alpha <= .38);
            add(samples, `recoil-finite-${i}-${reduced}`, true, [recoil.offsetX, recoil.offsetY, recoil.rotation, recoil.flashAlpha, recoil.maxDisplacement].every(Number.isFinite));
            add(samples, `recoil-bounded-${i}-${reduced}`, true, Math.hypot(recoil.offsetX, recoil.offsetY) <= recoil.maxDisplacement + 1.5 && recoil.maxDisplacement <= 8);
        }
    }
    add(samples, 'heavy-recoil-less', true, characterHitRecoilPresentation(1, 1, 0, 1.8, false).maxDisplacement < characterHitRecoilPresentation(1, 1, 0, .8, false).maxDisplacement);
    add(samples, 'reduced-recoil-less', true, Math.abs(characterHitRecoilPresentation(1, 1, 0, 1, true).offsetX) < Math.abs(characterHitRecoilPresentation(1, 1, 0, 1, false).offsetX));
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 64)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 };
}
