import { ACTION_BUTTONS } from './config.js';
import { advanceSafeLaneGapFeatherHysteresisState } from './safe-lane-gap-feather-hysteresis-rendering.js';
export function runSafeLaneGapFeatherHysteresisAudit() { const samples = []; for (const reduced of [false, true])
    for (const shift of [0, .1, .2]) {
        let s = advanceSafeLaneGapFeatherHysteresisState(undefined, { start: .3, end: .5 }, 1, reduced);
        s = advanceSafeLaneGapFeatherHysteresisState(s, { start: .3 + shift, end: .5 + shift }, 1.016, reduced);
        samples.push({ id: `move-${reduced}-${shift}`, passed: s.visible && s.start >= 0 && s.end <= 1 && s.start <= s.end && s.release >= 0 });
        s = advanceSafeLaneGapFeatherHysteresisState(s, null, 1.05, reduced);
        samples.push({ id: `release-${reduced}-${shift}`, passed: Number.isFinite(s.start) && Number.isFinite(s.end) && s.release >= 0 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
