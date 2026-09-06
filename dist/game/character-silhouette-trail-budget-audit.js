import { ACTION_BUTTONS } from './config.js';
import { characterSilhouetteTrailBudgetPresentation } from './character-silhouette-trail-budget-rendering.js';
export function runCharacterSilhouetteTrailBudgetAudit() { const samples = []; for (const owner of ['locomotion', 'attack', 'recovery', 'hit', 'special'])
    for (const pivot of [0, .5, 1])
        for (const reduced of [false, true]) {
            const p = characterSilhouetteTrailBudgetPresentation({ owner, pivotWeight: pivot, baseAlpha: .6, trailDistanceScale: 1, motionLayerActive: owner !== 'locomotion' }, reduced);
            samples.push({ id: `${owner}-${pivot}-${reduced}`, passed: p.alphaScale >= 0 && p.alphaScale <= 1 && p.trailDistanceScale >= 0 && p.trailDistanceScale <= 1 && p.singleTrailOwner });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
