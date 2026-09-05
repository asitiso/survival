import { SPAWN_LANE_HYSTERESIS_MAX_SHIFT, spawnLaneHysteresisUpdate } from './spawn-lane-hysteresis.js';
export function runSpawnLaneHysteresisAudit() {
    const samples = [];
    let passed = true;
    const bounds = { width: 1280, height: 800 };
    for (let i = 0; i < 64; i++) {
        const kind = i % 7 === 0 ? 'boss' : i % 5 === 0 ? 'elite' : 'regular';
        const target = i % 2 ? 'hero' : 'core';
        const a = { pos: { x: 220 + i, y: 18 }, kind, target };
        const b = { pos: { x: 272 + i, y: 20 }, kind, target };
        const r = spawnLaneHysteresisUpdate(a, b, bounds);
        const ok = Boolean(r && r.edge === 'top' && r.shift > 0 && r.shift <= SPAWN_LANE_HYSTERESIS_MAX_SHIFT && r.pos.x < b.pos.x);
        passed &&= ok;
        samples.push(`${i}:${kind}:${target}:${r?.edge ?? 'none'}:${r?.shift.toFixed(2) ?? '0'}`);
    }
    return { samples, actionCount: 9, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed };
}
