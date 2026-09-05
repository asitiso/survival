import { ACTION_BUTTONS } from './config.js';
import { bossStaggerSpecialRecoveryArbitrationPresentation } from './boss-stagger-special-recovery-arbitration-rendering.js';
export function runBossStaggerSpecialRecoveryArbitrationAudit() { const archetypes = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater']; const phases = [1, 2, 3]; const tiers = ['heavy', 'critical']; const samples = []; for (const archetype of archetypes)
    for (const phase of phases)
        for (const tier of tiers)
            for (const telegraph of [false, true]) {
                const p = bossStaggerSpecialRecoveryArbitrationPresentation(archetype, phase, { stagger: tier === 'critical' ? 1 : .72, tier, recovery: .78, specialTimer: telegraph ? .7 : 4 }, false);
                samples.push({ id: `${archetype}-${phase}-${tier}-${telegraph}`, passed: p.staggerScale >= 0 && p.staggerScale <= 1 && p.genericRecoilScale >= 0 && p.genericRecoilScale <= 1 && p.recoveryScale >= 0 && p.recoveryScale <= 1 && (!telegraph || p.owner === 'telegraph') });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
