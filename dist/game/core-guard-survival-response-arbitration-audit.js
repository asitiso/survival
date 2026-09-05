import { ACTION_BUTTONS } from './config.js';
import { coreGuardSurvivalResponseArbitrationPresentation } from './core-guard-survival-response-arbitration-rendering.js';
export function runCoreGuardSurvivalResponseArbitrationAudit() { const samples = []; for (const reduced of [false, true])
    for (const world of [0, .08, .2, .65])
        for (const latched of [false, true]) {
            const p = coreGuardSurvivalResponseArbitrationPresentation({ worldGuardStrength: world, worldGuardOwned: latched, survivalTtl: .3, survivalMaxTtl: .42 }, reduced);
            samples.push({ id: `${reduced}-${world}-${latched}`, passed: p.survivalAlphaScale >= 0 && p.survivalAlphaScale <= 1 && (!p.worldGuardOwned || p.survivalAlphaScale === 0) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
