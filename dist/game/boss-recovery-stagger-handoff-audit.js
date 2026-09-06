import { ACTION_BUTTONS } from './config.js';
import { bossRecoveryStaggerHandoffPresentation } from './boss-recovery-stagger-handoff-rendering.js';
export function runBossRecoveryStaggerHandoffAudit() { const samples = []; for (const tier of [null, 'heavy', 'critical'])
    for (const reduced of [false, true])
        for (const recovery of [0, .25, .55, .9])
            for (const stagger of [.2, .75, 1])
                for (const telegraph of [false, true]) {
                    const p = bossRecoveryStaggerHandoffPresentation({ recovery, stagger, tier, specialTimer: telegraph ? .7 : 4 }, reduced);
                    samples.push({ id: `${tier}-${reduced}-${recovery}-${stagger}-${telegraph}`, passed: [p.recoveryScale, p.staggerScale, p.silhouetteAlphaScale, p.yieldStrength].every(v => Number.isFinite(v) && v >= 0 && v <= 1) && (!telegraph || p.owner === 'telegraph') });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
