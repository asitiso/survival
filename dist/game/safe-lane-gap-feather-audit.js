import { ACTION_BUTTONS } from './config.js';
import { safeLaneGapFeatherPresentation } from './safe-lane-gap-feather-rendering.js';
export function runSafeLaneGapFeatherAudit() { const samples = []; for (const reduced of [false, true])
    for (const start of [.05, .3, .45])
        for (const end of [.55, .7, .95]) {
            const p = safeLaneGapFeatherPresentation({ from: { x: 100, y: 100 }, to: { x: 500, y: 100 }, gap: { start, end } }, reduced);
            samples.push({ id: `${reduced}-${start}-${end}`, passed: p.locatorVisible && p.bodySegments.length >= 1 && p.bodySegments.length <= 2 && p.featherSegments.length >= 2 && p.featherSegments.every(s => s.alphaScale >= 0 && s.alphaScale <= 1 && [s.from.x, s.from.y, s.to.x, s.to.y].every(Number.isFinite)) });
        } const clear = safeLaneGapFeatherPresentation({ from: { x: 100, y: 100 }, to: { x: 500, y: 100 }, gap: null }, false); samples.push({ id: 'clear', passed: !clear.gapApplied && clear.bodySegments.length === 1 && clear.featherSegments.length === 0 }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 19 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
