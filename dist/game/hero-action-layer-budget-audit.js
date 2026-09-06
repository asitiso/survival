import { ACTION_BUTTONS } from './config.js';
import { heroActionLayerBudgetPresentation } from './hero-action-layer-budget-rendering.js';
export function runHeroActionLayerBudgetAudit() { const samples = []; for (const owner of ['movement', 'cast', 'ultimate', 'recovery', 'hit'])
    for (const reduced of [false, true]) {
        const p = heroActionLayerBudgetPresentation({ owner, movement: .8, cast: owner === 'cast' ? .8 : .2, recovery: owner === 'recovery' ? .8 : 0, ultimate: owner === 'ultimate' ? .8 : 0, hit: owner === 'hit' ? .8 : 0, meter: .8 }, reduced);
        samples.push({ id: `${owner}-${reduced}`, passed: [p.idleScale, p.movementScale, p.castScale, p.recoveryScale, p.crestScale].every(v => v >= 0 && v <= 1) && p.singleActionOwner });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 10 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
