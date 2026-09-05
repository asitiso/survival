import { ACTION_BUTTONS } from './config.js';
import { bossSpecialLaunchOriginPresentation } from './boss-special-launch-origin-rendering.js';
const A = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
const P = [1, 2, 3];
export function runBossSpecialLaunchOriginAudit() { const samples = []; for (const archetype of A)
    for (const phase of P) {
        const f = bossSpecialLaunchOriginPresentation({ archetype, phase, radius: 58, facingX: 1, facingY: 0, specialTimer: .2, rebaseOffsetX: -26, rebaseOffsetY: 9, handoffStrength: .8 }, false);
        const r = bossSpecialLaunchOriginPresentation({ archetype, phase, radius: 58, facingX: 1, facingY: 0, specialTimer: .2, rebaseOffsetX: -26, rebaseOffsetY: 9, handoffStrength: .8 }, true);
        samples.push({ id: `${archetype}-${phase}-projectile`, passed: Math.hypot(f.projectileOffsetX, f.projectileOffsetY) <= 52.001 });
        samples.push({ id: `${archetype}-${phase}-hazard`, passed: Math.abs(f.hazardOriginOffsetX) <= 24.001 && Math.abs(f.hazardOriginOffsetY) <= 24.001 });
        samples.push({ id: `${archetype}-${phase}-reduced`, passed: Math.hypot(r.projectileOffsetX, r.projectileOffsetY) <= Math.hypot(f.projectileOffsetX, f.projectileOffsetY) + .001 });
        samples.push({ id: `${archetype}-${phase}-ttl`, passed: f.convergeSeconds > 0 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
