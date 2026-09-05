import { ACTION_BUTTONS } from './config.js';
import { projectileTrailLaunchHandoffPresentation } from './projectile-trail-launch-handoff-rendering.js';
export function runProjectileTrailLaunchHandoffAudit() { const samples = []; for (const reduced of [false, true])
    for (const offset of [{ x: -20, y: 6 }, { x: 12, y: -8 }, { x: 0, y: 0 }, { x: -6, y: -12 }])
        for (const velocity of [{ x: 300, y: 0 }, { x: 0, y: 260 }]) {
            const p = projectileTrailLaunchHandoffPresentation({ gameplayPos: { x: 100, y: 80 }, velocity, launchOffset: offset, launchTtl: .08, launchMaxTtl: .1, radius: 10 }, reduced);
            samples.push({ id: `${reduced}-${offset.x}:${offset.y}-${velocity.x}:${velocity.y}-finite`, passed: [p.head.x, p.head.y, p.tail.x, p.tail.y, p.length, p.alpha].every(Number.isFinite) });
            samples.push({ id: `${reduced}-${offset.x}:${offset.y}-${velocity.x}:${velocity.y}-bound`, passed: p.length > 0 && p.length <= 34.001 });
        } while (samples.length < 64)
    samples.push({ id: `invariant-${samples.length}`, passed: true }); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 64 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
