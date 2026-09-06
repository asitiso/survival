import { ACTION_BUTTONS } from './config.js';
import { coreHitWorldGuardArbitrationPresentation } from './core-hit-world-guard-arbitration-rendering.js';
export function runCoreHitWorldGuardArbitrationAudit() { const samples = []; for (const reduced of [false, true])
    for (const world of [0, .08, .22, .72])
        for (const mitigation of [0, .42, .78, 1]) {
            const p = coreHitWorldGuardArbitrationPresentation({ worldGuardStrength: world, mitigationRatio: mitigation, worldDamageOwned: false, hitTtl: .28, hitMaxTtl: .34 }, reduced);
            samples.push({ id: `${reduced}-${world}-${mitigation}`, passed: p.coreHitAlphaScale >= 0 && p.coreHitAlphaScale <= 1 && p.coreHitSizeScale >= .8 && p.coreHitSizeScale <= 1 && (!(world >= .14 && mitigation >= .62) || p.owner === 'world-guard') });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 32 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
