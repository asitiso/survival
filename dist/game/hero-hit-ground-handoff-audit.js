import { ACTION_BUTTONS } from './config.js';
import { heroHitGroundHandoffPresentation } from './hero-hit-ground-handoff-rendering.js';
export function runHeroHitGroundHandoffAudit() { const samples = []; for (const hit of [0, .18, .95])
    for (const action of ['none', 'cast'])
        for (const movement of [0, .8])
            for (const direction of [-1, 1])
                for (const reduced of [false, true]) {
                    const p = heroHitGroundHandoffPresentation({ hit, hitOffsetX: direction * 10, hitOffsetY: direction * 4, movement, cast: action === 'cast' ? .85 : 0, evade: 0, ultimate: 0 }, reduced);
                    samples.push({ id: `${hit}-${action}-${movement}-${direction}-${reduced}`, passed: [p.groundMotionScale, p.widthScale, p.heightScale, p.alphaScale].every(Number.isFinite) && Math.abs(p.shadowOffsetX) <= 2.6 && Math.abs(p.shadowOffsetY) <= 1.8 && p.groundMotionScale >= .4 && p.groundMotionScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 48 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
