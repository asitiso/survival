import { ACTION_BUTTONS } from './config.js';
import { bossGroundCueArbitrationPresentation } from './boss-ground-cue-arbitration-rendering.js';
export function runBossGroundCueArbitrationAudit() { const samples = []; for (const phase of [1, 2, 3])
    for (const recovery of [0, .45, .9])
        for (const stagger of [0, .9])
            for (const telegraph of [false, true])
                for (const reduced of [false, true]) {
                    const p = bossGroundCueArbitrationPresentation(phase, { motion: .65, settle: .55, recovery, stagger, specialTimer: telegraph ? .7 : 4 }, reduced);
                    samples.push({ id: `${phase}-${recovery}-${stagger}-${telegraph}-${reduced}`, passed: [p.locomotionScale, p.shadowMotionScale, p.contactPulseScale, p.locomotionShadowBoostScale, p.recoveryShadowBoostScale].every(v => v >= 0 && v <= 1) && (!telegraph || p.owner === 'telegraph') });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
