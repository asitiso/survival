import { ACTION_BUTTONS } from './config.js';
import { coreGuardVisualLoadBudgetPresentation } from './core-guard-visual-load-budget-rendering.js';
export function runCoreGuardVisualLoadBudgetAudit() { const samples = []; for (const reduced of [false, true])
    for (const mitigation of [.1, .35, .65, .9])
        for (const mixedPressure of [false, true]) {
            const p = coreGuardVisualLoadBudgetPresentation({ coreHitAlphaScale: .94, projectileAccentAlpha: mixedPressure ? .48 : .28, contactAccentAlpha: mixedPressure ? .42 : 0, mitigationRatio: mitigation, mixedPressure }, reduced);
            samples.push({ id: `${reduced}-${mitigation}-${mixedPressure}`, passed: p.coreHitAlphaScale >= 0 && p.coreHitAlphaScale <= 1 && p.accentAlphaScale > 0 && p.accentAlphaScale <= 1 && p.combinedVisualLoad <= p.visualLoadCap + 1e-9 && p.visualLoadCap > 0 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
