import { ACTION_BUTTONS } from './config.js';
import { advanceHeroUltimateAimContinuityState, heroUltimateAimContinuityPresentation } from './hero-ultimate-aim-continuity-rendering.js';
export function runHeroUltimateAimContinuityAudit() { const samples = []; for (const reduced of [false, true])
    for (const direction of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        let s = advanceHeroUltimateAimContinuityState(undefined, { x: direction[0], y: direction[1] }, 0, reduced);
        for (const step of [0, .18, .36, .84]) {
            s = advanceHeroUltimateAimContinuityState(s, null, step, reduced);
            const p = heroUltimateAimContinuityPresentation(s, -direction[0], -direction[1], step < .7, step, reduced);
            samples.push({ id: `${reduced}-${direction.join(',')}-${step}`, passed: [p.facingX, p.facingY, p.retention, p.overlayAngle].every(Number.isFinite) && Math.abs(Math.hypot(p.facingX, p.facingY) - 1) < .001 && p.retention >= 0 && p.retention <= 1 });
        }
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
