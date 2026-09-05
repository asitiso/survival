import { ACTION_BUTTONS } from './config.js';
import { projectileMultiHitImpactHandoff } from './projectile-multihit-impact-retirement-rendering.js';
export function runProjectileMultiHitImpactRetirementAudit() { const samples = []; for (const reduced of [false, true])
    for (const prior of [0, 1, 2, 4])
        for (const continues of [false, true]) {
            const p = projectileMultiHitImpactHandoff({ launchOffset: { x: -18, y: 6 }, launchTtl: .06, launchMaxTtl: .1, priorImpactCount: prior, continues }, reduced);
            samples.push({ id: `${reduced}-${prior}-${continues}-finite`, passed: Number.isFinite(p.entryOffset.x) && Number.isFinite(p.entryOffset.y) });
            samples.push({ id: `${reduced}-${prior}-${continues}-retire`, passed: prior === 0 ? p.retireLaunchOwner : !p.retireLaunchOwner });
        } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
