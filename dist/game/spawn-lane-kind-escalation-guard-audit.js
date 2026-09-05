import { ACTION_BUTTONS } from './config.js';
import { spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
const cue = (count, kind) => ({ edge: 'north', kind, target: 'hero', start: { x: 320, y: 18 }, end: { x: 640, y: 400 }, count, alpha: .58, remainingTtl: .8, priority: 'tactical', animated: false, motionAmplitude: 0, stackSlot: 0, labelPos: { x: 320, y: 22 }, labelVisible: count > 1, presentationOnly: true });
export function runSpawnLaneKindEscalationGuardAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const base = 4 - (i % 2);
        let r = spawnLaneEdgeCountDownwardDebounce([], [cue(base, 'regular')], 10 + i);
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(2, 'elite')], 10 + i + .04);
        const eliteImmediate = r.counts[0] === 2 && r.memory.some((entry) => entry.kind === 'elite');
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(1, 'boss')], 10 + i + .08);
        const bossImmediate = r.counts[0] === 1 && r.memory.some((entry) => entry.kind === 'boss');
        const parallel = spawnLaneEdgeCountDownwardDebounce([], [cue(base, 'regular'), cue(2, 'elite')], 20 + i);
        const independent = parallel.counts[0] === base && parallel.counts[1] === 2;
        const ok = eliteImmediate && bossImmediate && independent && r.presentationOnly && r.gameplayMutation === false;
        passed &&= ok;
        samples.push(`${i}:${eliteImmediate ? 1 : 0}:${bossImmediate ? 1 : 0}:${independent ? 1 : 0}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
