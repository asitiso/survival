import { ACTION_BUTTONS } from './config.js';
import { coreGuardMultiCueStackBudget } from './core-guard-multi-cue-stack-budget-rendering.js';
export function runCoreGuardMultiCueStackBudgetAudit() { const samples = []; for (const reduced of [false, true])
    for (let count = 1; count <= 6; count++) {
        const cues = Array.from({ length: count }, (_, i) => ({ id: i, ttl: .34 - i * .025, maxTtl: .34 })), r = coreGuardMultiCueStackBudget(cues, reduced);
        samples.push({ id: `${reduced}-${count}`, passed: r.entries.length === count && r.entries.every(e => e.alphaScale >= 0 && e.alphaScale <= 1) && r.combinedLoad <= r.stackLoadCap + 1e-9 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 12 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
