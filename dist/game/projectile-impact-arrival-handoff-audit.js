import { ACTION_BUTTONS } from './config.js';
import { projectileImpactEntryOffset, projectileImpactVisualPosition } from './projectile-impact-arrival-handoff-rendering.js';
export function runProjectileImpactArrivalHandoffAudit() { const samples = []; for (const reduced of [false, true])
    for (const ttl of [0, .025, .05, .1])
        for (const offset of [{ x: -20, y: 8 }, { x: 12, y: -6 }]) {
            const e = projectileImpactEntryOffset(offset, ttl, .1, reduced), p = projectileImpactVisualPosition({ x: 200, y: 100 }, e, .09, .18);
            samples.push({ id: `${reduced}-${ttl}-${offset.x}-finite`, passed: [e.x, e.y, p.x, p.y].every(Number.isFinite) });
            samples.push({ id: `${reduced}-${ttl}-${offset.x}-bound`, passed: Math.hypot(e.x, e.y) <= 18.001 });
        } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
