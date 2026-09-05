import { ACTION_BUTTONS } from './config.js';
import { advanceBossSpecialOriginHandoffState, bossSpecialOriginHandoffPresentation } from './boss-special-origin-handoff-rendering.js';
export function runBossSpecialOriginHandoffAudit() { const samples = []; for (const kind of ['materialize', 'summon', 'teleport'])
    for (const travel of [0, 18, 90])
        for (const ageSteps of [0, 3])
            for (const radius of [18, 36])
                for (const reduced of [false, true]) {
                    let s = advanceBossSpecialOriginHandoffState(undefined, { kind, offsetX: -travel, offsetY: travel * .28 }, 0, radius, reduced);
                    for (let i = 0; i < ageSteps; i++)
                        s = advanceBossSpecialOriginHandoffState(s, null, .06, radius, reduced);
                    const p = bossSpecialOriginHandoffPresentation(s, reduced);
                    samples.push({ id: `${kind}-${travel}-${ageSteps}-${radius}-${reduced}`, passed: s.strength >= 0 && s.strength <= 1 && Math.abs(p.groundOffsetX) <= 20.2 && Math.abs(p.groundOffsetY) <= 14.6 && p.shadowAlphaScale >= .38 && p.shadowAlphaScale <= 1 && p.locomotionScale >= .16 && p.locomotionScale <= 1 && p.contactPulseScale >= .08 && p.contactPulseScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
