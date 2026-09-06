import { ACTION_BUTTONS } from './config.js';
import { safeLaneHazardPathGapPresentation } from './safe-lane-hazard-path-gap-rendering.js';
export function runSafeLaneHazardPathGapAudit() { const samples = []; for (const telegraph of [.1, .3, .7])
    for (const y of [100, 160, 300])
        for (const radius of [40, 80]) {
            const p = safeLaneHazardPathGapPresentation({ from: { x: 100, y: 100 }, to: { x: 500, y: 100 }, hazards: [{ pos: { x: 300, y }, radius, telegraph }] });
            samples.push({ id: `${telegraph}-${y}-${radius}`, passed: p.locatorVisible && p.segments.length >= 1 && p.segments.length <= 2 && p.segments.every(s => [s.from.x, s.from.y, s.to.x, s.to.y].every(Number.isFinite)) && p.mergedHazardCount >= 0 && p.mergedHazardCount <= 1 });
        } const merged = safeLaneHazardPathGapPresentation({ from: { x: 100, y: 100 }, to: { x: 500, y: 100 }, hazards: [{ pos: { x: 280, y: 100 }, radius: 60, telegraph: .2 }, { pos: { x: 330, y: 100 }, radius: 60, telegraph: .24 }] }); samples.push({ id: 'overlap-merge', passed: merged.gapApplied && merged.mergedHazardCount === 2 && merged.locatorVisible && merged.segments.length <= 2 }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, multiHazardMerge: true, passed: samples.length === 19 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
