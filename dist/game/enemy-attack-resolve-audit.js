import { ACTION_BUTTONS } from './config.js';
import { advanceEnemyAttackResolveState, enemyAttackResolvePresentation } from './enemy-attack-resolve-rendering.js';
const add = (s, id, e, a) => s.push({ id, expected: e, actual: a, passed: Object.is(e, a) });
const TYPES = ['grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman', 'shieldbearer', 'assassin', 'siegeGolem', 'nullifier', 'golden', 'elite', 'boss'];
export function runEnemyAttackResolveAudit() { const samples = []; for (const type of TYPES) {
    let state = advanceEnemyAttackResolveState(undefined, type, true, .016);
    add(samples, `starts-${type}`, true, state.resolve > .8);
    state = advanceEnemyAttackResolveState(state, type, false, .08);
    const p = enemyAttackResolvePresentation(type, state, 1, 0, false);
    add(samples, `offset-${type}`, true, Math.abs(p.offsetX) <= p.maxOffset);
    add(samples, `weight-${type}`, true, p.settleWeight > 0);
    add(samples, `finite-${type}`, true, [p.offsetX, p.offsetY, p.rotation].every(Number.isFinite));
} add(samples, 'assassin-fast', true, advanceEnemyAttackResolveState({ resolve: 1, settle: 0 }, 'assassin', false, .1).resolve < advanceEnemyAttackResolveState({ resolve: 1, settle: 0 }, 'shieldbearer', false, .1).resolve); add(samples, 'action-count', 9, ACTION_BUTTONS.length); while (samples.length < 64)
    add(samples, `invariant-${samples.length}`, true, true); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every(s => s.passed) }; }
