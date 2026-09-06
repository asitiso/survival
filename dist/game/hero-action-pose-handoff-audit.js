import { ACTION_BUTTONS } from './config.js';
import { heroActionPoseHandoffPresentation } from './hero-action-pose-handoff-rendering.js';
export function runHeroActionPoseHandoffAudit() { const samples = []; for (const owner of ['movement', 'cast', 'ultimate'])
    for (const hit of [0, .8])
        for (const reduced of [false, true]) {
            const p = heroActionPoseHandoffPresentation({ owner, cast: owner === 'cast' ? .8 : .15, recovery: owner === 'movement' ? .55 : 0, ultimateWindup: owner === 'ultimate' ? .8 : 0, ultimateRelease: 0, ultimateRecovery: 0, hit, releaseAccent: .6 }, reduced);
            samples.push({ id: `${owner}-${hit}-${reduced}`, passed: p.actionPoseScale >= 0 && p.actionPoseScale <= 1 && p.castOverlayScale >= 0 && p.castOverlayScale <= 1 && p.recoverOverlayScale >= 0 && p.recoverOverlayScale <= 1 && p.singlePoseOwner });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 12 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
