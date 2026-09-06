import { ACTION_BUTTONS } from './config.js';
import { coreGuardMixedSourceCompositionPresentation } from './core-guard-mixed-source-composition-rendering.js';
export function runCoreGuardMixedSourceCompositionAudit() { const samples = []; for (const reduced of [false, true])
    for (const sourceClass of ['projectile', 'contact', 'other'])
        for (const mixedPressure of [false, true])
            for (const owner of ['hit', 'shared', 'world-guard', 'retired']) {
                const p = coreGuardMixedSourceCompositionPresentation({ sourceClass, mixedPressure, owner, ttl: .28, maxTtl: .34 }, reduced);
                samples.push({ id: `${reduced}-${sourceClass}-${mixedPressure}-${owner}`, passed: p.projectileAccentAlpha >= 0 && p.projectileAccentAlpha <= 1 && p.contactAccentAlpha >= 0 && p.contactAccentAlpha <= 1 && p.bodyScaleX > .7 && p.bodyScaleX < 1.4 && p.bodyScaleY > .7 && p.bodyScaleY < 1.4 && !p.duplicatesDamageCue });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
