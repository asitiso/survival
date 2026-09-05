import { ACTION_BUTTONS } from './config.js';
import { bossDisplacementAftermathOriginPresentation } from './boss-displacement-aftermath-origin-rendering.js';
export function runBossDisplacementAftermathOriginAudit() { const samples = []; for (const rebase of [0, .5, 1])
    for (const specialStrength of [0, .6, 1])
        for (const settle of [0, .8])
            for (const direction of [-1, 1])
                for (const reduced of [false, true]) {
                    const p = bossDisplacementAftermathOriginPresentation({ rebase, groundOffsetX: direction * 30, groundOffsetY: direction * 12, specialStrength, settle }, reduced);
                    samples.push({ id: `${rebase}-${specialStrength}-${settle}-${direction}-${reduced}`, passed: Math.abs(p.originOffsetX) <= 18 && Math.abs(p.originOffsetY) <= 11 && p.aftermathAlphaScale >= .3 && p.aftermathAlphaScale <= 1 && p.contactPulseScale >= .08 && p.contactPulseScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
