import { ACTION_BUTTONS } from './config.js';
import { enemyHitStaggerPresentation, enemyDeathTransitionPresentation } from './enemy-hit-death-transition-rendering.js';
export function runEnemyHitDeathTransitionAudit() { const types = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman', 'shieldbearer', 'assassin', 'siegeGolem', 'nullifier', 'golden', 'elite']; const tiers = ['normal', 'heavy', 'critical']; const samples = []; for (const type of types)
    for (const tier of tiers)
        for (const reduced of [false, true]) {
            const motion = { motionBlend: .72, stride: 1, facingX: .8, facingY: .6, turn: .35, recovery: .1 };
            const hit = enemyHitStaggerPresentation(type, .1, tier, -.8, -.6, motion, reduced);
            const death = enemyDeathTransitionPresentation(type, { radius: 20, facingX: .8, facingY: .6, motionBlend: .72, turn: .35, impactX: -.8, impactY: -.6, tier }, .5, reduced);
            samples.push({ id: `${type}-${tier}-${reduced}`, passed: Math.hypot(hit.offsetX, hit.offsetY) <= 7 && Math.abs(hit.rotation) <= .18 && death.alpha >= 0 && death.alpha <= 1 && death.scaleX >= .78 && death.scaleX <= 1.1 && death.scaleY >= .78 && death.scaleY <= 1.05 });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
