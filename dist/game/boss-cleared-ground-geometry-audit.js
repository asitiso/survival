import { ACTION_BUTTONS } from './config.js';
import { bossClearedGroundGeometryPresentation } from './boss-cleared-ground-geometry-rendering.js';
export function runBossClearedGroundGeometryAudit() { const samples = []; for (const shape of [undefined, 'corridor', 'cross', 'ring'])
    for (const reduced of [false, true])
        for (const radius of [42, 68, 96]) {
            const p = bossClearedGroundGeometryPresentation({ geometryShape: shape, radius, angle: .7, length: 320, alpha: .18 }, reduced);
            samples.push({ id: `${shape}-${reduced}-${radius}`, passed: p.alpha >= 0 && p.alpha <= .2 && p.radius >= 24 && p.halfLength >= 0 && p.halfLength <= 240 && p.halfWidth >= 0 && p.halfWidth <= 54 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
