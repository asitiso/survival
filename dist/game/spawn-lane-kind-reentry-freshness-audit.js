import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_KIND_REENTRY_FRESHNESS_SECONDS, spawnLaneEdgeCountDownwardDebounce } from './spawn-lane-edge-count-downward-debounce.js';
const cue = (count, kind, edge = 'north') => ({ edge, kind, target: 'hero', start: { x: 320, y: edge === 'north' ? 18 : 782 }, end: { x: 640, y: 400 }, count, alpha: .58, remainingTtl: .8, priority: 'tactical', animated: false, motionAmplitude: 0, stackSlot: 0, labelPos: { x: 320, y: 22 }, labelVisible: count > 1, presentationOnly: true });
export function runSpawnLaneKindReentryFreshnessAudit() {
    const samples = [];
    let passed = SPAWN_LANE_KIND_REENTRY_FRESHNESS_SECONDS >= .04 && SPAWN_LANE_KIND_REENTRY_FRESHNESS_SECONDS <= .12;
    for (let i = 0; i < 64; i++) {
        const t = 10 + i;
        let r = spawnLaneEdgeCountDownwardDebounce([], [cue(5, 'regular')], t);
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(1, 'boss')], t + .04);
        r = spawnLaneEdgeCountDownwardDebounce(r.memory, [cue(2, 'regular')], t + .12);
        const reset = r.counts[0] === 2;
        let same = spawnLaneEdgeCountDownwardDebounce([], [cue(5, 'regular')], t);
        same = spawnLaneEdgeCountDownwardDebounce(same.memory, [], t + .04);
        same = spawnLaneEdgeCountDownwardDebounce(same.memory, [cue(2, 'regular')], t + .08);
        const preserved = same.counts[0] === 5;
        let other = spawnLaneEdgeCountDownwardDebounce([], [cue(5, 'regular')], t);
        other = spawnLaneEdgeCountDownwardDebounce(other.memory, [cue(1, 'boss', 'south')], t + .05);
        other = spawnLaneEdgeCountDownwardDebounce(other.memory, [cue(2, 'regular')], t + .12);
        const isolated = other.counts[0] === 5;
        const ok = reset && preserved && isolated && r.presentationOnly && r.gameplayMutation === false;
        passed &&= ok;
        samples.push(`${i}:${reset ? 1 : 0}:${preserved ? 1 : 0}:${isolated ? 1 : 0}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
