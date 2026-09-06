import { ACTION_BUTTONS } from './config.js';
import { characterSilhouetteDirectionOwnerPresentation } from './character-silhouette-direction-owner-rendering.js';
export function runCharacterSilhouetteDirectionOwnerAudit() { const samples = []; for (const kind of ['specialist', 'boss'])
    for (const attack of [0, .7])
        for (const recovery of [0, .6])
            for (const hit of [0, .8])
                for (const special of [0, .8]) {
                    const p = characterSilhouetteDirectionOwnerPresentation({ kind, locomotion: { x: 1, y: 0 }, target: { x: 0, y: 1 }, hitDirection: { x: -1, y: 0 }, attack, recovery, hit, special }, false);
                    samples.push({ id: `${kind}-${attack}-${recovery}-${hit}-${special}`, passed: Number.isFinite(p.facingX) && Number.isFinite(p.facingY) && Math.abs(Math.hypot(p.facingX, p.facingY) - 1) < .001 && p.trailDistanceScale >= 0 && p.trailDistanceScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
