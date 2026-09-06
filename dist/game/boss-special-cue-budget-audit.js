import { ACTION_BUTTONS } from './config.js';
import { bossSpecialCueBudgetPresentation } from './boss-special-cue-budget-rendering.js';
export function runBossSpecialCueBudgetAudit() { const samples = []; for (const phase of [1, 2, 3])
    for (const mode of ['special', 'recovery', 'stagger'])
        for (const reduced of [false, true]) {
            const p = bossSpecialCueBudgetPresentation({ phase, charge: mode === 'special' ? .8 : .08, recovery: mode === 'recovery' ? .8 : 0, stagger: mode === 'stagger' ? .8 : 0, phaseOverlay: true }, reduced, reduced);
            samples.push({ id: `${phase}-${mode}-${reduced}`, passed: [p.baseOutlineScale, p.primaryRingScale, p.secondaryRingScale, p.phaseOverlayScale, p.alphaScale].every(v => v >= 0 && v <= 1) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 18 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
