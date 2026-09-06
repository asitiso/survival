import { ACTION_BUTTONS } from './config.js';
import { specialistRecoveryHitHandoffPresentation } from './specialist-recovery-hit-handoff-rendering.js';
export function runSpecialistRecoveryHitHandoffAudit() { const samples = []; for (const tier of ['normal', 'heavy', 'critical'])
    for (const reduced of [false, true])
        for (const resolve of [0, .35, .7, 1])
            for (const hit of [.2, .7, 1]) {
                const p = specialistRecoveryHitHandoffPresentation({ pullback: 0, lunge: 0, resolve, hitStagger: hit, tier }, reduced);
                samples.push({ id: `${tier}-${reduced}-${resolve}-${hit}`, passed: [p.attackResolveScale, p.hitStaggerScale, p.silhouetteAlphaScale, p.yieldStrength].every(v => Number.isFinite(v) && v >= 0 && v <= 1) });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
