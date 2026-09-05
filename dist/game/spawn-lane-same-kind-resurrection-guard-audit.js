import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS, SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS, spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
const cue = (count, edge = 'north') => ({ edge, kind: 'regular', target: edge === 'north' ? 'hero' : 'core', start: { x: 320, y: 18 }, end: { x: 640, y: 400 }, count, alpha: .58, remainingTtl: .8, priority: 'tactical', animated: false, motionAmplitude: 0, stackSlot: 0, labelPos: { x: 320, y: 22 }, labelVisible: count > 1, presentationOnly: true });
export function runSpawnLaneSameKindResurrectionGuardAudit() {
    const samples = [];
    let passed = SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS === SPAWN_LANE_EDGE_COUNT_DOWNWARD_DEBOUNCE_SECONDS;
    for (let i = 0; i < 64; i++) {
        const t = 20 + i;
        let longGap = spawnLaneEdgeCountDownwardDebounce([], [cue(5)], t);
        longGap = spawnLaneEdgeCountDownwardDebounce(longGap.memory, [], t + .1);
        longGap = spawnLaneEdgeCountDownwardDebounce(longGap.memory, [cue(2)], t + SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS + .02);
        let shortGap = spawnLaneEdgeCountDownwardDebounce([], [cue(5)], t);
        shortGap = spawnLaneEdgeCountDownwardDebounce(shortGap.memory, [], t + .04);
        shortGap = spawnLaneEdgeCountDownwardDebounce(shortGap.memory, [cue(2)], t + .08);
        const reset = longGap.counts[0] === 2, preserved = shortGap.counts[0] === 5;
        const ok = reset && preserved && longGap.presentationOnly && longGap.gameplayMutation === false;
        passed &&= ok;
        samples.push(`${i}:${reset ? 1 : 0}:${preserved ? 1 : 0}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
