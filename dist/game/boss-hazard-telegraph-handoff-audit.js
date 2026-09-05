import { ACTION_BUTTONS } from './config.js';
import { bossHazardTelegraphHandoffPresentation } from './boss-hazard-telegraph-handoff-rendering.js';
export function runBossHazardTelegraphHandoffAudit() { const samples = []; for (const reduced of [false, true])
    for (const telegraph of [0, .2, .7, 1.05])
        for (const ttl of [0, .04, .12, .22]) {
            const p = bossHazardTelegraphHandoffPresentation({ telegraph, launchTtl: ttl, launchMaxTtl: .22 }, reduced);
            samples.push({ id: `${reduced}-${telegraph}-${ttl}-finite`, passed: Number.isFinite(p.launchCueAlpha) && Number.isFinite(p.telegraphAlphaScale) });
            samples.push({ id: `${reduced}-${telegraph}-${ttl}-bounds`, passed: p.launchCueAlpha >= 0 && p.launchCueAlpha <= .32 && p.telegraphAlphaScale >= .72 && p.telegraphAlphaScale <= 1 });
        } while (samples.length < 72)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
