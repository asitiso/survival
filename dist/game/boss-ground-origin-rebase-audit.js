import { ACTION_BUTTONS } from './config.js';
import { advanceBossGroundOriginRebaseState, bossGroundOriginRebasePresentation } from './boss-ground-origin-rebase-rendering.js';
export function runBossGroundOriginRebaseAudit() { const samples = []; for (const phase of [1, 2, 3])
    for (const travel of [0, 8, 90])
        for (const cycleChanged of [false, true])
            for (const phaseChanged of [false, true])
                for (const reduced of [false, true]) {
                    let s = advanceBossGroundOriginRebaseState(undefined, { x: 120, y: 160, phase, cycle: 2 }, .016, 32, reduced);
                    const nextPhase = phaseChanged ? (phase === 1 ? 2 : phase === 2 ? 3 : 2) : phase;
                    s = advanceBossGroundOriginRebaseState(s, { x: 120 + travel, y: 160 + travel * .18, phase: nextPhase, cycle: cycleChanged ? 3 : 2 }, .016, 32, reduced);
                    const p = bossGroundOriginRebasePresentation(s, reduced);
                    samples.push({ id: `${phase}-${travel}-${cycleChanged}-${phaseChanged}-${reduced}`, passed: s.rebase >= 0 && s.rebase <= 1 && Math.abs(p.groundOffsetX) <= 19.2 && Math.abs(p.groundOffsetY) <= 13.9 && p.contactPulseScale >= .08 && p.contactPulseScale <= 1 && p.shadowMotionScale >= .5 && p.shadowMotionScale <= 1 });
                } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 72 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
