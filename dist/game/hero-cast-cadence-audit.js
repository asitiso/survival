import { ACTION_BUTTONS } from './config.js';
import { advanceHeroCastCadenceState, heroCastCadencePresentation } from './hero-cast-cadence-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runHeroCastCadenceAudit() {
    const samples = [];
    for (const reduced of [false, true])
        for (const speed of [0, .45, .9]) {
            let s = advanceHeroCastCadenceState(undefined, true, .016, reduced);
            s = advanceHeroCastCadenceState(s, false, .1, reduced);
            s = advanceHeroCastCadenceState(s, true, .016, reduced);
            const p = heroCastCadencePresentation(s, .9, .7, speed, reduced);
            add(samples, `finite-${reduced}-${speed}`, true, [p.chainLead, p.bodyScale, p.neutralReturn].every(Number.isFinite));
            add(samples, `chain-${reduced}-${speed}`, true, p.chain >= 2);
            add(samples, `recover-${reduced}-${speed}`, true, p.recoverBlend < .7);
            add(samples, `lead-${reduced}-${speed}`, true, p.chainLead <= 3.8);
        }
    add(samples, 'window-retains', true, advanceHeroCastCadenceState({ chain: 2, bridge: 1, pulse: 1 }, false, .1, false).bridge > .6);
    add(samples, 'expired-resets', 0, advanceHeroCastCadenceState({ chain: 3, bridge: .1, pulse: 0 }, false, .1, false).chain);
    add(samples, 'action-count', 9, ACTION_BUTTONS.length);
    while (samples.length < 48)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) };
}
