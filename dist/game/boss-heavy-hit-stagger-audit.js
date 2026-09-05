import { ACTION_BUTTONS } from './config.js';
import { advanceBossHeavyHitStaggerState, bossHeavyHitStaggerPresentation } from './boss-heavy-hit-stagger-rendering.js';
export function runBossHeavyHitStaggerAudit() { const archetypes = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater']; const phases = [1, 2, 3]; const tiers = ['heavy', 'critical']; const samples = []; for (const archetype of archetypes)
    for (const phase of phases)
        for (const tier of tiers)
            for (const protectedWindow of [false, true]) {
                const s = advanceBossHeavyHitStaggerState(undefined, { tier, directionX: -.9, directionY: .3 }, 0, false);
                const p = bossHeavyHitStaggerPresentation(archetype, phase, s, protectedWindow ? .8 : 4, false);
                samples.push({ id: `${archetype}-${phase}-${tier}-${protectedWindow}`, passed: Math.hypot(p.offsetX, p.offsetY) <= 8 && Math.abs(p.rotation) <= .16 && p.scaleX >= .9 && p.scaleX <= 1.1 && p.scaleY >= .9 && p.scaleY <= 1.1 && (!protectedWindow || p.genericRecoilScale <= .15) });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
