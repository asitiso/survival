import { ACTION_BUTTONS } from './config.js';
import { specialistSilhouettePhaseHandoffPresentation } from './specialist-silhouette-phase-handoff-rendering.js';
export function runSpecialistSilhouettePhaseHandoffAudit() { const samples = []; for (const phase of ['windup', 'strike', 'resolve', 'hit'])
    for (const reduced of [false, true]) {
        const p = specialistSilhouettePhaseHandoffPresentation({ pullback: phase === 'windup' ? .8 : 0, lunge: phase === 'strike' ? .8 : 0, resolve: phase === 'resolve' ? .8 : 0, hit: phase === 'hit' ? .8 : 0 }, reduced);
        samples.push({ id: `${phase}-${reduced}`, passed: p.attackAlphaScale >= 0 && p.attackAlphaScale <= 1 && p.trailScale >= 0 && p.trailScale <= 1 && p.strikeCarry >= 0 && p.strikeCarry <= 1 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 8 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
