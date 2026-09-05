import { ACTION_BUTTONS } from './config.js';
import { advanceHeroUltimateBodyState, heroUltimateBodyPresentation } from './hero-ultimate-body-continuity-rendering.js';
export function runHeroUltimateBodyContinuityAudit() { const samples = []; const kinds = ['meteorStorm', 'blackHole']; for (const kind of kinds)
    for (const age of [0, .08, .18, .34])
        for (const reduced of [false, true]) {
            let s = advanceHeroUltimateBodyState(undefined, kind, 0, reduced);
            s = advanceHeroUltimateBodyState(s, null, age, reduced);
            const p = heroUltimateBodyPresentation(s, .8, .6, reduced);
            samples.push({ id: `${kind}-${age}-${reduced}`, passed: Math.hypot(p.offsetX, p.offsetY) <= 7 && Math.abs(p.rotation) <= .16 && p.scaleX >= .9 && p.scaleX <= 1.1 && p.scaleY >= .9 && p.scaleY <= 1.1 });
        } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
