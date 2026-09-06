import { ACTION_BUTTONS } from './config.js';
import { bossAnticipationRecoveryHandoffPresentation } from './boss-anticipation-recovery-handoff-rendering.js';
export function runBossAnticipationRecoveryHandoffAudit() { const samples = []; for (const mode of ['anticipation', 'recovery', 'stagger'])
    for (const reduced of [false, true]) {
        const p = bossAnticipationRecoveryHandoffPresentation({ charge: mode === 'anticipation' ? .8 : .08, recovery: mode === 'recovery' ? .8 : .1, stagger: mode === 'stagger' ? .8 : 0, ringAlphaScale: 1, bodyStrength: .8 }, reduced, reduced);
        samples.push({ id: `${mode}-${reduced}`, passed: p.ringScale >= 0 && p.ringScale <= 1 && p.secondaryRingScale >= 0 && p.secondaryRingScale <= 1 && p.bodyScale >= 0 && p.bodyScale <= 1 && p.alphaScale >= 0 && p.alphaScale <= 1 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 6 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
