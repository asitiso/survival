import { ACTION_BUTTONS } from './config.js';
import { specialistSilhouetteCrowdBudgetPresentation } from './specialist-silhouette-crowd-budget-rendering.js';
export function runSpecialistSilhouetteCrowdBudgetAudit() { const samples = []; for (const count of [1, 4, 8, 12])
    for (const owner of ['locomotion', 'strike', 'resolve', 'hit'])
        for (const reduced of [false, true]) {
            const p = specialistSilhouetteCrowdBudgetPresentation({ specialistCount: count, owner, hit: owner === 'hit' ? .8 : 0, baseAlpha: .6 }, reduced);
            samples.push({ id: `${count}-${owner}-${reduced}`, passed: p.alphaScale > 0 && p.alphaScale <= 1 && p.trailScale > 0 && p.trailScale <= 1 && p.shapeScale >= .4 && p.shapeScale <= 1 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 32 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
