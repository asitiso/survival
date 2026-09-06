import { ACTION_BUTTONS } from './config.js';
import { secondaryImpactLineageLabelPresentation } from './secondary-impact-lineage-label-anchor-rendering.js';
export function runSecondaryImpactLineageLabelAnchorAudit() { const samples = []; for (const reduced of [false, true])
    for (const count of [1, 2, 4, 8])
        for (const bound of [false, true]) {
            const p = secondaryImpactLineageLabelPresentation({ lineageKey: bound ? 'lineage-2' : 'unbound:2:3', anchor: bound ? { x: 240, y: 210 } : undefined, heldCount: count, ttl: .11, maxTtl: .14, budgetVisible: true }, reduced);
            samples.push({ id: `${reduced}-${count}-${bound}`, passed: p.alpha >= 0 && p.alpha <= 1 && ((bound && count > 1) ? p.visible : !p.visible) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
