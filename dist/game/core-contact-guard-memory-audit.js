import { ACTION_BUTTONS } from './config.js';
import { coreContactGuardMemoryPresentation } from './core-contact-guard-memory-rendering.js';
export function runCoreContactGuardMemoryAudit() { const samples = []; for (const reduced of [false, true])
    for (const prevented of [0, .08, .2, .55, .9])
        for (const ttl of [0, .08, .22, .4]) {
            const p = coreContactGuardMemoryPresentation({ preventedRatio: prevented, ttl, maxTtl: .4 }, reduced);
            samples.push({ id: `${reduced}-${prevented}-${ttl}`, passed: p.contactAlpha >= 0 && p.contactAlpha <= 1 && p.memoryAlpha >= 0 && p.memoryAlpha <= .2 && p.braceWidth >= 28 && p.braceWidth <= 62 && p.braceHeight >= 10 && p.braceHeight <= 24 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 40 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
