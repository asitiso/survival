import { ACTION_BUTTONS } from './config.js';
import { secondaryImpactClusterReadabilityBudgetPresentation } from './secondary-impact-cluster-readability-budget-rendering.js';
export function runSecondaryImpactClusterReadabilityBudgetAudit() {
    const samples = [];
    for (const quality of ['high', 'medium', 'low'])
        for (const reduced of [false, true])
            for (let sample = 0; sample < 12; sample++) {
                const impacts = Array.from({ length: 1 + (sample % 8) }, (_, i) => ({ pos: { x: 160 + (i % 4) * 9, y: 220 + Math.floor(i / 4) * 10 }, ttl: .14 - i * .006, maxTtl: .14 }));
                const result = secondaryImpactClusterReadabilityBudgetPresentation(impacts, quality, reduced), visible = result.filter(entry => entry.visible).length, maxVisible = quality === 'high' ? 3 : quality === 'medium' ? 2 : 1;
                samples.push({ id: `${quality}-${reduced}-${sample}`, passed: result.length === impacts.length && visible <= maxVisible && result.every(entry => entry.alphaScale >= 0 && entry.alphaScale <= 1 && entry.sizeScale >= 0 && entry.sizeScale <= 1) });
            }
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(sample => sample.passed) && ACTION_BUTTONS.length === 9 };
}
