import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS, spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
const cue = (count, edge = 'north', target = 'hero') => ({ edge, kind: 'elite', target, start: { x: 320, y: 18 }, end: { x: 640, y: 400 }, count, alpha: .58, remainingTtl: .8, priority: 'tactical', animated: false, motionAmplitude: 0, stackSlot: 0, labelPos: { x: 320, y: 22 }, labelVisible: count > 1, presentationOnly: true });
export function runSpawnLaneEdgeCountDownwardDebounceAudit() {
    const samples = [];
    let passed = SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS > .08 && SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS < .35;
    for (let i = 0; i < 64; i++) {
        const base = 4 - (i % 2);
        let r = spawnLaneEdgeCountDownwardDebounce([], [cue(base)], 10 + i);
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(base - 1)], 10 + i + .04);
        const held = r.counts[0] === base;
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(base - 1)], 10 + i + .04 + SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS + .01);
        const released = r.counts[0] === base - 1;
        const ok = held && released && r.presentationOnly && r.gameplayMutation === false && r.memory.every((entry) => entry.presentationOnly);
        passed &&= ok;
        samples.push(`${i}:${base}:${held ? 1 : 0}:${released ? 1 : 0}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
