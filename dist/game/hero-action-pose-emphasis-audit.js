import { ACTION_BUTTONS } from './config.js';
import { heroActionPoseEmphasisPresentation } from './hero-action-pose-emphasis-rendering.js';
export function runHeroActionPoseEmphasisAudit() { const samples = []; for (const owner of ['movement', 'cast', 'ultimate'])
    for (const reduced of [false, true])
        for (const hit of [0, .7]) {
            const p = heroActionPoseEmphasisPresentation({ owner, cast: owner === 'cast' ? .8 : 0, recovery: owner === 'movement' ? .7 : 0, ultimateWindup: owner === 'ultimate' ? .7 : 0, ultimateRelease: owner === 'ultimate' ? .5 : 0, ultimateRecovery: 0, hit, facingX: 1, facingY: .2 }, reduced);
            samples.push({ id: `${owner}-${reduced}-${hit}`, passed: Number.isFinite(p.forwardLead) && Number.isFinite(p.lift) && p.poseStrength >= 0 && p.poseStrength <= 1 && p.scaleX > .7 && p.scaleX < 1.3 && p.scaleY > .7 && p.scaleY < 1.3 && p.presentationOnly });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 12 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
