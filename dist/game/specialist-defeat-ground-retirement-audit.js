import { ACTION_BUTTONS } from './config.js';
import { specialistDefeatGroundRetirementPresentation } from './specialist-defeat-ground-retirement-rendering.js';
const TYPES = ['shieldbearer', 'assassin', 'siegeGolem', 'nullifier'];
export function runSpecialistDefeatGroundRetirementAudit() { const samples = []; for (const type of TYPES)
    for (const progress of [0, .45, .92])
        for (const offset of [2, 9])
            for (const reduced of [false, true]) {
                const p = specialistDefeatGroundRetirementPresentation(type, progress, { offsetX: offset, offsetY: -offset * .4, alpha: 1 - progress * .72, radius: type === 'siegeGolem' ? 28 : 18 }, reduced);
                samples.push({ id: `${type}-${progress}-${offset}-${reduced}`, passed: p.groundPulseScale === 0 && p.shadowAlpha >= 0 && p.shadowAlpha <= .42 && Math.abs(p.shadowOffsetX) <= 2.8 && Math.abs(p.shadowOffsetY) <= 1.8 && p.widthScale >= .78 && p.widthScale <= 1.24 });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
