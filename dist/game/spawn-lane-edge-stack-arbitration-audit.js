import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION, spawnLaneEdgeStackArbitration } from './spawn-lane-edge-stack-arbitration.js';
export function runSpawnLaneEdgeStackArbitrationAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const edge = i % 4 === 0 ? 'north' : i % 4 === 1 ? 'east' : i % 4 === 2 ? 'south' : 'west';
        const pos = edge === 'north' ? { x: 300 + i, y: 18 } : edge === 'south' ? { x: 300 + i, y: 782 } : edge === 'east' ? { x: 1262, y: 260 + i } : { x: 18, y: 260 + i };
        const second = edge === 'north' || edge === 'south' ? { x: pos.x + 8, y: pos.y } : { x: pos.x, y: pos.y + 8 };
        const cues = [{ edge, kind: 'boss', target: 'hero', start: pos, end: { x: 640, y: 400 }, count: 3, alpha: .5, priority: 'tactical', animated: false, motionAmplitude: 0 }, { edge, kind: 'elite', target: 'core', start: second, end: { x: 1000, y: 400 }, count: 2, alpha: .5, priority: 'tactical', animated: false, motionAmplitude: 0 }];
        const r = spawnLaneEdgeStackArbitration({ cues, width: 1280, height: 800 });
        const d = Math.hypot(r[0].labelPos.x - r[1].labelPos.x, r[0].labelPos.y - r[1].labelPos.y);
        const ok = r.length === 2 && r.every(x => x.labelVisible && x.presentationOnly) && d >= SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION;
        passed &&= ok;
        samples.push(`${i}:${edge}:${r[0].stackSlot}:${r[1].stackSlot}:${d.toFixed(1)}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
