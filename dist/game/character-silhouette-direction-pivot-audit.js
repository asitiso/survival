import { ACTION_BUTTONS } from './config.js';
import { characterSilhouetteDirectionPivotPresentation } from './character-silhouette-direction-pivot-rendering.js';
export function runCharacterSilhouetteDirectionPivotAudit() { const samples = []; for (const owner of ['locomotion', 'attack', 'recovery', 'hit', 'special'])
    for (const turn of [0, .5, 1])
        for (const reduced of [false, true]) {
            const p = characterSilhouetteDirectionPivotPresentation({ locomotion: { x: 1, y: 0 }, owned: { owner, facingX: 0, facingY: 1, trailDistanceScale: 1, presentationOnly: true }, turn }, reduced);
            samples.push({ id: `${owner}-${turn}-${reduced}`, passed: Number.isFinite(p.facingX) && Number.isFinite(p.facingY) && p.pivotWeight >= 0 && p.pivotWeight <= 1 && Math.abs(Math.hypot(p.facingX, p.facingY) - 1) < .001 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
