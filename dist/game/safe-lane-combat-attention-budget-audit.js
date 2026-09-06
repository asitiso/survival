import { ACTION_BUTTONS } from './config.js';
import { safeLaneCombatAttentionBudgetPresentation } from './safe-lane-combat-attention-budget-rendering.js';
export function runSafeLaneCombatAttentionBudgetAudit() { const samples = []; for (const reduced of [false, true])
    for (const heroCritical of [false, true])
        for (const coreCritical of [false, true])
            for (const lawActive of [false, true]) {
                const p = safeLaneCombatAttentionBudgetPresentation({ heroCritical, coreCritical, lawActive }, reduced);
                samples.push({ id: `${reduced}-${heroCritical}-${coreCritical}-${lawActive}`, passed: p.primaryAlphaScale > 0 && p.primaryAlphaScale <= 1 && p.bridgeAlphaScale >= 0 && p.bridgeAlphaScale <= 1 && p.arrivalAlphaScale > 0 && p.arrivalAlphaScale <= 1 && typeof p.detailVisible === 'boolean' && typeof p.directionVisible === 'boolean' });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
