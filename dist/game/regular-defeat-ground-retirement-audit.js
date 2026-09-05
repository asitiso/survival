import { ACTION_BUTTONS } from './config.js';
import { regularDefeatGroundRetirementPresentation } from './regular-defeat-ground-retirement-rendering.js';
const TYPES = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman', 'golden', 'elite'];
export function runRegularDefeatGroundRetirementAudit() { const samples = []; for (const type of TYPES)
    for (const progress of [0, .48, .93])
        for (const offset of [2, 12])
            for (const reduced of [false, true]) {
                const p = regularDefeatGroundRetirementPresentation(type, progress, { offsetX: offset, offsetY: -offset * .42, alpha: 1 - progress * .78, radius: type === 'elite' ? 28 : 18 }, reduced);
                samples.push({ id: `${type}-${progress}-${offset}-${reduced}`, passed: p.groundPulseScale === 0 && p.shadowAlpha >= 0 && p.shadowAlpha <= .42 && Math.abs(p.shadowOffsetX) <= 2.8 && Math.abs(p.shadowOffsetY) <= 1.8 && p.widthScale >= .78 && p.widthScale <= 1.2 });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 96 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
