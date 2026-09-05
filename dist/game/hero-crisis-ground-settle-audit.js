import { ACTION_BUTTONS } from './config.js';
import { advanceHeroCrisisGroundSettleState, heroCrisisGroundSettlePresentation } from './hero-crisis-ground-settle-rendering.js';
export function runHeroCrisisGroundSettleAudit() { const samples = []; for (const hit of [0, .72, 1.1, 1.25])
    for (const steps of [0, 3])
        for (const movement of [0, .8])
            for (const direction of [-1, 1])
                for (const reduced of [false, true]) {
                    let s = advanceHeroCrisisGroundSettleState(undefined, hit, 0, reduced);
                    for (let i = 0; i < steps; i++)
                        s = advanceHeroCrisisGroundSettleState(s, null, .05, reduced);
                    const p = heroCrisisGroundSettlePresentation(s, movement, reduced);
                    samples.push({ id: `${hit}-${steps}-${movement}-${direction}-${reduced}`, passed: s.impact >= 0 && s.impact <= 1 && s.settle >= 0 && s.settle <= 1 && p.groundMotionScale >= .5 && p.groundMotionScale <= 1 && p.movementRestartScale >= .56 && p.movementRestartScale <= 1 && p.shadowFollowScale >= .48 && p.shadowFollowScale <= 1 && p.widthScale >= 1 && p.widthScale <= 1.09 && p.heightScale >= .83 && p.heightScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
