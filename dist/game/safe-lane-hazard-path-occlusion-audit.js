import { ACTION_BUTTONS } from './config.js';
import { safeLaneHazardPathOcclusionPresentation } from './safe-lane-hazard-path-occlusion-rendering.js';
export function runSafeLaneHazardPathOcclusionAudit() { const samples = []; for (const reduced of [false, true])
    for (const telegraph of [.1, .3, .7, 1.4])
        for (const y of [100, 180, 320]) {
            const p = safeLaneHazardPathOcclusionPresentation({ from: { x: 100, y: 100 }, to: { x: 500, y: 100 }, hazards: [{ pos: { x: 300, y }, radius: 58, telegraph }] }, reduced);
            samples.push({ id: `${reduced}-${telegraph}-${y}`, passed: p.pathAlphaScale > 0 && p.pathAlphaScale <= 1 && p.locatorAlphaScale === 1 && p.arrivalAlphaScale > 0 && p.arrivalAlphaScale <= 1 && p.bridgeAlphaScale > 0 && p.bridgeAlphaScale <= 1 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
