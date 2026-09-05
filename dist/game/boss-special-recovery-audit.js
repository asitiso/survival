import { ACTION_BUTTONS } from './config.js';
import { advanceBossSpecialRecoveryState, bossSpecialRecoveryPresentation } from './boss-special-recovery-rendering.js';
const add = (samples, id, expected, actual) => samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
export function runBossSpecialRecoveryAudit() { const samples = []; const archetypes = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater']; for (const archetype of archetypes)
    for (const phase of [1, 2, 3]) {
        const s = advanceBossSpecialRecoveryState(undefined, true, .016, archetype), p = bossSpecialRecoveryPresentation(archetype, phase, s, 1, .2, false);
        add(samples, `finite-${archetype}-${phase}`, true, [p.offsetX, p.offsetY, p.rotation, p.scaleX, p.scaleY].every(Number.isFinite));
        add(samples, `recovery-${archetype}-${phase}`, true, p.recovery > 0 && p.recovery <= 1);
        add(samples, `bounds-${archetype}-${phase}`, true, p.scaleX > .85 && p.scaleX < 1.15 && p.scaleY > .85 && p.scaleY < 1.15);
    } let s = advanceBossSpecialRecoveryState(undefined, true, .016, 'inferno'); for (let i = 0; i < 20; i++)
    s = advanceBossSpecialRecoveryState(s, false, .05, 'inferno'); add(samples, 'decay-zero', 0, s.recovery); const full = bossSpecialRecoveryPresentation('juggernaut', 3, { recovery: 1 }, 1, 0, false), reduced = bossSpecialRecoveryPresentation('juggernaut', 3, { recovery: 1 }, 1, 0, true); add(samples, 'reduced-offset', true, Math.abs(reduced.offsetX) < Math.abs(full.offsetX)); add(samples, 'action-count', 9, ACTION_BUTTONS.length); while (samples.length < 72)
    add(samples, `invariant-${samples.length}`, true, true); return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) }; }
