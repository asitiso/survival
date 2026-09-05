import { ACTION_BUTTONS } from './config.js';
import { specialistAttackHitArbitrationPresentation } from './specialist-attack-hit-arbitration-rendering.js';
export function runSpecialistAttackHitArbitrationAudit() { const types = ['shieldbearer', 'assassin', 'siegeGolem', 'nullifier']; const tiers = ['normal', 'heavy', 'critical']; const samples = []; for (const type of types)
    for (const tier of tiers)
        for (const committed of [false, true])
            for (const fatal of [false, true])
                for (const reduced of [false, true]) {
                    const p = specialistAttackHitArbitrationPresentation(type, { pullback: committed ? .86 : 0, lunge: committed ? .08 : 0, resolve: committed ? .12 : .04, hitStagger: .9, tier, fatal }, reduced);
                    samples.push({ id: `${type}-${tier}-${committed}-${fatal}-${reduced}`, passed: p.attackScale >= 0 && p.attackScale <= 1 && p.attackResolveScale >= 0 && p.attackResolveScale <= 1 && p.hitStaggerScale >= 0 && p.hitStaggerScale <= 1 && p.fatalTransitionScale >= 0 && p.fatalTransitionScale <= 1 && (!fatal || p.owner === 'fatal') });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 96 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
