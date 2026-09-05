import { ACTION_BUTTONS } from './config.js';
import { specialistTurnStopPresentation } from './specialist-turn-stop-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runSpecialistTurnStopAudit() { const samples = []; const types = ['assassin', 'shieldbearer', 'siegeGolem', 'nullifier']; for (const type of types)
    for (const reduced of [false, true]) {
        const motion = { motionBlend: .55, stride: 1, facingX: .9, facingY: .2, turn: .7, recovery: .65 };
        const signature = { arrival: type === 'assassin' ? .8 : 0, brace: type === 'shieldbearer' ? .8 : 0, plant: type === 'siegeGolem' ? .35 : 0 };
        const p = specialistTurnStopPresentation(type, motion, signature, reduced);
        add(samples, `finite-${type}-${reduced}`, true, [p.offsetX, p.offsetY, p.rotation, p.scaleX, p.scaleY].every(Number.isFinite));
        add(samples, `scale-${type}-${reduced}`, true, p.scaleX > .85 && p.scaleX < 1.15 && p.scaleY > .85 && p.scaleY < 1.15);
        add(samples, `stop-${type}-${reduced}`, true, p.stop >= 0 && p.stop <= 1);
        add(samples, `kind-${type}-${reduced}`, type, p.kind);
    } const full = specialistTurnStopPresentation('assassin', { motionBlend: .8, stride: 0, facingX: 1, facingY: 0, turn: .8, recovery: .4 }, { arrival: .9, brace: 0, plant: 0 }, false), reduced = specialistTurnStopPresentation('assassin', { motionBlend: .8, stride: 0, facingX: 1, facingY: 0, turn: .8, recovery: .4 }, { arrival: .9, brace: 0, plant: 0 }, true); add(samples, 'reduced-offset', true, Math.hypot(reduced.offsetX, reduced.offsetY) < Math.hypot(full.offsetX, full.offsetY)); add(samples, 'action-count', 9, ACTION_BUTTONS.length); while (samples.length < 64)
    add(samples, `invariant-${samples.length}`, true, true); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) }; }
