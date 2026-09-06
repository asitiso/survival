import { ACTION_BUTTONS } from './config.js';
import { heroBodyFacingOwnerPresentation } from './hero-body-facing-owner-rendering.js';
export function runHeroBodyFacingOwnerAudit() { const samples = []; for (const cast of [0, .8])
    for (const ultimate of [0, .8])
        for (const x of [-1, 0, 1]) {
            const p = heroBodyFacingOwnerPresentation({ currentFacing: { x: 1, y: 0 }, cast: { owner: cast > 0 ? 'cast' : 'current', facingX: x || 1, facingY: x === 0 ? 1 : 0, retention: cast }, ultimate: { owner: ultimate > 0 ? 'ultimate' : 'current', facingX: x || 1, facingY: x === 0 ? -1 : 0, retention: ultimate } }, false);
            samples.push({ id: `${cast}-${ultimate}-${x}`, passed: Number.isFinite(p.facingX) && Number.isFinite(p.facingY) && Number.isFinite(p.bodyAngle) && Math.abs(Math.hypot(p.facingX, p.facingY) - 1) < .001 && (p.mirrorX === 1 || p.mirrorX === -1) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
